'use server';
import {revalidatePath} from 'next/cache';
import {getVerifiedPlatformOwner} from '../../../../lib/auth/platform-owner';

const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export async function saveTemplate(_previous:{ok:boolean;message:string},form:FormData):Promise<{ok:boolean;message:string}>{
 const event=String(form.get('event_id')||'');
 if(!UUID.test(event))return {ok:false,message:'Select an event first.'};
 const text=(k:string,max:number)=>String(form.get(k)||'').trim().slice(0,max);
 const color=(k:string)=>String(form.get(k)||'');
 const num=(k:string)=>Number(form.get(k));
 if(!['primary_color','background_color','text_color'].every(k=>/^#[0-9a-f]{6}$/i.test(color(k))))return {ok:false,message:'Invalid color.'};
 if(!['classic','modern','minimal'].includes(text('layout',20)))return {ok:false,message:'Invalid layout.'};
 try{
  const access=await getVerifiedPlatformOwner();
  if(!access)return {ok:false,message:'Super Admin session required.'};
  const {error}=await access.client.rpc('save_certificate_template',{
   p_event_id:event,p_title:text('title',90),p_subtitle:text('subtitle',160),p_footer:text('footer',160),
   p_primary:color('primary_color'),p_background:color('background_color'),p_text:color('text_color'),
   p_name_y:num('name_y'),p_qr_x:num('qr_x'),p_qr_y:num('qr_y'),p_layout:text('layout',20)
  });
  if(error)return {ok:false,message:'Template could not be saved. Check field values.'};
  revalidatePath('/admin/dashboard/certificates');
  return {ok:true,message:'Certificate template saved.'};
 }catch{return {ok:false,message:'Unable to contact certificate service.'};}
}
export async function bulkIssue(_previous:{ok:boolean;message:string},form:FormData):Promise<{ok:boolean;message:string}>{
 const event=String(form.get('event_id')||'');
 const type=String(form.get('certificate_type')||'participation');
 if(!UUID.test(event)||!['participation','appreciation'].includes(type))return {ok:false,message:'Select an event and valid certificate type.'};
 try{
  const access=await getVerifiedPlatformOwner();
  if(!access)return {ok:false,message:'Super Admin session required.'};
  const {data,error}=await access.client.rpc('bulk_issue_event_certificates',{p_event_id:event,p_type:type});
  if(error)return {ok:false,message:'Bulk issuance failed. Event may exceed 1,000 registrations.'};
  revalidatePath('/admin/dashboard/certificates');
  return {ok:true,message:`${data} new certificates issued. Previously issued certificates were not duplicated.`};
 }catch{return {ok:false,message:'Unable to contact certificate service.'};}
}
