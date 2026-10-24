# Codex Handoff — CampusOS main branch
**Updated:** 24 October 2026 · **Destination:** `veeny698-coder/CampusOs`, **branch `main` ONLY**.

## Start here

1. Read `documents/CampusOS_Full_Master_PRD_All_Phases.md` (the full text of the original 34-page PRD, drafted 22 October 2026).
2. Read `documents/CampusOS_Complete_SRS_All_Phases.md` (the full text of the original 23-page SRS, v1.0, 304 target requirements).
3. Read `documents/CAMPUSOS_COMPLETION_AUDIT_2026-10-24.md` and `docs/ORIGINAL_CERTIFRENZY_MIGRATION.md`.
4. Inspect original uploaded **`certifrenzi-main(1).zip`** and the existing GitHub code. This ZIP is the UI/interaction design authority, not the recently invented CertiFrenzy UI.
5. Do not start with new page mockups; keep original UI including layout, forms, custom image/template editor, coordinate controls, feedback, coordinators, QR authenticity, ID lookup, shares, exported artwork and responsive styles.

## Non-negotiables from product owner

- **One Supabase DB, one event identity** across QRBlaze, CertiFrenzy, events, participants and attendance.
- Each functional area **is a standalone portal** with independent routing: Events, QR scanner, certificate/CertiFrenzy; future society, ID cards, meetings, auditions, results etc.
- Platform Super Admin can dynamically **assign and remove any portal** to a member, at institution, organization or event scope. Enforcement must happen at server actions, RLS/RPCs and exports, **not only menus**.
- Users can belong to several society workspaces with one login; data fully isolated across colleges. Preserve hierarchy: institution → society/department/committee → event → sub-event.
- **Exact original CertiFrenzy frontend**. Change data access to shared Supabase, not its proven design and workflows. Keep **Powered by CertiFrenzy** permanently visible in certificates and public views.
- AI assistant must explicitly request confirmation **before EVERY write**; no silent writes.
- Launch at one complimentary founding institution, support paid multi-college SaaS.
- **Use GitHub `main` branch for changes**, keep Vercel auto builds disabled; do not manually deploy without user authorization.
- Keep existing data intact; avoid destructive migrations and auth regressions.

## Immediate engineering task sequence

### P0 — make current work trustworthy and easy to use

- [ ] Use original ZIP for a **screen-by-screen/feature-by-feature parity inventory**, with file paths and screenshots for desktop/mobile. Reuse React component code and styles where feasible; map original Firebase calls to new repositories/adapters backed by Supabase.
- [ ] Preserve original event-detail page, feedback setup/required questions, template positioning/drag-drop, coordinator templates and rosters, custom links, certificate ID, authentify and sharing. Verify participant self-claim *after feedback*, with idempotent issuance and revoked-state behaviour.
- [ ] Collapse confusing bespoke CertiFrenzy settings into original UI; separate super-admin portal assignment UI from institution operator UX. Do not leave two competing certificate admin screens.
- [ ] Ensure `portal_catalog` + `portal_assignments` + `has_portal_access` control **all** protected Events, QR, CertiFrenzy reads/writes/exports. Expose actual role-scoped route entry points; do not simply show inaccessible links.
- [ ] Check current QR-only delegated read/export access, scanner event matching and genuine deprovisioning.
- [ ] Run compile/lint/typecheck and module tests; fix known type issues if any. CI is necessary but not sufficient.
- [ ] Add repeatable end-to-end workflows in isolated test project: owner creates institution → creates society/event → registration → QR scan → feedback → certificate issue/download/QR verification; coordinator CSV/import, custom fields, revocation; separate user denied cross-institution access.

**P0 acceptance:** original UI signed off by product owner; same event visible in all portals; no assigned-role dead ends; scoped reads/writes/exports properly secured; flows tested and documented.

### P1 — finish original Release 1

- [ ] Full institution CRUD (soft-delete/archive) and delegated college-owner onboarding; organization/society/department CRUD.
- [ ] RBAC role policies for HOD, faculty head, society head, coordinator, member, student, multi-workspace switcher and user invitations.
- [ ] Unified event hierarchy and nested sub-events, approvals, schedules, publish/unpublish, organizer ownership.
- [ ] Real registrations, native custom form designer, CSV/third-party imports, duplicate detection, email/QR delivery and reminder templates.
- [ ] Operations dashboard for events/attendance/certificates, event staff scanner sessions, exports, admin audit.
- [ ] Frontend accessibility/responsive audits, invalid/empty/error/loading states, navigation simplification.

