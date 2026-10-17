# Role Memory: a living onboarding map for each department

A shared workspace where people in each department (Finance, Marketing, Ops...) record how they do their work every day, in Malayalam, Hindi, Tamil or English. The AI turns these inputs into an onboarding map for each role. When someone leaves, the next person gets a working onboarding plan and can ask questions about the role.

## Who uses it

- **Company admin**: creates the company workspace and departments, and invites people.
- **Role-holder**: belongs to a department and owns one or more roles (e.g. "Accounts Payable Lead"). Adds daily logs and uploads files.
- **Successor / new hire**: reads the map and onboarding plan, and asks questions in their chosen language.

## Core flows

1. **Sign up and set up the workspace**: create a company, add departments, invite teammates by email, and assign each person a role.
2. **Daily log** (the "day in the life"): a quick entry each day with a voice note, typed text, or both, in any of the 4 languages. A prompt asks: "What did you decide today, and why?"
3. **Uploads**: PDFs, Word, Excel/CSV, email exports (.eml/.txt), WhatsApp/Slack chat exports, plus **KT session recordings and screen recordings with audio** (upload a file or record inside the app).
4. **AI processing**: each input is transcribed, read, and broken down into tasks, decisions (and the reasons behind them), people/contacts, tools/systems, schedules (daily/monthly/yearly) and edge cases. Each item links back to the input it came from.
5. **Cross-referencing**: new inputs are merged into the role's map. Repeated patterns become stronger, and conflicting statements are flagged for the role-holder to confirm.
6. **Onboarding map** with a **Read / Visual toggle**:
   - Read mode: structured sections (Responsibilities, Recurring tasks and calendar, Key decisions and judgment, People and contacts, Tools and systems, Edge cases and gotchas).
   - Visual mode: an interactive graph of tasks, decisions, people and tools. Click a node to see its details and sources.
7. **Onboarding plan**: an AI-generated week 1 / week 2 / month 1 plan for the successor, built from the map.
8. **Ask the role**: chat with the role's map. Answers cite their sources. The successor picks the answer language; original quotes are kept and can be shown.
9. **Department view**: every role in a department, how complete each map is, and recent activity.

## "Read Me" page (/readme, linked from the home page and the app header)

- **How to review in 3 minutes**: open the demo, then the Accounts Lead map, switch Read/Visual and the language, ask "How do I pay a new vendor?", record a voice note in any language, and confirm the pending change card.
- **1. Usefulness and understanding of the user (30)**: who it's for (Indian SMEs whose staff work in regional languages), the problem (knowledge leaves when people leave, and wikis don't get written), and how each feature maps to a real need: voice in your own language, no writing, handover plan.
- **2. Functionality and execution (30)**: the working core journey step by step, what is real AI vs. sample data, and how errors and limits are handled.
- **3. User experience and design (25)**: mobile-first logging, Read/Visual modes for different learning styles, Indic fonts, accessibility choices, and clear feedback states.
- **4. Originality (15)**: organized by role instead of by page, regional languages first, the change-confirmation loop, and the completeness index.
- Known limitations and sample-data notes. Demo credentials are not shown on the page; they go in the private form.

## End-to-end user flow

```text
Landing page --> Sign up / "Try the demo"
   |
Admin: create company --> add departments (Finance, Marketing...) --> add role cards --> invite people by email
   |
Role-holder dashboard ("My roles")
   |-- Daily log: tap mic --> speak in Malayalam/Hindi/Tamil/English --> save
   |-- Upload: files, chat exports, emails, KT/screen recordings
   |        |
   |   Processing status: transcribing --> extracting --> added to map
   |        |
   |-- Review inbox: "Did this change?" cards --> Confirm / Keep old
   |
Role map  [Read | Visual toggle]  [language switch]
   |-- sections or graph --> click an item --> see its source (clip, snippet, file)
   |-- Ask the role (chat with cited answers)
   |-- Onboarding plan (week 1 / week 2 / month 1 checklist)
   |
Manager: department view --> completeness % per role --> spot risky roles
   |
Handover: role-holder leaves --> admin assigns successor --> successor opens the map, plan and chat
```

## Design system

- Components: shadcn/ui (accessible, already in the project), themed with our own colors and fonts so it doesn't look generic.
- Accessibility: WCAG AA contrast, large touch targets for the mic button, full keyboard support, readable Indic fonts at 16px or larger.
- Mobile-first for daily logging, with a desktop-friendly layout for the map and graph.
- Every screen gives clear feedback: processing states, empty states that explain what to do next, and "Sample data" badges.

## Capture first, writing optional

The app is built to capture work and organize it automatically, not for people to write and maintain pages. Nobody writes an SOP.

- One-tap "End of day" voice button on every screen. It works well on phones (60-second notes).
- Forward or paste email threads and chat exports straight into a role's bucket.
- Screen recordings become **step-by-step guides with annotated screenshots** (key frames + narration turned into numbered steps).

## Keeping the map fresh

