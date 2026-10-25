# ADR-001 â€” Society Workspace as the primary operational portal

- Status: Accepted
- Date: 26 October 2026
- Decision owner: Product owner
- Affected source requirements: SRS:ORG-005, ORG-007, ORG-012, REC-001â€“016, MTG-001â€“026, COM-002â€“008, OPS-003â€“011, FIN-006, ACL-009; PRD:ORG, REC, SOC, OPS
- Scope: society / portal

## Context and problem

CampusOS must operate a society across its full lifecycle, not only manage individual events. Society leaders need a secure home for recruiting and onboarding members, preserving institutional knowledge, running meetings and communications, and accounting for funds, sponsor obligations, and equipment.

## Decision and rationale

Provide a Society Workspace at `/societies/[organizationId]`. Events remain a connected module, while the workspace is the society's operational home. Its modules are independent assignable portals:

1. `recruitment` â€” applications, auditions, interviews, rubrics, selections, and membership onboarding.
2. `knowledge_hub` â€” scoped document library, ownership, versions, searchable archives, and reusable templates.
3. `finance` â€” budgets, expenses, reimbursement approvals, sponsors, deliverables, inventory, and audit history.
4. `meetings` â€” agendas, attendance, minutes, decisions, action items, polls, and targeted announcements.

The workspace landing page is a permission-filtered summary of those modules: upcoming meetings, active recruitment cycles, action items, pending approvals, document activity, and financial alerts. It must never reveal a module's private records solely because the user can see the workspace.

## Data architecture / schema impact

All records reference an existing organization whose `kind` is `society`, plus its institution. Events continue to reference the canonical shared `events.id`; recruitment, meetings, sponsor work, documents, and inventory must not create a second event or identity data store.

Additive schema work is required before building write flows: organization memberships and office tenure, action-level grants, recruitment cycles/applications/evaluations, documents and versions, meetings/minutes/actions, financial ledgers/approvals, sponsors/deliverables, and inventory custody.

## Auth/RLS / privacy impact

Module visibility uses a portal assignment scoped to institution and organization. Reads and writes additionally require an action-level permission checked in route loaders, server actions, RPCs, RLS policies, exports, and Storage.

Recruitment applications and evaluator notes are restricted to the recruitment panel. Finance, exports, sponsor contacts, candidate data, and mass communications are sensitive actions; they require explicit grants and auditable approval. An organization member or event manager receives none of those rights implicitly.

## Migration and rollback

Ship additive schema and route changes behind per-tenant feature flags. Existing Events, QR Scanner, and CertiFrenzy routes remain compatible. Disable the new society portals on a tenant to roll back UI access; never delete historic applications, meetings, files, approvals, or finance records as a rollback step.

## Acceptance tests

1. A Society A head can manage only Society A; Society B and another institution are denied.
2. A recruitment reviewer can score assigned candidates but cannot view finance, documents marked restricted, or another reviewer's private rubric score where blind review applies.
3. A treasurer cannot publish recruitment decisions; an approver cannot alter an approved immutable finance audit record.
4. Revocation blocks new reads, mutations, exports, file downloads, and check-ins with a stale browser tab.
5. Meeting and audition attendance remain distinct from event participant attendance.
6. A selected applicant is onboarded through an approved action with membership and handover history preserved.

## Follow-ups / review date

Implement the prerequisite organization membership and action-grant foundation first. Then deliver Meetings + Knowledge Hub as the first Society Workspace vertical slice, followed by Recruitment, then Finance/Sponsorships/Inventory.

