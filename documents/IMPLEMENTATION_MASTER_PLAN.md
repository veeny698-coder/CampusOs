# CampusOS — Detailed Master Implementation Plan
**Planning baseline:** uploaded original PRD/SRS dated 22 October 2026; status DRAFT, entire 8-stage destination product. Engineering audit 24 October 2026; this plan is a proposal for engineering sequencing, **not a replacement or rewrite of source requirements**. Track source IDs separately as PRD:<id> and SRS:<id>.

## 0. Planning principles and release gates

### Goals
A shared, commercial, institution-isolated platform: QRBlaze + exact original CertiFrenzy; one account, many society workspaces; independent assignable portals; event/subevent hierarchy; safe AI/n8n workflows; student, faculty, members, institutional and vendor operations. Founding institution explicitly has a zero-price contract.

### Milestone definitions
- **Engineering foundation:** build, schema, owner login, RLS, audit and initial route skeletons; does not imply functionality.
- **P0 / migration stabilization:** source/UI parity map, security remediation, shared event adapters, functional vertical slice (not commercial launch).
- **P1 / first usable release:** Super Admin, Organizations, Unified Events, identity/delegation (with QR + CertiFrenzy integration usable for pilot). SRS explicitly says first usable release here.
- **P2–P6 / platform feature expansion:** additional portals and operations according to source prioritization. Avoid renaming source stages without ADR.
- **P7 / commercial maturity:** complete subscription billing/usage/integration and operational service gates.
- **Commercial GA:** all approved target acceptance criteria, security/reliability and legal checks verified. Passing CI ≠ GA.

### Each task's Definition of Done
Requirement IDs and acceptance; implementation with RLS; migration/rollback plan; tests including unauthorized and concurrency cases; UX screenshot parity/mobile; instrumentation; documentation; product-owner review for UI; green CI. Only then status VERIFIED.

---

## 1. Sprint 0 — Repository recovery, source freeze and measurable baseline

**Prerequisite:** before touching current user flows. **Owner:** Tech lead + source analyst + QA.

1. Freeze original 22 Oct PRD/SRS DOCX and original CertiFrenzi ZIP as immutable baseline with SHA-256, security audit for embedded keys, and per-file source provenance. Avoid uploading secrets from original ZIP.
2. Restore exact original DOCX binary into `documents/originals/` once authenticated binary-upload path is available; keep Markdown as searchable archives only. Record source hash in `SOURCE_MANIFEST.md`.
3. Produce full PRD/SRS requirement tables from original DOCX (paragraphs + all table rows). Define 304 SRS functional/non-functional requirements separately from 20 AT cases; prevent ID collisions with document-qualified keys.
4. Map existing 111 source files and 33+ SQL migrations to modules, owners, routes and requirements. Identify duplicate unfinished pages, unsafe RPCs, legacy Firebase paths and dead navigation.
5. Record baseline GitHub CI, Vercel build ignore, environment matrix, Supabase schema and RLS policies. Do NOT copy secret values into docs.
6. Create isolated Supabase staging/test project and safe seed data: 2 institutions, 2 societies each, 5 actors, 3 nested events, 10 registrations, feedback, scanner and certificate cases. Never seed actual student PII.
7. Choose issue tracker naming `[P0][CER][SRS:CER-003]`, acceptance checklist and code owner. Record dates as estimates only after team capacity is known.

**Deliverables:** source manifest, requirement trace CSVs, current-state architecture diagram, test database, CI screenshots/log links, defect and ADR register. **Exit:** no unknown source/version and reproducible local build/test.

## 2. Sprint 1 — Auth, tenant security and permission foundation

**Source:** SRS TEN, IAM, ACL; PRD SAS, IAM.

1. Formalize actor → tenant membership → organization/position → event/session grants. Distinguish founder from tenant owner and exceptional support access.
2. Build `permission_catalog`, `role_catalog`, `role_actions`, `grant_assignments` with grantor, effective/expiry, reason, audit, revoke, optional approval. Existing `portal_assignments` supports module visibility only, not fine action rights.
3. Create centralized server `can(actor,action,resource)` and database transaction access checks; disallow mass read/exports on UI permission alone.
4. Add workspace switcher for users with multiple societies/tenants. Resolve selection against active membership every request.
5. Implement invitation, verified email, user activation, owner provisioning; privileged MFA and recovery/session controls according to source requirements.
6. Route and action gates for Events, QR Scanner, CertiFrenzy, organization directory, reports and exports. Remove reliance on `getVerifiedPlatformOwner` in tenant operational portals.
7. A scoped event manager may manage registrations only; certificate issuance/export require separate grants; scanner check-in action must not imply read roster.
8. Add revocation/expiry tests, denied audit and tenant data isolation including storage/realtime. Test parent→child inheritance and cross-organization event grants explicitly.
9. Check previous QR scanner `SECURITY DEFINER` function's event/context grants and RLS; keep anonymous token lookup minimal and rate-limited.

