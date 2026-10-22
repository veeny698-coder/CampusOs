import { redirect } from 'next/navigation';
import { getVerifiedPlatformOwner } from '../../../../lib/auth/platform-owner';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export default async function SecureDashboard() {
  let access;
  try { access = await getVerifiedPlatformOwner(); } catch { return <main style={{padding:40}}>Backend not configured. Administrator access is unavailable.<p><Link href="/admin/dashboard/institutions">Manage institutions →</Link></p></main>; }
  if (!access) redirect('/login');
  const {count,error} = await access.client.from('institutions').select('id',{count:'exact',head:true});
  return <main style={{padding:40}}><p>CampusOS · Platform Owner</p><h1>Institution control center</h1><p>Authenticated access granted.</p><p>Institutions: {error?'Unavailable':count ?? 0}</p><p>Institution onboarding is available to verified Platform Owners.</p></main>;
}
