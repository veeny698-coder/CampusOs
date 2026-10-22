'use server';
import { revalidatePath } from 'next/cache';
import { getVerifiedPlatformOwner } from '../../../../lib/auth/platform-owner';
export type CreateInstitutionState={ok:boolean;message:string};
export async function createInstitution(_previous:CreateInstitutionState,formData:FormData):Promise<CreateInstitutionState>{
 const name=String(formData.get('name')??'').trim();
 const slug=String(formData.get('slug')??'').trim().toLowerCase();
 const confirmed=formData.get('confirmed')==='yes';
 if(!confirmed)return {ok:false,message:'Confirm creation before submitting.'};
 if(name.length<2||name.length>200||!/^[a-z0-9][a-z0-9-]{2,62}$/.test(slug))return {ok:false,message:'Check institution name and slug format.'};
 try{
  const access=await getVerifiedPlatformOwner();
  if(!access)return {ok:false,message:'Not authorized. Sign in with a provisioned Platform Owner account.'};
  const {error}=await access.client.rpc('create_institution',{p_name:name,p_slug:slug});
  if(error)return {ok:false,message:error.code==='23505'?'That slug is already taken.':'Unable to create institution. Check permissions and try again.'};
  revalidatePath('/admin/dashboard/institutions');
  return {ok:true,message:'Institution created and audit event recorded.'};
 }catch{return {ok:false,message:'Backend unavailable. Please try again later.'};}
}
