import {createSupabaseServerClient} from './supabase/server';
import {getVerifiedPlatformOwner} from './auth/platform-owner';

export type PortalKey='events'|'qr_scanner'|'certifrenzy';
export type PortalScope={institutionId:string;eventId?:string;organizationId?:string};
export async function getPortalSession(portal:PortalKey,scope?:PortalScope){
 const client=await createSupabaseServerClient();
 const {data:{user},error}=await client.auth.getUser();
 if(error||!user)return null;
 const owner=await getVerifiedPlatformOwner();
 if(owner)return {client,user,isPlatformOwner:true};
 if(!scope)return null;
 const {data:allowed,error:permissionError}=await client.rpc('has_portal_access',{
  p_key:portal,p_institution:scope.institutionId,
  p_event:scope.eventId??null,p_organization:scope.organizationId??null
 });
 if(permissionError||allowed!==true)return null;
 return {client,user,isPlatformOwner:false};
}
