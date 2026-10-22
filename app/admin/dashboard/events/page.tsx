import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getVerifiedPlatformOwner } from '../../../../lib/auth/platform-owner';

export const dynamic = 'force-dynamic';
export default async function EventsPage() {
  let access;
  try { access = await getVerifiedPlatformOwner(); }
  catch { return <main className="console-fallback"><h1>Service unavailable</h1><p>Unable to load event data right now.</p></main>; }
  if (!access) redirect('/login');
  const [{ data: events, error }, { count, error: countError }] = await Promise.all([
    access.client.from('events').select('id,title,status,institution_id,created_at').order('created_at',{ascending:false}).limit(50),
    access.client.from('events').select('id',{count:'exact',head:true}),
  ]);
  return <main className="console-directory">
    <Link href="/admin/dashboard" className="console-text-link">← Back to command center</Link>
    <div className="eyebrow" style={{marginTop:32}}>PLATFORM / EVENTS</div>
    <h1 className="heading">Every event. One orbit. <span className="console-sparkle">✦</span></h1>
    <p className="muted">Live, read-only view of events across your campus network.</p>
    <section className="console-section" style={{marginTop:32}}><div className="console-section-heading"><h2>Event directory</h2><span className="console-directory-count">{countError?'Count unavailable':(count ?? 0)+' total'} · latest 50</span></div>
      <div className="console-list">{error?<p role="alert" className="console-empty">Unable to load events. Check database permissions.</p>:!events?.length?<div className="console-empty"><strong>Ready for the first big moment?</strong><p>No events have been created yet. Event creation and QR check-in are upcoming milestones.</p></div>:events.map(event=><div className="console-institution" key={event.id}><div className="console-institution-mark">✦</div><div className="console-institution-text"><strong>{event.title}</strong><small>{event.status} · Institution {event.institution_id.slice(0,8)} · {new Date(event.created_at).toLocaleDateString('en-IN')}</small></div></div>)}</div>
    </section>
  </main>;
}
