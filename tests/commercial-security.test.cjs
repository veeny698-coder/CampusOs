const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {PGlite}=require('@electric-sql/pglite');

test('commercial foundation in disposable PostgreSQL',async t=>{
 const db=await PGlite.create();t.after(()=>db.close());
 await db.exec(`create role anon;create role authenticated;create schema auth;
 create table auth.users(id uuid primary key,email text);
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 grant usage on schema auth,public to anon,authenticated;grant execute on function auth.uid() to anon,authenticated;`);
 for(const file of ['202610220001_foundation.sql','202610220002_platform_owners.sql','202610220004_audited_institution_creation.sql','202610240001_portal_assignments.sql','202610260001_super_admin_institution_management.sql','202610260005_commercial_foundation.sql']){
  await db.exec(fs.readFileSync(`supabase/migrations/${file}`,'utf8').replace('create extension if not exists pgcrypto;',''));
 }
 const a='10000000-0000-0000-0000-000000000001',b='10000000-0000-0000-0000-000000000002';
 const owner='20000000-0000-0000-0000-000000000001',member='20000000-0000-0000-0000-000000000002';
 await db.exec(`insert into auth.users(id) values('${owner}'),('${member}');insert into public.platform_owners(user_id) values('${owner}');
 insert into public.institutions(id,name,slug) values('${a}','Fixture A','fixture-a'),('${b}','Fixture B','fixture-b');
 insert into public.institution_memberships(institution_id,user_id,role) values('${a}','${member}','member');`);
 async function run(sql,args=[],actor=owner,role='authenticated'){
  await db.query("select set_config('request.jwt.claim.sub',$1,false)",[actor]);await db.exec(`set role ${role}`);
  try{return await db.query(sql,args);}finally{await db.exec('reset role');}
 }
 async function rpc(name,args=[],actor=owner){return (await run(`select public.${name}(${args.map((_,i)=>`$${i+1}`).join(',')}) as result`,args,actor)).rows[0].result;}
 let plan,version,subscription,meter,contract;
 await t.test('tenant and anonymous cannot create commercial records',async()=>{
  await assert.rejects(rpc('create_commercial_plan',['test_plan','Test plan','trial','Fixture creation'],member),{code:'42501'});
  await assert.rejects(run("select public.create_commercial_plan('test_plan','Test plan','trial','Fixture creation')",[],'','anon'),{code:'42501'});
 });
 await t.test('owner creates draft plan and version; empty version cannot publish',async()=>{
  plan=await rpc('create_commercial_plan',['test_plan','Test plan','trial','Fixture creation']);
  version=await rpc('create_commercial_plan_version',[plan,'Fixture terms reference','Fixture version']);
  await assert.rejects(rpc('publish_commercial_version',[version,'Fixture approval']),{code:'22023'});
  await rpc('set_commercial_entitlement',[version,'test_events',true,10,'Fixture approval']);
  await rpc('set_commercial_entitlement',[version,'test_disabled',false,10,'Fixture approval']);
  await rpc('set_commercial_entitlement',[version,'test_unlimited',true,null,'Fixture approval']);
  await rpc('publish_commercial_version',[version,'Fixture approval']);
 });
 await t.test('published plan content and entitlements cannot be changed',async()=>{
  await assert.rejects(rpc('set_commercial_entitlement',[version,'test_events',true,100,'Fixture amendment']),{code:'22023'});
  await assert.rejects(db.query('update public.commercial_plan_versions set terms_reference=$1 where id=$2',['changed',version]),{code:'55000'});
  await assert.rejects(db.query('update public.commercial_plan_entitlements set quota_limit=100 where plan_version_id=$1',[version]),{code:'55000'});
 });
 await t.test('contracts enforce transitions and signed history',async()=>{
  contract=await rpc('create_commercial_contract',[a,'Fixture contract','2026-01-01',null,'Fixture creation']);
  await assert.rejects(rpc('transition_commercial_contract',[contract,'signed','Fixture signing']),{code:'22023'});
  await rpc('transition_commercial_contract',[contract,'negotiating','Fixture negotiation']);
  await rpc('transition_commercial_contract',[contract,'signed','Fixture signing']);
  await assert.rejects(db.query('update public.commercial_contracts set contract_reference=$1 where id=$2',['mutated',contract]),{code:'55000'});
 });
 await t.test('cross-tenant contract FK rejects privileged direct insertion',async()=>{
  await assert.rejects(db.query("insert into public.commercial_subscriptions(institution_id,plan_version_id,contract_id,status,starts_at) values($1,$2,$3,'active',now())",[b,version,contract]),{code:'23503'});
  await assert.rejects(rpc('create_commercial_subscription',[b,version,contract,'active','2026-01-01',null,'Fixture subscription']),{code:'22023'});
 });
 await t.test('subscription creation requires reason and unique current tenant subscription',async()=>{
  await assert.rejects(rpc('create_commercial_subscription',[a,version,contract,'active','2026-01-01',null,null]),{code:'22023'});
  subscription=await rpc('create_commercial_subscription',[a,version,contract,'active','2026-01-01',null,'Fixture subscription']);
  await assert.rejects(rpc('create_commercial_subscription',[a,version,contract,'active','2026-01-01',null,'Duplicate fixture']),{code:'23505'});
 });
 await t.test('RLS hides commercial tables from tenant and prohibits direct writes for owner',async()=>{
  assert.equal((await run('select id from public.commercial_subscriptions',[],member)).rows.length,0);
  assert.equal((await run('select id from public.commercial_subscriptions')).rows.length,1);
  await assert.rejects(run('delete from public.commercial_subscriptions'),{code:'42501'});
  await assert.rejects(run('select * from public.commercial_subscriptions',[],'','anon'),{code:'42501'});
  const tables=(await db.query("select tablename from pg_tables where schemaname='public' and tablename like 'commercial_%'")).rows;
  assert.equal(tables.length,10);
  for(const {tablename} of tables){
   assert.equal((await run(`select * from public.${tablename}`,[],member)).rows.length,0,tablename);
   await assert.rejects(run(`insert into public.${tablename} default values`),{code:'42501'});
   await assert.rejects(run(`select * from public.${tablename}`,[],'','anon'),{code:'42501'});
  }
  const exposed=(await db.query("select proname from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and proname like '%commercial%' and has_function_privilege('anon',p.oid,'EXECUTE')")).rows;
  assert.deepEqual(exposed,[]);
 });
 await t.test('entitlement check validates identity, tenant, quantity and membership',async()=>{
  assert.equal(await rpc('commercial_entitlement_check',[a,'test_events',1],member),true);
  assert.equal(await rpc('commercial_entitlement_check',[b,'test_events',1],member),false);
  assert.equal(await rpc('commercial_entitlement_check',[a,'test_events',-1],member),false);
  assert.equal(await rpc('commercial_entitlement_check',[a,'test_events',null],member),false);
  assert.equal(await rpc('commercial_entitlement_check',[a,'test_events',1],''),false);
  assert.equal(await rpc('commercial_entitlement_check',[a,'test_disabled',1],member),false);
  assert.equal(await rpc('commercial_entitlement_check',[a,'test_missing',1],member),false);
  assert.equal(await rpc('commercial_entitlement_check',[a,'test_unlimited',100000],member),true);
  await db.query("update public.commercial_subscriptions set starts_at=now()+interval '1 day' where id=$1",[subscription]);
  assert.equal(await rpc('commercial_entitlement_check',[a,'test_events',1],member),false);
  await db.query("update public.commercial_subscriptions set starts_at='2026-01-01',ends_at=now()-interval '1 day' where id=$1",[subscription]);
  assert.equal(await rpc('commercial_entitlement_check',[a,'test_events',1],member),false);
  await db.query('update public.commercial_subscriptions set ends_at=null where id=$1',[subscription]);
 });
 await t.test('usage retry is idempotent and conflicting retry rejected',async()=>{
  meter=await rpc('create_commercial_meter',['test_counter','Test counter','count','test_events','Fixture meter']);
  const args=[subscription,meter,4,'fixture-key-1','fixture-source','Fixture usage'];
  const first=await rpc('record_commercial_usage',args);assert.equal(await rpc('record_commercial_usage',args),first);
  await assert.rejects(rpc('record_commercial_usage',[subscription,meter,3,'fixture-key-1','fixture-source','Fixture usage']),{code:'22023'});
  assert.equal((await db.query('select quantity::int as n from public.commercial_usage_rollups')).rows[0].n,4);
  assert.equal((await db.query('select count(*)::int as n from public.commercial_metering_events')).rows[0].n,1);
 });
 await t.test('quota enforcement is atomic and tenant cannot write usage',async()=>{
  await assert.rejects(rpc('record_commercial_usage',[subscription,meter,7,'fixture-key-2','fixture-source','Fixture usage']),{code:'42501'});
  await assert.rejects(rpc('record_commercial_usage',[subscription,meter,1,'fixture-key-3','fixture-source','Fixture usage'],member),{code:'42501'});
  await rpc('record_commercial_usage',[subscription,meter,6,'fixture-key-4','fixture-source','Fixture usage']);
  assert.equal(await rpc('commercial_entitlement_check',[a,'test_events',1],member),false);
  assert.equal((await db.query('select quantity::int as n from public.commercial_usage_rollups')).rows[0].n,10);
 });
 await t.test('metering and lifecycle audit are append-only even for database writer',async()=>{
  await assert.rejects(db.exec('delete from public.commercial_metering_events'),{code:'55000'});
  await assert.rejects(db.exec("update public.commercial_lifecycle_audit set reason='rewritten'"),{code:'55000'});
 });
 await t.test('billing references validate tenant FK and cannot be rewritten after recording',async()=>{
  await assert.rejects(rpc('record_commercial_billing',[b,subscription,'invoice','Fixture invoice','2026-01-01','Fixture billing']),{code:'23503'});
  const bill=await rpc('record_commercial_billing',[a,subscription,'invoice','Fixture invoice','2026-01-01','Fixture billing']);
  await assert.rejects(db.query('update public.commercial_billing_records set external_reference=$1 where id=$2',['rewritten',bill]),{code:'55000'});
  await rpc('transition_commercial_billing',[bill,'settled','Fixture settlement']);
  await assert.rejects(rpc('transition_commercial_billing',[bill,'recorded','Fixture reversal']),{code:'22023'});
 });
 await t.test('suspension and membership removal deny entitlements including owner for inactive tenant',async()=>{
  await rpc('transition_commercial_subscription',[subscription,'suspended','Fixture suspension']);
  assert.equal(await rpc('commercial_entitlement_check',[a,'test_events',0],member),false);
  await rpc('transition_commercial_subscription',[subscription,'active','Fixture resumption']);
  await db.query("update public.institutions set lifecycle_status='suspended' where id=$1",[a]);
  assert.equal(await rpc('commercial_entitlement_check',[a,'test_events',0]),false);
  await db.query("update public.institutions set lifecycle_status='active' where id=$1",[a]);
  await db.query('delete from public.institution_memberships where user_id=$1',[member]);
  assert.equal(await rpc('commercial_entitlement_check',[a,'test_events',0],member),false);
 });
 await t.test('plan retirement preserves agreed entitlements; cancellation is terminal',async()=>{
  await rpc('retire_commercial_plan',[plan,'Fixture retirement']);
  assert.equal(await rpc('commercial_entitlement_check',[a,'test_events',0]),true);
  await assert.rejects(rpc('create_commercial_subscription',[b,version,null,'active','2026-01-01',null,'Fixture retired plan']),{code:'22023'});
  await rpc('transition_commercial_subscription',[subscription,'cancelled','Fixture cancellation']);
  assert.equal(await rpc('commercial_entitlement_check',[a,'test_events',0]),false);
  await assert.rejects(rpc('transition_commercial_subscription',[subscription,'active','Fixture resurrection']),{code:'22023'});
 });
 await t.test('release verification SQL passes and ledger reconciles',async()=>{
  await db.exec(fs.readFileSync('supabase/tests/phase5_commercial_verification.sql','utf8'));
 });
});
