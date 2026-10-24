import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '../../../../lib/supabase/server';
import CheckinForm from './checkin-form';
export const dynamic='force-dynamic';
export default async function CheckinPage({searchParams}:{searchParams:Promise<{token?:string}>}){
 const client=await createSupabaseServerClient();
 const {data:{user}}=await client.auth.getUser();
 if(!user)redirect('/login');
 const [{data:owner},{data:assigned}]=await Promise.all([
  client.from('platform_owners').select('user_id').eq('user_id',user.id).maybeSingle(),
  client.from('portal_assignments').select('id').eq('user_id',user.id).eq('portal_key','qr_scanner').limit(1)
 ]);
 if(!owner&&!assigned?.length)redirect('/portals');
 const {token=''}=await searchParams;
 return <main style={{maxWidth:800,margin:'auto',padding:36}}><Link href="/admin/dashboard/events">← Events</Link><h1>Event check-in</h1><p>Open a participant QR ticket or enter its token. Duplicate scans are blocked and logged.</p><CheckinForm initialToken={token}/></main>;
}
