# CampusOS Engineering Knowledge Base — Start Here

**Source priority:** Owner's explicit instructions → original 22 Oct 2026 PRD and SRS → approved decisions → original CertiFrenzy code/UI → current implementation. Both source documents are **drafts pending stakeholder sign-off**. The repository Markdown exports are searchable archives; not visually identical to the Word originals.

## Product
Commercial institution-isolated operating platform combining QRBlaze attendance/event and original CertiFrenzy certificates with societies, faculty, events/subevents, member identities, meetings, recruitment/auditions, competitions/results, analytics, communications, AI/n8n and platform commercial operations. First usable release: Super Admin + Organizations + Unified Events. Entire target extends across **8 delivery stages**.

## Confirmed owner decisions
- One Supabase database and single global user account with multi-society workspaces.
- One canonical event record; modules link by immutable event UUID. No duplicate QRBlaze/CertiFrenzy event or student database.
- Every area is an independent portal assignable/removable per person/scope. Platform Super Admin provisions; tenant owners and permitted heads delegate only what they hold.
- Original CertiFrenzy UI code and interactions are canonical. Previous bespoke certificate studio is an interim implementation, not UX specification.
- In generated certificates and public verification: permanent **Powered by CertiFrenzy**.
- Every AI-initiated write must be confirmed by a human; read-only assistance can be unconfirmed.
- Founding institution's free access must be an explicit zero-price plan/contract, not hard-coded.
- GitHub branch main. Vercel automatic Git build disabled; no unrequested production deployment.

## Actual code today
Next.js App Router + Supabase Auth/Postgres, owner console, institutions tables/creation, event drafts/publishing, public registration/tickets, participant QR camera/check-in, attendance listing/export, partial certificates/feedback/verification/template upload, portal assignments UI and scoped QR check-in RPC. Many parts owner-only, without full delegated-role support.

## What is NOT done
Original CertiFrenzy UI transplant, complete scoped portal enforcement, organization CRUD/onboarding, multi-role multi-workspace UX, nested event lifecycle, custom registration forms, staff/member/meeting scanner contexts, ID cards, auditions/recruitment, competitions, AI/n8n, subscription billing, notifications and fully validated production flows.

## Live evidence at audit (24 Oct 2026)
1 institution, 3 platform owners; **zero** organizations, events, registrations, feedback, participant/coordinator certificates and portal assignments. Treat empty data as *untested workflows*, never as validated success.

## Read next
- PRODUCT_CONTRACT.md: boundaries, roles and domain vocabulary.
- SYSTEM_ARCHITECTURE.md: source-of-truth database and adapter map.
- PORTAL_RBAC_AND_TENANCY.md: delegated and negative authorization.
- CERTIFRENZY_PARITY.md: original-screen migration checklist.
- REQUIREMENTS_TRACEABILITY.md: ID scheme and trace rules.
- TESTING_AND_RELEASE.md: QA/release gates.
- ../IMPLEMENTATION_MASTER_PLAN.md: dependent tasks, deliverables, phases.
- ../CODEX_HANDOFF_AND_BACKLOG.md: legacy handoff; plan here supersedes where more detailed.

## Coding rhythm
Start with a requirement ID + acceptance criterion. Inspect original source, plan data and authorization, write tests, implement domain and UI, validate in test tenancy, update requirement matrix, commit main and report limitations. CI green ≠ UX correct, secure or deployed.
