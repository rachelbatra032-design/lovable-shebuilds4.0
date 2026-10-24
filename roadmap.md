# Roadmap (SheBuilds deadline Sun Oct 18 12:29 IST)

- [x] Align capture upload choices and rewrite Read Me as a visual guide with a review checklist; 34 tests pass and layouts verified on phone/tablet/laptop. Spoken browser test recording saved, transcribed and extracted; hosted signup settings read successfully.
- [ ] Complete physical microphone/screen-sharing and fresh email-confirmed account checks — requires a real device and accessible inbox; browser simulation and hosted settings are verified separately.

- [x] Re-run all automated tests and the signed-in core journey after the status-bar and typography changes (34 tests passed; real captures, text upload, cited Ask, translations, tracked agents, Draft checks, dark-mode persistence and protected access verified; invitation acceptance fixture absent and device/signup limitations recorded in WORKFLOW_VERIFICATION.md).

- [x] Extend the workspace reference design across role panels, workspace and Read Me, preserving phone navigation (33 tests pass; all panels, Visual, Read Me anchors and dark mode checked at 360, 393, 726 and 1280px with one tablist and no page overflow)

- [x] Refresh the design using the Hand Off reference and remove app-facing em dashes, including saved AI content (33 tests pass; homepage, sign-in CTA, Read Me, all signed-in role tabs and Visual map checked on phone/laptop without overflow or runtime errors)

- [x] Run the full test suite and live core journey, including all reading languages (33 tests pass; signed-in capture, Review, cited Ask, Draft Plan, translations and phone/laptop navigation verified; limits in WORKFLOW_VERIFICATION.md)
- [x] Add user-triggered handover agents with private run history and human-reviewed results (Plan builder and rule-based Readiness checker; completed history survives reload)

- [x] Design system + landing page + Read Me page
- [x] Cloud: schema, auth (email, Google, Lovable), sample company "Kerala Spices Traders"
- [x] Workspace: departments, roles, invites
- [x] Daily voice/text log + transcription + AI extraction
- [x] Role map Read/Visual + language switch + sources
- [x] Ask the role chat with citations
- [x] Change confirmation cards + completeness index
- [x] File / chat export uploads, KT/screen recordings, onboarding plan
- [x] Signed-in end-to-end tab test
- [x] First sign-in language setup (recording languages + optional output language)
- [x] Automated interaction tests for Visual/Capture/Review/Ask/Plan
- [x] Better onboarding plan (research-based structure + clearer page)
- [x] Client-side error logging (page, last action, stack)
- [x] Onboarding: actual recorded procedures instead of questions or shadowing arrangements
- [x] Onboarding readiness check: flag missing screen paths, decision criteria, approval rules and completion criteria
- [x] Basic security scan, signed-in main journey, labels, category, testing instructions and fallback verification
- [x] Persistent route-loading fallback with retry after automatic recovery
- [x] Simplify typography and verify phone/laptop layouts across sign-in, workspace and role tabs (360px, 390px, 1366px; no page overflow or runtime errors; 21 tests pass)
- [x] Replace the rejected notebook look with a simple Grok-inspired monochrome design; verified sign-in, workspace, all role tabs and language dialog at 360px, 390px and 1366px (no overflow/runtime errors; 21 tests pass)
- [x] Add compact phone panel navigation, consistent capture/upload/map styling, optional dark mode, and clearer role-map hierarchy and decision summaries (24 tests pass; signed-in phone/laptop checks, theme persistence, real upload and sourced Ask answer verified)
- [ ] Publish and verify judge access — waits for user authorization to publish
- [x] Simplify the first-time walkthrough, clarify fresh/returning sample access, and keep Read Me reachable on phones (verified signed in at 360/390/1366px; no overflow or runtime errors; 24 tests pass)
- [x] Add a distinctive monochrome handover identity to workspace, role headers and visual map (24 tests pass; category switching and source opening verified at 393/1366px without overflow or runtime errors)
- [x] Review three security layers, fix invitation and company-reference access gaps, retain evidence and pass eight live security assertions
- [ ] Complete Lovable deep code scan before publication — requires More → Security → Run deep scan in the editor
- [ ] Review stored-plan direct-write enforcement and sensitive error telemetry — not established by this security review
- [ ] Resolve remaining sprintf-js dependency warnings — no patched registry release available
- [ ] Complete external Hub submission fields and optional screenshot uploads — Hub form unavailable here
- [ ] Freeze submitted version — waits for confirmed submission
