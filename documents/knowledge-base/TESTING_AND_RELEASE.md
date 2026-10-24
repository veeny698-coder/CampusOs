# Quality Assurance, Acceptance Testing and Release Playbook

## What passing CI currently means
The repository GitHub workflow has historically installed npm dependencies, executed `npm run typecheck` and `npm run build`. Passing these checks does **not** establish functioning multi-tenant apps, original CertiFrenzy parity or production readiness. Extend pipeline before release.

## Test environments
- **Local/dev:** disposable Supabase schema, fake tenant/student data, feature development.
- **Integration/staging:** dedicated Supabase project and branch, production-like RLS, Vercel preview after explicit setup, isolated test mail/payment/AI.
- **Production:** real user data; destructive tests forbidden; changes require change ticket, migration plan, rollback and smoke tests.
Never use production service-role key for tests, in GitHub actions logs or frontend. Automatically provision two test tenants plus scoped identities.

## Test identities and scenarios
A = institution owner for tenant A, B = owner tenant B; H = head of Society A1; S = QR scanner of event A1; C = certificate manager event A1; P = registered participant; X = anonymous; R = revoked member. One user has memberships in A1 and A2.
- Auth: invalid/expired invitation; fresh login; password/passkey; session expiry; recovery; MFA privileged role.
- Permissions: H can manage only A1; S can check in A1, cannot export lists if not granted; B cannot access A; R denied even with open tab.
- Grants: institution-wide, org, event, child event, shared event, expiry and revoke; delegation cannot exceed grantor's rights.
- Events: draft → approved/published, nested schedule, cancel/close, duplicate registration race and import rollback.
- QR: camera scanning, incorrect host/QR, duplicate, concurrent, early/late, revoked station access, attendee vs staff vs meeting context.
- Feedback: required questions, form closed, repeated responses, tampered ticket, private fields not on certificate, answer version.
- CertiFrenzy: original UI screenshot comparison, portrait/landscape, long names/Unicode, custom placeholders/QR, participants/coordinators, valid/revoked/reissue, old URLs, ZIP/PDF artifacts.
- Others: society card validity and meeting attendance, auditions role separation, judge scoring locks, sending permission and finance isolation.
- AI: preview and confirmation for **every** write; deny tool when delegated action absent; no hidden mutation.
- Commercial: free founding contract, expired trial, quota hard/soft limits, webhooks idempotent and replay-safe, export at cancellation.

## E2E golden path
1. Founder provisions tenant A under explicit contract and verifies institution owner.
2. Institution owner creates Society A1, Society A2, invites heads; same student joins both.
3. Society head creates parent festival with child event. Registration form published and respondent registers.
4. Participant gets unique QR. Scanner assigned only A1 event scans (once). Another event denies.
5. Feedback link opens original CertiFrenzy form. Required fields complete. Eligibility evaluated.
6. Certificate issued with immutable event/template/recipient snapshot, stamped Powered by CertiFrenzy.
7. Participant downloads PNG/PDF, QR verification displays approved fields; revoked certificate displays revoked.
8. Coordinator staff shift attendance/hours is separately confirmed before staff certificate according to policy.
9. Remove scanner portal assignment; attempt scan fails. Tenant B cannot view A registrant.
10. Audit traces all mutations with actor/action/scope/time.

## Automation layers
- Unit: business rules, parent-child traversal, policy evaluation, ID/QR utils, import parser, placeholder mapping.
- DB integration: real Postgres constraints, policies, functions with non-owner user sessions, concurrency tests.
- API/server: signed auth cookies, unsafe role injection, rate limits, export identity and authorization.
- Browser: Playwright across desktop+mobile viewports; camera mocks and real-device pilot; screenshots original vs new.
- Regression: golden flow on every release candidate; load/failure and privacy on weekly/security milestones.

## Release gates
| Stage | Required evidence |
|---|---|
| PR approved | requirement IDs, ADR if needed, threat assessment |
| Build | deterministic npm install, lint/typecheck/build, tests |
| Schema | disposable migration up/down compatibility, RLS regression |
| UI | original design parity, responsive, accessibility and empty/error |
| Staging | seeded two-tenant E2E, negative scope and race |
| Security | secrets scan, CSP, auth & public endpoint review |
| Performance | agreed p95/SLO, scan bursts and batch queue |
| Owner sign-off | pixel parity for CertiFrenzy and business journey approval |
| Production | explicit deployment authorization, backups, monitoring, smoke test and rollback |

## Deployment controls
Automatic Vercel Git builds are intentionally ignored via `exit 0`. Do not remove/reset casually. User must explicitly request manual deployment. Always record exact Git commit SHA, project ID, environment, deployment result, logs, domain verification and rollback options. Distinguish GitHub green CI from Vercel READY and functional smoke test. A CANCELED ignored deployment is not a build failure or a deployed code version.

## Incidents / rollback
Before schema change snapshot metadata/backups and data migrations; prefer backwards-compatible additive DDL. Maintain prior Vercel READY deployment. Feature-flag new portals. On error turn off new portal flag, restore prior deployment with user approval, reconcile data if needed; never drop historic certificates/registrations.

## Evidence file conventions
`documents/qa/<YYYY-MM-DD>_<module>_<scenario>.md` containing tenant fixture, actor, requirement IDs, test command, observed result, screenshot/log URL, reviewer and blocker; avoid storing real student emails or access tokens.