**Deliverables:** RBAC schema/RPCs, portal assignment UI, member email/role selection, effective rights viewer, negative test suite, audit. **Exit:** assigned authorized user can actually access their permitted routes/data/actions; revoked user denied immediately.

## 3. Sprint 2 — Institution + organization operations (P1 requirement)

**Source:** SRS ORG; PRD ORG.

1. Institution create/verify/activate/archive/suspend, logo, sender, policies, timezone; preserve data on suspend.
2. Institution owner invitation + acceptance; college admin/faculty appointments with effective tenure; no cross-college visibility.
3. CRUD for department/society/club/committee. Model parent/affiliation/joint activity without collapsing distinct permissions.
4. Society member invitation, pending/approved/active/paused/alumni/revoked states. Multiple concurrent memberships in one user account.
5. Teams, positions, office bearer tenure, academic-year switch, handover/history. Bulk member CSV dry-run/rollback with errors.
6. Institution/society navigation, minimal directory privacy, user avatars/contact consent. Restricted export with audit.
7. Organization portal registry and assignment; separate frontend workspace for owner, faculty, head, member.
8. Staging E2E: founder creates A and B, A owner makes department and two societies, assigns heads, head creates own events; B cannot view A.

**Exit:** non-founder institutional owner manages organizations and delegates without global access.

## 4. Sprint 3 — Unified Events and forms

**Source:** SRS EVT, REG, DATA; PRD EVT and REG/ATT.

1. Extend existing `events` by additive migrations with type, metadata, timezone, schedule, venue, capacity, contact, approvals, attachment and lifecycle fields.
2. Parent/child hierarchy with recursive cycle prevention, same-tenant FK, proper inherited permission, organization lead and explicit co-organizers.
3. Event wizard, draft/pending/review/approved/rejected/published/live/completed/closed/cancelled/archive transitions; server validations.
4. Schedule/conflict detection across multi-day sessions/tracks/venues; clone without participant data.
5. Versioned custom registration form builder and conditional fields; capacity reservation under concurrent submissions; team registration with captain/team members and eligibility.
6. External participant verified contact, duplicate controls, invoice/refunds integration only where paid-event entitlement enabled.
7. Data import mapping for third-party registration CSV, dry-run and deduplication preview.
8. Public event microsite and registration → QR link; participant self-service status, cancellation, confirmation delivery.
9. Parent/child roll-up and registrations analytics scoped by actor.
10. Reusable `event_id` API for QR, CertiFrenzy and every future operational portal.

**Exit:** one event/subevent appears consistently across registrations, scanner and certificates; multiple tenant/role isolation tests pass.

## 5. Sprint 4 — Original QRBlaze attendance engine

**Source:** SRS QRA, MTG, STA; PRD ATT.

1. Retain original QR ticket UX/camera where applicable; ticket is opaque and specific to registration/session, not student PII.
2. Shared scanner context chooser: participant, event-staff shift, society meeting, audition; verify context/station/window server-side.
3. Idempotent transactions and concurrent scanning tests; already-checked-in vs invalid vs unauthorized vs early/late states. Avoid ambiguous global checked_in flag for every context.
4. Coordinator/faculty/volunteer assignments, shifts, hours, check-out and supervisor corrections/approvals. Member ID QR reused only for eligible staff/meeting sessions.
5. Meeting and audition context models remain separate from event participation, with versioned rosters and explicit check-in windows.
6. Mobile-first camera permissions, torch when supported, scan retry and manual supervisor fallback with reason. UI must not claim offline scans committed.
7. Attendance exports scoped by event/session/team and permitted fields; audit scans and corrections.
8. Spike/load tests: duplicate concurrent scans resolve single record, no negative durations, revoked staff denied.
9. Connect staff attendance to coordinator certificate eligibility rules when configured.

**Exit:** all supported scanner contexts are distinct, safe and operational for assigned users on mobile devices.

## 6. Sprint 5 — Exact CertiFrenzy transplant (top user-priority)

**Source:** SRS CER, PRD CER and original `certifrenzi-main(1).zip`.

