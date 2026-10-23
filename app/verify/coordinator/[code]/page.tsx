import Link from 'next/link';
import DownloadCertificate from '../../certificate/[code]/download';
import {notFound} from 'next/navigation';
import {createClient} from '@supabase/supabase-js';
export const dynamic='force-dynamic';
export default async function CoordinatorCertificate({params}:{params:Promise<{code:string}>}){
 const {code}=await params;
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(code))notFound();
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!url||!key)return <main>Verification service unavailable</main>;
 const client=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data,error}=await client.rpc('verify_coordinator_certificate',{p_code:code});
 if(error)return <main role="alert">Unable to verify the certificate.</main>;
 const r=Array.isArray(data)?data[0]:null;
 if(!r)notFound();
 return <main style={{minHeight:'100vh',background:'#0d1424',color:'#fff',display:'grid',placeItems:'center',padding:24}}>
  <article style={{width:'100%',maxWidth:860,background:'#151b2f',border:'5px double #a78bfa',padding:48,textAlign:'center',borderRadius:12}}>
  <Link href="/">campusOS. ✦</Link>
  <p style={{letterSpacing:4,color:'#b9a5ff'}}>CERTIFRENZY</p>
  <h1>Certificate of Coordination</h1><p>Presented with appreciation to</p>
  <h2 style={{fontSize:42,color:'#f5e9bf'}}>{r.recipient_name}</h2><p>For coordinating</p><h3>{r.event_name}</h3>
  <p>{new Date(r.issued_at).toLocaleDateString('en-IN')}</p>
  <p role="status" style={{color:r.status==='valid'?'#86efac':'#fca5a5'}}>{r.status==='valid'?'✓ Authentic coordinator certificate':'Certificate revoked'}</p>
  <p style={{fontSize:12,overflowWrap:'anywhere'}}>Certificate ID: {code}</p>
  <DownloadCertificate info={{name:r.recipient_name,event:r.event_name,issued:r.issued_at,code,status:r.status,type:'coordinator',title:'Certificate of Coordination',imagePath:r.image_path,placeholders:r.placeholders,customFields:r.custom_fields,verificationPath:'/verify/coordinator/'+code}}/>
  </article></main>;
}
