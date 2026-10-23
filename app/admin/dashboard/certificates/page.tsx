import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getVerifiedPlatformOwner } from '../../../../lib/auth/platform-owner';
import IssueForm from './issue-form';
import TemplateEditor from './template-editor';
import CoordinatorForm from './coordinator-form';
import ArtworkUploader from './artwork-uploader';
import PlaceholderEditor from './placeholder-editor';
import FeedbackEditor from './feedback-editor';
import CoordinatorBulk from './coordinator-bulk';
export const dynamic='force-dynamic';
export default async function CertificatesPage(){
 const access=await getVerifiedPlatformOwner();
 if(!access)redirect('/login');
 const {data:registrations,error}=await access.client.from('event_registrations').select('id,full_name,email,event_id').order('created_at',{ascending:false}).limit(150);
 const eventIds=[...new Set((registrations??[]).map(r=>r.event_id))];
 const events=eventIds.length?await access.client.from('events').select('id,title').in('id',eventIds):{data:[],error:null};
 const titles=new Map((events.data??[]).map(e=>[e.id,e.title]));
 const {data:allEvents,error:eventError}=await access.client.from('events').select('id,title').order('created_at',{ascending:false}).limit(100);
 const {data:templates,error:templateError}=await access.client.from('certificate_templates').select('*').limit(100);
 const {data:coordinators,error:coordinatorError}=await access.client.from('certificate_coordinators').select('id,full_name,event_id,certificate_code,created_at').order('created_at',{ascending:false}).limit(100);
 const {data:issued,error:issuedError}=await access.client.from('event_certificates').select('id,recipient_name,certificate_type,certificate_code,issued_at').order('issued_at',{ascending:false}).limit(50);
 return <main className="console-directory" style={{maxWidth:1050,margin:'auto',padding:28}}>
  <Link href="/admin/dashboard" className="console-text-link">← Dashboard</Link><div className="eyebrow" style={{marginTop:28}}>CERTIFRENZY / CERTIFICATES</div>
  <h1 className="heading">Every achievement counts. ✦</h1>
  <p className="muted">Issue authentic, uniquely verifiable certificates for event participants.</p>
  <p><Link className="console-text-link" href="/admin/dashboard/certificates/feedback-responses">Review feedback responses & export CSV ↗</Link></p>
  {error||events.error?<p role="alert">Unable to load event registrations.</p>:<IssueForm registrations={(registrations??[]).map(r=>({...r,event_title:titles.get(r.event_id)||'Event'}))}/>}
  {eventError||templateError?<p role="alert">Unable to load certificate studio settings.</p>:<><TemplateEditor events={allEvents??[]} templates={templates??[]}/><ArtworkUploader events={allEvents??[]} templates={templates??[]}/><PlaceholderEditor events={allEvents??[]} templates={templates??[]}/><FeedbackEditor events={allEvents??[]} templates={templates??[]}/><CoordinatorForm events={allEvents??[]}/><CoordinatorBulk events={allEvents??[]}/></>}
  {(allEvents??[]).length>0&&<section style={{marginTop:24}}><h2>Coordinator download links</h2>{(allEvents??[]).map(e=><p key={e.id}><Link href={'/events/'+e.id+'/coordinators'} target="_blank">{e.title} — Coordinator certificate link ↗</Link></p>)}</section>}
  <section className="console-section" style={{marginTop:32}}><div className="console-section-heading"><h2>Coordinator certificate links</h2></div>
   <div className="console-list">{coordinatorError?<p role="alert">Coordinator records unavailable.</p>:!coordinators?.length?<p className="console-empty">No coordinators added yet.</p>:coordinators.map(person=><div className="console-institution" key={person.id}><div className="console-institution-text"><strong>{person.full_name}</strong><small>{(allEvents??[]).find(e=>e.id===person.event_id)?.title??'Event'}</small></div><Link className="console-text-link" href={'/verify/coordinator/'+person.certificate_code} target="_blank">Certificate ↗</Link></div>)}</div>
  </section>
  <section className="console-section" style={{marginTop:32}}><div className="console-section-heading"><h2>Recently issued</h2><span className="console-directory-count">Latest 50</span></div>
   <div className="console-list">{issuedError?<p role="alert">Certificate records unavailable.</p>:!issued?.length?<p className="console-empty">No certificates issued yet.</p>:issued.map(c=><div className="console-institution" key={c.id}><div className="console-institution-text"><strong>{c.recipient_name}</strong><small>{c.certificate_type} · {new Date(c.issued_at).toLocaleDateString('en-IN')}</small></div><Link className="console-text-link" href={'/verify/certificate/'+c.certificate_code} target="_blank">Verify ↗</Link></div>)}</div>
  </section>
 </main>;
}
