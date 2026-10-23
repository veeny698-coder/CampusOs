import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getVerifiedPlatformOwner } from '../../../../../../lib/auth/platform-owner';

export const dynamic = 'force-dynamic';
const isUuid = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

export default async function AttendancePage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const access = await getVerifiedPlatformOwner();
  if (!access) redirect('/login');
  const search = await searchParams;
  const q = (search.q || '').trim().slice(0,80);
  const status = search.status === 'checked_in' || search.status === 'pending' ? search.status : 'all';
  const page = Math.min(100,Math.max(1,Number.parseInt(search.page || '1',10) || 1));
  const [{ data: event, error: eventError }, { count: total }, { count: checkedIn }] = await Promise.all([
    access.client.from('events').select('id,title,status').eq('id',id).maybeSingle(),
    access.client.from('event_registrations').select('id',{count:'exact',head:true}).eq('event_id',id),
    access.client.from('event_registrations').select('id',{count:'exact',head:true}).eq('event_id',id).not('checked_in_at','is',null),
  ]);
  if (eventError) return <main style={{padding:36}}>Unable to load event.</main>;
  if (!event) notFound();
  let query = access.client.from('event_registrations').select('id,full_name,email,created_at,checked_in_at',{count:'exact'}).eq('event_id',id);
  if (q) query = query.or('full_name.ilike.%'+q.replace(/[%_,.()]/g,'')+'%,email.ilike.%'+q.replace(/[%_,.()]/g,'')+'%');
  if (status==='checked_in') query=query.not('checked_in_at','is',null);
  if (status==='pending') query=query.is('checked_in_at',null);
  const { data: registrations, count, error } = await query.order('created_at',{ascending:false}).range((page-1)*25,page*25-1);
  const paramsFor=(nextPage:number)=>'?'+new URLSearchParams({...(q?{q}:{}),...(status!=='all'?{status}:{}),page:String(nextPage)}).toString();
  return <main className="console-directory" style={{maxWidth:1050,margin:'auto',padding:'28px 20px'}}>
    <Link href="/admin/dashboard/events" className="console-text-link">← Events</Link>
    <div className="eyebrow" style={{marginTop:30}}>EVENT OPERATIONS / ATTENDANCE</div>
    <h1 className="heading">{event.title} <span className="console-sparkle">✦</span></h1>
    <p className="muted">Live registrations and attendance · {event.status}</p>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:14,margin:'24px 0'}}>
      <div className="console-stat"><span>Registered</span><strong>{total??'—'}</strong></div>
      <div className="console-stat"><span>Checked in</span><strong>{checkedIn??'—'}</strong></div>
      <div className="console-stat"><span>Attendance rate</span><strong>{total?Math.round((checkedIn??0)/total*100)+'%':'0%'}</strong></div>
    </div>
    <div style={{display:'flex',gap:16,flexWrap:'wrap',marginBottom:24}}>
      <Link className="console-text-link" href="/admin/dashboard/check-in">Open check-in →</Link>
      <a className="console-text-link" href={'/admin/dashboard/events/'+id+'/attendance/export'}>Export attendance CSV ↓</a>
    </div>
    <form method="get" style={{display:'flex',gap:10,flexWrap:'wrap',marginBottom:22}}>
      <input name="q" defaultValue={q} placeholder="Search name or email" aria-label="Search participants" style={{padding:12,borderRadius:10,border:'1px solid #53617a',background:'#151b2f',color:'white',minWidth:230}}/>
      <select name="status" defaultValue={status} aria-label="Attendance filter" style={{padding:12,borderRadius:10,border:'1px solid #53617a',background:'#151b2f',color:'white'}}>
        <option value="all">All registrations</option><option value="checked_in">Checked in</option><option value="pending">Not checked in</option>
      </select>
      <button type="submit" className="console-ghost">Filter</button>
    </form>
    {error?<p role="alert">Unable to load registrations.</p>:!registrations?.length?<p className="console-empty">No matching registrations yet.</p>:<div className="console-list">
      {registrations.map(r=><div className="console-institution" key={r.id}>
        <div className="console-institution-mark">{r.full_name.slice(0,1).toUpperCase()}</div>
        <div className="console-institution-text"><strong>{r.full_name}</strong><small>{r.email} · Registered {new Date(r.created_at).toLocaleString('en-IN')}</small></div>
        <span style={{fontWeight:700,color:r.checked_in_at?'#86efac':'#fbbf24'}}>{r.checked_in_at?'✓ Checked in':'Pending'}</span>
      </div>)}
    </div>}
    <div style={{display:'flex',justifyContent:'space-between',marginTop:24}}>
      {page>1?<Link className="console-text-link" href={paramsFor(page-1)}>← Previous</Link>:<span/>}
      <span className="muted">Page {page} · {count??0} results</span>
      {(count??0)>page*25?<Link className="console-text-link" href={paramsFor(page+1)}>Next →</Link>:<span/>}
    </div>
  </main>;
}
