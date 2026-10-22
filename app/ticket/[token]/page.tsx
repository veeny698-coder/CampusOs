import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';
export default async function TicketRedirect({params}:{params:Promise<{token:string}>}){
 const {token}=await params;
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token))notFound();
 redirect('/admin/dashboard/check-in?token='+encodeURIComponent(token));
}
