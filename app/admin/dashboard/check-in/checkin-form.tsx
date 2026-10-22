'use client';
import { useActionState } from 'react';
import { checkin } from './actions';
export default function CheckinForm({initialToken}:{initialToken:string}){
 const [state,action,pending]=useActionState(checkin,{ok:false,message:''});
 return <form action={action} style={{display:'grid',gap:16,maxWidth:540}}>
 <label htmlFor="token">QR ticket token</label>
 <input id="token" name="token" defaultValue={initialToken} required placeholder="Paste ticket UUID" style={{padding:14,border:'1px solid #53617a',borderRadius:10,background:'#151b2f',color:'white'}}/>
 <button disabled={pending} style={{padding:14,background:'#a78bfa',color:'#101021',borderRadius:10,fontWeight:700}}>{pending?'Checking…':'Check in participant'}</button>
 <p role="status" style={{color:state.ok?'#86efac':'#fca5a5'}}>{state.message}</p>
 </form>;
}
