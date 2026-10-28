const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const {PGlite}=require('@electric-sql/pglite');
test('limited platform audit operators in disposable PostgreSQL',async t=>{
 const db=await PGlite.create();t.after(()=>db.close());
 await db.exec(`create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key,email text);
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 grant usage on schema auth,public to anon,authenticated;grant execute on function auth.uid() to anon,authenticated;`);
 for(const file of ['202610220001_foundation.sql','202610220002_platform_owners.sql','202610220004_audited_institution_creation.sql','202610220007_audit_owner_read.sql','20261028123732_platform_operator_audit_access.sql'])await db.exec(fs.readFileSync(`supabase/migrations/${file}`,'utf8').replace('create extension if not exists pgcrypto;',''));
 const owner='10000000-0000-0000-0000-000000000001',reviewer='10000000-0000-0000-0000-000000000002',operator='10000000-0000-0000-0000-000000000003',other='10000000-0000-0000-0000-000000000004';
 await db.exec(`insert into auth.users(id) values('${owner}'),('${reviewer}'),('${operator}'),('${other}');insert into public.platform_owners(user_id) values('${owner}'),('${reviewer}');`);
 async function run(actor,sql,args=[],role='authenticated'){await db.query("select set_config('request.jwt.claim.sub',$1,false)",[actor]);await db.exec(`set role ${role}`);try{return await db.query(sql,args);}finally{await db.exec('reset role');}}
 async function rpc(actor,name,args=[]){return (await run(actor,`select public.${name}(${args.map((_,i)=>`$${i+1}`).join(',')}) as result`,args)).rows[0].result;}
 const future=new Date(Date.now()+86400000).toISOString();let version,request;
 await t.test('owner publishes immutable version without granting ownership',async()=>{
  version=await rpc(owner,'publish_platform_audit_role',['audit_reader','Audit reader','Fixture role']);
  const next=await rpc(owner,'publish_platform_audit_role',['audit_reader','Audit reviewer','Fixture next version']);assert.notEqual(next,version);
  assert.equal((await db.query('select max(version) as v from public.platform_role_versions')).rows[0].v,2);
  await assert.rejects(db.exec("update public.platform_role_versions set label='changed'"),{code:'55000'});
 });
 await t.test('non-owner cannot publish roles or request access',async()=>{
  await assert.rejects(rpc(operator,'publish_platform_audit_role',['audit_reader','Bad role','Fixture escalation']),{code:'42501'});
  await assert.rejects(rpc(operator,'request_platform_audit_access',[other,version,future,'Fixture escalation']),{code:'42501'});
  await assert.rejects(run(operator,"insert into public.platform_role_versions(role_key,label,version,capabilities,created_by) values('fake','Fake',1,ARRAY['owner'],$1)",[operator]),{code:'42501'});
 });
 await t.test('pending request grants no capability and cannot be self-approved',async()=>{
  request=await rpc(owner,'request_platform_audit_access',[operator,version,future,'Fixture request']);
  assert.deepEqual(await rpc(operator,'platform_my_capabilities'),[]);
  await assert.rejects(rpc(owner,'decide_platform_audit_access',[request,'approve','Fixture self approval']),{code:'42501'});
  await assert.rejects(rpc(operator,'decide_platform_audit_access',[request,'approve','Fixture self approval']),{code:'42501'});
  await assert.rejects(run(operator,'select * from public.platform_audit_feed()'),{code:'42501'});
 });
 await t.test('independent owner approval grants audit metadata only',async()=>{
  await rpc(reviewer,'decide_platform_audit_access',[request,'approve','Fixture independent approval']);
  assert.deepEqual(await rpc(operator,'platform_my_capabilities'),['audit.read']);
  const feed=await run(operator,'select * from public.platform_audit_feed()');assert.ok(feed.rows.length>0);
  assert.deepEqual(Object.keys(feed.rows[0]).sort(),['action','created_at','id','resource_id','resource_type']);
  assert.equal((await run(operator,'select * from public.audit_logs')).rows.length,0);
  assert.equal((await run(operator,'select * from public.platform_role_versions')).rows.length,0);
  assert.equal((await run(other,'select * from public.platform_access_requests')).rows.length,0);
  await assert.rejects(rpc(reviewer,'decide_platform_audit_access',[request,'approve','Fixture replay']),{code:'22023'});
 });
 await t.test('revocation immediately removes capabilities and feed access',async()=>{
  await rpc(owner,'decide_platform_audit_access',[request,'revoke','Fixture revocation']);
  assert.deepEqual(await rpc(operator,'platform_my_capabilities'),[]);
  await assert.rejects(run(operator,'select * from public.platform_audit_feed()'),{code:'42501'});
 });
 await t.test('expired grants fail and remain revocable',async()=>{
  const expiring=await rpc(owner,'request_platform_audit_access',[operator,version,future,'Fixture expiry']);
  await rpc(reviewer,'decide_platform_audit_access',[expiring,'approve','Fixture approval']);
  await db.query("update public.platform_access_requests set requested_at=now()-interval '2 days',expires_at=now()-interval '1 day' where id=$1",[expiring]);
  assert.deepEqual(await rpc(operator,'platform_my_capabilities'),[]);
  await rpc(owner,'decide_platform_audit_access',[expiring,'revoke','Fixture expired revocation']);
 });
 await t.test('anonymous access and owner-role mutation are unavailable',async()=>{
  await assert.rejects(run('','select public.platform_my_capabilities()',[],'anon'),{code:'42501'});
  await assert.rejects(rpc(owner,'request_platform_audit_access',[reviewer,version,future,'Fixture owner target']),{code:'22023'});
  await assert.rejects(run(owner,'delete from public.platform_owners'),{code:'42501'});
  assert.equal((await db.query('select count(*)::int as n from public.platform_owners')).rows[0].n,2);
 });
});
