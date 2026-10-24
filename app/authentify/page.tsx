import Link from 'next/link';
import {redirect} from 'next/navigation';
import {createClient} from '@supabase/supabase-js';
export const dynamic='force-dynamic';

const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export default async function Authentify({searchParams}:{searchParams:Promise<{id?:string}>}){
 const {id:input}=await searchParams;
 const id=String(input||'').trim();
 let invalid=false;
 if(id){
  invalid=true;
  if(UUID.test(id)){
   const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
   if(url&&key){
    const client=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
    const {data:participant,error:participantError}=await client.rpc('verify_event_certificate',{p_code:id});
    if(!participantError&&Array.isArray(participant)&&participant.length)redirect('/verify/certificate/'+id);
    const {data:coordinator,error:coordinatorError}=await client.rpc('verify_coordinator_certificate',{p_code:id});
    if(!coordinatorError&&Array.isArray(coordinator)&&coordinator.length)redirect('/verify/coordinator/'+id);
   }
  }
 }
 return <main style={{minHeight:'100vh',display:'grid',placeItems:'center',background:'#0d1424',color:'#fff',padding:24}}>
  <section style={{maxWidth:520,width:'100%',padding:32,border:'1px solid #34365b',borderRadius:20,background:'#151b2f'}}>
   <Link href="/" style={{color:'#b9a5ff'}}>campusOS. ✦</Link>
   <p style={{fontSize:12,color:'#b9a5ff',marginTop:20}}>Powered by CertiFrenzy</p>
   <h1>Authentify Certificate</h1>
   <p>Enter the certificate ID printed on a participant or coordinator certificate to verify it.</p>
   {invalid&&<p role="alert" style={{color:'#fca5a5'}}>No verified certificate was found for that ID. Please check it and retry.</p>}
   <form method="GET" action="/authentify" style={{display:'grid',gap:14,marginTop:22}}>
    <label>Certificate ID<input name="id" required minLength={36} maxLength={36} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" defaultValue={id} style={{display:'block',marginTop:10,width:'100%',padding:12,borderRadius:8}}/></label>
    <button style={{padding:13,borderRadius:9,background:'#a78bfa',color:'#151b2f',fontWeight:700}}>Verify certificate</button>
   </form>
  </section>
 </main>;
}
