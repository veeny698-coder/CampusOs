const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { PGlite } = require('@electric-sql/pglite');

test('portal authorization against a disposable PostgreSQL engine', async t => {
  const db = await PGlite.create();
  t.after(() => db.close());
  await db.exec(`
    create role anon; create role authenticated;
    create schema auth;
    create table auth.users(id uuid primary key, email text);
    create function auth.uid() returns uuid language sql stable as
      $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
    grant usage on schema auth,public to anon,authenticated;
    grant execute on function auth.uid() to anon,authenticated;
  `);
  const files = ['202610220001_foundation.sql','202610220002_platform_owners.sql',
    '202610220004_audited_institution_creation.sql','202610240001_portal_assignments.sql',
    '202610260001_super_admin_institution_management.sql','202610260002_time_bound_portal_assignments.sql'];
  for (const file of files) {
    // gen_random_uuid is built into PostgreSQL. The unrelated pgcrypto extension
    // is unavailable in this WASM runtime; all relevant DDL/function bodies run unchanged.
    const sql = fs.readFileSync(`supabase/migrations/${file}`, 'utf8')
      .replace('create extension if not exists pgcrypto;', '');
    await db.exec(sql);
  }
  const tenantA='10000000-0000-0000-0000-000000000001';
  const tenantB='10000000-0000-0000-0000-000000000002';
  const member='20000000-0000-0000-0000-000000000001';
  const owner='20000000-0000-0000-0000-000000000002';
  const eventA='30000000-0000-0000-0000-000000000001';
  const eventB='30000000-0000-0000-0000-000000000002';
  await db.exec(`
    insert into auth.users(id) values('${member}'),('${owner}');
    insert into public.platform_owners(user_id) values('${owner}');
    insert into public.institutions(id,name,slug) values('${tenantA}','Tenant A','tenant-a'),('${tenantB}','Tenant B','tenant-b');
    insert into public.institution_memberships(institution_id,user_id,role) values('${tenantA}','${member}','member');
    insert into public.events(id,institution_id,title) values('${eventA}','${tenantA}','Event A'),('${eventB}','${tenantB}','Event B');
    insert into public.portal_assignments(portal_key,institution_id,user_id,assigned_by) values('qr_scanner','${tenantA}','${member}','${owner}');
  `);
  async function check(actor=member, institution=tenantA, event=eventA) {
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [actor]);
    await db.exec('set role authenticated');
    try { return (await db.query('select public.has_portal_access($1,$2,$3) as allowed', ['qr_scanner',institution,event])).rows[0].allowed; }
    finally { await db.exec('reset role'); }
  }
  await db.exec(`delete from public.institution_memberships where user_id='${member}'`);
  assert.equal(await check(),true,'reproduce Phase 3 stale membership regression');
  await db.exec(fs.readFileSync('supabase/migrations/202610270001_restore_portal_membership_checks.sql','utf8'));
  await t.test('removed institution member is denied', async()=>assert.equal(await check(),false));
  await db.exec(`insert into public.institution_memberships(institution_id,user_id,role) values('${tenantA}','${member}','member')`);
  await t.test('current in-scope member is allowed',async()=>assert.equal(await check(),true));
  await t.test('cross-tenant resource mismatch is denied',async()=>assert.equal(await check(member,tenantA,eventB),false));
  await t.test('unrelated institution is denied',async()=>assert.equal(await check(member,tenantB,eventB),false));
  await t.test('null identity is denied',async()=>assert.equal(await check(''),false));
  await t.test('revoked assignment is denied',async()=>{
    await db.exec('update public.portal_assignments set revoked_at=now()');
    assert.equal(await check(),false);
    await db.exec('update public.portal_assignments set revoked_at=null');
  });
  await t.test('expired assignment is denied',async()=>{
    await db.exec("update public.portal_assignments set starts_at=now()-interval '2 days',expires_at=now()-interval '1 day'");
    assert.equal(await check(),false);
    await db.exec('update public.portal_assignments set expires_at=null');
  });
  await t.test('future assignment is denied',async()=>{
    await db.exec("update public.portal_assignments set starts_at=now()+interval '1 day'");
    assert.equal(await check(),false);
    await db.exec('update public.portal_assignments set starts_at=now()');
  });
  await t.test('active owner allowed only for valid tenant resource',async()=>{
    assert.equal(await check(owner),true);
    assert.equal(await check(owner,tenantA,eventB),false);
  });
  await t.test('disabled module denied including platform owner',async()=>{
    await db.exec("update public.portal_catalog set enabled=false where key='qr_scanner'");
    assert.equal(await check(),false); assert.equal(await check(owner),false);
    await db.exec("update public.portal_catalog set enabled=true where key='qr_scanner'");
  });
  await t.test('suspended institution denied',async()=>{
    await db.exec(`update public.institutions set lifecycle_status='suspended' where id='${tenantA}'`);
    assert.equal(await check(),false); assert.equal(await check(owner),false);
  });
  await t.test('anonymous role has no execute privilege',async()=>{
    await db.exec('set role anon');
    try { await assert.rejects(db.query('select public.has_portal_access($1,$2)', ['qr_scanner',tenantA]), { code: '42501' }); }
    finally { await db.exec('reset role'); }
  });
  await db.exec(fs.readFileSync('supabase/migrations/202610270002_portal_management.sql','utf8'));
  async function manage(actor=owner, enabled=true, event=null, reason='Reviewed access', expiry=null, organization=null) {
    await db.query("select set_config('request.jwt.claim.sub',$1,false)",[actor]);
    await db.exec('set role authenticated');
    try { return await db.query('select public.set_portal_assignment($1,$2,$3,$4,$8,$5,$6,$7) as id', ['qr_scanner',tenantA,member,enabled,event,expiry,reason,organization]); }
    finally { await db.exec('reset role'); }
  }
  await t.test('tenant member cannot administer assignments',async()=>{
    await assert.rejects(manage(member),{code:'42501'});
  });
  await t.test('revocation succeeds for suspended tenants and disabled portals',async()=>{
    await db.exec("update public.portal_catalog set enabled=false where key='qr_scanner'");
    await manage(owner,false);
    assert.ok((await db.query('select revoked_at from public.portal_assignments')).rows[0].revoked_at);
    const before=(await db.query("select count(*) from public.audit_logs where action='portal.assignment.revoked'")).rows[0].count;
    await manage(owner,false);
    assert.equal((await db.query("select count(*) from public.audit_logs where action='portal.assignment.revoked'")).rows[0].count,before);
    await assert.rejects(manage(),{code:'22023'});
    await db.exec("update public.portal_catalog set enabled=true where key='qr_scanner'");
    await assert.rejects(manage(),{code:'22023'});
    await db.exec(`update public.institutions set lifecycle_status='active' where id='${tenantA}'`);
  });
  await t.test('owner can grant current member access with an audit record',async()=>{
    const result=await manage();
    assert.ok(result.rows[0].id);
    assert.equal(await check(),true);
    assert.equal((await db.query("select count(*)::int as n from public.audit_logs where action='portal.assignment.granted'")).rows[0].n,1);
  });
  await t.test('cross-tenant grants and invalid expiry/reason fail',async()=>{
    await assert.rejects(manage(owner,true,eventB),{code:'22023'});
    await assert.rejects(manage(owner,true,null,' '),{code:'22023'});
    await assert.rejects(manage(owner,true,null,'Reviewed','2000-01-01'),{code:'22023'});
    await assert.rejects(manage(owner,true,null,'Reviewed','infinity'),{code:'22023'});
  });
  await t.test('removed member cannot receive new grants but can be revoked',async()=>{
    await db.exec(`delete from public.institution_memberships where user_id='${member}'`);
    await assert.rejects(manage(),{code:'42501'});
    await manage(owner,false);
    assert.equal(await check(),false);
  });
  await t.test('organization grant requires matching tenant and current organization membership',async()=>{
    const organization='40000000-0000-0000-0000-000000000001';
    const other='40000000-0000-0000-0000-000000000002';
    await db.exec(`insert into public.institution_memberships(institution_id,user_id,role) values('${tenantA}','${member}','member');
      insert into public.organizations(id,institution_id,name,kind) values('${organization}','${tenantA}','Society A','society'),('${other}','${tenantB}','Society B','society');`);
    await assert.rejects(manage(owner,true,null,'Reviewed',null,other),{code:'22023'});
    await assert.rejects(manage(owner,true,null,'Reviewed',null,organization),{code:'42501'});
    await db.exec(`insert into public.organization_memberships(organization_id,user_id,role) values('${organization}','${member}','member')`);
    await manage(owner,true,null,'Reviewed',null,organization);
    await assert.rejects(manage(owner,true,eventA,'Reviewed',null,organization),{code:'22023'});
    await db.exec(`update public.events set organization_id='${organization}' where id='${eventA}'`);
    assert.equal(await check(),true);
    await db.exec(`delete from public.organization_memberships where user_id='${member}'`);
    assert.equal(await check(),false);
    await manage(owner,false,null,'Removed member',null,organization);
  });
});
