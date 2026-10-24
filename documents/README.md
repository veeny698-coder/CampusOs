# CampusOS — Documentation and Knowledge Base

**Branch:** GitHub `main` · **Review date:** 24 October 2026 · **Master requirements:** 22 October 2026 draft original DOCX documents.

> New Codex agents: read root [AGENTS.md](../AGENTS.md) FIRST, then [full handoff](CODEX_HANDOFF_AND_BACKLOG.md), [master plan](IMPLEMENTATION_MASTER_PLAN.md), and [knowledge base](knowledge-base/00_START_HERE.md). No prior conversation is required for engineering orientation.

## Original authoritative requirements
| Source | Links | Reality |
|---|---|---|
| Master Product Requirements (34 pages, 20 Word tables) | [Text-searchable PRD](CampusOS_Full_Master_PRD_All_Phases.md) / [Originals manifest](originals/README.md) | Attached DOCX is authoritative; original binary still needs Codex-local Git upload. |
| Master Software Requirements (23 pages, 7 Word tables) | [Text-searchable SRS](CampusOS_Complete_SRS_All_Phases.md) / [Originals manifest](originals/README.md) | Source contains 304 numbered requirements + 20 acceptance cases, 10 reference workflows, 8 delivery stages. |
| Original CertiFrenzi UI | [Parity and migration contract](knowledge-base/CERTIFRENZY_PARITY.md) / [Screen matrix](qa/certifrenzy-parity-matrix.md) | Original user ZIP must be supplied in Codex workspace; **do not** copy legacy secrets/Firebase databases. |

**Why PRD/SRS previously looked different:** GitHub `.md` versions are text-extraction archives; original multi-column tables, typography, page breaks and graphics were flattened. Newly reattached originals have the same SHA256 as the earlier uploads; source content did not change. See originals/README for hashes and binary import instructions.

## Codex execution documents
1. [Root AGENTS.md](../AGENTS.md) — agent authority, security, workflow, Git branch and acceptance rules.
2. [Detailed Codex Handoff](CODEX_HANDOFF_AND_BACKLOG.md) — current repo/status, source links, first 20 engineering tasks, screen-parity contract and runnable kickoff prompt.
3. [Detailed Master Implementation Plan](IMPLEMENTATION_MASTER_PLAN.md) — dependencies, P0 through P7 delivery streams, technical tasks and G0–G7 exits.
4. [Completion Audit](CAMPUSOS_COMPLETION_AUDIT_2026-10-24.md) — evidence-based baseline and candid gaps. Percentages are rough, not acceptance-weighted.
5. [Legacy Original UX Migration Agreement](../docs/ORIGINAL_CERTIFRENZY_MIGRATION.md) — original UI as design source.

## Engineering knowledge base
- [Start Here / terminology](knowledge-base/00_START_HERE.md)
- [Product Contract, scope and actor model](knowledge-base/PRODUCT_CONTRACT.md)
- [System Architecture and shared event identity](knowledge-base/SYSTEM_ARCHITECTURE.md)
- [Portal authorization and tenancy](knowledge-base/PORTAL_RBAC_AND_TENANCY.md)
- [Original CertiFrenzi parity and data adapters](knowledge-base/CERTIFRENZY_PARITY.md)
- [Traceability and document-ID pitfalls](knowledge-base/REQUIREMENTS_TRACEABILITY.md)
- [Test matrix and production release gates](knowledge-base/TESTING_AND_RELEASE.md)
- [Runtime environments and operations](knowledge-base/OPERATIONS_AND_ENVIRONMENTS.md)
- [Architecture decisions/open product questions](knowledge-base/OPEN_DECISIONS_AND_ADRS.md)

## Machine-readable requirements and QA
- [PRD inventory](requirements/PRD_REQUIREMENTS.csv) — 172 IDs, initially NOT_STARTED pending individual evidence.
- [SRS inventory](requirements/SRS_REQUIREMENTS.csv) — 304 IDs, initially NOT_STARTED.
- [SRS test cases](requirements/SRS_ACCEPTANCE_CASES.csv) — 20 IDs, initially NOT_STARTED.
- [DOCX trace extractor](../scripts/build_requirements_index.py) — fills full source excerpts from originals and conservatively preserves already-reviewed statuses.
- [CertiFrenzi visual parity matrix](qa/certifrenzy-parity-matrix.md).
- [Architecture decision template](decisions/ADR_TEMPLATE.md).

## Important baseline
Current GitHub CI typecheck/build has passed for recent feature commits, but that is NOT proof of live deployment or complete features. Supabase last audit: 1 institution, 3 platform owners, 0 organizations/events/registrations/certificates/portal assignments. Owner wants original CertiFrenzi UI restored exactly, with one shared Supabase DB. GitHub main only. Vercel Git automatic builds are intentionally disabled.

## Correct start in Codex
1. Import exact original `.docx` binaries from the separately supplied source pack; verify SHA256.
2. Run requirement extraction; review ID mapping before editing code.
3. Freeze screenshots of original CertiFrenzi UI from ZIP; inspect all CSS/images/fonts and old backend calls.
4. Establish two-tenant test DB and negative authorization matrix.
5. Implement dependent tasks in master plan with smaller atomic commits, tests and status evidence.
6. Do not claim original parity or production-ready status without visual/user/security/E2E approvals.
