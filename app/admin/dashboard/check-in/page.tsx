import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getVerifiedPlatformOwner } from '../../../../lib/auth/platform-owner';
import CheckinForm from './checkin-form';
export const dynamic='force-dynamic';
export default async function CheckinPage({searchParams}:{searchParams:Promise<{token?:string}>}){
 const access=await getVerifiedPlatformOwner();
 if(!access)redirect('/login');
 const {token=''}=await searchParams;
 return <main style={{maxWidth:800,margin:'auto',padding:36}}><Link href="/admin/dashboard/events">← Events</Link><h1>Event check-in</h1><p>Open a participant QR ticket or enter its token. Duplicate scans are blocked and logged.</p><CheckinForm initialToken={token}/></main>;
}
