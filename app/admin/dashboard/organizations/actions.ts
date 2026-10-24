'use server';
import {revalidatePath} from 'next/cache';
import {getVerifiedPlatformOwner} from '../../../../lib/auth/platform-owner';
export type OrganizationState={ok:boolean;message:string};
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export async function createOrganization(_prev:OrganizationState,form:FormData):Promise<OrganizationState>{
 const institution=String(form.get('institution')||'');
 const kind=String(form.get('kind')||'');
 const name=String(form.get('name')||'').trim();
 if(form.get('confirmed')!=='yes')return {ok:false,message:'Please confirm organization creation.'};
 if(!UUID.test(institution)||!['department','society','club','committee'].includes(kind)||name.length<2||name.length>120)
 return {ok:false,message:'Select an institution, organization type and valid name.'};
 try{
  const access=await getVerifiedPlatformOwner();
  if(!access)return {ok:false,message:'Platform owner authorization required.'};
  const {error}=await access.client.rpc('create_campus_organization',{p_institution:institution,p_kind:kind,p_name:name});
  if(error)return {ok:false,message:error.code==='23505'?'This organization already exists in the college.':'Could not create organization. Check permissions.'};
  revalidatePath('/admin/dashboard/organizations');
  return {ok:true,message:'Organization created and audit event saved.'};
 }catch{return {ok:false,message:'Organization service unavailable.'};}
}
