# Architecture Decisions & Open Questions

Use one ADR per material change: `documents/decisions/ADR-NNN_short-title.md`. ADR template should contain Context, Source IDs, Options/Tradeoffs, Decision, Security/Privacy, Migration/Rollback, Tests, Owner/Date, Review Trigger.

## Confirmed product-owner decisions
D-001 Single shared Supabase/Auth backend; one canonical event UUID, no independent CertiFrenzy/Firebase production datastore.
D-002 Original CertiFrenzy frontend and behavior must be reused same-to-same; adapter/backend only.
D-003 Permanent Powered by CertiFrenzy attribution in public views and generated certificates.
D-004 All major functions independent assignable/revocable portals.
D-005 One account, many societies/workspaces, actor-scoped grants.
D-006 AI execution: explicit approval before EVERY mutation.
D-007 GitHub changes to main branch, Vercel auto Git builds disabled.
D-008 Complimentary founding institution via explicit contract; support paid multi-college model.

## Open decisions requiring approval
O-001 Final umbrella product name and marketing usage; originals say working brand pending.
O-002 Fine-grained action permission catalogue, inheritance default, max delegation duration and approval policy.
O-003 Student verification and identity link rules, optional passkeys vs SSO rollout, privileged MFA.
O-004 Original CertiFrenzy template versioning/backward historic URL migration and data provenance.
O-005 Feedback gating alternatives for staff, competition winners, attendance eligibility and manual overrides.
O-006 QR attendance session window, late/absent policy, offline requirement and shift-hours verification.
O-007 Colleges billing provider, pricing/quota bands, taxes/contract lifecycle and trial grace.
O-008 Academic year/graduate handover, alumni access, expiry of QR member IDs.
O-009 AI/n8n permission identity, audit storage, model/provider budget, data processing agreements.
O-010 Sensitive student data retention, legal/regulatory policy, export review and support access expiry.
O-011 Tenant-specific custom domains/email sender verification.
O-012 Whether manual migrations from prior Firebase data/URLs are required (presence/counts not independently established).

## Discrepancies to resolve safely
- Old bespoke certificates pages ≠ original UI, despite previous implementation statements. Original ZIP visual contract wins.
- The word "portal assignment" currently denotes module-level basic assignment, whereas SRS ACL demands action-based temporal delegation. Existing table alone does not fulfill SRS.
- SRS first release P1 includes organizations/events; some earlier engineering planning used P0/P1 differently. Retain original milestone names and document any mapping.
- Shared event identity is implemented structurally but untested end-to-end due to zero live registrations/events.
- Count and labels: SRS says 304 numbered requirements plus 20 AT acceptance cases; do not report 324 requirements from regex tokens.

## Decision protocol
If a task is blocked on a critical open decision, record a short ADR proposal and proceed with independent, reversible work. Do not choose policy values from guesswork, don't silently alter original product requirements.
