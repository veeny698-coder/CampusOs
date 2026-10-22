# Provision the first Platform Owner (development)

**Current status:** No Supabase Auth users or Platform Owners exist yet. No admin password is embedded in source control.

1. Set the Netlify environment variables `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from the Supabase dashboard's public project URL and publishable/anon key. Redeploy.
2. In Supabase Dashboard → Authentication → Users, invite the intended administrator's verified email. Use a mailbox the administrator controls. Configure Supabase Authentication → URL Configuration with the Netlify site URL and the exact callback URL `https://campusos-preview.netlify.app/auth/callback`.
3. After the invited administrator has signed in, find their Supabase Auth user ID in Authentication → Users. From the trusted SQL Editor (never the browser), execute:

   ```sql
   insert into public.platform_owners(user_id)
   values ('<verified-auth-user-uuid>'::uuid)
   on conflict (user_id) do nothing;
   ```

4. Sign out and sign in again. Visit `/admin/dashboard`.

**Security:** Verify the Auth user ID and email before granting access. Do not insert based on email alone, expose a public admin signup endpoint, commit passwords, or share service-role keys. Only a trusted database operator can grant or revoke the owner role.
