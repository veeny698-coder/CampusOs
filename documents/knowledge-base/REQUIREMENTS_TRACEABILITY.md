# Requirements Traceability, Vocabulary and Status Policy

## Source material
- **Original PRD:** 22 Oct 2026, 34 pages, 20 DOCX tables; 24 main sections. Contains product domain IDs such as `SAS-001`, `IAM-001`, `EVT-001`, `CER-001`, `AIA-001`. Source describes all planned releases.
- **Original SRS:** 22 Oct 2026, 23 pages, 7 DOCX tables, **304 numbered requirement statements**, **20 acceptance test cases**, **10 reference workflows**, **8 delivery stages** (as document claims).
- We inspected uploaded DOCX attachments; old GitHub Markdown exports are extracted text and lose formatted tables, and must not supersede source originals.

## ID collision rule
`PRD:IAM-001` and `SRS:IAM-001` can have different descriptions. NEVER merge by bare `IAM-001`. Unique key is `source_doc:requirement_id`.

## Status vocabulary
- `NOT_STARTED`: no working code.
- `PARTIAL`: skeleton/limited scope exists, missing required cases.
- `IMPLEMENTED_UNVERIFIED`: code exists, no acceptance evidence.
- `VERIFIED`: tests cover all requirement actions and negative scopes; product owner approved UX where needed.
- `BLOCKED`: cannot proceed safely until data/access/business decision.
- `DEFERRED_APPROVED`: explicitly signed off to later release; still in total product scope.

## Canonical trace row
`source, id, domain, requirement summary, source section/page, planned wave, owner, status, repo paths, migration IDs, positive test ID, negative test ID, UX screenshot link, acceptance owner, evidence date, open issue/ADR`.

## Traceability practice
Every feature PR/commit must reference at least one PRD and one relevant SRS requirement. Create separate rows where PRD and SRS describe same domain differently. Never infer compliance from file name or schema table existence.

## Requirement counts
The original SRS has 304 actual requirements in domain sections; regex extraction over DOCX also sees **AT-001…AT-020** acceptance test IDs (thus 324 distinct identifier tokens). Acceptance cases are tests, not functional requirements. The PRD has its own numbered capability list and a different prefix scheme. Establish matrix from the ORIGINAL Word tables/paragraphs before calculating precise status counts.

## Coverage computation
Implementation % = number of `VERIFIED` target requirements / all in-scope approved requirements, after manual trace review. Code coverage/build pass ≠ feature coverage. Existing "15–25%" overall estimate is an informed rough estimate, **not** the formula result.

## Verification evidence example
`SRS:QRA-006` repeated scan idempotency → `check_in_event_ticket` RPC + unique DB constraint → two parallel scans test produces one canonical record and a safe already-checked-in response → proof log. Mark VERIFIED only after staging test, not because an SQL migration exists.

## Next task for Codex
Create `documents/requirements/PRD_REQUIREMENTS.csv` and `documents/requirements/SRS_REQUIREMENTS.csv` from original DOCX with paragraph and table extraction; provide exact per-ID descriptions and section/page mapping; seed every status conservatively `NOT_STARTED` or `PARTIAL` with file-level evidence; no invented completion. Reconcile 304 SRS statements and 20 acceptance test IDs independently.
