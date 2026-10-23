'use client';
import {useState} from 'react';
import {createClient} from '@supabase/supabase-js';
export default function CoordinatorLookup({eventId}:{eventId:string}){
 const [name,setName]=useState(''),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[code,setCode]=useState('');
 async function find(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();setBusy(true);setMessage('');setCode('');
  try{const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
   if(!url||!key)throw Error('Lookup service unavailable');
   const client=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
   const {data,error}=await client.rpc('lookup_coordinator_certificate',{p_event:eventId,p_name:name.trim()});
   if(error)throw Error('Unable to search coordinators');
   if(!data){setMessage('No certificate found. Check your coordinator name.');return;}
   setCode(String(data));setMessage('Coordinator certificate found.');
  }catch(e){setMessage(e instanceof Error?e.message:'Lookup unavailable');}finally{setBusy(false);}
 }
 return <form onSubmit={find} style={{display:'grid',gap:16}}>
 <label>Coordinator full name<input required minLength={2} maxLength={120} autoComplete="name" value={name} onChange={e=>setName(e.target.value)} style={{display:'block',padding:13,width:'100%',marginTop:9}}/></label>
 <button disabled={busy} style={{padding:13,borderRadius:9,background:'#a78bfa',color:'#151b2f',fontWeight:700}}>{busy?'Searching…':'Find my certificate'}</button>
 <p role="status">{message}</p>
 {code&&<a href={'/verify/coordinator/'+code} style={{color:'#b9a5ff'}}>View verified coordinator certificate ↗</a>}
 </form>;
}
