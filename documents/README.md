# CampusOS — Canonical requirements and Codex handoff

These documents are on GitHub **main**. Updated 24 October 2026.

| File | Purpose |
| --- | --- |
| [Master Product Requirements Document](CampusOS_Full_Master_PRD_All_Phases.md) | Entire 34-page all-phases PRD; source DOCX authored 22 Oct 2026, **draft for stakeholder sign-off**. |
| [Master Software Requirements Specification](CampusOS_Complete_SRS_All_Phases.md) | Entire 23-page all-phases SRS, version 1.0, 304 target requirements and representative acceptance scenarios; **draft for stakeholder approval**. |
| [Completion Audit](CAMPUSOS_COMPLETION_AUDIT_2026-10-24.md) | What exists, what does not, quantified estimates and current verified production data. |
| [Codex Handoff + Backlog](CODEX_HANDOFF_AND_BACKLOG.md) | Exact UX migration constraints, priority sequence P0/P1/P2, test gates and copyable kickoff prompt. |

**Read this before writing code:** Complete target scope in a PRD/SRS is **not** evidence that a feature is shipped. The original `.docx` files are retained in the user's earlier conversation; the GitHub `.md` copies contain extracted original text and are not layout-identical Word files. For original layouts/tables/screens, reference the source documents and original `certifrenzi-main(1).zip`.

**Branch policy:** Main branch only (per product owner). **Vercel Git automatic builds disabled**; do not re-enable them or run a manual deployment without explicit permission.

**Engineering note:** This directory does not alter Supabase runtime or app routes. Feature work and release gates must be tracked separately.