- **One-click change confirmation**: when a new log contradicts the map (e.g. "we switched from Vendor A to Vendor B"), the role-holder sees a card with Confirm change / Keep old, and the map updates itself.
- Items that haven't come up in recent inputs are marked "possibly outdated".
- Every point links back to its source: you can play the voice clip, open the chat snippet or document, or view the screenshot.

## Completeness index

Each role card shows a coverage score, e.g. "Accounts Lead: 85% documented, based on the last 30 days of activity". It reflects how many task categories are covered, how recent and frequent the logs are, and how many items have no source or are unconfirmed. Managers see which roles are a risk (single points of failure) on the department view.

## Ask the role: multi-format answers

Answers give exact steps, cite their sources inline (with a playable voice clip, screenshot, or chat excerpt), and can be turned into a day-by-day or week-by-week checklist.

## Language handling

- Voice notes and recording audio are transcribed in the original language (Malayalam, Hindi, Tamil, English, including mixed speech like Manglish/Hinglish).
- The original text is always stored. Extracted knowledge is normalized internally, and readers can view it in English or their own language with a single switch.

## Design direction

A warm "field notebook" look: off-white paper background, deep ink-green primary, a terracotta accent, editorial serif headings (Instrument Serif) with Work Sans body text, and a font with Indic script support (Noto Sans Malayalam/Devanagari/Tamil) so regional text displays cleanly.

## Phasing

- **Phase 1 (this build)**: auth, one-click workspace setup with email invites, company/departments/roles, daily voice/text logs, document and chat uploads, AI extraction with source links, one-click change confirmation, map in Read and Visual modes, Ask chat, language switch, completeness index.
- **Phase 2**: KT and screen-recording capture/upload turned into step-by-step guides with screenshots, onboarding plan and checklist generator, department risk dashboard, "possibly outdated" marking.
- **Later / outside this app**: a WhatsApp or Slack bot for sending voice notes, and a browser extension that records clicks (like Scribe). A browser extension can't be built inside this project; WhatsApp/Slack need their own business accounts.

## SheBuilds submission (deadline Sun Oct 18, 12:29 IST, about 22 hours away)

Judges reward one focused, working journey more than lots of features, so Phase 1 is the submission and Phase 2 only gets built if time allows. Category: **Business Operations**.

Build order (each step leaves the app in a working state):
1. Workspace, departments, roles, sign-in.
2. Daily voice/text log in Malayalam/Hindi/Tamil/English, with transcription and extraction into the map.
3. Map in Read and Visual modes, with source links and the language switch.
4. Ask the role, with citations.
5. Change confirmation cards and the completeness index.
6. File and chat-export uploads.
7. Phase 2 extras (KT/screen recordings first) if time remains.

Pre-submission checklist built into the work:
- **Judge can open the link**: publish to a .lovable.app URL. The home page explains the product and has a "Try the demo" button.
- **Safe login**: a dedicated demo account (e.g. a fictional company "Kerala Spices Traders") with Finance and Marketing departments. The credentials go only in the private submission form.
- **Sample data clearly labeled**: fictional seeded logs in Malayalam, Hindi and English, an extracted map, and one pending change card, all marked with a "Sample data" badge. No real personal data.
- **Main journey works**: tested end to end while signed in as the demo user: record a note, see it processed, see the map update, ask a question.
- **Security errors resolved**: run a security scan and fix every error before submitting.
- **Known limitations** shown on an About page (e.g. maximum recording length, supported file types, accuracy can vary on regional dialects).
- **Testing instructions and screenshots**: I'll write short testing steps and capture 3 screenshots for the form.
- **Original build**: everything is created fresh in this project during the event, with no imported designs or templates.
- After submission, no further edits. Any further work happens in a separate copy.

## Technical details

- Lovable Cloud: email auth, profiles, `user_roles` table (admin/member), plus tables for companies, departments, roles, role_members, inputs (type, language, storage path, transcript, status), knowledge_items (kind, title, body, original_text, source_input_id, confidence), knowledge_links (graph edges), and chat threads/messages. RLS restricts all data to members of the same company.
- Storage: a private bucket for uploads and recordings, with a raised file size limit for video.
- AI through Lovable AI Gateway, called from server functions:
  - Speech-to-text default model for voice notes and the audio tracks of recordings (the browser extracts audio from a screen recording before upload; long audio is split into segments).
  - Default chat model (Responses API, streamed) for strict-schema JSON extraction, merging/conflict detection, translation, the onboarding plan, and Ask chat with citations.
  - Sampled video frames are sent as images so the model can read what is shown on screen during recordings.
  - Embeddings default model + pgvector so Ask chat retrieves the relevant items.
- Parsing: PDF goes directly to the model; DOCX/XLSX/CSV/email/chat exports are converted to text in the browser before upload.
- Graph view: React Flow, loaded only in the browser.
- In-app recording: MediaRecorder for voice notes, getDisplayMedia for screen + mic.
- Processing status is shown per input (queued, transcribing, extracting, done/failed), with gateway error messages displayed clearly when credits run out.
