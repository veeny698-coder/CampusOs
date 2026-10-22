import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getVerifiedPlatformOwner } from '../../../../lib/auth/platform-owner';
import CreateEventForm from './create-form';
import { setEventPublication } from './actions';

export const dynamic = 'force-dynamic';
export default async function EventsPage() {
  let access;
  try { access = await getVerifiedPlatformOwner(); }
  catch { return <main className="console-fallback"><h1>Service unavailable</h1><p>Unable to load event data right now.</p></main>; }
  if (!access) redirect('/login');
  const [{ data: events, error }, { count, error: countError }, { data: institutions, error: institutionError }] = await Promise.all([
    access.client.from('events').select('id,title,status,institution_id,created_at').order('created_at',{ascending:false}).limit(50),
    access.client.from('events').select('id',{count:'exact',head:true}),
    access.client.from('institutions').select('id,name').order('name').limit(200),
  ]);
  return <main className="console-directory">
    <Link href="/admin/dashboard" className="console-text-link">← Back to command center</Link>
    <div className="eyebrow" style={{marginTop:32}}>PLATFORM / EVENTS</div>
    <h1 className="heading">Every event. One orbit. <span className="console-sparkle">✦</span></h1>
    <p className="muted">Create, publish, and manage events across your campus network.</p><p><Link className="console-text-link" href="/admin/dashboard/check-in">Open QR check-in →</Link></p>
    {institutionError?<p role="alert">Institution options are temporarily unavailable.</p>:<CreateEventForm institutions={institutions??[]}/>}
    <section className="console-section" style={{marginTop:32}}><div className="console-section-heading"><h2>Event directory</h2><span className="console-directory-count">{countError?'Count unavailable':(count ?? 0)+' total'} · latest 50</span></div>
      <div className="console-list">{error?<p role="alert" className="console-empty">Unable to load events. Check database permissions.</p>:!events?.length?<div className="console-empty"><strong>Ready for the first big moment?</strong><p>No events have been created yet. Create a draft event above to get started.</p></div>:events.map(event=><div className="console-institution" key={event.id}><div className="console-institution-mark">✦</div><div className="console-institution-text"><strong>{event.title}</strong><small>{event.status} · Institution {event.institution_id.slice(0,8)} · {new Date(event.created_at).toLocaleDateString('en-IN')}</small>{event.status==='published'&&<Link className="console-text-link" href={'/events/'+event.id} target="_blank">View public event ↗</Link>}</div>{(event.status==='draft'||event.status==='published')&&<form action={setEventPublication}><input type="hidden" name="event_id" value={event.id}/><input type="hidden" name="action" value={event.status==='draft'?'publish':'unpublish'}/><button type="submit" style={{padding:'10px 16px',borderRadius:10,background:event.status==='draft'?'#a78bfa':'#28314a',color:event.status==='draft'?'#101021':'#fff',fontWeight:700}}>{event.status==='draft'?'Publish':'Unpublish'}</button></form>}</div>)}</div>
    </section>
  </main>;
}
