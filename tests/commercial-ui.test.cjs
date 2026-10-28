const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ts=require('typescript');
const React=require('react');
const {renderToStaticMarkup}=require('react-dom/server');
function load(path,deps={}){
 const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText,{exports,Date,require:name=>deps[name]??require(name)});return exports;
}
const commands=load('lib/commercial/commands.ts');
const forms=load('app/super-admin/billing/command-form.tsx',{'react':{...React,useActionState:()=>[{ok:false,message:''},undefined,false]},'../../../lib/commercial/commands':commands,'./command-action':{saveCommercialCommand:()=>{}}});
const records=load('app/super-admin/billing/records.tsx');
test('every commercial form renders labelled fields, reason and explicit confirmation',()=>{
 for(const [command,spec] of Object.entries(commands.commercialCommands)){
  const html=renderToStaticMarkup(React.createElement(forms.CommercialForm,{command}));
  for(const field of spec.fields)assert.ok(html.includes(`name="${field.name}"`),`${command}:${field.name}`);
  assert.match(html,/name="reason"/);assert.match(html,/type="checkbox".*name="confirmed"/);assert.ok(html.includes(spec.label));
 }
});
for(const route of ['plans','contracts','subscriptions','usage']){
 test(`${route} page denies non-owner before reading commercial data`,async()=>{
  const page=load(`app/super-admin/billing/${route}/page.tsx`,{'../../../../lib/auth/platform-owner':{getVerifiedPlatformOwner:async()=>null},'../command-form':forms,'../records':records});
  assert.equal(await page.default(),null);
 });
 test(`${route} page shows database failure without mutation forms or fabricated counts`,async()=>{
  const client={from:()=>{const query={select:()=>query,order:()=>query,eq:()=>query,limit:async()=>({data:null,error:{code:'missing'}})};return query;}};
  const page=load(`app/super-admin/billing/${route}/page.tsx`,{'../../../../lib/auth/platform-owner':{getVerifiedPlatformOwner:async()=>({client})},'../command-form':forms,'../records':records});
  const html=renderToStaticMarkup(await page.default());assert.match(html,/role="alert"/);assert.ok(!html.includes('<form'));
 });
}
