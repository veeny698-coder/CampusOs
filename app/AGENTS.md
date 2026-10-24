# App Router Agent Instructions (inherits root /AGENTS.md)

## Before UI work
Read original CertiFrenzi ZIP React components and CSS before changing certificate pages. Product owner explicitly rejected bespoke certificate dashboard redesign; preserve original layout, labels, workflow, controls and responsive behavior. Record original vs new screenshot diff for every migrated route. Add `Powered by CertiFrenzy` visibly and in rendered PNG/PDF without hiding original primary UX.

## Routing and auth
- Next.js App Router server components are authoritative for permission-aware data. Use cookie-bound Supabase user, avoid trusting client-submitted tenant/role.
- Shared `events.id` UUID across every portal; legacy slug mapping is adapter-only.
- Portal catalog display is not authorization. Require action- and resource-specific policy in loaders, server actions, route handlers and database functions.
- Super Admin control plane routes are different from college/society operator portals. Do not give tenant users platform-owner privileges to make features work.
- Do not copy original Firebase-auth dependencies/credentials or embed admin Supabase key.
- Avoid `NEXT_PUBLIC_` for secrets. Public certificate verification returns minimal approved fields.

## UX acceptance
- Preserve original CertiFrenzi template editor interactions and fonts/placeholder positioning, coordinator lookup and required feedback.
- Mobile responsiveness for scanning, template editor, feedback and student wallet. Accessible labels/keyboard/touch feedback.
- Signed/opaque QR, no raw PII in URLs/canvas and no accidental private feedback rendering.
- AI assistant must ask approval before *each* write.
- Record screenshot evidence in `documents/qa/` and tests of loading/error/empty/success states.

## Validation
Run npm typecheck/build and unit/browser tests; test guest, participant, delegated role, revoked role, cross-tenant and owner. Never replace original UI with fabricated simplified markup and call parity complete.
