# Product Contract, Domains and Actors

## Canonical definitions
- **Platform**: vendor-operated global control plane for tenant provisioning, plans, contracts, cross-tenant support access and monitoring.
- **Institution (tenant)**: independently isolated college/campus entity with branding, approved domains, contracts, policies, users and organizations.
- **Organization**: departmental unit, society, club, committee or temporary event team. Memberships and office tenures are historical and multi-valued.
- **Event**: reusable canonical record. Parent events and children share institution and may have explicit co-organizers; sessions are not conflated with events.
- **Portal**: independent application capability/module surfaced based on grants; catalogue key is separate from action grants.
- **Assignment**: action rights within time-limited tenant/org/event/session scope. Being in the navigation is never authorization.
- **Participant ticket**: an event registration-specific opaque QR.
- **Membership ID**: active society membership credential, reusable for meeting and permitted staff-shift attendance. It is not a participant ticket.
- **Certificate**: auditable, verifiable issued credential referencing immutable event, recipient, template version, award class and eligibility snapshot.
- **Actor**: person/service with explicit role and permitted actions. AI/n8n agent uses same rules.

## Principal actors
Platform Founder/Super Admin; Platform Commercial Operator; Institution Owner; College Admin/Dean/Principal; HOD/Department Faculty; Society Faculty Advisor/Society Head; Society Treasurer/Core Team/Member; Event Director/Registration Manager/Scanner/Certificate Manager; Judge/Guest/External Participant; Student/Alumni; AI Operator/n8n Service. Original SRS actor table in section 2 is canonical.

## Source business rules
- Institution and global platform roles must be separate. Super Admin global provisioning ≠ routine access to private student data.
- Org heads can delegate only rights they possess, with non-escalating delegation and expiry.
- Same user can belong to multiple societies/roles while retaining different data boundaries.
- Institution lifecycle changes retain data; cancellation or plan expiry does not silently delete records.
- Attendance recorded for *specific* session/meeting/shift/audition, with idempotent check-in and corrections.
- Coordinator certificate eligibility must not automatically derive from participant attendance. Staff hours, roles and approvals may be required.
- Feedback is an input to certificate eligibility policy, not the only possible future eligibility rule (attendance, result, manual awards, etc).
- Public verification displays approved minimal credential fields; revocation/reissue logged; historic verification links need compatibility where feasible.
- Every AI write previews exact changes and obtains explicit human confirmation.
- Paid institution subscriptions/plan quotas belong to commercial control plane; founding institution free plan remains explicit contract.

## All-phases scope
Tenancy/commerce; identity/auth; fine-grained RBAC; institutions/societies; recruitment & auditions; digital member IDs; event hierarchy; registration; QR participant/staff/member attendance; society meetings; competitions; CertiFrenzy; communications; society operations; portals; AI and n8n; analytics; finance/budget/resources; data/integrations; reliability and security.

## Change management
If implementation needs a behavior outside the PRD/SRS: propose ADR with requirement, option analysis, privacy, migration impact and product-owner decision. No undocumented hard-coded branch or one-off per-college fork.

## Terminology discrepancy
The original PRD has IDs such as **SAS-001, IAM-001, ORG-001, EVT-001, CER-001**; the SRS has **TEN-001, IAM-001, ORG-001, EVT-001, CER-001** with *different definitions and numeric meanings*. Never assume the same ID identifies the same requirement across documents; prefix every ticket `PRD:` or `SRS:`.
