'use client';
import { useActionState } from 'react';
import { createEventDraft, type CreateEventState } from './actions';
const initial: CreateEventState = {ok:false,message:''};
export default function CreateEventForm({institutions}:{institutions:{id:string;name:string}[]}) {
 const [state,action,pending]=useActionState(createEventDraft,initial);
 return <section className="console-section" style={{marginTop:32}}><h2>Create a draft event</h2><p className="muted">Prepare an event before publishing or registration.</p>
 <form action={action} style={{display:'grid',gap:14,maxWidth:580,marginTop:18}}>
 <label htmlFor="event-title">Event title</label><input id="event-title" name="title" required minLength={3} maxLength={180} placeholder="Annual Tech Fest" style={{padding:14,borderRadius:10}} />
 <label htmlFor="event-institution">Institution</label><select id="event-institution" name="institution_id" required defaultValue="" style={{padding:14,borderRadius:10}}><option value="" disabled>Select institution</option>{institutions.map(i=><option key={i.id} value={i.id}>{i.name}</option>)}</select>
 <label style={{display:'flex',gap:10,alignItems:'center'}}><input type="checkbox" name="confirmed" value="yes" required /> Create as draft (not published)</label>
 <button disabled={pending||institutions.length===0} type="submit" style={{padding:14,borderRadius:12,background:'#a78bfa',fontWeight:700}}>{pending?'Creating…':'Create draft event'}</button>
 {institutions.length===0&&<p className="muted">Create an institution first.</p>}
 {state.message&&<p role="status">{state.message}</p>}
 </form></section>;
}
