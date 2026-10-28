import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '../../../lib/supabase/server';

export const dynamic = 'force-dynamic';

/** Resolve the landing page from verified identity and current database rights. */
export default async function ContinueSignIn() {
  const client = await createSupabaseServerClient();
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) redirect('/login');
  const { data: owner, error: permissionError } = await client.from('platform_owners')
    .select('user_id').eq('user_id', user.id).maybeSingle();
  if (permissionError) return <main role="alert" style={{ padding: 32 }}>
    <h1>Unable to load your workspace</h1>
    <p>Your sign-in succeeded, but we could not check your access. Please try again.</p>
    <a href="/auth/continue">Retry access check</a>
  </main>;
  if(owner)redirect('/super-admin');
  const capabilities=await client.rpc('platform_my_capabilities');
  if(!capabilities.error&&Array.isArray(capabilities.data)&&capabilities.data.includes('audit.read'))redirect('/super-admin/audit');
  redirect('/portals');
}
