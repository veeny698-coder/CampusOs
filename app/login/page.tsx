'use client';
import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
export default function Login() {
  const [email,setEmail]=useState('');const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');
  async function submit(e:React.FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);setMessage('');try{
    const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if(!url||!key)throw new Error('Authentication is not configured');
    const client=createBrowserClient(url,key);
    const {error}=await client.auth.signInWithOtp({email,options:{emailRedirectTo:window.location.origin+'/auth/callback'}});
    if(error)throw error;setMessage('Check your email for the sign-in link.');
  }catch(error){const message=error instanceof Error?error.message:'Unknown authentication error';setMessage('Sign-in failed: '+message)}finally{setBusy(false)}}
  return <main style={{minHeight:'100vh',display:'grid',placeItems:'center',padding:20}}><form onSubmit={submit} style={{width:'100%',maxWidth:420,background:'#151b2f',padding:36,border:'1px solid #34365b',borderRadius:24}}><div style={{color:'#b9a5ff'}}>CAMPUSOS / SECURE ACCESS</div><h1>Welcome back.</h1><p style={{color:'#aab6d0'}}>Sign in using your institutional email.</p><label htmlFor="email">Email address</label><input id="email" type="email" required autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} style={{display:'block',width:'100%',padding:14,margin:'12px 0 20px',borderRadius:10,border:'1px solid #53617a',background:'#0d1424',color:'white'}}/><button disabled={busy} style={{padding:14,borderRadius:10,width:'100%',background:'#a78bfa',fontWeight:700}}>{busy?'Sending…':'Send secure sign-in link'}</button><p role="status">{message}</p></form></main>
}
