import Link from 'next/link';
import {redirect} from 'next/navigation';
import {getVerifiedPlatformOwner} from '../../../../../lib/auth/platform-owner';
export const dynamic='force-dynamic';
export default async function FeedbackResponses(){
 const access=await getVerifiedPlatformOwner();
 if(!access)redirect('/login');
 const {data:responses,error}=await access.client.from('certificate_feedback')
 .select('id,registration_id,event_id,submitted_at,answers').order('submitted_at',{ascending:false}).limit(100);
 const registrations=(responses??[]).map(f=>f.registration_id);
 const eventIds=[...new Set((responses??[]).map(f=>f.event_id))];
 const [{data:people},{data:events}]=await Promise.all([
  registrations.length?access.client.from('event_registrations').select('id,full_name,email').in('id',registrations):Promise.resolve({data:[]}),
  eventIds.length?access.client.from('events').select('id,title').in('id',eventIds):Promise.resolve({data:[]})
 ]);
 const names=new Map((people??[]).map(p=>[p.id,p]));
 const titles=new Map((events??[]).map(e=>[e.id,e.title]));
 return <main style={{padding:32,maxWidth:1100,margin:'auto'}}>
  <Link href="/admin/dashboard/certificates">← Certificate studio</Link>
  <p className="eyebrow" style={{marginTop:20}}>CERTIFRENZY / PRIVATE RESPONSES</p>
  <h1>Event feedback responses</h1>
  <p className="muted">Latest 100 submissions. Only verified platform owners can review feedback.</p>
  <a href="/admin/dashboard/certificates/feedback-responses/export" style={{color:'#b9a5ff'}}>Export responses CSV ↗</a>
  {error?<p role="alert">Unable to load responses.</p>:!responses?.length?<p className="console-empty">No feedback submitted yet.</p>:<div style={{display:'grid',gap:16,marginTop:20}}>
   {responses.map(r=><article key={r.id} style={{background:'#151b2f',border:'1px solid #34365b',borderRadius:15,padding:20}}>
    <strong>{names.get(r.registration_id)?.full_name??'Participant'}</strong>
    <p className="muted">{titles.get(r.event_id)??'Event'} · {new Date(r.submitted_at).toLocaleString('en-IN')}</p>
    <p className="muted">{names.get(r.registration_id)?.email??''}</p>
    <dl>{Object.entries(r.answers as Record<string,unknown>).map(([key,value])=><div key={key} style={{marginBottom:9}}><dt style={{fontWeight:700}}>{key}</dt><dd style={{marginLeft:0,overflowWrap:'anywhere'}}>{String(value??'')}</dd></div>)}</dl>
   </article>)}
  </div>}
 </main>;
}
