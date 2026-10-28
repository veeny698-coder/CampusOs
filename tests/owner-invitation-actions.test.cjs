const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ts=require('typescript');
const ownerActions=ts.transpileModule(fs.readFileSync('app/super-admin/institutions/actions.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
const acceptActions=ts.transpileModule(fs.readFileSync('app/owner-invitations/accept/actions.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
const institution='10000000-0000-0000-0000-000000000001';
const invitation='10000000-0000-0000-0000-000000000002';
const token='a'.repeat(64);
function ownerFixture(owner=true){
 const calls=[];const paths=[];const exports={};
 vm.runInNewContext(ownerActions,{exports,FormData,Date,require(name){
  if(name==='next/cache')return {revalidatePath:path=>paths.push(path)};
  if(name.includes('platform-owner'))return {getVerifiedPlatformOwner:async()=>owner?{client:{rpc:async(name,args)=>{calls.push({name,args});return {data:[{invitation_id:invitation,token}],error:null};}}}:null};
  throw Error(name);
 }});return {actions:exports,calls,paths};
}
function form(values){const f=new FormData();for(const [key,value] of Object.entries(values))f.set(key,value);return f;}
test('owner invitation link action validates input and never calls RPC before owner authorization',async()=>{
 const f=ownerFixture();
 assert.equal((await f.actions.createOwnerInvitation({},form({institution,email:'bad',expires_at:'',reason:''}))).ok,false);assert.equal(f.calls.length,0);
 assert.equal((await f.actions.createOwnerInvitation({},form({institution,email:'invitee@example.test',expires_at:'not-a-date',reason:'Authorized invite'}))).ok,false);assert.equal(f.calls.length,0);
 const denied=ownerFixture(false);
 assert.equal((await denied.actions.createOwnerInvitation({},form({institution,email:'invitee@example.test',expires_at:'2099-01-01T00:00',reason:'Authorized invite'}))).ok,false);assert.equal(denied.calls.length,0);
});
test('owner invitation link action sends only allowlisted parameters and returns a relative one-time URL',async()=>{
 const f=ownerFixture();const result=await f.actions.createOwnerInvitation({},form({institution,email:'INVITEE@example.test',expires_at:'2099-01-01T00:00',reason:'Authorized invite'}));
 assert.equal(result.ok,true);assert.equal(result.invitationLink,`/owner-invitations/accept?token=${token}`);assert.equal(f.calls[0].name,'create_owner_invitation_link');assert.equal(f.calls[0].args.p_email,'invitee@example.test');assert.ok(f.paths.includes(`/super-admin/institutions/${institution}`));
});
test('owner revocation action validates scope and does not trust an unauthenticated request',async()=>{
 const f=ownerFixture();assert.equal((await f.actions.revokeOwnerInvitation({},form({invitation,institution,reason:'Stop access'}))).ok,true);assert.equal(f.calls[0].name,'revoke_owner_invitation_link');
 const denied=ownerFixture(false);assert.equal((await denied.actions.revokeOwnerInvitation({},form({invitation,institution,reason:'Stop access'}))).ok,false);assert.equal(denied.calls.length,0);
});
function acceptFixture({user={id:'invitee'},result={ok:true},error=null}={}){
 const calls=[];const paths=[];const exports={};const client={auth:{getUser:async()=>({data:{user},error:null})},rpc:async(name,args)=>{calls.push({name,args});return {data:result,error};}};
 vm.runInNewContext(acceptActions,{exports,FormData,require(name){if(name==='next/cache')return {revalidatePath:path=>paths.push(path)};if(name.includes('supabase/server'))return {createSupabaseServerClient:async()=>client};throw Error(name);}});
 return {run:exports.acceptOwnerInvitation,calls,paths};
}
test('acceptance action needs signed-in user and maps all database denials to a generic result',async()=>{
 const anonymous=acceptFixture({user:null});assert.equal((await anonymous.run({},form({token}))).ok,false);assert.equal(anonymous.calls.length,0);
 const denied=acceptFixture({result:{ok:false}});assert.equal((await denied.run({},form({token}))).ok,false);assert.equal(denied.calls[0].name,'accept_owner_invitation');
 const accepted=acceptFixture();assert.equal((await accepted.run({},form({token}))).ok,true);assert.equal(accepted.calls[0].args.p_token,token);assert.deepEqual(accepted.paths,['/portals']);
});
