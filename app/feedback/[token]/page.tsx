import Link from 'next/link';
import {notFound} from 'next/navigation';
import {createClient} from '@supabase/supabase-js';
import FeedbackForm from './feedback-form';
export const dynamic='force-dynamic';
export default async function FeedbackPage({params}:{params:Promise<{token:string}>}){
 const {token}=await params;
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token))notFound();
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!url||!key)return <main>Feedback is temporarily unavailable.</main>;
 const client=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data,error}=await client.rpc('get_certificate_feedback_event',{p_ticket:token});
 if(error)return <main role="alert">Unable to load feedback form. Please try again.</main>;
 const record=Array.isArray(data)?data[0]:null;
 if(!record)notFound();
 return <main style={{minHeight:'100vh',display:'grid',placeItems:'center',padding:24}}>
  <section style={{width:'100%',maxWidth:580,padding:30,background:'#151b2f',border:'1px solid #34365b',borderRadius:20}}>
   <Link href="/">campusOS. ✦</Link><h1>Event Feedback</h1><p style={{fontSize:12,color:"#b9a5ff"}}>Powered by CertiFrenzi</p>
   <h2>{record.event_title}</h2><p className="muted">Participant: {record.participant_name}</p>
   <p>Submit your feedback to become eligible for an event certificate.</p>
   <FeedbackForm token={token} alreadySubmitted={record.already_submitted} questions={record.feedback_questions} open={record.feedback_open}/>
  </section>
 </main>;
}
