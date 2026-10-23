import Link from 'next/link';
import {createClient} from '@supabase/supabase-js';
import CertificateLookup from './lookup-form';
export const dynamic='force-dynamic';
export default async function LookupPage(){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!url||!key)return <main role="alert">Certificate lookup is unavailable.</main>;
 const client=createClient(url,key,{auth:{autoRefreshToken:false,persistSession:false}});
 const {data,error}=await client.from('events').select('id,title').eq('status','published').order('created_at',{ascending:false}).limit(150);
 return <main style={{minHeight:'100vh',padding:24,display:'grid',placeItems:'center'}}>
  <section style={{width:'100%',maxWidth:600,border:'1px solid #34365b',borderRadius:18,background:'#151b2f',padding:30}}>
   <Link href="/">campusOS. ✦</Link><p className="eyebrow">CERTIFRENZY / PARTICIPANTS</p>
   <h1>Find your certificate</h1>
   <p className="muted">Look up your participation certificate with the exact name and email used during event registration. Feedback must have been completed.</p>
   {error?<p role="alert">Unable to load events.</p>:!data?.length?<p>No public events available yet.</p>:<CertificateLookup events={data}/>}
  </section>
 </main>;
}
