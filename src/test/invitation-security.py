"""Live security regression checks; requires a minted preview session and test fixtures.

Run: python3 src/test/invitation-security.py
Fixture IDs are reserved for temporary security-test workspaces, never real data.
"""
import asyncio
import json
import os
from pathlib import Path
from playwright.async_api import async_playwright

A = "00000000-0000-4000-8000-000000000301"
B = "00000000-0000-4000-8000-000000000302"
INVITE = "00000000-0000-4000-8000-000000000303"

async def main():
    with open(os.path.expanduser("~/.cache/lovable-auth/session.json")) as f:
        minted = json.load(f)
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1280, "height": 1800})
        page = await context.new_page()
        await page.goto("http://localhost:8080")
        await page.evaluate("([k,v]) => localStorage.setItem(k,v)",
                            [minted["storage_key"], json.dumps(minted["session"])])
        await page.goto("http://localhost:8080/app")
        await page.get_by_role("heading", name="Your workspace", exact=True).wait_for()
        Path("/tmp/browser/security").mkdir(parents=True, exist_ok=True)
        await page.screenshot(path="/tmp/browser/security/workspace.png")
        async def query(operation, payload):
            return await page.evaluate("""async ({operation, payload}) => {
              const {supabase} = await import('/src/integrations/supabase/client.ts');
              let result;
              if (operation === 'inviteUpdate') result = await supabase.from('invites').update(payload.patch).eq('id', payload.id);
              if (operation === 'join') {
                const {data} = await supabase.auth.getUser();
                result = await supabase.from('company_members').insert({company_id: payload.company, user_id: data.user.id, member_role: 'member'});
              }
              if (operation === 'readCompany') result = await supabase.from('companies').select('id').eq('id', payload.company);
              if (operation === 'readInvite') result = await supabase.from('invites').select('accepted').eq('id', payload.id).single();
              if (operation === 'foreignReference') result = await supabase.from('inputs').insert({company_id: payload.company, role_id: payload.role, kind:'text', original_text:'Security test'});
              return {failed: Boolean(result.error), data: result.data};
            }""", {"operation": operation, "payload": payload})
        result = await query("inviteUpdate", {"id": INVITE, "patch": {"company_id": B}})
        assert result["failed"], "Invitee must not change the invited company"
        print("PASS: invitation cannot be retargeted")
        result = await query("readCompany", {"company": B})
        assert result["failed"] or result["data"] == [], "Unrelated company must not be readable"
        print("PASS: unrelated company is hidden")
        result = await query("join", {"company": B})
        assert result["failed"], "No membership without a matching invitation"
        print("PASS: unrelated company cannot be joined")
        result = await query("join", {"company": A})
        assert not result["failed"], "Valid invitation must allow joining"
        print("PASS: valid invitation can be accepted")
        result = await query("readInvite", {"id": INVITE})
        assert result["data"]["accepted"] is True, "Joining must atomically consume the invitation"
        print("PASS: joining consumes invitation")
        result = await query("inviteUpdate", {"id": INVITE, "patch": {"accepted": False}})
        assert result["failed"], "Accepted invitation must not be reopened"
        print("PASS: consumed invitation cannot be reopened")
        result = await query("foreignReference", {"company": A, "role": "2c3a097e-c074-4c65-801b-825cb7328331"})
        assert result["failed"], "References to a different company must be rejected"
        print("PASS: foreign-company role reference rejected")
        await browser.close()

asyncio.run(main())