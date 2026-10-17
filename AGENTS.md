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
- Onboarding readiness is computed by the shared source-backed validator in `src/lib/plan-completeness.ts` on save and display, not by an AI readiness claim; missing or legacy audits fail closed to draft.
- Stale dynamic-module failures recover through a fresh document load, capped per path to prevent reload loops; ordinary runtime errors remain in the error boundary.
- Root and router-default error boundaries share `RouteErrorScreen` so failed route imports retain a visible retry and home action after recovery is exhausted.
- Typography is centralized in global font tokens; display and body share one sans-serif stack with script-specific fallbacks so headings and controls stay consistent across languages.
- Shared surface and category colors use global semantic tokens; retain legacy token aliases so redesigns do not alter knowledge logic or status behavior.
- Shared navigation and mixed text/action rows use shrink-safe responsive grids; bounded chat/map canvases and scrollable dialogs keep phone controls reachable without changing laptop layouts.
- Theme preference is owned by the root ThemeProvider and restored after hydration; shared tokens and graph variables keep light/dark presentation consistent without server storage access.
- Role panels share one tab state and one responsive tablist, fixed to the phone bottom edge with safe-area clearance, so desktop and mobile navigation cannot diverge.
- Invitations allow only acceptance updates, are consumed atomically on membership insertion, and cannot be reopened; this prevents retargeting or reuse after removal.
- Database triggers reject cross-company related IDs and tenant reassignment; per-row membership policies alone cannot guarantee relationship integrity.
