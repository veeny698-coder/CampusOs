'use server';
import {revalidatePath} from 'next/cache';
import {getVerifiedPlatformOwner} from '../../../lib/auth/platform-owner';
import {parseCommercialCommand} from '../../../lib/commercial/commands';
export async function saveCommercialCommand(_: {ok:boolean;message:string},form:FormData){
 let parsed:ReturnType<typeof parseCommercialCommand>;
 try{parsed=parseCommercialCommand(form);}catch(error){return {ok:false,message:error instanceof Error?error.message:'Invalid commercial change.'};}
 const access=await getVerifiedPlatformOwner();
 if(!access)return {ok:false,message:'Platform-owner authorization is required.'};
 const {error}=await access.client.rpc(parsed.rpc,parsed.args);
 if(error)return {ok:false,message:error.code==='23505'?'A conflicting record already exists. Review the current records.':'Change rejected. Check the current state, scope, dates and quota. The commercial database update must be installed.'};
 for(const route of ['plans','contracts','subscriptions','usage'])revalidatePath(`/super-admin/billing/${route}`);
 return {ok:true,message:'Change saved and audited.'};
}
