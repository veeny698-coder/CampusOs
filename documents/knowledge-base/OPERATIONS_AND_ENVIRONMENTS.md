# Runtime Configuration, Infrastructure and Operations

## Inventory (verified in earlier account interactions)
- Source: `veeny698-coder/CampusOs`, requested working branch `main`.
- Vercel project: `campus-os`, project ID `prj_3I84eeM7B7Yg9VFQxLGhKzaDZVy7`, team `team_7QeTtJzekD7BUZ9jVfOG7ok3`.
- Domain: `https://campusblaze-os.vercel.app`. SSO deployment protection applies to relevant Vercel preview URLs.
- Supabase project: `dcpetrudlngtrabmdwol` (current shared project).
- CI: `.github/workflows/ci.yml`. Build status must be queried for exact latest SHA.
- Auto Vercel builds deliberately disabled with ignored build command `exit 0`; canceled auto deployments expected.
These identifiers are project metadata, **not credentials**. Verify state before any production operation.

## Env principles
List only variable names in documentation or `.env.example`, NEVER values. Expected classes: `NEXT_PUBLIC_SUPABASE_URL`, public anon/publishable key (verify exact code), Supabase service-role only on trusted server if absolutely needed, auth RP/origin, optional email SMTP/provider keys, n8n signed webhook keys, billing provider secrets, analytics errors/tracing DSN.

## Operational separation
Global owner control plane ≠ tenant operations. Production student records must be unreadable absent justified support privileges; use redacted logs and sample data in QA.

## CI expectations
`npm ci` on lockfile-managed dependency installation, `npm run typecheck`, build, ESLint/test scripts, Supabase migrations in ephemeral DB, Playwright E2E, secret/dependency scan. Existing project might not include a committed lockfile; add/reconcile before changing CI to npm ci.

## Observability
Log request id, tenant id, event id, actor id (not secret token), operation, result and error code. Monitor auth errors, check-in duplication, certificate rendering failures, feedback claim failures, cross-tenant policy denials, provider delivery, job backlog and subscription entitlements. Alerts on unusual denied scans, high error rates and source-bucket anomalies.

## Backups/restore
Define Supabase PITR and snapshot policy consistent with contract/privacy law. Test restore into isolated environment periodically; archive certificate evidence/issued template snapshots. Take backup before migrations and maintain rollback runbooks.

## Media and data export
Certificate artwork public bucket only for explicitly non-sensitive templates. Student ID photos, rosters, feedback and reports private by default. Upload content-type signature, dimension, file size and ownership checks. Export via audited scope gate, masking and short-lived URL.

## Release and governance
Review dependency licenses and original CertiFrenzy code provenance. Secure credentials, check Node version alignment (Vercel may use Node 24, GitHub CI Node 22), detect Next.js unstable API changes. Avoid blind package updates. Document deployment exact commit and smoke result.

## Open operational decisions
Pricing/payments, data residence, university SSO/MFA, support access approvals, retention, backup RPO/RTO, usage quota definitions, native messaging provider, student guardian/consent requirements where applicable. Do not invent source values.
