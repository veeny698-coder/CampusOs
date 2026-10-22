import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getVerifiedPlatformOwner } from '../../../../lib/auth/platform-owner';
import SecurityControls from './security-controls';
export const dynamic = 'force-dynamic';
export default async function SecurityPage() {
  const access = await getVerifiedPlatformOwner();
  if (!access) redirect('/login');
  return <main style={{ padding: 36, maxWidth: 860, margin: 'auto' }}><Link href="/admin/dashboard">← Back to dashboard</Link><h1>Account security</h1><p>Set up additional secure ways to sign in to CampusOS.</p><SecurityControls /></main>;
}
