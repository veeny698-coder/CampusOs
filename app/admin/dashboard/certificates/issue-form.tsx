'use client';
import { useActionState } from 'react';
import { issueCertificate } from './actions';
export default function IssueForm({registrations}:{registrations:{id:string;full_name:string;email:string;event_title:string}[]}){
 const [state,action,busy]=useActionState(issueCertificate,{ok:false,message:''});
 return <form action={action} style={{display:'grid',gap:13,maxWidth:580,padding:24,background:'#151b2f',border:'1px solid #34365b',borderRadius:18}}>
  <h2>Issue certificate</h2>
  <label htmlFor="registration">Registered participant</label>
  <select name="registration_id" id="registration" required style={{padding:13,background:'#0d1424',color:'white',border:'1px solid #53617a',borderRadius:10}}>
   <option value="">Select participant</option>{registrations.map(r=><option key={r.id} value={r.id}>{r.full_name} — {r.event_title} ({r.email})</option>)}
  </select>
  <label htmlFor="certificate_type">Certificate type</label>
  <select name="certificate_type" id="certificate_type" style={{padding:13,background:'#0d1424',color:'white',border:'1px solid #53617a',borderRadius:10}}>
   <option value="participation">Certificate of Participation</option><option value="appreciation">Certificate of Appreciation</option>
  </select>
  <button disabled={busy||registrations.length===0} style={{padding:14,background:'#a78bfa',borderRadius:10,color:'#101021',fontWeight:700}}>{busy?'Issuing…':'Issue verified certificate'}</button>
  <p role="status" style={{color:state.ok?'#86efac':'#fca5a5'}}>{state.message}</p>
  {state.ok&&state.code&&<a style={{color:'#b9a5ff'}} href={'/verify/certificate/'+state.code} target="_blank" rel="noreferrer">Open verified certificate ↗</a>}
 </form>;
}
