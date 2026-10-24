# Put Kaimaaral on GitHub

## How it works
Lovable syncs all of your code to GitHub for you, so you don't have to upload anything by hand. The connection is something only you can turn on:

1. Open Project settings, then Git (or use the + menu next to the chat box, then Project, then GitHub).
2. Click Connect GitHub and sign in to the GitHub account or organization you want to use.
3. Lovable creates a new private repository and pushes all of the code. After that, every change syncs both ways.

Notes:
- Lovable always creates a brand-new repository. It cannot link to one you already have.
- Your data (companies, roles, recordings) stays in the app's backend. Only the code goes to GitHub.
- No secret keys are stored in the code. The only key in it is the public one the app is designed to expose.

## What I will prepare so the repository looks professional
1. **README.md**: what Kaimaaral does, the problem it solves for Indian SMEs, main features (capture, map, Ask, Review, Plan, agents, four languages), how judges try it, a tech overview and how to run it locally.
2. **docs/ folder**: move the loose report files out of the root and into `docs/`, so the root stays tidy:
   - `docs/SUBMISSION_READINESS.md`
   - `docs/SECURITY_REVIEW.md`
   - `docs/WORKFLOW_VERIFICATION.md`
   - `docs/roadmap.md`
3. **.env.example**: lists the settings the app needs, with placeholder values, for anyone running it locally.
4. **Check .gitignore** so build output and dependencies never get uploaded.
5. Update the links in `AGENTS.md` and the roadmap rule so they point to the new `docs/` locations.

## Final layout
```text
kaimaaral/
  README.md
  AGENTS.md
  .env.example
  docs/            reports: security, verification, readiness, roadmap
  src/
    routes/        pages (home, Read Me, sign-in, workspace, role)
    components/    role workspace panels, walkthrough, shared UI
    lib/           AI, translation, plan checks, capture logic
    integrations/  backend client (generated)
    test/          automated tests
  supabase/        database migrations
  public/          static files
```

## Not changed
App behavior, design, tests and data stay the same. I will run all tests after the file moves.
