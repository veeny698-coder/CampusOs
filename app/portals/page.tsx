import Link from 'next/link';
import {redirect} from 'next/navigation';
import {createSupabaseServerClient} from '../../../lib/supabase/server';
export const dynamic='force-dynamic';
const icons:Record<string,string>={events:'✦',qr_scanner:'▣',certifrenzy:'◇'};
export default async function PortalHub(){
 const client=await createSupabaseServerClient();
 const {data:{user}}=await client.auth.getUser();
 if(!user)redirect('/login');
 const {data:owner}=await client.from('platform_owners').select('user_id').eq('user_id',user.id).maybeSingle();
 const {data:catalog,error:catalogError}=await client.from('portal_catalog').select('key,label,description,route').eq('enabled',true).order('label');
 const {data:assignments,error:assignmentsError}=await client.from('portal_assignments').select('portal_key,institution_id,event_id,organization_id').eq('user_id',user.id).limit(200);
 if(catalogError||assignmentsError)return <main style={{padding:32}} role="alert">Unable to load assigned portals. Your permissions have not changed.</main>;
 const allowed=new Set((assignments??[]).map(a=>a.portal_key));
 const visible=(catalog??[]).filter(p=>Boolean(owner)||allowed.has(p.key));
 return <main style={{maxWidth:1000,margin:'auto',padding:'40px 22px'}}>
  <p className="eyebrow">CAMPUSOS / WORKSPACE</p><h1 className="heading">Your portals ✦</h1>
  <p className="muted">One account. Only the portals assigned to you.</p>
  {owner&&<p><Link href="/admin/dashboard/portals">Manage access ↗</Link></p>}
  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:18,marginTop:32}}>
   {visible.map(p=><article key={p.key} style={{padding:24,border:'1px solid #34365b',borderRadius:18,background:'#151b2f'}}>
    <span style={{fontSize:28}}>{icons[p.key]||'▤'}</span><h2>{p.label}</h2><p>{p.description}</p>
    {owner?<Link href={p.route}>Open portal →</Link>:<p style={{color:'#aab6d0',fontSize:13}}>Assigned scope: {((assignments??[]).filter(a=>a.portal_key===p.key).map(a=>a.event_id?'Event':a.organization_id?'Organization':'Institution')).join(', ')}. Access must be enforced by the module.</p>}
   </article>)}
  </div>
  {!visible.length&&<div style={{padding:30,border:'1px solid #34365b',borderRadius:14}}><h2>No portals assigned yet</h2><p>Ask your institution administrator to assign a portal.</p></div>}
 </main>;
}
