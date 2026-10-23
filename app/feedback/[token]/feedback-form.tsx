'use client';
import {useState} from 'react';
import {createBrowserClient} from '@supabase/ssr';
export default function FeedbackForm({token,alreadySubmitted}:{token:string;alreadySubmitted:boolean}){
 const [rating,setRating]=useState('');
 const [feedback,setFeedback]=useState('');
 const [busy,setBusy]=useState(false);
 const [certificate,setCertificate]=useState('');
 const [message,setMessage]=useState(alreadySubmitted?'Feedback previously submitted. You can update it here.':'');
 async function send(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();setBusy(true);setMessage('');
  try{
   const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
   if(!url||!key)throw Error('Feedback service is not configured');
   const client=createBrowserClient(url,key);
   const {error}=await client.rpc('submit_certificate_feedback',{p_ticket:token,p_answers:{rating,feedback}});
   if(error)throw Error('Unable to save feedback. Please verify your ticket and try again.');
   const {data:code,error:claimError}=await client.rpc('claim_certificate_after_feedback',{p_ticket:token});
   if(claimError||!code){setMessage('Feedback saved. Certificate is temporarily unavailable; use Claim certificate below to retry.');return;}
   setCertificate(String(code));
   setMessage('Feedback submitted successfully! Your certificate is ready.');
  }catch(error){setMessage(error instanceof Error?error.message:'Unable to submit feedback.');}
  finally{setBusy(false);}
 }
 return <form onSubmit={send} style={{display:'grid',gap:18,marginTop:24}}>
  <label>Rate this event (1 to 5)
   <select required value={rating} onChange={e=>setRating(e.target.value)} style={{display:'block',padding:14,marginTop:8,width:'100%'}}>
    <option value="">Select rating</option>{[1,2,3,4,5].map(v=><option key={v} value={String(v)}>{v} / 5</option>)}
   </select>
  </label>
  <label>Your feedback
   <textarea value={feedback} onChange={e=>setFeedback(e.target.value)} required minLength={2} maxLength={2000} rows={5} style={{display:'block',padding:14,marginTop:8,width:'100%'}}/>
  </label>
  <button type="submit" disabled={busy} style={{background:'#a78bfa',color:'#151b2f',padding:14,borderRadius:10,fontWeight:700}}>{busy?'Submitting…':'Submit feedback'}</button>
  <p role="status" aria-live="polite">{message}</p>
  {certificate&&<a href={'/verify/certificate/'+certificate} style={{color:'#b9a5ff',fontWeight:700}}>Open and download my certificate ↗</a>}
  {alreadySubmitted&&!certificate&&<button type="button" disabled={busy} onClick={async()=>{
    setBusy(true);setMessage('');
    try{
      const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if(!url||!key)throw Error('Service unavailable');
      const client=createBrowserClient(url,key);
      const {data,error}=await client.rpc('claim_certificate_after_feedback',{p_ticket:token});
      if(error||!data)throw Error('Could not retrieve certificate');
      setCertificate(String(data));setMessage('Certificate found.');
    }catch{setMessage('Could not retrieve certificate. Try again later.');}
    finally{setBusy(false);}
  }} style={{padding:12,borderRadius:10}}>Claim existing certificate</button>}
 </form>;
}
