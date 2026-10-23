'use server';
import {revalidatePath} from 'next/cache';
import {getVerifiedPlatformOwner} from '../../../../lib/auth/platform-owner';
export async function addCoordinator(_state:{message:string;code?:string},form:FormData){
 const event=String(form.get('event_id')||'');
 const name=String(form.get('full_name')||'').trim();
 if(!/^[a-f0-9-]{36}$/i.test(event)||name.length<2||name.length>120)return {message:'Select an event and enter a valid name.'};
 try{
  const access=await getVerifiedPlatformOwner();
  if(!access)return {message:'Super Admin access required.'};
  const {data,error}=await access.client.rpc('add_certificate_coordinator',{p_event:event,p_name:name,p_fields:Object.fromEntries(['role','department','designation'].map(key=>[key,String(form.get(key)||'').trim().slice(0,120)]).filter(([,value])=>Boolean(value)))});
  if(error)return {message:'Unable to add coordinator. Please check event permissions.'};
  revalidatePath('/admin/dashboard/certificates');
  return {message:'Coordinator certificate ready.',code:String(data)};
 }catch{return {message:'Certificate service unavailable.'};}
}
