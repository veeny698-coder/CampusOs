'use client';
import {useState} from 'react';
import {createBrowserClient} from '@supabase/ssr';
type Question={id:string;label:string;type:'rating'|'text'|'certificate_text';required:boolean};
export default function FeedbackForm({token,alreadySubmitted,questions,open}:{token:string;alreadySubmitted:boolean;questions:Question[];open:boolean}){
 const [answers,setAnswers]=useState<Record<string,string>>({});
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState(alreadySubmitted?'Feedback was previously submitted. You may claim your certificate below.':'');
 const [certificate,setCertificate]=useState('');
 function client(){
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if(!url||!key)throw Error('Feedback service unavailable');
  return createBrowserClient(url,key);
 }
 async function claim(){
  const {data,error}=await client().rpc('claim_certificate_after_feedback',{p_ticket:token});
  if(error||typeof data!=='string')throw Error('Certificate is not available yet');
  setCertificate(data);setMessage('Your certificate is ready.');
 }
 async function submit(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();setBusy(true);setMessage('');
  try{
   const {error}=await client().rpc('submit_certificate_feedback',{p_ticket:token,p_answers:answers});
   if(error)throw Error('Could not save feedback. Check all required questions.');
   await claim();
  }catch(e){setMessage(e instanceof Error?e.message:'Unable to submit feedback');}
  finally{setBusy(false);}
 }
 async function retryClaim(){
  setBusy(true);setMessage('');
  try{await claim();}catch(e){setMessage(e instanceof Error?e.message:'Unable to retrieve certificate');}finally{setBusy(false);}
 }
 return <section style={{display:'grid',gap:18}}>
 {open&&<form onSubmit={submit} style={{display:'grid',gap:16,marginTop:24}}>
  {questions.map(q=><label key={q.id}>{q.label}{q.required?' *':''}{q.type==='certificate_text'?' (will appear on your public certificate)':''}
   {q.type==='rating'?<select required={q.required} value={answers[q.id]||''} onChange={e=>setAnswers(a=>({...a,[q.id]:e.target.value}))} style={{display:'block',padding:13,marginTop:8,width:'100%'}}>
    <option value="">Select rating</option>{[1,2,3,4,5].map(i=><option key={i} value={String(i)}>{i} / 5</option>)}
   </select>:<textarea rows={4} maxLength={2000} required={q.required} value={answers[q.id]||''} onChange={e=>setAnswers(a=>({...a,[q.id]:e.target.value}))} style={{display:'block',padding:13,marginTop:8,width:'100%'}}/>}
  </label>)}
  <button disabled={busy} style={{padding:13,borderRadius:10,background:'#a78bfa',color:'#151b2f',fontWeight:700}}>{busy?'Submitting…':'Submit feedback & get certificate'}</button>
 </form>}
 {!open&&<p role="status">This event's feedback form is closed.</p>}
 {(alreadySubmitted||certificate)&&<button type="button" disabled={busy} onClick={retryClaim} style={{padding:12,borderRadius:10}}>Find my submitted certificate</button>}
 <p role="status" aria-live="polite">{message}</p>
 {certificate&&<a href={'/verify/certificate/'+certificate} style={{color:'#b9a5ff',fontWeight:700}}>Open and download my certificate ↗</a>}
 </section>;
}
