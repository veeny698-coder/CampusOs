'use client';
import {useActionState} from 'react';
import {addCoordinator} from './coordinator-actions';
export default function CoordinatorForm({events}:{events:{id:string;title:string}[]}){
 const [state,action,busy]=useActionState(addCoordinator,{message:''});
 return <form action={action} style={{display:'grid',gap:12,padding:24,border:'1px solid #34365b',borderRadius:18,marginTop:30}}>
  <h2>Coordinator certificates</h2>
  <p className="muted">Create a separate verified certificate for a coordinator. Participation feedback is not required for coordinators.</p>
  <label>Event<select name="event_id" required style={{display:'block',padding:12,marginTop:8,width:'100%'}}>{events.map(e=><option value={e.id} key={e.id}>{e.title}</option>)}</select></label>
  <label>Coordinator name<input name="full_name" required minLength={2} maxLength={120} style={{display:'block',padding:12,marginTop:8,width:'100%'}}/></label>
  {(['role','department','designation'] as const).map(field=><label key={field}>{field.charAt(0).toUpperCase()+field.slice(1)} (optional)<input name={field} maxLength={120} style={{display:'block',padding:12,marginTop:8,width:'100%'}}/></label>)}
  <button type="submit" disabled={busy||events.length===0} style={{padding:12,borderRadius:10,background:'#a78bfa',color:'#151b2f',fontWeight:700}}>{busy?'Creating…':'Create coordinator certificate'}</button>
  <p role="status">{state.message}</p>
  {state.code&&<a href={'/verify/coordinator/'+state.code} target="_blank" rel="noreferrer">Open coordinator certificate ↗</a>}
 </form>;
}
