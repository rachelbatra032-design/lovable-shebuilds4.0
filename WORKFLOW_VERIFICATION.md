# Workflow verification

## Guided walkthrough: October 24, 2026
- Added an optional eight-step role walkthrough covering coverage, recorded evidence, Visual, Capture, Review, Ask, Plan and tracked agents with business-value explanations and no em dashes.
- Signed-in private sample: all eight highlights verified at 1280x1800, 726x638 and 390x844; highlight and explanation did not overlap, and the page had no horizontal overflow.
- Next, Previous, Finish, Skip, replay, Auto-play, Pause and Escape checked through automated interactions or the live browser. Exiting restores the previous panel; the walkthrough submits no notes and runs no AI tasks.
- All 36 tests passed across 9 files. Latest preview build reports build OK; live browser recorded zero runtime errors.
- No physical-device, inbox, social-sign-in or security-release claims were added by this walkthrough check.

## Recheck: October 24, 2026
- Capture options now form one consistent group with plain-English document, screen and session-video choices; Read Me uses a visual five-step review checklist and criterion sections, checked at 1280px, 726px and 390px without overflow.
- Chromium recorded actual spoken synthetic test audio through the voice button, saved the recording, transcribed it and completed extraction. This verifies the browser recording path, not physical microphone hardware. The transcript misheard "training" as "trading", reinforcing the need to inspect the original recording.
- A successful read of hosted auth settings confirmed email sign-in and public signup enabled, email confirmation required, and anonymous signup disabled. The signup form rejected missing fields; a reserved example.com address was safely rejected by hosted auth. No real inbox was available, so email delivery, confirmation and full new-account onboarding remain unverified. No auth settings were changed.
- All 34 automated tests passed across 9 files after the typography and status-bar changes.
- Signed-out workspace access redirects to sign-in; Read Me opens publicly; signing out blocks role access again.
- Signed-in Map, Visual, Capture, Review, Ask and Plan were exercised at 1280px, 726px and 390px with no horizontal page overflow.
- Malayalam, Hindi and Tamil maps displayed native-script content without a translation retry error; English restored.
- Real fictional typed captures and a text-file upload saved and appeared in Capture history; extraction added their training procedures to the role map.
- Ask returned Suresh Nair's approval rule above ₹50,000, the GSTIN check and three source citations; a source sheet displayed the original Malayalam evidence.
- Plan builder completed and persisted after reload; Readiness checker also completed with 12 steps checked and 29 missing details. The plan remained Draft.
- Dark mode restored after hydration on reload; live browser checks recorded no runtime errors.
- The invitation security script passed its first three negative-access assertions but could not test valid acceptance: its reserved invite fixture is absent (confirmed by a read-only database query). This is an incomplete security recheck, not evidence that invitations are broken or secure in every case.
- Review had no pending conflicts; a fresh conflict acceptance was not exercised in this recheck.
- Physical microphone/screen recording, fresh signup and email delivery, social sign-in and native-speaker translation quality remain unverified, as do other document formats and the release gates below.

This recheck added explicitly fictional training notes and a text upload to the existing private sample company, and regenerated its draft plan. No production company was used.

## Earlier verification: October 18, 2026

## Passed
- Full automated suite: 8 files, 33 tests.
- Public Read Me loads; signed-out workspace and role access redirect to sign-in.
- Authenticated Accounts Lead workspace loads; Read/Visual, Capture, Review, Ask and Plan work.
- Malayalam, Hindi and Tamil render in their native scripts, including newly captured items. The recorded ₹50,000 threshold remains visible. English restores correctly.
- Real typed sample note saved, extracted into the map and read back in capture history.
- Pending sample change confirmed successfully.
- Real AI answer returned with source citations.
- Agent Plan builder generated a source-backed draft; Readiness checker reported 12 checked steps and 28 missing details. Incomplete plan remained Draft.
- Both completed agent runs persisted and were visible in a fresh browser after reload.
- Phone (393px) and laptop (1366px) panel navigation works without horizontal overflow or runtime errors.
- Sign-out removes access to the protected role page.
- Preview build reports build OK.

## Translation safeguards
- Invalid/empty cached translations fall back to English.
- Translation writes merge languages atomically under caller permissions and reject changed source text.
- Read/write failures surface instead of falsely reporting successful translation.
- Failed translation stops loading and offers an explicit retry; it does not loop automatically after failure.

## Not verified in this run
- Native-speaker linguistic review; rendering and preserved sample facts do not guarantee every translation is perfect.
- Fresh email signup, email delivery and complete social sign-in.
- Live microphone/screen capture, video, PDF, Word and spreadsheet extraction.
- New external agent services: this release uses the connected built-in Plan builder and deterministic Readiness checker, not an external-agent API.
- Deep security scan, public published-link access and external submission fields remain separate release gates.
- Closing the browser during an agent task may leave its history marked running; these are user-triggered foreground tasks, not durable background jobs.

Verification added two explicitly fictional sample capture submissions, confirmed the pending sample change and regenerated the sample plan in the user's existing private sample workspace. No production company was used.