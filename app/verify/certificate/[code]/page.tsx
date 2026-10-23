import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
export const dynamic='force-dynamic';
export default async function VerifyCertificate({params}:{params:Promise<{code:string}>}){
 const {code}=await params;
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(code))notFound();
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!url||!key)return <main style={{padding:40}}>Verification temporarily unavailable.</main>;
 const client=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data,error}=await client.rpc('verify_event_certificate',{p_code:code});
 if(error)return <main style={{padding:40}}>Unable to verify certificate. Try again later.</main>;
 const record=Array.isArray(data)?data[0]:null;
 if(!record)notFound();
 return <main style={{minHeight:'100vh',padding:'50px 20px',background:'#0d1424',color:'white',display:'grid',placeItems:'center'}}>
  <article style={{maxWidth:840,width:'100%',textAlign:'center',padding:'min(7vw,64px) 24px',border:'3px double #a78bfa',borderRadius:12,background:'#151b2f'}}>
   <Link href="/" style={{color:'#b9a5ff'}}>campusOS. ✦</Link>
   <p style={{letterSpacing:4,color:'#b9a5ff',marginTop:35}}>CERTIFRENZY</p>
   <h1 style={{fontSize:'clamp(2rem,6vw,3.5rem)'}}>Certificate of {record.certificate_type==='appreciation'?'Appreciation':'Participation'}</h1>
   <p>This certificate is proudly presented to</p>
   <h2 style={{fontSize:'clamp(2rem,6vw,3rem)',margin:'24px 0',color:'#f5e9bf'}}>{record.recipient_name}</h2>
   <p>For {record.certificate_type==='appreciation'?'their contribution to':'participating in'}</p>
   <h3 style={{fontSize:24}}>{record.event_name}</h3>
   <p style={{color:'#aab6d0'}}>Issued on {new Date(record.issued_at).toLocaleDateString('en-IN')}</p>
   <hr style={{borderColor:'#53617a',margin:'36px 0 20px'}}/>
   <strong style={{color:record.status==='valid'?'#86efac':'#fca5a5'}}>{record.status==='valid'?'✓ Authentic certificate — Verified':'Certificate revoked'}</strong>
   <p style={{fontSize:12,overflowWrap:'anywhere',color:'#aab6d0'}}>Verification ID: {code}</p>
  </article>
 </main>;
}
