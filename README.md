# CampusOS

Multi-tenant campus operations platform combining QRBlaze and CertiFrenzy.

> Status: early secure foundation, not production-ready.

## Architecture
- Next.js TypeScript web application (`apps/web`)
- Supabase Auth and PostgreSQL with tenant-scoped RLS (`supabase/migrations`)
- Modular domain services; n8n orchestration added after authenticated tool APIs

## Security first
- No credentials committed. Configure `.env.local` from `.env.example`.
- All tenant data requires server-side authorization and database RLS.
- Never deploy SQL migrations to an existing production database without review.
- AI write operations must explicitly request user confirmation.

## Development
See `docs/architecture.md` and `docs/security.md` for implementation and phased migration details.
