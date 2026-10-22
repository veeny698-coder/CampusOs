import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getVerifiedPlatformOwner } from '../../../../lib/auth/platform-owner';
import CreateInstitutionForm from './create-form';
export const dynamic='force-dynamic';
export default async function InstitutionsPage(){
 let access;try{access=await getVerifiedPlatformOwner()}catch{return <main className="console-fallback">Backend unavailable. Institution data cannot be displayed.</main>}
 if(!access)redirect('/login');
 const {data,error}=await access.client.from('institutions').select('id,name,slug,created_at').order('created_at',{ascending:false}).limit(50);
 return <main className="console-directory"><Link href="/admin/dashboard" className="console-text-link">← Back to command center</Link><div className="eyebrow" style={{marginTop:32}}>PLATFORM / INSTITUTIONS</div><h1 className="heading">Your campus network<span className="console-sparkle"> ✦</span></h1><p className="muted">One place to manage institution onboarding and discover your network.</p><CreateInstitutionForm/><section className="console-section"><div className="console-section-heading"><h2>Institution directory</h2><span className="console-directory-count">{error?'Unavailable':data?.length??0} shown · latest 50</span></div><div className="console-list">{error?<p role="alert" className="console-empty">Unable to load institutions. Check database configuration and policies.</p>:!data?.length?<p className="console-empty">No institutions yet. Create your first institution above.</p>:data.map(item=><div key={item.id} className="console-institution"><div className="console-institution-mark">{item.name.slice(0,1).toUpperCase()}</div><div className="console-institution-text"><strong>{item.name}</strong><small>{item.slug}</small></div><span className="console-index">{new Date(item.created_at).toLocaleDateString('en-IN')}</span></div>)}</div></section></main>;
}
