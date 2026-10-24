# Live Supabase Schema Snapshot and Required Evolution
**Introspected 24 October 2026** from project `dcpetrudlngtrabmdwol`. This is a **schema inventory only**, not approval of current policies or live viability. No private rows or credentials included.

## Tables actually present
| Table | Current columns (condensed, exact names) | Current limitation |
|---|---|---|
| `institutions` | `id,name,slug,created_at` | lacks status, contract, timezone/branding, tenant owner onboarding |
| `institution_memberships` | `institution_id,user_id,role,created_at` | role simplistic, no status/tenure/approval |
| `organizations` | `id,institution_id,name,kind,created_at` | no parent/affiliation, approval, lifecycle |
| `organization_memberships` | `organization_id,user_id,role` | no historical term, team/role effective dates |
| `platform_owners` | `user_id,created_at` | founder control plane exists; exceptional student-data support policy missing |
| `events` | `id,institution_id,organization_id,parent_event_id,title,status,created_at` | tree FK exists but no richer wizard, session, approvals, capacity |
| `event_registrations` | `id,event_id,institution_id,full_name,email,ticket_token,created_at,checked_in_at,checked_in_by` | only basic attendee check-in, no independent sessions/forms/teams |
| `certificate_feedback` | `id,registration_id,event_id,answers,submitted_at` | answers JSON only, no immutable question version snapshot/consent model |
| `certificate_templates` | `event_id,institution_id,title,subtitle,footer,primary_color,background_color,text_color,name_y,qr_x,qr_y,layout,updated_at,image_path,coordinator_image_path,participant_placeholders,coordinator_placeholders,feedback_open,feedback_questions` | currently one mutable configuration per event, needs versioning and original UI shape |
| `certificate_coordinators` | `id,event_id,institution_id,full_name,certificate_code,custom_fields,revoked_at,created_at` | coordinator identity by name; no staff assignment/session/hours approval binding |
| `event_certificates` | `id,certificate_code,event_id,institution_id,registration_id,recipient_name,certificate_type,issued_by,issued_at,revoked_at,custom_fields` | no immutable template version/eligibility snapshot; limited class model |
| `portal_catalog` | `key,label,route,description,enabled` | portal registry, not fine action catalog |
| `portal_assignments` | `id,portal_key,institution_id,organization_id,event_id,user_id,assigned_by,created_at` | no temporal expiry/status/rights, basic owner-only assignment |
| `audit_logs` | `id,actor_user_id,action,resource_type,resource_id,details,created_at` | no standardized reason/before-after/tenant scope fields |

## Existing provenance
Actual migrations live under `supabase/migrations/`; links: `202610220001_foundation.sql`; `202610230002_event_registrations.sql`; `202610230005_certificates.sql` and subsequent feedback/template/coordinator migrations; `202610240001_portal_assignments.sql` to `202610240005_assigned_qr_checkin.sql`. Table snapshot does not prove no other tables/functions; query full catalog prior to migration planning.

## Critical relational invariants
- `institution_id` follows the event/organization and must be checked server-side in every write.
- `events.id` is the single event identity across register, scan, feedback, certificate and all future modules.
- `parent_event_id` must never form cycles or cross tenants; enforce recursively and with tenant-scoped FK.
- Separate attendance facts for participant event/session, coordinator shift, society meeting and audition session, not one global `checked_in_at` for all use cases.
- Issued certificate must snapshot template version/award type/recipient/event/time and verification reference; mutable template changes must not retroactively rewrite issued records.
- Scope is actor+tenant+organization/event/session+action+time; current module assignment only models part of it.
- Public search and issuance must not rely solely on arbitrary name/email guesses; review bearer tokens, rate limits, verification and privacy.

## Proposed additions — not current schema
- `permission_actions, role_definitions, role_actions, grants` with effective dates and delegation rules.
- `institution_contracts, plans, entitlements, usage_events` for commercial control.
- `organization_positions, teams, memberships_history, academic_terms`.
- `event_sessions, event_coorganizers, event_approvals, registration_form_versions, registrations_answers, team_registrations`.
- `attendance_contexts, attendance_records, staff_shifts, meeting_occurrences, auditions` with canonical context ID.
- `certificate_template_versions, certificate_eligibility_policies, certificate_issue_snapshots, legacy_certificate_aliases`.
- `communication_templates, outbox_jobs, delivery_receipts, provider_webhook_receipts`.
- `meeting_minutes, ID_card_templates, issued_membership_cards, recruitment_flows, judge_scores`.
These are architectural *candidates*. Codex must reconcile actual original PRD/SRS requirements, security needs and existing schema before writing SQL. Avoid adding all at once.

## SQL/RLS review checklist
Inspect `pg_policies`, table grants, function owners, `prosecdef`, `search_path`, Storage buckets/policies, foreign keys, uniqueness, and indexes. Run authenticated actor tests using real JWT-backed sessions; an elevated SQL connection reading a table proves nothing about user scope.

## Schema changes sequencing
1. Diff current live project against migrations and staging.
2. Add backward-compatible columns/tables and tenant-constrained FKs first.
3. Backfill in staging with dummy data and reconciliation metrics.
4. Introduce versioned adapter layer plus gating/feature flags.
5. Migrate original UI and clients.
6. Run negative scope/consistency tests.
7. Retire old routes only after acceptance. Never silently delete old issued credentials.
