'use client';
import {useActionState} from 'react';
import {createOrganization} from './actions';
export default function CreateOrganization({institutions}:{institutions:{id:string;name:string}[]}){
 const [state,action,pending]=useActionState(createOrganization,{ok:false,message:''});
 return <form action={action} style={{display:'grid',gap:12,padding:24,border:'1px solid #34365b',borderRadius:16,marginTop:24}}>
  <h2>Create organization</h2>
  <label>Institution<select name="institution" required style={{display:'block',width:'100%',padding:12,marginTop:8}}>{institutions.map(i=><option key={i.id} value={i.id}>{i.name}</option>)}</select></label>
  <label>Type<select name="kind" required style={{display:'block',width:'100%',padding:12,marginTop:8}}><option value="department">Department</option><option value="society">Society</option><option value="club">Club</option><option value="committee">Committee</option></select></label>
  <label>Name<input name="name" required minLength={2} maxLength={120} placeholder="e.g. Computer Science Society" style={{display:'block',width:'100%',padding:12,marginTop:8}}/></label>
  <label><input type="checkbox" name="confirmed" value="yes" required/> Confirm creation in the selected institution</label>
  <button disabled={pending||!institutions.length} style={{background:'#a78bfa',padding:13,borderRadius:10,color:'#151b2f',fontWeight:700}}>{pending?'Creating…':'Create organization'}</button>
  <p role="status">{state.message}</p>
 </form>;
}
