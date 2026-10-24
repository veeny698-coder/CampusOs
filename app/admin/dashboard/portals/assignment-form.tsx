'use client';
import {useActionState,useMemo,useState} from 'react';
import {changePortalAssignment} from './actions';
type Institution={id:string;name:string};
type Event={id:string;title:string;institution_id:string};
type Organization={id:string;name:string;institution_id:string};
type User={user_id:string;institution_id:string};
type Portal={key:string;label:string;description:string};
export default function AssignmentForm({institutions,events,organizations,users,portals}:{institutions:Institution[];events:Event[];organizations:Organization[];users:User[];portals:Portal[]}){
 const [state,submit,busy]=useActionState(changePortalAssignment,{ok:false,message:''});
 const [institution,setInstitution]=useState(institutions[0]?.id||'');
 const [scope,setScope]=useState('institution');
 const filteredEvents=useMemo(()=>events.filter(e=>e.institution_id===institution),[events,institution]);
 const filteredOrganizations=useMemo(()=>organizations.filter(e=>e.institution_id===institution),[organizations,institution]);
 const filteredUsers=useMemo(()=>users.filter(u=>u.institution_id===institution),[users,institution]);
 const [user,setUser]=useState('');
 return <form action={submit} style={{display:'grid',gap:16,border:'1px solid #34365b',borderRadius:18,padding:24,maxWidth:720}}>
  <h2>Assign or remove portal access</h2>
  <label>Institution<select name="institution" value={institution} onChange={e=>{setInstitution(e.target.value);setUser('');}} required style={{display:'block',padding:12,width:'100%'}}>{institutions.map(i=><option value={i.id} key={i.id}>{i.name}</option>)}</select></label>
  <label>Portal<select name="portal" required style={{display:'block',padding:12,width:'100%'}}>{portals.map(p=><option value={p.key} key={p.key}>{p.label}</option>)}</select></label>
  <label>Member<select name="user" required value={user} onChange={e=>setUser(e.target.value)} style={{display:'block',padding:12,width:'100%'}}><option value="">Select institution member</option>{filteredUsers.map(u=><option key={u.user_id} value={u.user_id}>{u.user_id}</option>)}</select></label>
  <label>Scope<select value={scope} onChange={e=>setScope(e.target.value)} style={{display:'block',padding:12,width:'100%'}}><option value="institution">Whole institution</option><option value="organization">One society / organization</option><option value="event">One event</option></select></label>
  {scope==='event'&&<label>Event<select name="event" required style={{display:'block',padding:12,width:'100%'}}><option value="">Select event</option>{filteredEvents.map(e=><option key={e.id} value={e.id}>{e.title}</option>)}</select></label>}
  {scope==='organization'&&<label>Organization<select name="organization" required style={{display:'block',padding:12,width:'100%'}}><option value="">Select organization</option>{filteredOrganizations.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}</select></label>}
  <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
   <button name="mode" value="assign" disabled={busy||!user} style={{padding:13,background:'#a78bfa',color:'#151b2f',borderRadius:9,fontWeight:700}}>Assign portal</button>
   <button name="mode" value="remove" disabled={busy||!user} style={{padding:13,border:'1px solid #a78bfa',borderRadius:9}}>Remove portal</button>
  </div>
  <p role="status">{state.message}</p>
 </form>;
}
