# Documentation and Requirements Agent Instructions (inherits root /AGENTS.md)

## Source fidelity
- Original 22 Oct 2026 master PRD and SRS DOCX are authoritative, currently DRAFT. Searchable Markdown archives flatten Word tables and page layouts.
- Always cite `PRD:<id>` or `SRS:<id>`, not bare overlapping IDs. PRD has 172 capability IDs; SRS has 304 requirements plus 20 AT test cases.
- Preserve wording, scope and original delivery-stage semantics. All-phases target scope ≠ first usable release.
- Separate **VERIFIED facts**, **inferences/proposals**, **open decisions** and **unimplemented** items.
- Do not produce false status percentages or mark VERIFIED based on schema presence or typecheck.
- Source originals expected under `documents/originals` with hashes from README; until uploaded as binary, refer to user-provided source pack and do not treat archival Markdown as visually exact.

## Each task must update
- requirements CSV row status and evidence, relevant implementation plan stage and known-risk changes;
- ADR with owner decision for deviations;
- QA matrix for original CertiFrenzi UI changes;
- CODEX_HANDOFF for critical design/test discoveries;
- CI/deployment evidence with exact commit SHA.

## Documentation structure
`knowledge-base/` for stable domain and operational contracts, `requirements/` for machine-readable trace, `qa/` for tests/parity, `decisions/` for ADRs, `originals/` for immutable Word sources, root for plan/handoff and index.
