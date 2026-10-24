import Link from 'next/link';
import {createClient} from '@supabase/supabase-js';
import {notFound} from 'next/navigation';
import CoordinatorLookup from './coordinator-lookup';
export const dynamic='force-dynamic';
export default async function Coordinators({params}:{params:Promise<{id:string}>}){
 const {id}=await params;
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))notFound();
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!url||!key)return <main>Event lookup unavailable.</main>;
 const client=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data,error}=await client.from('events').select('title').eq('id',id).eq('status','published').maybeSingle();
 if(error)return <main role="alert">Unable to load coordinator lookup.</main>;
 if(!data)notFound();
 return <main style={{minHeight:'100vh',padding:24,display:'grid',placeItems:'center'}}>
 <section style={{padding:30,maxWidth:580,width:'100%',background:'#151b2f',border:'1px solid #34365b',borderRadius:20}}>
 <Link href="/">campusOS. ✦</Link><p className="eyebrow">CERTIFRENZY / COORDINATORS</p>
 <h1>Coordinator certificates</h1><p style={{fontSize:12,color:"#b9a5ff"}}>Powered by CertiFrenzi</p><h2>{data.title}</h2><p className="muted">Enter your name as registered by the event administrator.</p>
 <CoordinatorLookup eventId={id}/>
 </section></main>;
}