**P1 acceptance:** another college/society can be onboarded, owner assigns portals, member operates event + QR + CertiFrenzy without being platform owner.

### P2 — remaining PRD/SRS target product (commercial all-phases)

- [ ] Student/faculty/society operational portals, meetings and QR membership IDs.
- [ ] Digital society ID-card editor, templates, QR verification and membership lifecycle.
- [ ] Auditions/recruitment, application review, shortlist/select/reject, staff and notifications.
- [ ] Event competitions/jury scoring/results; hierarchy-specific reporting.
- [ ] AI task agent + n8n integration with confirmation on all writes, least-privilege execution, tracing and error handling.
- [ ] Certificates advanced lifecycle (feedback gating, participant/coordinator/staff, bulk issue, duplicate/revoke), branding controls with original UX.
- [ ] Dashboards, analytics, communications/campaigns, exports and audit retention.
- [ ] Subscription catalog, founding-institution complimentary entitlement, paid tenant billing, service limits, finance/resources.
- [ ] Monitoring/error alerts, backups/restore, SLA, test/load/security reviews, documentation and release playbooks.

## Files / existing architecture

- `supabase/migrations/202610220001_foundation.sql`: core institutions, organizations, memberships, events and FK.
- `supabase/migrations/202610230002_event_registrations.sql`: registrations and ticket issuance.
- `supabase/migrations/202610230003_event_checkin.sql` + `202610240005_assigned_qr_checkin.sql`: check-in and scoped authorization.
- `supabase/migrations/202610230005_certificates.sql` through `202610230019_coordinator_qr_layout.sql`: certificate functions, templates, coordinators and feedback.
- `supabase/migrations/202610240001_portal_assignments.sql` through `202610240004_portal_membership_revocation.sql`: registry and assignments.
- `lib/supabase/server.ts`, `lib/auth/platform-owner.ts`, `lib/portal-access.ts`: auth/data access.
- `app/admin/dashboard/portals`, `app/portals`: management/hub.
- `app/admin/dashboard/certificates`: **interim bespoke UX, not original design**.
- `app/events/[id]`, `app/feedback/[token]`, `app/verify/**`, `app/certificates/lookup`: public flows.

## Testing matrix (must implement)

| Actor | Within assigned event | Outside assigned event | Other institution | After revoke |
| --- | --- | --- | --- | --- |
| Platform owner | Admin-permitted (audited) | Admin-permitted | Admin-permitted | Owner bypass remains |
| College owner | Approved college operations | Denied unless scoped | Denied | Denied if revoked |
| Society head | Operate own assigned scope | Denied | Denied | Denied |
| Coordinator | QR scan own event | Denied | Denied | Denied |
| Student/participant | Register and own feedback/certificate | No private staff records | No private records | No staff portal |
| Anonymous | Public published event/registration/verification only | No internal management | No internal management | N/A |

Test **each** protected GET, server action, REST route, table RLS and SECURITY DEFINER RPC. Public bearer links/tickets require throttling, expiration/revocation policy and privacy review.

## Known gaps / don't mistake for done

- Existing platform-owner certificates/events UI isn't permission-complete for assigned users.
- 0 recorded real events/registrations/certificates/assignments at audit time; tests cannot claim success in production.
- Github CI passing only confirms build/typecheck.
- Previous attempt to create one-time production Vercel build does not prove current `main` is live.
- No production-rated AI/n8n, subscriptions, advanced society ops, ID cards, auditions/meetings.
- Original DOCX source documents were converted into text-complete `.md` archives in `documents/` to make them directly readable by Codex; Word formatting is not preserved.

## Codex first prompt (copy directly)

> Read documents/CAMPUSOS_COMPLETION_AUDIT_2026-10-24.md, documents/CampusOS_Full_Master_PRD_All_Phases.md, documents/CampusOS_Complete_SRS_All_Phases.md and docs/ORIGINAL_CERTIFRENZY_MIGRATION.md. Inspect the original CertiFrenzi ZIP. Work on main. Preserve original frontend UI and interactions exactly, replace legacy backend with shared Supabase keyed by events.id, and make every portal dynamically assignable with enforced scoped permissions. Implement the P0 checklist and test end-to-end before P1. Maintain existing DB, existing auth, Powered by CertiFrenzy branding and disabled Vercel automatic builds. Do not claim completion without tests. Commit and report every change, test and remaining blocker.
