# CampusOS — FULL CODEX ENGINEERING HANDOFF
**Canonical branch:** `main` · **Audit date:** 24 October 2026 · **Handoff status:** Development, NOT production complete.

> THIS IS A HANDOFF FOR AN ENGINEERING AGENT, NOT AN ALL-PHASES "DONE" CLAIM. Start by reading `AGENTS.md` at repository root and `documents/IMPLEMENTATION_MASTER_PLAN.md`.

## 1. Non-negotiable request, in the product owner's own terms (paraphrased)
- The previous certificate dashboard became confusing and diverged too far from original CertiFrenzy. **Take original CertiFrenzy UI and code the same way** rather than re-designing it. Only replace separate database/auth with shared Supabase.
- QRBlaze/CertiFrenzy Events/Scanner/Certificates and every next module are **separate portals**. Portals can be assigned/removed dynamically to exact people and scopes, and this must actually enable/disallow operations.
- Use **one Supabase database** and the **same canonical event IDs**; avoid QRBlaze and CertiFrenzy creating separate events/registrants.
- Always preserve **Powered by CertiFrenzy** branding on certificate exports and public views.
- One user account may belong to many college societies. Owner/society/HOD/faculty/coordinator roles get scoped access.
- Keep GitHub changes in **main**, no unapproved production deployment. Vercel ignored Git build command currently `exit 0`.
- Entire product includes original all-phases PRD/SRS, not just the first usable release. AI-initiated mutations require explicit confirmation.

## 2. Inputs and source-of-truth
| Asset | Location | Authority and notes |
|---|---|---|
| PRD original | `documents/originals/CampusOS_Full_Master_PRD_All_Phases.docx` **pending binary commit** | Exact uploaded Word file, 34 pages, 20 tables, hash in originals/README |
| SRS original | `documents/originals/CampusOS_Complete_SRS_All_Phases.docx` **pending binary commit** | Exact Word, 23 pages, 304 requirements + 20 acceptance cases, hash in originals/README |
| Searchable PRD | `documents/CampusOS_Full_Master_PRD_All_Phases.md` | Earlier extracted text, tables may be flattened |
| Searchable SRS | `documents/CampusOS_Complete_SRS_All_Phases.md` | Earlier extracted text, NOT the original visual layout |
| Original CertiFrenzi | `certifrenzi-main(1).zip` from user upload/source pack | UI/behavior reference; audit ZIP secrets before copying |
| Current code | GitHub `veeny698-coder/CampusOs`, main | Functional starting point; not UX authority for certificates |
| Constraints | `AGENTS.md` and `documents/knowledge-base/` | Implementation and security rules |
| Plan | `documents/IMPLEMENTATION_MASTER_PLAN.md` | Deep P0–P7 work breakdown, stage gates |
| Parity | `documents/qa/certifrenzy-parity-matrix.md` | Mark each original screen against new screenshots |

**Source hashes:** PRD `40f307022b250207557663c40aaf79c1d802367bd81dfc53ada7721602ed9947`; SRS `10caca437218b83592d40b5f017ec812d1fcd7c97f9de06e3f171d9c882359e6`. The new attached originals match prior uploads byte-for-byte. Do NOT re-create them from Markdown.

## 3. Current project and repo
- Next.js App Router, React/TypeScript, Supabase Auth/Postgres/RLS and Storage.
- Repo: `veeny698-coder/CampusOs`; Vercel `campus-os`, domain `campusblaze-os.vercel.app`.
- Supabase project `dcpetrudlngtrabmdwol`.
- Core files: `lib/supabase/server.ts`, `lib/auth/platform-owner.ts`, `lib/portal-access.ts`.
- Current portal control: `app/admin/dashboard/portals`, `app/portals`, `portal_catalog`, `portal_assignments`, `has_portal_access`.
- Event/QR: `app/admin/dashboard/events`, `app/events/[id]`, `app/admin/dashboard/check-in`, attendance pages and check-in migrations.
- CertiFrenzi interim: `app/admin/dashboard/certificates`, `app/feedback/[token]`, `app/verify/**`, `app/certificates/lookup`; **NOT pixel-identical original**.
- Source migrations: `supabase/migrations/202610220001_foundation.sql` → `202610240005_assigned_qr_checkin.sql`. Never reset the database or assume migrations apply in arbitrary order.

