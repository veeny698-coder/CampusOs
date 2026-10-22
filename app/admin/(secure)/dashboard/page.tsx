import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getVerifiedPlatformOwner } from '../../../../lib/auth/platform-owner';
import { signOut } from '../../dashboard/sign-out';

export const dynamic = 'force-dynamic';

export default async function SecureDashboard() {
  let access;
  try { access = await getVerifiedPlatformOwner(); }
  catch { return <main className="console-fallback"><h1>Backend unavailable</h1><p>Administrator access is disabled until configuration is restored.</p><Link href="/">Return home</Link></main>; }
  if (!access) redirect('/login');

  const [{ count: institutionCount, error: countError }, { data: institutions, error: listError }] = await Promise.all([
    access.client.from('institutions').select('id', { count: 'exact', head: true }),
    access.client.from('institutions').select('id,name,slug,created_at').order('created_at', { ascending: false }).limit(5),
  ]);

  return <div className="console-shell">
    <aside className="console-sidebar">
      <Link href="/" className="console-logo">campus<span>OS.</span><span className="console-logo-dot">✦</span></Link>
      <div className="console-nav-label">WORKSPACE</div>
      <nav aria-label="Platform navigation" className="console-nav">
        <Link href="/admin/dashboard" aria-current="page" className="selected"><span>◈</span> Overview</Link>
        <Link href="/admin/dashboard/institutions"><span>▦</span> Institutions</Link>
        <Link href="/admin/dashboard/audit"><span>☷</span> Audit trail</Link>
        <Link href="/admin/dashboard/events"><span>✧</span> Events</Link>
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
      <div className="console-list">{listError?<p role="alert" className="console-empty">Institution data could not be loaded. Please check permissions.</p>:!institutions?.length?<div className="console-empty"><strong>Your network starts here.</strong><p>No institutions have been added yet. Provisioning will be available after the onboarding workflow is audited.</p></div>:institutions.map((institution,i)=><div key={institution.id} className="console-institution"><div className="console-institution-mark">{institution.name.slice(0,1).toUpperCase()}</div><div className="console-institution-text"><strong>{institution.name}</strong><small>{institution.slug}</small></div><span className="console-index">0{i+1}</span></div>)}</div>
      </section><footer className="console-footer">CampusOS · Development workspace · Sensitive actions require explicit authorization</footer>
    </main>
  </div>;
}
