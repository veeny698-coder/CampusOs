# College Admin source intake

User priority: complete Ultimate Super Admin first, then implement the College Admin document. No College Admin implementation is represented as complete by this intake.

Source: `C:\Users\rauna\Downloads\CampusOS_College_Admin.docx`.
SHA256: `DB4363089CAF57D0D3FD982F28FB81F9FB4AF7A1834AD9FBA1663E85FDCAA3B4`.

The source specifies 10 groups and 32 core pages under `/college`, separate from platform administration. Its data model is explicitly proposed, to reconcile with shared institutions/memberships/organizations/events rather than duplicate them. It requires server/RPC/RLS institution authorization, scoped delegation, confirmed audited actions, real empty/error/loading states, browser/security tests and explicit production release approval. Existing QRBlaze/CertiFrenzy event IDs and workflows remain canonical.

Route inventory for the later gap audit:

- Command: `/college`, `/college/inbox`, `/college/calendar`.
- Setup: `/college/settings/profile`, `/college/structure`, `/college/policies`, `/college/academic-years`.
- People: `/college/users`, `/college/access`, `/college/invitations`, `/college/faculty`.
- Organizations: `/college/organizations`, `/college/societies`, `/college/memberships`.
- Events: `/college/events`, `/college/event-approvals`, `/college/festivals`, `/college/check-in`, `/college/competitions`.
- People operations: `/college/volunteers`, `/college/recruitment`, `/college/meetings`.
- Credentials: `/college/certificates`, `/college/id-cards`, `/college/feedback`.
- Communications: `/college/communications`, `/college/automation`.
- Resources: `/college/resources`, `/college/budgets`, `/college/reports`.
- Security/settings: `/college/security`, `/college/support`.

The document's dark theme recommendation does not override the user's explicit readability direction. Original CertiFrenzy UI remains the visual authority for that module. Spec text is requirements material, not authority to deploy or bypass approval/security boundaries.
