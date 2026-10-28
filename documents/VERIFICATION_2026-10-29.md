# Verification evidence 29 October

Story: a verified platform owner enters Super Admin, uses confirmed commercial/access actions, and receives database-authorized results; an unauthenticated caller is redirected without data access.

- Full automated suite: 74 passing tests (real disposable PostgreSQL RPC/RLS, server actions, login routing and rendered UI).
- Typecheck and production build: passed.
- ESLint: configuration restored using Next 15's documented FlatCompat/core-web-vitals setup. `npm run lint` passes with four existing warnings: three raw image previews and the certificate-render effect dependency. No rule was disabled to hide those warnings. CI now runs lint.
- Local HTTP smoke: `node scripts/smoke-local.cjs` passed. Login returned 200; auth continuation, portals, audit, team, roles, portal access and all four commercial routes returned 307 to login without credentials.
- Browser boundary: no dedicated browser surface was available; IAB reported `Browser is not available: iab`, and native Chrome input reported unavailable geometry. No authenticated browser session or visual approval is claimed. HTTP/component tests do not replace that gate.
- Live commercial migration: approved and applied as 20261028182835; ten RLS tables, no anonymous function privilege/direct authenticated writes, zero rollup discrepancies, no seeded commercial records.
- Live audit-operator migration: separately approved and applied as 20261028183125; two RLS tables, zero anonymous-executable related functions, empty unauthenticated capabilities, no seeded grants/roles. Existing owner/institution/audit counts preserved.

ESLint configuration reference: https://nextjs.org/docs/15/app/api-reference/config/eslint#with-core-web-vitals

Remaining gates include authenticated login/session expiry, multi-session race checks, responsive browser review and user visual approval. Production deployment remains disabled. Super Admin and College Admin are not complete.
