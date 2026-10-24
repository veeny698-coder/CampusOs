# AGENTS.md — CampusOS repository instructions

> Mandatory for Codex and contributor agents. Scope: entire repository. Branch: **main**.

## Reading order
1. `documents/README.md`: canonical source list.
2. `documents/knowledge-base/00_START_HERE.md`: architecture/context.
3. `documents/knowledge-base/PRODUCT_CONTRACT.md`: immutable product requirements.
4. `documents/knowledge-base/SYSTEM_ARCHITECTURE.md`: integration model.
5. `documents/knowledge-base/PORTAL_RBAC_AND_TENANCY.md`: permissions and boundaries.
6. `documents/knowledge-base/CERTIFRENZY_PARITY.md`: original UX/code migration.
7. `documents/IMPLEMENTATION_MASTER_PLAN.md`: implementation phases and definition of done.
8. Original attached master PRD/SRS DOCX and `certifrenzi-main(1).zip` where available.

## Hard product rules
- Work **on main only** as the owner instructed. Preserve all user data, credentials, tenant and event IDs.
- Shared Supabase project/auth; `public.events.id` is canonical for QRBlaze, registration, check-in, CertiFrenzy templates, feedback and certificates. No Firebase or secondary certificate DB.
- **Copy original CertiFrenzy frontend/UI/workflow**, do not improvise replacement designs. Replace old persistence/auth adapters with Supabase, and reconcile unique event IDs.
- **Powered by CertiFrenzy** visible in actual generated PNG/PDF/ZIP and verification pages, including uploaded template backgrounds.
- Every major function is its **own assignable/revocable portal**: Events, QR Scanner, CertiFrenzy, future Auditions, Societies, IDs, Meetings, AI, etc. Enforce rights on every route, action, RPC, row, export and storage object, not just UI.
- One account can have multiple institution/society memberships, separate roles and active workspace.
- All **AI-driven writes** require explicit human confirmation, even the smallest write.
- Super Admin and tenant owner are distinct. Global platform owner is not automatically authorized to browse sensitive student data for routine support.
- Respect master documents' **all-phases target**. P0/P1 deliverables are milestones, not scope cuts.
- Automatic Vercel Git builds remain disabled. No manual deployment without explicit permission.

## Source precedence
Latest explicit user directives > approved PRD/SRS/change decisions > reviewed ADR and tests > original CertiFrenzy UI/code > current code. Documents dated 22 Oct 2026 are marked **draft**. If design conflicts, document open decision, avoid silently overriding user direction.

## Work loop
1. Identify source requirement IDs and acceptance scenarios; open source document (not just a summary).
2. Inspect current code, schema, RLS and original UI; map old endpoints → shared Supabase domain APIs.
3. Write smallest compatible migration; verify foreign-key tenant integrity and deny-by-default.
4. Implement tested feature without breaking existing auth, roles, QR scanning, certificates and public pages.
5. Add positive AND negative tests: out-of-scope tenant/event, expired/revoked grant, duplicate issuance/QR, privacy leaks and invalid inputs.
6. Run npm typecheck/build/tests and CI; use disposable test tenant/test database for destructive scenarios.
7. Update traceability and decision docs; commit atomic changes to main; report tests with evidence and known gaps.

## Data/auth safety
- No service-role credential in browser, markdown, logs or public endpoints. Never commit legacy Firebase secrets.
- Lock down SECURITY DEFINER search_path; explicit grants; no unchecked RLS bypass.
- Resolve tenant, organization, event and action scope for each mutation, query and export.
- A portal assignment grants no access unless authenticated, active within time window, and member still belongs to authorized scope.
- Public feedback/ticket and certificate links are bearer capabilities; add rate limiting and abuse review.
- Issue certificates only when versioned eligibility rules pass; audit issues/revokes/reissues.
- Shared scanner must differentiate participant registration, coordinator shift, society meeting and audition attendance.
- QR carries opaque reference, never raw PII. Include event/session context on check-in.
- Only approved public certificate fields go into verification; private feedback is not exposed.
- Test CSV formula injection, uploads, signed URLs, content validation, request concurrency and replay.

## Agents and expected deliverables
- Product analyst: PRD/SRS ID traceability and missing decisions.
- Original UI migration: exact component/layout parity screenshots + adapters, no UI invention.
- Data/security: schema, grants, RLS, negative authorization tests and rollback.
- Portal/identity: scopes, delegation, membership, revocation, workspace switcher.
- QA/release: E2E test matrix, responsive/a11y, staging verification and release checklist.
Every agent reports modified files, requirement IDs, tests, unresolved risks. Integrator verifies shared event identity.

## Completion policy
Only mark requirement VERIFIED when implementation, test evidence, security check and necessary product-owner visual approval exist. A passing TypeScript build is **not** proof of working feature parity or production readiness. Do not silently claim "complete". See implementation plan for gates.
