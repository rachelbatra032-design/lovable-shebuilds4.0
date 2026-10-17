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

## Language handling

- Voice notes and recording audio are transcribed in the original language (Malayalam, Hindi, Tamil, English, including mixed speech like Manglish/Hinglish).
- The original text is always stored. Extracted knowledge is normalized internally, and readers can view it in English or their own language with a single switch.

## Design direction

A warm "field notebook" look: off-white paper background, deep ink-green primary, a terracotta accent, editorial serif headings (Instrument Serif) with Work Sans body text, and a font with Indic script support (Noto Sans Malayalam/Devanagari/Tamil) so regional text displays cleanly.

## Phasing

- **Phase 1 (this build)**: auth, company/departments/roles, daily voice/text logs, document and chat uploads, AI extraction, map in Read and Visual modes, Ask chat, language switch.
- **Phase 2**: KT and screen-recording capture/upload with audio transcription plus key-frame analysis, onboarding plan generator, conflict review, department dashboard.

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
