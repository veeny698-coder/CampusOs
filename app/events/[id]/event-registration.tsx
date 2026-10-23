'use client';
import { useState } from 'react';
import QRCode from 'qrcode';
import { createClient } from '@supabase/supabase-js';

export default function EventRegistration({ eventId, eventTitle }: { eventId: string; eventTitle: string }) {
  const [name,setName]=useState('');
  const [email,setEmail]=useState('');
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [ticket,setTicket]=useState('');
  const [qr,setQr]=useState('');
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();setBusy(true);setError('');
    try {
      const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!url||!key) throw new Error('Registration is unavailable.');
      const client=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
      const {data,error}=await client.rpc('register_for_event',{p_event_id:eventId,p_full_name:name,p_email:email});
      if(error) throw new Error(error.code==='23505'?'This email is already registered for this event.':error.message);
      if(typeof data!=='string') throw new Error('Unable to create ticket.');
      const value=window.location.origin+'/ticket/'+data;
      setQr(await QRCode.toDataURL(value,{width:280,margin:2,errorCorrectionLevel:'M'}));
      setTicket(data);
    } catch(err){setError(err instanceof Error?err.message:'Registration failed.');}
    finally{setBusy(false);}
  }
  if(ticket) return <section style={{marginTop:30,padding:22,border:'1px solid #53617a',borderRadius:12}}>
    <h2>Registration successful!</h2>
    <p>Save this QR ticket now. It is not emailed automatically.</p>
    {qr&&<img src={qr} width={280} height={280} alt="Unique event ticket QR code" style={{maxWidth:'100%',background:'white'}}/>}
    <p style={{overflowWrap:'anywhere',fontSize:12}}>Ticket ID: {ticket}</p>
    {qr&&<a href={qr} download={'campusos-ticket-'+eventId+'.png'} style={{color:'#b9a5ff'}}>Download QR ticket ↓</a>}
    <p style={{color:'#aab6d0'}}>Show this ticket at event check-in. Do not share it publicly.</p>
    <p><a href={'/feedback/'+ticket} style={{color:'#b9a5ff',fontWeight:700}}>Submit event feedback for your certificate ↗</a></p>
  </section>;
  return <form onSubmit={submit} style={{display:'grid',gap:12,marginTop:30}}>
    <h2>Register for {eventTitle}</h2>
    <label htmlFor="participant-name">Full name</label>
    <input id="participant-name" value={name} onChange={e=>setName(e.target.value)} required minLength={2} maxLength={120} autoComplete="name" style={{padding:12,borderRadius:8,color:'#fff',background:'#0d1424',border:'1px solid #53617a'}}/>
    <label htmlFor="participant-email">Email</label>
    <input id="participant-email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required maxLength={254} autoComplete="email" style={{padding:12,borderRadius:8,color:'#fff',background:'#0d1424',border:'1px solid #53617a'}}/>
    <button disabled={busy} style={{padding:14,background:'#a78bfa',color:'#101021',borderRadius:10,fontWeight:700}}>{busy?'Registering…':'Register & get QR ticket'}</button>
    <p role="alert" style={{color:'#fca5a5'}}>{error}</p>
    <small style={{color:'#aab6d0'}}>Your name and email are used for event registration and attendance.</small>
  </form>;
}
