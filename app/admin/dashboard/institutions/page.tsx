import Link from 'next/link';
import CreateInstitutionForm from './create-form';
import { redirect } from 'next/navigation';
import { getVerifiedPlatformOwner } from '../../../../lib/auth/platform-owner';
export const dynamic='force-dynamic';
export default async function InstitutionsPage(){
 let access;try{access=await getVerifiedPlatformOwner()}catch{return <main style={{padding:40}}>Database unavailable. Institution data cannot be displayed.</main>}
 if(!access)redirect('/login');
 const {data,error}=await access.client.from('institutions').select('id,name,slug,created_at').order('created_at',{ascending:false}).limit(50);
 return <main style={{padding:'48px max(20px,6vw)',maxWidth:1300,margin:'auto'}}><Link href="/admin/dashboard">← Command center</Link><p className="eyebrow" style={{marginTop:35}}>Platform / Institution directory</p><h1 className="heading">Your institutions.</h1><p className="muted">Securely view organizations across your platform. Create and view institutions with audited, owner-only actions.</p><div className="card" style={{marginTop:28}}>{error?<p role="alert">Unable to load institutions. Check database configuration and policies.</p>:!data?.length?<p className="muted">No institutions available to this account.</p>:<div style={{display:'grid',gap:14}}>{data.map(item=><div key={item.id} style={{padding:18,border:'1px solid #29324a',borderRadius:12,display:'flex',justifyContent:'space-between',gap:20,flexWrap:'wrap'}}><strong>{item.name}</strong><span className="muted">{item.slug}</span></div>)}</div>}</div><CreateInstitutionForm/></main>
}