### 6a. Source and UI map
1. Enumerate original app routes, component dependencies, stylesheet/assets, fonts, status/loading errors and responsive breakpoints. Record screenshot/video baseline for home, admin, event settings, feedback, participant lookup, template editor, coordinator roster/lookup, authenticity and certificate.
2. Inventory original placeholders and template JSON structures, image generator, coordinator variables, QR/ID, feedback eligibility, custom links, public lookup and batch import/export; mark each as MUST MATCH.
3. Detect secrets/PII in ZIP. **Do not copy** old Firebase config/keys or old database credentials.

### 6b. Shared adapter and migration
4. Introduce thin repository/adapter boundary for `events.id` (plus legacy slug map); original React UI calls adapters with typed payloads; Supabase Auth/session and scoped RLS/RPC are authority.
5. Map legacy event metadata/settings to `events`, `certificate_templates`, `certificate_feedback`, `certificate_coordinators`, `event_certificates`. Never duplicate events/people or dual-write Firebase.
6. Implement versioned questionnaire/templates; preserve historical issued certificate snapshot (recipient/event/template/version/eligibility/time). Do not mutate previous issuance when template edited.
7. Data migration (if source has records): run counts/dry-run/hash, migrate explicit legacy IDs/URLs, preserve verification redirects with audit and rollback.

### 6c. Exact original interactions
8. Replace current bespoke certificate dashboard user journey with original screens/layout. Keep separate assignable CertiFrenzy portal, no giant all-in-one configuration form.
9. Original feedback page: event-specific questions, required fields, safe lookup, completion gate, status. Certificate eligible only after **all policy rules** (feedback/attendance/hours/results/manual approval) are satisfied.
10. Participant lookup, request/claim, issuance idempotency; no email/name enumeration, rate limit public endpoints; support privacy-safe verification.
11. Original template editor: upload artwork, map name/event/date/custom placeholders, drag/position, font, alignment, signature, QR location, live preview. Image/PDF output must match on-screen coordinates for portrait and landscape.
12. Coordinators: roster CSV with name/role/department/custom fields, separate template/link and optional shift/hours/supervisor approval. Name matching alone must not certify staff.
13. Unique credential ID and opaque verification QR, approved public verification, revoked/expired states, reissue audit.
14. Export PNG/PDF/batch with branding **Powered by CertiFrenzy** permanently printed and visible in verification pages. Ensure mobile, long names, Unicode, small/large images, print-safe dimensions.
15. Restore exact original response reports, settings, management and all known sharing controls.
16. Queue/resumable bulk issuance; preview recipients and missing fields, dedup retries, durable delivery state.
17. Screenshot visual regression against original screenshots; product owner signs off exact parity.

**Exit:** an original CertiFrenzy user recognizes and navigates same screens, certificate renders identically, and it shares a single event and Auth identity with QRBlaze.

## 7. Sprint 6 — Societies, member ID cards and meetings

**Source:** SRS IDC, MTG, OPS; PRD IDC, SOC, OPS.
- Society workspace home and member/profile/team management, office tenure, projects and tasks.
- Front/back member ID studio, templates/branding, approved placeholder fields and QR. Issue/revoke/expire/reissue cards with signed/opaque verification and a student multi-card wallet.
- Meeting agenda, invites, RSVP, recurrence, scanner context and per-occurrence attendance. Minutes approval, action items, reports and history.
- Staff/society ID QR scans must check membership and exact meeting/shift without marking event participant attendance.
- Tests: revoked card denied, cross-society membership denied, duplicate scans dedupe, academic-year role rollover preserves historic card records.

**Exit:** student joins two societies, sees two valid IDs, attends multiple meetings with one membership card per society and distinct audit records.

## 8. Sprint 7 — Auditions, competitions, notifications, advanced operations

**Source:** SRS REC/CMP/COM/OPS; PRD REC/CMP/COM/OPS.
- Recruitment drives: conditional forms, eligibility, preferences, applications, stage transitions, slots, QR attendance, panel/judge rubric, shortlist/waitlist/offer, approved selection → membership onboarding.
- Competitions: track/round/heats, judge access, scoring locking, tie/bracket logic, results approvals, winner certificates.
- Communications: email/in-app base, consent, audience preview, template/version, idempotent provider queue, webhooks, delivery/bounce/suppression, signed link expiry.
- Society projects/tasks, budget/resources and delegated analytics; direct finance actions scoped and audited.
- Tests: judges cannot see other judge scores/private candidate data; unauthorized AI cannot finalize outcomes; campaign preview matches recipients.

