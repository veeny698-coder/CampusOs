const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const ts=require('typescript');const vm=require('node:vm');
const compiled=ts.transpileModule(fs.readFileSync('app/super-admin/team/actions.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const uuid='10000000-0000-0000-0000-000000000001';
function fixture(owner=true){const calls=[];const paths=[];const exports={};vm.runInNewContext(compiled,{exports,Date,require(name){if(name==='next/cache')return {revalidatePath:path=>paths.push(path)};return {getVerifiedPlatformOwner:async()=>owner?{client:{rpc:async(name,args)=>{calls.push({name,args});return {error:null};}}}:null};}});return {run:exports.savePlatformAccess,calls,paths};}
function form(mode,overrides={}){const result=new FormData();for(const [key,value] of Object.entries({mode,confirmed:'yes',reason:'Fixture review',key:'audit_reader',label:'Audit reader',user:uuid,version:uuid,expiry:'2099-01-01T10:30',request:uuid,decision:'approve',...overrides}))result.set(key,value);return result;}
test('platform access actions require confirmation and owner authorization for every mode',async()=>{
 for(const mode of ['role','request','decision']){for(const denied of [false,true]){const f=fixture(denied);assert.equal((await f.run({},form(mode,denied?{confirmed:''}:{}))).ok,false);assert.equal(f.calls.length,0);}}
});
test('platform access dispatch is allowlisted and validates IDs and expiry',async()=>{
 for(const [mode,values] of [['unknown',{}],['request',{user:'bad'}],['request',{expiry:'2000-01-01'}],['decision',{decision:'owner'}],['role',{key:'invalid key'}]]){const f=fixture();assert.equal((await f.run({},form(mode,values))).ok,false);assert.equal(f.calls.length,0);}
});
test('valid platform access requests reach only reviewed RPCs',async()=>{
 for(const [mode,rpc] of [['role','publish_platform_audit_role'],['request','request_platform_audit_access'],['decision','decide_platform_audit_access']]){const f=fixture();assert.equal((await f.run({},form(mode))).ok,true);assert.equal(f.calls[0].name,rpc);assert.equal(f.paths.length,3);}
});
