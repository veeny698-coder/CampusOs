import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import EventRegistration from './event-registration';

export const dynamic = 'force-dynamic';
export default async function PublicEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) notFound();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return <main style={{padding:40}}>Event service is temporarily unavailable.</main>;
  const client = createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
  const { data: event, error } = await client.from('events').select('id,title,status,created_at').eq('id',id).eq('status','published').maybeSingle();
  if (error) return <main style={{padding:40}}>Event service is temporarily unavailable.</main>;
  if (!event) notFound();
  return <main style={{minHeight:'100vh',display:'grid',placeItems:'center',padding:24,background:'#0d1424',color:'#fff'}}>
    <article style={{width:'100%',maxWidth:680,padding:40,background:'#151b2f',border:'1px solid #34365b',borderRadius:24}}>
      <Link href="/" style={{color:'#b9a5ff'}}>campusOS. ✦</Link>
      <p style={{color:'#b9a5ff',marginTop:36}}>PUBLIC EVENT</p>
      <h1 style={{fontSize:'clamp(2rem,6vw,3.6rem)',lineHeight:1.12}}>{event.title}</h1>
      <p style={{color:'#aab6d0'}}>Published event · CampusOS</p>
      <div style={{marginTop:32,padding:18,border:'1px solid #53617a',borderRadius:12}}>
        Register below to receive your unique QR ticket.
      </div>
      <EventRegistration eventId={event.id} eventTitle={event.title}/>
      <div style={{display:'flex',gap:18,flexWrap:'wrap',marginTop:24}}><Link href="/certificates/lookup" style={{color:'#b9a5ff'}}>Find participant certificate ↗</Link><Link href={'/events/'+event.id+'/coordinators'} style={{color:'#b9a5ff'}}>Coordinator certificates ↗</Link></div>
    </article>
  </main>;
}
