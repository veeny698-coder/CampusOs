# Original Master Source Files — binary upload checklist

The following files are the **exact original DOCX uploads** supplied by the product owner on 24 October 2026. They have been inspected against the previously attached originals and hashes are identical. They are authoritative over extracted Markdown. **Binary files are NOT included in this GitHub directory yet**, because the available GitHub connector can create/update UTF-8 text files only; do not relabel extracted text as DOCX.

| Canonical target path | Uploaded file | SHA-256 | Size |
|---|---|---|---|
| `documents/originals/CampusOS_Full_Master_PRD_All_Phases.docx` | `CampusOS_Full_Master_PRD_All_Phases (1).docx` | `40f307022b250207557663c40aaf79c1d802367bd81dfc53ada7721602ed9947` | 62,487 bytes |
| `documents/originals/CampusOS_Complete_SRS_All_Phases.docx` | `CampusOS_Complete_SRS_All_Phases(1).docx` | `10caca437218b83592d40b5f017ec812d1fcd7c97f9de06e3f171d9c882359e6` | 59,557 bytes |

To finish original binary check-in using Codex/local Git access:
1. Copy the **actual uploaded bytes** (do not regenerate from Markdown) to the canonical target paths above.
2. Run `sha256sum documents/originals/*.docx` and compare the exact digests.
3. Confirm `python scripts/build_requirements_index.py` succeeds from original DOCX.
4. Commit **both original DOCX files** to GitHub main. Never upload private user data, secrets or legacy original ZIP without auditing.
5. Add a rendered visual diff only if original DOCX is intentionally edited; no reflow or substitute sources are approved.

The existing `documents/CampusOS_Full_Master_PRD_All_Phases.md` and `documents/CampusOS_Complete_SRS_All_Phases.md` were earlier extracted-text archives. They preserve searchable text imperfectly and do **not** retain the original 20 PRD tables and 7 SRS tables' layout.

## Document facts verified in source
PRD: 34 rendered pages, 24 main contents headings, 20 Word tables, 22 October 2026 and **Draft for stakeholder sign-off**.
SRS: 23 rendered pages, 28 main contents headings, 7 Word tables, 304 numbered requirement statements, 20 acceptance cases and 10 reference workflows, 8 delivery stages; **Draft for stakeholder approval**.

The original docs are NOT an implementation-complete assertion. A requirement needs trace and tests; review `documents/knowledge-base/REQUIREMENTS_TRACEABILITY.md`.