## 4. Verified data and release baseline
At 24 Oct 2026 audit: institutions **1**, platform owners **3**, organizations/events/registrations/feedback/issued certs/coordinators/portal grants **all 0**. This is a **test gap**, not proof of working business workflows. Earlier CI verified typecheck/build for feature commits, but no complete real-user acceptance tests. Recent automatic Vercel deployments CANCELED because build ignored; latest GitHub main **not proven live**.

Previous estimate: **15–25%** of entire target product, **40–55%** of first-release code foundation; *coarse estimates*, not actual 304 requirement pass rate. Re-evaluate through trace matrix, do not simply repeat percentage as fact.

## 5. Top critical problems
**Critical P0:** Original CertiFrenzy UI absent. Template editor and admin screen were re-created from scratch and rejected by owner. Import original JSX/CSS, keep layout and behavior, adapt data calls.
**Critical P0:** Per-portal access ineffective outside QR scanner. `portal_assignments` can record access but Events and certificate admin server actions remain mostly owner-only. Complete scopes/action grants and immediate revocation.
**Critical P0:** Shared event model only partly used and not E2E proven. Original legacy slug/event IDs may map differently. Ensure no parallel event registration, QR, certificate records.
**Critical P0:** Public lookup/token security, unversioned templates, coordinator proof/attendance and bulk delivery require hardening against SRS CER obligations.
**Critical P1:** Institution and organization provisioning, invitation/member onboarding, role delegation and workspace switcher incomplete. Without these, no viable non-founder admin workflow.
**Critical QA:** 0 live events, so no acceptance run; setup seeded isolated staging with 2 tenants, 2 societies per tenant, scoped users, passes, certificates.
**Major future:** meetings/ID cards, recruitment, auditions, competitions, communications, AI/n8n, analytics, billing/contracts, enterprise reliability not built.

## 6. DO FIRST — 20 concrete Codex actions
1. Inspect `AGENTS.md`, this handoff, implementation plan and exact original source files.
2. Copy original PRD/SRS DOCX binaries from provided `CampusOS_Codex_Original_Source_Pack.zip` into `documents/originals/`. Validate exact hashes; commit to main.
3. Run `python scripts/build_requirements_index.py`; verify 304 SRS requirements and 20 test cases, 172 PRD capability IDs. Commit CSVs and manual source verification notes. Distinguish PRD/SRS IDs.
4. Audit original CertiFrenzi ZIP tree; identify UI files/assets, dependencies, original Firebase auth/database and hardcoded public URLs. Make original route-to-new route map.
5. Generate screenshots of original UI at desktop/mobile from isolated original code with fake/local safe data. Review each with product owner.
6. Create staged tenant A/B fixtures and scoped users; never use real student data or production writes for testing.
7. Inspect every `SECURITY DEFINER` function, RLS grants, Storage policy and public RPC; record current authorized actors.
8. Design `portal action` policy with role, action, institution, organization, event, validity and scope; ensure role inheritance and grantor limits.
9. Implement full delegated portal access with secure check at every route, API, action and export. Existing scanner should not imply roster export privileges.
10. Implement tenant owner, society/department CRUD, membership invites and active workspace switching (without second user account).
11. Make all event and sub-event identifiers canonical; add safe alias mapping for old CertiFrenzi slugs and historic verification routes.
12. Extract CertiFrenzi legacy data calls into typed Supabase adapters; copy UI/CSS without re-inventing screens.
13. Replace bespoke certificate admin with original flows behind a feature flag, preserving old tables/data until safe cutover.
14. Implement feedback form and versioned rules, eligibility + recipient category, immutable template snapshot, idempotent issue/verify/revoke/reissue.
15. Implement original template editor layout and generator; test pixel parity including portrait and landscape output, QR and branding.
16. Implement coordinator roster/custom fields and certificate eligibility tied to confirmed staff role/hours/supervisor where required.
17. Test full path: event → registration → QR check-in → feedback → claim → PNG/PDF/QR verify; repeat for coordinator; test revoked/invalid IDs.
18. Run negative authorization for every scope and after revoke/expiry; test two colleges and independent societies.
19. Run CI typecheck/build, migrations in disposable DB, Playwright E2E and source screenshot comparison; add audit/report evidence.
20. Post concise completion report with requirement IDs, files, tests and outstanding gaps; do NOT deploy without explicit owner request.

