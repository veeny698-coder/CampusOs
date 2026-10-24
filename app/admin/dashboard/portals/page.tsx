import Link from 'next/link';
import {redirect} from 'next/navigation';
import {getVerifiedPlatformOwner} from '../../../../lib/auth/platform-owner';
import AssignmentForm from './assignment-form';
export const dynamic='force-dynamic';
export default async function PortalManagement(){
 const owner=await getVerifiedPlatformOwner();
 if(!owner)redirect('/login');
 const [portals,schools,events,organizations,members,assignments]=await Promise.all([
  owner.client.from('portal_catalog').select('key,label,description,route').eq('enabled',true).order('label'),
  owner.client.from('institutions').select('id,name').order('name').limit(100),
  owner.client.from('events').select('id,title,institution_id').order('created_at',{ascending:false}).limit(200),
  owner.client.from('organizations').select('id,name,institution_id').limit(200),
  owner.client.from('institution_memberships').select('user_id,institution_id').limit(500),
  owner.client.from('portal_assignments').select('id,portal_key,institution_id,organization_id,event_id,user_id,created_at').order('created_at',{ascending:false}).limit(150)
 ]);
 const error=[portals,schools,events,organizations,members,assignments].some(x=>x.error);
 const names=new Map((schools.data??[]).map(i=>[i.id,i.name]));
 return <main style={{padding:30,maxWidth:1100,margin:'auto'}}>
  <Link href="/admin/dashboard">← Command center</Link>
  <p className="eyebrow" style={{marginTop:20}}>CAMPUSOS / DYNAMIC PORTALS</p>
  <h1>One campus. Assignable portals.</h1>
  <p className="muted">Events, QR Scanner and CertiFrenzi share one Supabase event ID. Grant or revoke portal access for an institution, a society, or a single event.</p>
  {error?<p role="alert">Portal data could not be loaded. No permissions have changed.</p>:<>
   <AssignmentForm institutions={schools.data??[]} events={events.data??[]} organizations={organizations.data??[]} users={members.data??[]} portals={portals.data??[]}/>
   <section style={{marginTop:35}}><h2>Available portals</h2><div style={{display:'grid',gap:12}}>{(portals.data??[]).map(p=><div key={p.key} style={{padding:16,border:'1px solid #34365b',borderRadius:12}}><strong>{p.label}</strong><p>{p.description}</p><Link href={p.route}>Open portal ↗</Link></div>)}</div></section>
   <section style={{marginTop:30}}><h2>Current assignments</h2>{!assignments.data?.length?<p>No portal assignments yet.</p>:<div style={{display:'grid',gap:9}}>{assignments.data.map(a=><div key={a.id} style={{border:'1px solid #34365b',borderRadius:10,padding:14}}><strong>{a.portal_key}</strong> · {names.get(a.institution_id)??'Institution'} · {a.event_id?'Event: '+a.event_id:a.organization_id?'Organization: '+a.organization_id:'All events'}<p style={{fontSize:12,overflowWrap:'anywhere'}}>Member: {a.user_id}</p></div>)}</div>}</section>
  </>}
 </main>;
}
