const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const ts=require('typescript');const vm=require('node:vm');
const React=require('react');const {renderToStaticMarkup}=require('react-dom/server');
function load(path,deps){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText,{exports,require:name=>Object.hasOwn(deps,name)?deps[name]:require(name)});return exports;}
function accessFixture({user={id:'fixture'},authError=null,owner=false,permissionError=null,caps=['audit.read'],rpcError=null}={}){
 const client={auth:{getUser:async()=>({data:{user},error:authError})},from:()=>({select:()=>({eq:()=>({maybeSingle:async()=>({data:owner?{user_id:'fixture'}:null,error:permissionError})})})}),rpc:async()=>({data:caps,error:rpcError})};
 return load('lib/auth/platform-access.ts',{'../supabase/server':{createSupabaseServerClient:async()=>client}}).getVerifiedPlatformAccess;
}
test('platform entry denies anonymous, auth failure, database failure and unsupported grants',async()=>{
 for(const options of [{user:null},{authError:{}},{permissionError:{}},{caps:[]},{caps:['owner']},{rpcError:{}}])assert.equal(await accessFixture(options)(),null);
});
test('platform entry distinguishes owner from limited operator',async()=>{
 assert.equal((await accessFixture({owner:true})()).isOwner,true);
 const result=await accessFixture()();assert.equal(result.isOwner,false);assert.equal(result.capabilities.join(','),'audit.read');
});
test('operator shell renders audit navigation without privileged links or owner label',()=>{
 const {SuperAdminShell}=load('app/super-admin/super-admin-shell.tsx',{'./super-admin.css':{},'./readability.css':{},'next/navigation':{usePathname:()=>'/super-admin/audit'},'../admin/dashboard/sign-out':{signOut:undefined}});
 const html=renderToStaticMarkup(React.createElement(SuperAdminShell,{email:'operator@example.invalid',isOwner:false},'Audit content'));
 assert.ok(html.includes('href="/super-admin/audit"'));assert.ok(html.includes('Audit operator'));assert.ok(!html.includes('href="/super-admin/team"'));assert.ok(!html.includes('href="/super-admin/billing'));assert.ok(!html.includes('Platform owner'));
});
