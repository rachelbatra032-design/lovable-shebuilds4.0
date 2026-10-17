<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- Data access is company-scoped via RLS helper `is_company_member`; storage paths start with the company id so the same check covers files.
- All AI calls live in `src/lib/ai.server.ts` (streamed raw HTTP to the Lovable AI Gateway) and are dynamically imported inside server functions in `src/lib/roles.functions.ts`, keeping keys server-only.
- Knowledge items are stored in English with the original-language quote kept; other reading languages are cached in `knowledge_items.translations` on demand.
- The completeness score formula lives only in `src/lib/knowledge.ts` and is covered by `knowledge.test.ts`.
- Sample workspaces are created per user by a user-triggered server function, so each reviewer gets a private copy.
- Role page UI lives in `src/components/role/RoleWorkspace.tsx` (route file only passes the id) so `src/test/role-tabs.test.tsx` can click every tab without a router; run `bunx vitest run` before publishing.
- Browser runtime errors are logged by `src/lib/client-error-log.ts` (installed once in `__root`) into `client_errors` with page, last action and stack; keep it dependency-free so it can't itself crash the page.
