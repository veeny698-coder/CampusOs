# Architecture decisions

- Separate platform-wide administration from institution and organization roles.
- Users may belong to multiple organizations within an institution; membership is not authorization by itself.
- Every domain operation is scoped to an institution and checked against explicit grants.
- Supabase Auth handles identities; Postgres RLS provides a second authorization boundary.
- Use a server-only domain layer for privileged operations. No service-role keys in browsers.
- Begin with Supabase SQL migrations; defer Prisma until its value outweighs dual-schema and RLS drift risk.
- Events support parent/child hierarchy; registrations may be native or imported with validation and audit trails.
- AI assistants are read-only by default and must confirm each write action.
