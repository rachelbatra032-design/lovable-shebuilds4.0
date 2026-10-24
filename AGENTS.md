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
- Typography is centralized in separate display and body font tokens with script-specific fallbacks; headings use the display token while controls and reading text use the body token so the reference typography remains consistent across languages.
- Shared surface and category colors use global semantic tokens; retain legacy token aliases so redesigns do not alter knowledge logic or status behavior.
- Shared navigation and mixed text/action rows use shrink-safe responsive grids; bounded chat/map canvases and scrollable dialogs keep phone controls reachable without changing laptop layouts.
- Theme preference is owned by the root ThemeProvider and restored after hydration; shared tokens and graph variables keep light/dark presentation consistent without server storage access.
- Role panels share one tab state and one responsive tablist: desktop left rail, tablet horizontal navigation, and phone bottom navigation with safe-area clearance, so navigation behavior cannot diverge.
- Invitations allow only acceptance updates, are consumed atomically on membership insertion, and cannot be reopened; this prevents retargeting or reuse after removal.
- Database triggers reject cross-company related IDs and tenant reassignment; per-row membership policies alone cannot guarantee relationship integrity.
- Visual role maps expand one category at a time in a stable three-column layout, keeping dense maps readable without changing stored knowledge or links.
- Handover agents invoke existing authenticated plan generation and source-backed validation, with company-scoped run history; they never auto-approve knowledge changes.
- Translation caches merge atomically under caller RLS and compare source text before saving, preventing concurrent languages or edited sources from being overwritten.
- Visible punctuation is normalized after hydration by a root-owned observer, excluding editable fields; original stored evidence stays untouched so readiness and translation checks retain their exact source text.
- Shared progress indicators use a provider-free accessible DOM implementation to avoid introducing a separate context dependency into the handover workspace.
- Read Me keeps judge criteria and a local, user-ticked walkthrough separate from actual workspace readiness; its progress never changes business data.
- The optional role walkthrough uses one controlled step list and stable targets, changes only the visible panel, and restores the prior view on exit; it never submits captures, runs agents or changes readiness.
