import Link from 'next/link';
import {redirect} from 'next/navigation';
import {getVerifiedPlatformOwner} from '../../../../lib/auth/platform-owner';
import CreateOrganization from './create-form';
export const dynamic='force-dynamic';
export default async function Organizations(){
 const access=await getVerifiedPlatformOwner();
 if(!access)redirect('/login');
 const [institutions,organizations]=await Promise.all([
  access.client.from('institutions').select('id,name').order('name').limit(100),
  access.client.from('organizations').select('id,institution_id,name,kind,created_at').order('created_at',{ascending:false}).limit(100)
 ]);
 const nameById=new Map((institutions.data??[]).map(i=>[i.id,i.name]));
 return <main style={{maxWidth:1100,margin:'auto',padding:28}}>
  <Link href="/admin/dashboard">← Command center</Link>
  <p className="eyebrow" style={{marginTop:22}}>CAMPUSOS / ORGANIZATIONS</p>
  <h1 className="heading">Departments, societies & clubs</h1>
  <p className="muted">Each organization belongs to exactly one institution, with role-based membership controls to follow.</p>
  {institutions.error||organizations.error?<p role="alert">Organization data unavailable. Nothing was changed.</p>:<>
   <CreateOrganization institutions={institutions.data??[]}/>
   <section style={{marginTop:32}}><h2>Organization directory</h2>
    {!organizations.data?.length?<p>No organizations created yet.</p>:<div style={{display:'grid',gap:10}}>
      {organizations.data.map(o=><div key={o.id} style={{padding:17,border:'1px solid #34365b',borderRadius:12}}>
       <strong>{o.name}</strong><p className="muted">{o.kind} · {nameById.get(o.institution_id)??'Institution'}</p>
      </div>)}
    </div>}
   </section>
  </>}
 </main>;
}
