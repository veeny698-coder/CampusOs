import {createSupabaseServerClient} from '../supabase/server';

/** Every request revalidates identity and database permissions. No metadata roles. */
export async function getVerifiedPlatformAccess(){
 const client=await createSupabaseServerClient();
 const {data:{user},error}=await client.auth.getUser();
 if(error||!user)return null;
 const owner=await client.from('platform_owners').select('user_id').eq('user_id',user.id).maybeSingle();
 if(owner.error)return null;
 if(owner.data)return {client,user,isOwner:true,capabilities:['audit.read']};
 const result=await client.rpc('platform_my_capabilities');
 if(result.error||!Array.isArray(result.data))return null;
 const capabilities=result.data.filter((value:unknown):value is string=>value==='audit.read');
 return capabilities.length?{client,user,isOwner:false,capabilities}:null;
}
