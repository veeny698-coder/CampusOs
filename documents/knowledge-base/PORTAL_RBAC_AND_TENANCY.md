# Portal RBAC, Multi-Tenancy and Delegation

## Requirements source
SRS **TEN-001**, **IAM-001–012**, **ACL-001–014**; PRD **IAM-001–016**, plus portal requirements in PRD section 15 and SRS section 18. Same ID suffix across documents is NOT a shared exact requirement; always label SRS:/PRD:.

## Access decision contract
Access is true only if ALL hold: authenticated active actor; active tenant membership; resource's tenant matches resolved tenant; explicit action permission; portal module entitlement; assignment within effective/expiry window; scope includes exact resource; grant not revoked/suspended; any sensitive extra approval passed. Anonymous access only through explicit public endpoints (published event registration, limited verification, approved feedback bearer link).

Check on EVERY entry: navigation/loader, protected server components, server actions, RPC, RLS, Storage, exports, realtime. Frontend controls are usability, not access policy.

## Grant schema target (proposed extension)
`portal_catalog(module_key, route, label, flags)`; `permission_catalog(action_key, sensitivity, delegable)`; `roles(role_id, tenant_id?, version, immutable)`; `role_actions(role_id, action_key)`; `role_assignments(user_id, tenant_id, organization_id?, event_id?, session_id?, role_id, starts_at, expires_at, revoked_at, grantor_id, approved_by?, reason)`; `portal_assignments(...)` module visibility. Store audit before/after and deny reasons for sensitive actions. No ambiguous NULL inheritance; exact scope precedence documented.

The existing `portal_assignments` only has basic portal_key/tenant/org/event/user grants. It currently lacks true action-level rights, expiry, approval, purpose and issuer delegation checks. Treat as PARTIAL.

## Action vocabulary
`view, list, create, update, delete/archive, publish, approve, export, issue, revoke, check_in, configure, delegate, manage_permissions, billing`. Sensitive exports/finance/judge data require additional context and stronger controls.

## Scope matrix (examples)
| Role | Institution | Society | Event | Expected rights |
|---|---|---|---|---|
| Platform founder | global control | support by approved exception | provision and monitor | tenant/plan/contract, audited exceptional support |
| Institution owner | own tenant only | authorized own organizations | delegated institution events | manage tenant users/organizations/policies |
| HOD | assigned department | approved related orgs | approved department events | manage department membership/events |
| Society head | permitted tenant | assigned society only | owned/delegated events | societies, meetings, event grants within own rights |
| Event registration manager | exact assigned tenant | per grant | selected event/subevent | registration list/approval, not finance/certificates automatically |
| QR scanner | exact assigned tenant | optional | exact event/session/station | check-in only, not contact roster by default |
| Certificate manager | exact assigned tenant | optional | exact event and credential category | issue/approve/verify/export as individually granted |
| Student | authorized memberships | own | public/own entries | own pass, feedback, certificates, no staff records |

## Revocation + inheritance
Revoking user/role/portal stops **new** read/mutation/export in same transaction/effective time; old cached navigation has no authority. Parent event access applies to child ONLY if explicit inheritable grant, never by assuming UUID ancestor. Joint organization events use explicit co-organizer grants. Deactivated organization membership cannot retain derived event rights unless separately granted and approved.

## Critical current implementation gap
`public.has_portal_access` and assigned QR check-in RPC exist. Most current Events/CertiFrenzy management screens/actions still use `getVerifiedPlatformOwner()`, denying normal delegated users. The portal hub acknowledges some modules are owner-only. Assigning a portal does **not** mean the assigned user can use every workflow. Implement scoped route loaders and server repositories alongside RLS, then retire owner-only assumptions.

## Test matrix
1. Two tenants: A coordinator from tenant A may not read any B rows/exports/storage.
2. Two societies: user head of Society A cannot manage B.
3. A parent event grant with child inheritance OFF cannot change child event; with ON can only specified permitted actions.
4. Same user holds coordinator role in one event and member role in another; scope switch changes menus and data.
5. Revoked/expired member blocked for check-in, export, feedback analytics even with stale tab.
6. Head cannot delegate a grant the head does not possess; expired grant cannot be prolonged.
7. Global owner support access requires auditable approved purpose for private student records.
8. AI/n8n service principal gets exactly caller's effective scope, with confirmation before writes.
