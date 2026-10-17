# Kaimaaral submission readiness

## Verified on October 17, 2026
- Public Read Me and sign-in screens render locally; signed-out role access redirects to sign-in.
- Hosted sign-in settings: signups, email and Google enabled; anonymous accounts disabled. Google OAuth completion and email delivery were not exercised.
- Signed-in journey exercised with real AI and a new private sample workspace: sample creation → visual map (21 nodes) → typed note extraction → change confirmation → cited answer → generated draft plan → reload/readback.
- A forced route-module failure after automatic recovery showed the branded fallback; Retry page restored the role.
- All 21 automated tests pass. Preview reports build OK.
- Sample company/role/capture/review labels and Known limitations are visible. Read Me now describes the current plan and its readiness gate.
- Basic backend security checks passed (not a deep code audit). Removed anonymous access to company helpers and direct caller access to the signup trigger function.
- Updated SheetJS to official 0.20.3 and patched js-yaml/source-map-js. Two moderate sprintf-js dependency warnings remain; the registry has no version newer than the reported vulnerable 1.1.3. The scanner cannot registry-check the official SheetJS tarball; its installed version was verified directly.
- The two remaining database advisor warnings concern intentional signed-in execution of membership/admin helpers. Each checks only the caller's auth.uid(); these helpers are required for company-scoped policies.

## Submission fields: prepared text, not submitted
- Project name: Kaimaaral
- Published .lovable.app URL: BLOCKED — project is not published.
- Short description: A multilingual, voice-first role handover tool that turns everyday knowledge into source-backed maps, answers and onboarding procedures.
- Problem and intended user: Indian SMEs lose operational judgment when experienced employees leave. Kaimaaral helps role-holders capture that knowledge in Malayalam, Hindi, Tamil or English and successors inherit it.
- Final category: Business Operations.
- Screenshots: optional, up to three; use Map/Visual, a cited Ask answer and Plan with missing-detail flags. Verification captures are temporary, not uploaded to the Hub.
- Testing instructions: public /readme; sign in with your own account, choose languages, load a private sample company, open Accounts Lead and follow the walkthrough. Existing users can load another sample through New workspace.
- Known limitations: /readme. No private credentials are needed or included.

## Remaining release gates
- User authorizes publication and verifies the public URL in a signed-out browser. A normal project preview is access-restricted and is not the required published submission URL.
- Resolve or review remaining dependency warnings; no fully clean security claim is made.
- Submit the external SheBuilds Hub fields and attach any chosen screenshots. The actual Hub form is not available to inspect here; completion is unverified.
- Confirm fresh-project/team/rule eligibility in the Hub; these are not established by app behavior.
- Freeze only after submission. No code, content, configuration or connected-backend changes to the submitted version; further work uses a separate duplicate.

Deadline in the participant brief: October 17, 2026, 11:59 p.m. PT (October 18, 12:29 p.m. IST).