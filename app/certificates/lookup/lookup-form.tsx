'use client';
import {useState} from 'react';
import {createClient} from '@supabase/supabase-js';
export default function CertificateLookup({events}:{events:{id:string;title:string}[]}){
 const [event,setEvent]=useState(events[0]?.id||''),[name,setName]=useState(''),[email,setEmail]=useState('');
 const [busy,setBusy]=useState(false),[message,setMessage]=useState(''),[code,setCode]=useState('');
 async function lookup(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();setBusy(true);setMessage('');setCode('');
  try{
   const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
   if(!url||!key)throw Error('Lookup unavailable');
   const client=createClient(url,key,{auth:{autoRefreshToken:false,persistSession:false}});
   const {data,error}=await client.rpc('lookup_participant_certificate',{p_event:event,p_name:name,p_email:email});
   if(error)throw Error('Certificate lookup failed. Please retry.');
   if(!data){setMessage('No certificate found. Submit your event feedback and check your name/email.');return;}
   setCode(String(data));setMessage('Certificate found.');
  }catch(err){setMessage(err instanceof Error?err.message:'Unable to look up certificate');}
  finally{setBusy(false);}
 }
 return <form onSubmit={lookup} style={{display:'grid',gap:14}}>
  <label>Event<select required value={event} onChange={e=>setEvent(e.target.value)} style={{display:'block',width:'100%',marginTop:8,padding:12}}>{events.map(e=><option value={e.id} key={e.id}>{e.title}</option>)}</select></label>
  <label>Full name<input required maxLength={120} value={name} onChange={e=>setName(e.target.value)} style={{display:'block',width:'100%',marginTop:8,padding:12}}/></label>
  <label>Registered email<input required type="email" maxLength={254} value={email} onChange={e=>setEmail(e.target.value)} style={{display:'block',width:'100%',marginTop:8,padding:12}}/></label>
  <button disabled={busy||!event} style={{background:'#a78bfa',color:'#151b2f',borderRadius:10,padding:12,fontWeight:700}}>{busy?'Searching…':'Find certificate'}</button>
  <p role="status">{message}</p>
  {code&&<a href={'/verify/certificate/'+code} style={{color:'#b9a5ff',fontWeight:700}}>Open & download certificate ↗</a>}
 </form>;
}
