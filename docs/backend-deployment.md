# Live development backend

Supabase project: `campusos-dev`, project ref `dcpetrudlngtrabmdwol` (Mumbai).
Project URL: `https://dcpetrudlngtrabmdwol.supabase.co`.
Migrations 001–004 have been applied via Supabase connector and schema/advisor checks run.

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in your hosting environment (use a publishable key or compatible legacy anon key). Do not commit service role or secret keys. Configure Auth Site URL and allowed redirect URL `https://YOUR_DOMAIN/auth/callback`.

**Bootstrap:** After an operator has verified the correct Supabase Auth user, provision the platform owner using an authenticated, privileged SQL administration session:

```sql
insert into public.platform_owners(user_id) values ('VERIFIED_AUTH_USER_UUID');
```

Do not automatically assign all signups as platform owners. The `create_institution` RPC checks platform owner membership server-side, validates input, and records an audit event. Membership invitations, owner delegation, MFA, RLS impersonation tests, rate limits and deployment remain pending.
