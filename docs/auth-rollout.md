# Authentication milestone

- Public /admin is a design-only demo; real private portal is /admin/dashboard.
- Login uses Supabase email OTP PKCE code exchange and server-verified auth.getUser().
- Platform ownership comes from a protected DB table, not editable profile metadata.
- The owner must be provisioned by an authorized operator using trusted SQL after identity verification; never allow signup to self-assign.
- Supabase Auth redirect URL must include `https://YOUR_DOMAIN/auth/callback` (and localhost for development).
- Missing configuration fails closed; no privileged write endpoints exist yet.
- Before production: configure session refresh proxy, rate limiting, MFA for platform owners, audit logs, secure deployment origin, and RLS integration tests.
