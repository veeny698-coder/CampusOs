import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getVerifiedPlatformOwner } from '../../lib/auth/platform-owner';

export const dynamic = 'force-dynamic';

const nav = [
  ['Overview', '/admin'],
  ['Institutions', '/admin/dashboard/institutions'],
  ['Societies', null],
  ['Events & Festivals', '/admin/dashboard/events'],
  ['Auditions', null],
  ['Certificates', null],
  ['Automation Studio', null],
  ['Settings', null],
] as const;

export default async function AdminPage() {
  let access;
  try {
    access = await getVerifiedPlatformOwner();
  } catch {
    return <main className="main"><h1 className="heading">Unable to connect</h1><p role="alert">Authentication service is unavailable. Please try again later.</p></main>;
  }
  if (!access) redirect('/login');

  // All reads use the signed-in user's session; Supabase RLS remains enforced.
  const [institutionCount, organizationCount, eventCount, recentInstitutions, recentEvents] = await Promise.all([
    access.client.from('institutions').select('id', { count: 'exact', head: true }),
    access.client.from('organizations').select('id', { count: 'exact', head: true }),
    access.client.from('events').select('id', { count: 'exact', head: true }),
    access.client.from('institutions').select('id,name,created_at').order('created_at', { ascending: false }).limit(5),
    access.client.from('events').select('id,title,status,created_at').order('created_at', { ascending: false }).limit(5),
  ]);

  function metric(result: { count: number | null; error: { message: string } | null }) {
    return result.error ? '—' : String(result.count ?? 0);
  }

  return <div className="shell">
    <aside className="sidebar">
      <div className="brand">campus<span>OS.</span></div>
      <nav className="nav" aria-label="Admin navigation">
        {nav.map(([name, url], i) => url
          ? <Link className={i === 0 ? 'active' : ''} key={name} href={url}>{name}</Link>
          : <span key={name} className="muted" aria-disabled="true" title="Not implemented yet">{name}</span>)}
      </nav>
      <p className="muted" style={{ padding: 14, fontSize: 12, marginTop: 35 }}>SECURE ADMIN<br/>Authenticated · RLS-protected</p>
    </aside>
    <main className="main">
      <header className="top">
        <div><div className="eyebrow">Platform command center</div><h1 className="heading">Your campus universe.</h1><p className="muted">Everything your institutions need, beautifully connected.</p></div>
        <span className="pill">✦ Live workspace</span>
      </header>
      <section className="hero">
        <div><div className="eyebrow">The future of campus operations</div><h2>One platform. Infinite possibilities.</h2><p style={{ color: '#c3b9df', maxWidth: 530 }}>Bring societies, festivals, auditions, check-ins and certificates into one delightful workspace.</p></div>
        <Link className="button" href="/admin/dashboard">Open command center ↗</Link>
      </section>
      <section className="grid" aria-label="Platform modules">
        <div className="card"><small>Institutions</small><div className="metric">{metric(institutionCount)}</div><span className="muted">{institutionCount.error ? 'Unable to load institutions' : 'Live · RLS-scoped'}</span></div>
        <div className="card"><small>Organizations</small><div className="metric">{metric(organizationCount)}</div><span className="muted">{organizationCount.error ? 'Unable to load organizations' : 'Live · RLS-scoped'}</span></div>
        <div className="card"><small>Events</small><div className="metric">{metric(eventCount)}</div><span className="muted">{eventCount.error ? 'Unable to load events' : 'Live · RLS-scoped'}</span></div>
        <div className="card"><small>Automations</small><div className="metric">—</div><span className="muted">Not implemented yet</span></div>
      </section>
      <section className="section">
        <h2>Designed for every campus moment</h2>
        <div className="grid">
          <div className="card wide"><small>Operations pulse · Recent events</small>
            {recentEvents.error
              ? <div className="placeholder" role="alert">Unable to load events. Please try again later.</div>
              : !recentEvents.data?.length
                ? <div className="placeholder">No events yet. Created events will appear here.</div>
                : <ul>{recentEvents.data.map(event => <li key={event.id}><strong>{event.title}</strong> <span className="muted">· {event.status}</span></li>)}</ul>}
          </div>
          <div className="card wide"><small>Campus activity · Recent institutions</small>
            {recentInstitutions.error
              ? <div className="placeholder" role="alert">Unable to load institutions. Please try again later.</div>
              : !recentInstitutions.data?.length
                ? <div className="placeholder">No institutions yet. Added institutions will appear here.</div>
                : <ul>{recentInstitutions.data.map(institution => <li key={institution.id}>{institution.name}</li>)}</ul>}
          </div>
        </div>
      </section>
    </main>
  </div>;
}
