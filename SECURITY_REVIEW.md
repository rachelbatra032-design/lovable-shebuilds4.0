# Kaimaaral security evidence — October 17, 2026

## Three layers
- **Frontend:** privileged AI calls are not imported into browser components; the AI key is read inside the server-only AI module. Source review is not a production-bundle audit. The browser publishable key is intentionally public and does not bypass row policies.
- **TanStack backend:** all five app server functions validate the caller through the managed authentication middleware and query as that caller, not through a privileged client. Plan generation computes procedural completeness server-side before saving.
- **Database and files:** all inspected application tables have row-level security enabled. Company membership gates company data and the first segment of private upload paths. The inputs bucket is private, with a 50 MB limit. Company members intentionally share company knowledge; this is company isolation, not private-per-employee documents.

## Fixed in this review
- Invitees previously could change an invitation's company and join an unrelated company. Authenticated invitation updates now permit only `accepted`.
- Accepted invitations could previously be reused after membership removal. Joining now consumes invitations atomically; consumed invitations cannot be reopened or reused.
- Related IDs previously could reference another company. Database triggers now enforce company ownership for department, role, source-input and knowledge-item relationships, and reject company reassignment.

## Live evidence
Eight assertions passed against the real signed-in preview session: invitation retarget denied; unrelated company hidden; unrelated membership denied; legitimate invitation accepted; invitation atomically consumed; reopening denied; foreign-company role reference rejected; rejoining after membership removal denied.

Regression source: `src/test/invitation-security.py`. It requires temporary fixtures and a minted session; run the main checks, remove the test membership, then run `--after-removal`. Temporary fixtures were deleted after verification. No credentials are stored in the test.

All 24 existing automated tests passed after the changes. Preview build reports OK. Signed-in workspace screenshot inspected.

## Not a security certification
- Basic backend scan completed with no findings; it explicitly **does not include deep code analysis**.
- Deep scan still requires **More → Security → Run deep scan** in the editor. Wait for completion and an **Up to date** result; review all findings before publishing. No deep result was available through the tools used here.
- Dependency scan still reports two moderate `sprintf-js` denial-of-service warnings through TanStack Start and Mammoth. The official SheetJS tarball cannot be checked against registry advisories by this scanner.
- Members currently have collaborative write access. Direct API edits to stored plan JSON bypass the generation-time readiness validator; the displayed Plan recomputes readiness, but stored readiness is not an authoritative permission or execution gate. A database-enforced stored-plan gate remains unimplemented and must not be claimed as verified.
- Error telemetry can contain page query strings, labels and arbitrary error messages; sensitive-data redaction and server-enforced abuse limits were not verified.
- No production deployment, exhaustive penetration test, or two-real-account isolation audit was performed. These checks do not establish that all vulnerabilities are resolved.

## Publication
No publication was requested or performed in this review. Deep scan and outstanding findings remain release gates.