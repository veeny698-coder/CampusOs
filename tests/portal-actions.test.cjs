const {test}=require('node:test');
const assert=require('node:assert/strict');
const ts=require('typescript');
const fs=require('node:fs');
const vm=require('node:vm');
const compiled=ts.transpileModule(fs.readFileSync('app/super-admin/access/portals/actions.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
const tenant='10000000-0000-0000-0000-000000000001';
const user='20000000-0000-0000-0000-000000000001';
function fixture({owner=true,ready=true}={}){
  const calls=[]; const refreshed=[];
  const client={rpc:async(name,args)=>{calls.push({name,args});return {data:name==='portal_management_ready'?ready:'saved',error:null};},from:()=>({select:()=>({eq:()=>({maybeSingle:async()=>({data:{institution_id:tenant,user_id:user,portal_key:'qr_scanner',event_id:null,organization_id:null}})})})})};
  const exports={};
  vm.runInNewContext(compiled,{exports,Date,require(name){
    if(name==='next/cache')return {revalidatePath:path=>refreshed.push(path)};
    if(name.includes('platform-owner'))return {getVerifiedPlatformOwner:async()=>owner?{client}:null};
    throw Error(name);
  }});
  return {run:exports.savePortalAccess,calls,refreshed};
}
function form(values={}){const result=new FormData();for(const [key,value] of Object.entries({confirmed:'yes',reason:'Reviewed request',mode:'grant',institution:tenant,user,portal:'qr_scanner',...values}))result.set(key,value);return result;}
test('portal action rejects missing confirmation without a database call',async()=>{
  const f=fixture();assert.equal((await f.run({},form({confirmed:''}))).ok,false);assert.equal(f.calls.length,0);
});
test('portal action denies non-owner and unapplied migration',async()=>{
  for(const options of [{owner:false},{ready:false}]){const f=fixture(options);assert.equal((await f.run({},form())).ok,false);assert.ok(!f.calls.some(call=>call.name==='set_portal_assignment'));}
});
test('portal action validates scopes and expiry before mutation',async()=>{
  for(const values of [{event:tenant,organization:tenant},{expires_at:'invalid'},{expires_at:'2000-01-01'},{institution:'invalid'}]){const f=fixture();assert.equal((await f.run({},form(values))).ok,false);assert.ok(!f.calls.some(call=>call.name==='set_portal_assignment'));}
});
test('confirmed valid grant calls server RPC and refreshes affected pages',async()=>{
  const f=fixture();assert.equal((await f.run({},form())).ok,true);assert.equal(f.calls[1].args.p_user,user);assert.equal(f.calls[1].args.p_enabled,true);assert.equal(f.refreshed.length,3);
});
test('revoke resolves stored scope instead of trusting submitted tenant/user',async()=>{
  const f=fixture();assert.equal((await f.run({},form({mode:'revoke',assignment:tenant,institution:'forged',user:'forged',event:'forged'}))).ok,true);
  assert.equal(f.calls[1].args.p_institution,tenant);assert.equal(f.calls[1].args.p_user,user);assert.equal(f.calls[1].args.p_event,null);assert.equal(f.calls[1].args.p_enabled,false);
});
