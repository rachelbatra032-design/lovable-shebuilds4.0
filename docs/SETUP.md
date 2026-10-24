# Setup guide

This guide takes the repository from a fresh clone to a running copy of Kaimaaral on your machine.

## What you need

- **Bun 1.1 or newer** (the lockfile is `bun.lock`, so Bun is the package manager)
- **A backend** that provides a PostgreSQL database, user auth, file storage and row level security. The app was built on Lovable Cloud, so any project with the same three pieces works.
- **A Lovable AI Gateway key** for the AI features (extraction, chat answers, translation, plan generation, transcription).

## 1. Clone and install

```bash
git clone <repository-url>
cd <repository-name>
bun install
```

## 2. Environment variables

```bash
cp .env.example .env
```

Fill in your own values. The `.env` file is ignored by git, so real keys never get committed.

| Variable | Where it runs | What it is |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | browser | Backend address |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | browser | Publishable (public) API key |
| `VITE_SUPABASE_PROJECT_ID` | browser | Project identifier |
| `SUPABASE_URL` | server | Same backend address |
| `SUPABASE_PUBLISHABLE_KEY` | server | Same publishable key |
| `SUPABASE_PROJECT_ID` | server | Same project identifier |
| `LOVABLE_API_KEY` | server only | Lovable AI Gateway key |

Never prefix the AI key with `VITE_`. Anything with that prefix is shipped to the browser.

## 3. Apply the database migrations

The schema, row level security policies, triggers and helper functions live in `drizzle/migrations`. Apply them in numeric order, `0000` through `0006`.

With drizzle-kit:

```bash
export LOVABLE_DB_MIGRATION_URL="postgres://user:password@host:5432/postgres"
bunx drizzle-kit migrate
```

Or apply the files directly with `psql`, in order:

```bash
psql "$LOVABLE_DB_MIGRATION_URL" -f drizzle/migrations/0000_migration.sql
psql "$LOVABLE_DB_MIGRATION_URL" -f drizzle/migrations/0001_language_prefs_and_client_errors.sql
psql "$LOVABLE_DB_MIGRATION_URL" -f drizzle/migrations/0002_narrow_helper_function_execution.sql
psql "$LOVABLE_DB_MIGRATION_URL" -f drizzle/migrations/0003_secure_invitation_acceptance.sql
psql "$LOVABLE_DB_MIGRATION_URL" -f drizzle/migrations/0004_enforce_company_reference_boundaries.sql
psql "$LOVABLE_DB_MIGRATION_URL" -f drizzle/migrations/0005_handover_agent_runs.sql
psql "$LOVABLE_DB_MIGRATION_URL" -f drizzle/migrations/0006_atomic_translation_cache.sql
```

What the migrations set up:

- Company, department, role, member, invite, input, knowledge item, link, change request and agent run tables
- Row level security on every table, gated by the `is_company_member` and `is_company_admin` helpers
- Triggers that reject cross-company references and tenant reassignment
- Invitation acceptance that can only add a membership, is consumed atomically, and cannot be reopened
- An atomic translation cache function that refuses to save against changed source text
- File access rules for the storage bucket described below

## 4. Create the file storage area

Create one **private** bucket named `inputs`. Upload paths start with the company id, and migration `0000` already adds the read, upload and delete policies that check company membership for that first path segment. Keep the bucket private; the policies are what make access safe.

## 5. Turn on sign-in

Enable:

- **Email** sign-in, with email confirmation on
- **Google** as a provider
- **Sign in with Lovable** as a provider

Enable Google and Lovable together. If one is missing, the first attempt to use it fails with "Unsupported provider". Both redirect back to the app's own `/auth` route, so add that address to the allowed redirect URLs.

## 6. Add the AI key

Put your Lovable AI Gateway key in `LOVABLE_API_KEY`. It is read only inside server functions, never in the browser. Without it the app still opens and stores notes, but extraction, chat answers, translation and plan generation will fail.

## 7. Run it

```bash
bun run dev          # opens on http://localhost:8080
bunx vitest run      # 36 automated tests
bun run lint         # eslint
```

## 8. First run in the browser

1. Open the app and read the **Read Me** page.
2. Create an account and confirm the email.
3. Pick your recording languages, and an optional reading language for the successor.
4. Create the sample workspace. It builds a fictional company, "Kerala Spices Traders", always labeled **Sample data**, and it is private to your account.
5. Open **Accounts Lead** and walk the eight-step guided walkthrough.

## Troubleshooting

| Symptom | Cause and fix |
| --- | --- |
| "Unsupported provider" on first sign-in | Google or Lovable is not enabled in the backend's auth settings. Enable both. |
| Uploads fail | The `inputs` bucket is missing, or it was created public. Create it private. |
| AI features return errors | `LOVABLE_API_KEY` is missing, wrong, or prefixed with `VITE_`. It must be server-only. |
| Hand-rolled API calls fail with "Expected 3 parts in JWT; got 1" | The publishable and secret keys are opaque, not JWTs. Use the generated clients rather than building requests by hand. |
| A stale deploy shows a blank screen | The app reloads the page once to pick up new files. If it repeats, clear the site data for the origin. |
| Tests fail on a fresh clone | Dependencies are missing. Run `bun install` again, then `bunx vitest run`. |

## Notes

- Sample content is fictional. Do not treat it as real business data.
- Read [Security review](SECURITY_REVIEW.md) before pointing this at real company data.
- The knowledge, plan and translation rules are explained in [Workflow verification](WORKFLOW_VERIFICATION.md).
