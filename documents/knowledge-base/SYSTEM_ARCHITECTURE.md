# System Architecture — Target vs Current

## Stack and ownership
- **UI/server:** Next.js App Router + React/TypeScript; responsive web/PWA-first.
- **Identity and data:** one Supabase Auth + PostgreSQL schema with RLS.
- **Storage:** Supabase Storage buckets, classified public/private.
- **Asynchronous tasks:** provider-agnostic jobs/queues for bulk credentials, mail, imports, media; n8n is an *orchestration adapter*, not an authority bypass.
- **Deployment:** GitHub `main`, CI, Vercel project `campus-os` and domain `campusblaze-os.vercel.app`, Git build ignore remains enabled until expressly changed.
- **Original sources:** QRBlaze/Event Checkin and `certifrenzi-main(1).zip`. Original Firebase references are legacy dependencies to replace, not new cloud dependencies.

## Trust boundaries
Browser/untrusted QR payload → Next.js server / Supabase authenticated caller → centralized domain/RPC authorization → tenant-scoped PostgreSQL transaction → audit log. Public ticket/feedback/verification is separate from protected role-managed data. Never derive tenant, role or action solely from URL/form parameters; query canonical resources.

## Source-of-truth relational hierarchy
`auth.users` → institutional memberships → `institutions` → `organizations` / membership / positions → `events` (self-parented children, tenant FK) → `event_registrations` → event attendance by event/session and context → `certificate_feedback` → `event_certificates` and coordinator/staff recipients → verification IDs. Portal catalogue, assignments and action permissions refer back to institutions/orgs/events, not duplicated rows.

## Current migrations
- `202610220001_foundation.sql`: tenants, membership, organizations, events (self-parent event FK).
- `202610230002_event_registrations.sql`: public event registration ticket.
- `202610230003_event_checkin.sql` and `202610240005_assigned_qr_checkin.sql`: scanner operations; latter adds assignment-based authorization.
- `202610230005_certificates.sql` through `202610230019_coordinator_qr_layout.sql`: certificate issue/lookup, feedback, templates, coordinators, image and placeholders.
- `202610240001_portal_assignments.sql` through `202610240004_portal_membership_revocation.sql`: portal registry and scoped membership, partial grant model.
Do not trust implicit policies from old migrations; query live schema/permissions and test revoked scope.

## Domain port / adapter interfaces (recommended, NOT implemented contracts)
- `EventRepository.get(eventId, actorScope)`, `create/update/publish/close`.
- `RegistrationService.register(eventId, answers, identity)`, `lookupTicket(token)`.
- `AttendanceService.checkIn(context, opaqueToken, actor)`; `context.type` = `event_participant | staff_shift | society_meeting | audition`; each has unique contextId.
- `FeedbackService.getForm(eventId, version)`, `submit(registrationId, answers)`.
- `CertificateService.evaluateEligibility(recipient,event,ruleVersion)`, `issue`, `revoke`, `render`, `verify`.
- `PortalAccess.can(actor, action, tenantId, resourceScope, time)`; returns deny reason only to authorized admins.
- `EntitlementService.check(tenant, feature, useUnit, now)`.
These are proposed interfaces; validate field definitions against SRS and existing SQL before coding.

## Domain migration principle
Original CertiFrenzy components should call a thin `certifrenzy/data` adapter rather than Firebase directly. The adapter resolves legacy event slugs ↔ canonical event UUID, mapping roster/template/feedback fields as needed. Preserve historic certificate IDs and URLs with legacy mapping table/redirect where feasible. No dual-write to two databases.

## Repository boundaries to improve
Use `features/<portal>/components`, `features/<portal>/server`, `features/<portal>/domain` plus App Router routing as thin entry points when refactoring; do not mass-move until tests exist. Extract organization/entity selectors, event resource check, policy gate, audit writer, feedback form engine, certificate generator and exports into reusable modules.

## Scaling and failure modes
Bulk exports under memory/time limits → asynchronous jobs and resumable batches. Ticket scans → one transaction and unique constraint, avoid race. Public lookups → abuse limits and minimal disclosure. Supabase Auth → cookie session consistency + responsive error paths. Uploads → MIME/signature checks, dimensions limits, private/public classification. Background jobs → idempotency keys, retry state and dead-letter handling.

## Migration/rollback
Additive DDL first; deploy compatible old + new code; backfill/dry-run in staging; verify counts and old verification links; enable feature flag per tenant; cut over; monitor; rollback application flag and compatible schema rather than drop data.