## 7. Original CertiFrenzi acceptance contract
Do not classify parity complete until all of these are owner-approved:
- Original landing/admin/events/event detail screen visual layout and navigation.
- Dynamic feedback questions/required fields/feedback link/response management.
- Participant search/claim behavior and certificate availability conditions.
- Original certificate-template editor, uploaded images, position controls, fonts/signatures/QR.
- Coordinator-specific roster, custom fields, links and lookup flows.
- Unique certificate ID and public authenticity QR with revoked/expired handling.
- PNG/PDF and batch export true artwork, matching preview/format including long names.
- Historical certificate URLs, redirects and migrated provenance where relevant.
- **Powered by CertiFrenzy** stamped on each issued/downloaded artifact and visible on verification.
- No separate certificate database; single `events.id`.

## 8. Detailed security boundaries
- Same principal can hold multiple memberships; choose workspace server-side and confirm each resource scope.
- Platform founder not used as generic tenant data reader; approved support impersonation audited and expiring.
- Source SRS ACL covers fine action rights, inheritance, limited delegation, expiry, sensitive exports and AI parity; current basic portal grants do not satisfy this.
- Role grant only with grantor's own delegable rights; deny ambiguous or expired grants; revoke independently of frontend cache.
- QR token opaque; check exact attendance context and active window. Avoid global checked_in flag for staff/meeting vs participant.
- Verification output minimal public data. Feedback answers/rosters not enumerated publicly.
- Protect public lookup/ticket endpoints against guessing/rate attacks, verify uploads and provider webhooks, use private buckets appropriately.
- No service-role key in browser, no Firebase credentials from archived ZIP.

## 9. Evidence & traceability
Each issue: product statement; PRD:<id>; SRS:<id>; intended actor/action/scope; schema migration; UI file; API/RPC; positive/negative test; screenshot; QA decision. Use statuses `NOT_STARTED`, `PARTIAL`, `IMPLEMENTED_UNVERIFIED`, `VERIFIED`, `BLOCKED`, `DEFERRED_APPROVED`. No automated `VERIFIED` assignment.

## 10. Explicit owner decisions
- main branch only; no auto-deploy
- same original CertiFrenzi code/UI
- same Supabase DB, canonical events and user identity
- portals dynamically assign/remove
- permanent Powered by CertiFrenzy branding
- AI confirms every mutation
- complimentary first-college plan by contract, paid future institutions

## 11. Work breakdown, gates and human acceptance
See `documents/IMPLEMENTATION_MASTER_PLAN.md` for detailed foundation, security, organizations, events, QR, CertiFrenzi, societies/IDs/meetings, recruitment/competitions, AI and billing phases with gates G0–G7. Use `documents/knowledge-base/TESTING_AND_RELEASE.md` for cross-tenant fixture and release checklist. Every passed test must include actual logs/screenshots and exact commit.

## 12. First Codex session prompt — COPY THIS
"Open AGENTS.md, documents/README.md, documents/CODEX_HANDOFF_AND_BACKLOG.md, documents/IMPLEMENTATION_MASTER_PLAN.md, and all documents/knowledge-base/*.md. Inspect the original user-supplied DOCX and certifrenzi-main ZIP source pack. Work on main. First restore exact source DOCX binaries, hash-verify, run scripts/build_requirements_index.py and commit the source/trace CSVs. Then inventory original CertiFrenzi UI and perform an exact UI code transplant (not a redesign), replacing Firebase with shared Supabase data adapters keyed by events.id. Complete dynamic scoped portal action grants for Events, QR Scanner and CertiFrenzi, route/RLS/RPC/export enforcement. Establish staged two-college E2E tests, maintain Powered by CertiFrenzy in rendered certificates, and report source requirement IDs, test evidence and blockers. Do not deploy or enable Vercel automatic Git builds without my approval. Do not claim production readiness from CI alone."

## 13. Handoff completeness limitations
This document organizes engineering work; it does not contain all original source code or unchanged DOCX binaries inside GitHub yet. The provided source ZIP must be supplied to Codex and added locally only after auditing. User's original DOCX formatting cannot be inferred from older Markdown exports. Requirements and plan are not evidence of implemented features. The repo on main remains a partially implemented platform, not full CampusOS.
