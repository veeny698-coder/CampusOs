'use server';
import {revalidatePath} from 'next/cache';
import {getVerifiedPlatformOwner} from '../../../lib/auth/platform-owner';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export async function savePlatformAccess(_: {ok:boolean;message:string},form:FormData){
 const mode=String(form.get('mode')??'');const reason=String(form.get('reason')??'').trim();
 if(form.get('confirmed')!=='yes'||reason.length<3||reason.length>500)return {ok:false,message:'Confirm the change and provide a reason of 3–500 characters.'};
 let rpc:string;let args:Record<string,string>={p_reason:reason};
 if(mode==='role'){
  const key=String(form.get('key')??'').trim(),label=String(form.get('label')??'').trim();
  if(!/^[a-z][a-z0-9_]{2,79}$/.test(key)||label.length<2||label.length>120)return {ok:false,message:'Enter a valid role key and label.'};
  rpc='publish_platform_audit_role';args={...args,p_key:key,p_label:label};
 }else if(mode==='request'){
  const user=String(form.get('user')??''),version=String(form.get('version')??''),expiry=String(form.get('expiry')??'');
  const stamp=Date.parse(`${expiry}Z`);
  if(!uuid.test(user)||!uuid.test(version)||!Number.isFinite(stamp)||stamp<=Date.now())return {ok:false,message:'Choose an existing account, role and future UTC expiry.'};
  rpc='request_platform_audit_access';args={...args,p_user:user,p_role_version:version,p_expires_at:new Date(stamp).toISOString()};
 }else if(mode==='decision'){
  const request=String(form.get('request')??''),decision=String(form.get('decision')??'');
  if(!uuid.test(request)||!['approve','reject','revoke'].includes(decision))return {ok:false,message:'Choose a request and a valid decision.'};
  rpc='decide_platform_audit_access';args={...args,p_request:request,p_decision:decision};
 }else return {ok:false,message:'Unknown operation.'};
 const access=await getVerifiedPlatformOwner();if(!access)return {ok:false,message:'Platform-owner authorization is required.'};
 const {error}=await access.client.rpc(rpc,args);
 if(error)return {ok:false,message:'Change rejected. Check role, expiry and independent-owner approval. The platform-access migration must be installed.'};
 for(const path of ['/super-admin/team','/super-admin/access/roles','/super-admin/audit'])revalidatePath(path);
 return {ok:true,message:mode==='request'?'Request recorded. A different platform owner must approve before access is granted.':'Change saved and audited.'};
}
