'use server';
import {revalidatePath} from 'next/cache';
import {getVerifiedPlatformOwner} from '../../../../lib/auth/platform-owner';
export type AssignmentState={ok:boolean;message:string};
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export async function changePortalAssignment(_previous:AssignmentState,form:FormData):Promise<AssignmentState>{
 const portal=String(form.get('portal')||'');
 const institution=String(form.get('institution')||'');
 const user=String(form.get('user')||'');
 const event=String(form.get('event')||'');
 const organization=String(form.get('organization')||'');
 const enabled=String(form.get('mode'))==='assign';
 if(!uuid.test(institution)||!uuid.test(user)|| (event&&!uuid.test(event))||(organization&&!uuid.test(organization))||!portal)
  return {ok:false,message:'Choose valid portal, institution and user.'};
 if(event&&organization)return {ok:false,message:'Use event OR organization scope, not both.'};
 try{
  const owner=await getVerifiedPlatformOwner();
  if(!owner)return {ok:false,message:'Platform owner access required.'};
  const {error}=await owner.client.rpc('manage_portal_assignment',{
   p_key:portal,p_institution:institution,p_user:user,p_enabled:enabled,
   p_event:event||null,p_organization:organization||null
  });
  if(error)return {ok:false,message:'Could not change portal assignment. Check institution and user.'};
  revalidatePath('/admin/dashboard/portals');
  return {ok:true,message:enabled?'Portal access assigned.':'Portal access removed.'};
 }catch{return {ok:false,message:'Portal settings unavailable.'};}
}
