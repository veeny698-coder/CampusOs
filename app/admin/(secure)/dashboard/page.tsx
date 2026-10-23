import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getVerifiedPlatformOwner } from '../../../../lib/auth/platform-owner';
import { signOut } from '../../dashboard/sign-out';

export const dynamic = 'force-dynamic';

// Supabase network calls must not leave the server-rendered dashboard pending forever.
async function within<T>(work: PromiseLike<T>, timeoutMs = 10000): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      Promise.resolve(work),
      new Promise<T>((_, reject) => { timer = setTimeout(() => reject(new Error('Dashboard data request timed out')), timeoutMs); }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function DataError({ message }: { message: string }) {
  return <main className="console-fallback" role="alert">
    <h1>Dashboard temporarily unavailable</h1>
    <p>{message}</p>
    <p>Your data has not been changed. Please try refreshing this page.</p>
    <Link href="/admin/dashboard">Retry dashboard ↗</Link>
  </main>;
}

export default async function SecureDashboard() {
  let access;
  try { access = await within(getVerifiedPlatformOwner()); }
  catch { return <DataError message="Could not verify your session within 10 seconds. Check your connection and try again." />; }
  if (!access) redirect('/login');

  let institutionCount: number | null = null;
  let countError = false;
  let institutions: { id: string; name: string; slug: string; created_at: string }[] | null = null;
  let listError = false;
  try {
    const [countResult, listResult] = await within(Promise.all([
      access.client.from('institutions').select('id', { count: 'exact', head: true }),
      access.client.from('institutions').select('id,name,slug,created_at').order('created_at', { ascending: false }).limit(5),
    ]));
    institutionCount = countResult.count;
    countError = Boolean(countResult.error);
    institutions = listResult.data;
    listError = Boolean(listResult.error);
  } catch {
    countError = true;
    listError = true;
  }

  return <div className="console-shell">
    <aside className="console-sidebar">
      <Link href="/" className="console-logo">campus<span>OS.</span><span className="console-logo-dot">✦</span></Link>
      <div className="console-nav-label">WORKSPACE</div>
      <nav aria-label="Platform navigation" className="console-nav">
        <Link href="/admin/dashboard" aria-current="page" className="selected"><span>◈</span> Overview</Link>
        <Link href="/admin/dashboard/institutions"><span>▦</span> Institutions</Link>
        <Link href="/admin/dashboard/audit"><span>☷</span> Audit trail</Link>
        <Link href="/admin/dashboard/events"><span>✧</span> Events</Link>
        <Link href="/admin/dashboard/check-in"><span>▣</span> QR Scanner</Link>
        <Link href="/admin/dashboard/security"><span>⚿</span> Security</Link>
      </nav>
      <div className="console-nav-label">COMING NEXT</div>
      <div className="console-nav console-disabled" aria-label="Planned modules"><span>◉ &nbsp;Societies</span><span>✧ &nbsp;Festival automation</span><span>◇ &nbsp;Automation studio</span><span>▤ &nbsp;Certificates</span></div>
      <div className="console-sidebar-footer"><span className="console-avatar">{access.user.email?.slice(0,1).toUpperCase() || 'O'}</span><div><strong>Platform owner</strong><small title={access.user.email}>{access.user.email}</small></div></div>
    </aside>
    <main className="console-main">
      <header className="console-header"><div><div className="eyebrow">PLATFORM / COMMAND CENTER</div><h1>Good to have you here<span className="console-sparkle"> ✦</span></h1><p className="muted">A clearer view of your campus universe, in one place.</p></div><form action={signOut}><button className="console-ghost" type="submit">Sign out ↗</button></form></header>
      <section className="console-feature"><div className="console-feature-copy"><span className="console-feature-kicker">✦ &nbsp; CAMPUSOS CONTROL PLANE</span><h2>Every campus.<br/><em>One orbit.</em></h2><p>Build an extraordinary experience for every institution, society and student.</p><Link href="/admin/dashboard/institutions" className="console-feature-button">Explore institutions <span aria-hidden="true">↗</span></Link></div><div className="console-orbit" aria-hidden="true"><div className="orbit-ring ring-one"/><div className="orbit-ring ring-two"/><div className="orbit-ring ring-three"/><div className="orbit-core">C<span>✦</span></div><div className="orbit-point point-one"/><div className="orbit-point point-two"/><div className="orbit-point point-three"/></div></section>
      <section className="console-metrics" aria-label="Live platform metrics"><div className="console-stat"><span>Institutions visible</span><strong>{countError?'—':institutionCount ?? 0}</strong><small>{countError?'Data temporarily unavailable':'Live · RLS-protected'}</small></div><div className="console-stat"><span>Current access</span><strong className="console-stat-label">Owner</strong><small>Verified server-side</small></div><div className="console-stat"><span>Institution data</span><strong className="console-stat-label">{listError?'Error':'Live'}</strong><small>Connected to Supabase</small></div></section>
      <section className="console-section"><div className="console-section-heading"><div><div className="eyebrow">YOUR NETWORK</div><h2>Institutions</h2></div><Link href="/admin/dashboard/institutions" className="console-text-link">View directory ↗</Link></div>
      <div className="console-list">{listError?<div role="alert" className="console-empty"><strong>Could not load institution data.</strong><p>Supabase did not respond in time or the query was denied. Please retry.</p><Link className="console-text-link" href="/admin/dashboard">Retry ↗</Link></div>:!institutions?.length?<div className="console-empty"><strong>Your network starts here.</strong><p>No institutions have been added yet. Provisioning will be available after the onboarding workflow is audited.</p></div>:institutions.map((institution,i)=><div key={institution.id} className="console-institution"><div className="console-institution-mark">{institution.name.slice(0,1).toUpperCase()}</div><div className="console-institution-text"><strong>{institution.name}</strong><small>{institution.slug}</small></div><span className="console-index">0{i+1}</span></div>)}</div>
      </section><footer className="console-footer">CampusOS · Development workspace · Sensitive actions require explicit authorization</footer>
    </main>
  </div>;
}
