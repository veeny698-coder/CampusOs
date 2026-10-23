'use server';
import { revalidatePath } from 'next/cache';
import { getVerifiedPlatformOwner } from '../../../../lib/auth/platform-owner';

export type IssueState={ok:boolean;message:string;code?:string};
export async function issueCertificate(_prev:IssueState,form:FormData):Promise<IssueState>{
 const id=String(form.get('registration_id')??'');
 const type=String(form.get('certificate_type')??'participation');
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))return {ok:false,message:'Select a valid registration.'};
 if(type!=='participation'&&type!=='appreciation')return {ok:false,message:'Invalid certificate type.'};
 try{
  const access=await getVerifiedPlatformOwner();
  if(!access)return {ok:false,message:'Super Admin session required.'};
  const {data,error}=await access.client.rpc('issue_event_certificate',{p_registration_id:id,p_type:type});
  if(error)return {ok:false,message:'Issuance failed. Check registration and permissions.'};
  revalidatePath('/admin/dashboard/certificates');
  return {ok:true,message:'Certificate issued successfully.',code:data};
 }catch{return {ok:false,message:'Certificate service unavailable.'};}
}
