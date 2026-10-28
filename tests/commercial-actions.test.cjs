const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ts=require('typescript');
function load(path,dependencies={}){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,Date,require:name=>{if(dependencies[name])return dependencies[name];throw Error(name);}});return exports;}
const commands=load('lib/commercial/commands.ts');
const id='10000000-0000-0000-0000-000000000001';
function fixture({owner=true,error=null}={}){
 const calls=[];const paths=[];
 const actions=load('app/super-admin/billing/command-action.ts',{'../../../lib/commercial/commands':commands,'next/cache':{revalidatePath:path=>paths.push(path)},'../../../lib/auth/platform-owner':{getVerifiedPlatformOwner:async()=>owner?{client:{rpc:async(name,args)=>{calls.push({name,args});return {error};}}}:null}});
 return {run:actions.saveCommercialCommand,calls,paths};
}
function make(command,overrides={}){
 const form=new FormData();form.set('command',command);form.set('confirmed','yes');form.set('reason','Reviewed fixture');
 const spec=commands.commercialCommands[command];
 for(const field of spec?.fields??[]){let value=field.type==='uuid'?id:field.type==='key'?'fixture_key':field.type==='date'?'2026-10-01T10:00':field.type==='integer'?'1':field.type==='boolean'?'true':field.type==='choice'?field.choices[0]:'Fixture reference';form.set(field.name,value);}
 for(const [key,value] of Object.entries(overrides))form.set(key,value);return form;
}
test('every commercial command uses its allowlisted RPC and explicit audit reason',async()=>{
 for(const [command,spec] of Object.entries(commands.commercialCommands)){
  const f=fixture();const result=await f.run({},make(command));assert.equal(result.ok,true,command);assert.equal(f.calls[0].name,spec.rpc);assert.equal(f.calls[0].args.p_reason,'Reviewed fixture');assert.equal(f.paths.length,4);
 }
});
test('all commercial mutations reject anonymous and non-owner callers',async()=>{
 for(const command of Object.keys(commands.commercialCommands)){const f=fixture({owner:false});assert.equal((await f.run({},make(command))).ok,false);assert.equal(f.calls.length,0);}
});
test('forged commands, invalid UUIDs, dates, integers and missing confirmation never invoke RPC',async()=>{
 for(const form of [make('__proto__'),make('retire',{confirmed:''}),make('retire',{plan:'bad'}),make('contract',{starts_at:'bad'}),make('usage',{quantity:'-1'}),make('usage',{quantity:'9007199254740992'}),make('usage',{idempotency_key:'short'}),make('plan',{reason:''})]){
  const f=fixture();assert.equal((await f.run({},form)).ok,false);assert.equal(f.calls.length,0);
 }
});
test('database rejection is recoverable and does not invalidate pages as success',async()=>{
 const f=fixture({error:{code:'42501',message:'private database detail'}});const result=await f.run({},make('retire'));
 assert.equal(result.ok,false);assert.ok(!result.message.includes('private database detail'));assert.equal(f.paths.length,0);
});
test('UTC values and explicit unlimited quota are preserved',()=>{
 const date=commands.parseCommercialCommand(make('contract',{starts_at:'2026-10-01T10:30'}));assert.equal(date.args.p_starts_at,'2026-10-01T10:30:00.000Z');
 assert.equal(commands.parseCommercialCommand(make('entitlement',{limit:''})).args.p_limit,null);
});
