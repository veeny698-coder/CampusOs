import { redirect } from 'next/navigation';
import { getVerifiedPlatformOwner } from '../../../../lib/auth/platform-owner';

export const dynamic = 'force-dynamic';
export default async function SecureDashboard() {
  let access;
  try { access = await getVerifiedPlatformOwner(); } catch { return <main style={{padding:40}}>Backend not configured. Administrator access is unavailable.</main>; }
  if (!access) redirect('/login');
  const {count,error} = await access.client.from('institutions').select('id',{count:'exact',head:true});
  return <main style={{padding:40}}><p>CampusOS · Platform Owner</p><h1>Institution control center</h1><p>Authenticated access granted.</p><p>Institutions: {error?'Unavailable':count ?? 0}</p><p>Additional management actions are disabled until scoped write authorization is implemented.</p></main>;
}
