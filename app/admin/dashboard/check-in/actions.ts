'use server';
import { createSupabaseServerClient } from '../../../../lib/supabase/server';
export type CheckinState={message:string;ok:boolean};
export async function checkin(_prev:CheckinState,form:FormData):Promise<CheckinState>{
 const token=String(form.get('token')??'').trim();
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token))return {ok:false,message:'Invalid QR ticket token.'};
 try{
  const client=await createSupabaseServerClient();
  const {data:{user}}=await client.auth.getUser();
  if(!user)return {ok:false,message:'Sign in to scan tickets.'};
  const {data,error}=await client.rpc('check_in_event_ticket',{p_ticket_token:token});
  if(error)return {ok:false,message:error.code==='42501'?'QR Scanner is not assigned to you for this event.':'Unable to check in ticket.'};
  const messages:Record<string,string>={checked_in:'Check-in successful!',already_checked_in:'This ticket has already been checked in.',invalid:'Ticket not found.',event_not_open:'Event is not currently published.'};
  return {ok:data==='checked_in',message:messages[data as string]??'Unknown ticket status.'};
 }catch{return {ok:false,message:'Check-in service unavailable.'};}
}