**Exit:** complete two-round audition and award winners with approval; invitations/meeting communications auditable.

## 9. Sprint 8 — AI / n8n, analytics and commercial operations

**Source:** SRS AIX/TEN/RPT/FIN/NFR; PRD AIA/SAS/RPT.
- Assistant per portal with read-only grounding, typed tools, scope lookup, action preview, **mandatory explicit approval for every write**, idempotency and audit. n8n runs under short-lived scoped service grants, not service-role browser bypass.
- Cross-event/institution analytics only within policy; dashboard metrics with definitions, sampling/retention, CSV/private-data export restrictions.
- Plan catalogue/versioning, complimentary founding contract, trial/grace/suspended lifecycle, quotas and usage meters (events/members/certificates/storage/messages/AI).
- Billing/quotes/invoices, payment reconciliation webhooks, renewals, entitlements and overage policy, tenant data portability and legal retention.
- Backup/restore, capacity and cost budgets, monitoring/alerts, security incident runbooks, accessibility, consent/privacy, vendor due diligence.

**Exit:** pilot institution successfully transitions from zero-cost to versioned entitlement; second paid tenant operates without cross-leak and all targets meet SLO.

## 10. Horizontal quality gates (re-run each stage)

- **Typecheck/build:** `npm ci`, `npm run typecheck`, `npm run build`. Existing CI should be expanded to migrations, unit, integration and E2E.
- **Authorization:** for each endpoint/table/function test owner, in-scope delegate, out-of-scope user, revoked user, anonymous, cross-tenant, ambiguous roles.
- **Data:** additive migrations, tenant-checked FKs, unique/idempotency constraints, transaction rollback, full audit.
- **Public security:** no PII leaks in lookup, QR opaque references, limit brute force and abuse, redact logs, upload MIME/magic validation.
- **UX:** original parity where requested, accessibility keyboard/screen reader, fast mobile camera, loading/error, poor connectivity, long text/Unicode.
- **Nonfunctional:** backup/restore rehearsal, logging/tracing and latency/capacity thresholds from approved SRS, load spikes for scanning and exports, recovery plan.
- **Release:** staging sign-off, test evidence, explicit permission to deploy, no unintended Vercel auto-build enablement, smoke test, rollback checkpoint.
- **Docs:** traceability, ADRs, API contract, entity schema, tests and known limitations updated before declaring Done.

## 11. Suggested Codex task orchestration and commit order
1. Source analyst builds actual requirement index from original DOCX.
2. Data/security agent audits current 33+ migrations and designs tenant-scope grants.
3. UI migration agent inventories original ZIP and screenshot pairs, fixes adapter contracts only.
4. Portal identity agent implements safe organizations, member selection and scoped entry.
5. QA agent creates two-tenant seeded E2E matrix in disposable environment.
6. Integrator merges into `main`, runs CI, reconciles PRD/SRS IDs and posts evidence.
7. Repeat per vertical slice; avoid introducing broad new UI before source and security review.

## 12. Milestone acceptance table
| Gate | Minimum tangible evidence |
|---|---|
| G0 Baseline | hashes, original sources, full traceability, test dataset, green CI |
| G1 Auth/Tenancy | scoped roles, invite, multi-workspace, tenant-negative tests |
| G2 Events | single event reused, nested workflow, registration idempotency |
| G3 QR | participant/staff/meeting context, revoked scope denial, device test |
| G4 CertiFrenzy | original UI screenshot parity, feedback/eligibility, coordinator, QR, branded PNG/PDF, owner sign-off |
| G5 Societies | ID wallet, meetings, member audit |
| G6 Operations | auditions/results, notifications and reporting |
| G7 Commercial | entitlements, payments, AI confirmed writes, security/reliability review |

## 13. Known decisions to resolve, not invent
- Product final umbrella brand (original documents still say pending).
- Granular role catalog, delegation maximum duration, ancestor-event inheritance defaults.
- Enrollment verification, student PII retention/consent, off-campus participant access.
- Certificate eligibility combinations/exception approval; historic CertiFrenzy URL retention.
- College trial, contractual terms, pricing, payment gateway, tax/accounting model.
- Attendance session windows/offline policy; staff volunteer-hour approvals.
- AI provider/model budget, audit retention, approval UX and n8n service principal.
- Required performance/SLO thresholds where draft spec leaves open values.

**Do not report completion using a fabricated percent.** Current 15–25% all-phase / 40–55% first-release foundation numbers are rough historical assessments pending requirement-level tests.
