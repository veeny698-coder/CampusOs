const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {PGlite}=require('@electric-sql/pglite');

test('owner invitation acceptance is scoped, one-time and non-enumerating',async t=>{
 const db=await PGlite.create();t.after(()=>db.close());
 await db.exec(`create role anon;create role authenticated;create schema auth;
 create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz,banned_until timestamptz);
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 grant usage on schema auth,public to anon,authenticated;grant execute on function auth.uid() to anon,authenticated;`);
 for(const file of ['202610220001_foundation.sql','202610220002_platform_owners.sql','202610220004_audited_institution_creation.sql','202610240001_portal_assignments.sql','202610260001_super_admin_institution_management.sql','20261028183937_owner_invitation_acceptance.sql']){
  await db.exec(fs.readFileSync(`supabase/migrations/${file}`,'utf8').replace('create extension if not exists pgcrypto;',''));
 }
 const institution='10000000-0000-0000-0000-000000000001';
 const owner='20000000-0000-0000-0000-000000000001';
 const invited='20000000-0000-0000-0000-000000000002';
 const wrong='20000000-0000-0000-0000-000000000003';
 const member='20000000-0000-0000-0000-000000000004';
 await db.exec(`insert into auth.users(id,email,email_confirmed_at) values
 ('${owner}','owner@example.test',now()),('${invited}','invitee@example.test',now()),('${wrong}','other@example.test',now()),('${member}','member@example.test',now());
 insert into public.platform_owners(user_id) values('${owner}');
 insert into public.institutions(id,name,slug) values('${institution}','Fixture','fixture');
 insert into public.institution_memberships(institution_id,user_id,role) values('${institution}','${member}','member');`);
 async function run(sql,args=[],actor=owner,role='authenticated'){
  await db.query("select set_config('request.jwt.claim.sub',$1,false)",[actor]);await db.exec(`set role ${role}`);
  try{return await db.query(sql,args);}finally{await db.exec('reset role');}
 }
 async function rpc(name,args=[],actor=owner){return (await run(`select public.${name}(${args.map((_,i)=>`$${i+1}`).join(',')}) as result`,args,actor)).rows[0].result;}
 await t.test('only platform owner can create a link and anon cannot execute it',async()=>{
  await assert.rejects(rpc('create_owner_invitation_link',[institution,'invitee@example.test','2099-01-01','Fixture invitation'],member),{code:'42501'});
  await assert.rejects(run(`select public.create_owner_invitation_link($1,$2,$3,$4)`,[institution,'invitee@example.test','2099-01-01','Fixture invitation'],'','anon'),{code:'42501'});
 });
 let invitation,token;
 await t.test('link is opaque and its hash is not readable to tenant or anonymous users',async()=>{
  const result=(await run('select * from public.create_owner_invitation_link($1,$2,$3,$4)',[institution,'invitee@example.test','2099-01-01','Fixture invitation'])).rows[0];
  invitation=result.invitation_id;token=result.token;
  assert.match(token,/^[0-9a-f]{64}$/);
  await assert.rejects(run('select * from public.owner_invitation_tokens',[],member),{code:'42501'});
  await assert.rejects(run('select * from public.owner_invitation_tokens',[],'','anon'),{code:'42501'});
  const exposed=(await db.query("select proname from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and proname like '%owner_invitation%' and has_function_privilege('anon',p.oid,'EXECUTE')")).rows;
  assert.deepEqual(exposed,[]);
 });
 await t.test('wrong account and invalid token produce only generic denial',async()=>{
  assert.deepEqual(await rpc('accept_owner_invitation',[token],wrong),{ok:false});
  assert.deepEqual(await rpc('accept_owner_invitation',['f'.repeat(64)],invited),{ok:false});
  assert.equal((await db.query('select status from public.institution_owner_invitations where id=$1',[invitation])).rows[0].status,'pending');
 });
 await t.test('verified invited account accepts once and gains only the intended owner membership',async()=>{
  const accepted=await rpc('accept_owner_invitation',[token],invited);assert.equal(accepted.ok,true);assert.equal(accepted.institution_id,institution);
  const row=(await db.query('select status,accepted_by,accepted_at from public.institution_owner_invitations where id=$1',[invitation])).rows[0];
  assert.equal(row.status,'accepted');assert.equal(row.accepted_by,invited);assert.ok(row.accepted_at);
  assert.equal((await db.query('select role from public.institution_memberships where institution_id=$1 and user_id=$2',[institution,invited])).rows[0].role,'owner');
  assert.deepEqual(await rpc('accept_owner_invitation',[token],invited),{ok:false});
 });
 await t.test('revocation invalidates a pending link and is audited',async()=>{
  const second=(await run('select * from public.create_owner_invitation_link($1,$2,$3,$4)',[institution,'other@example.test','2099-01-01','Fixture invitation'])).rows[0];
  await rpc('revoke_owner_invitation_link',[second.invitation_id,'Fixture revocation']);
  assert.deepEqual(await rpc('accept_owner_invitation',[second.token],wrong),{ok:false});
  assert.equal((await db.query('select status from public.institution_owner_invitations where id=$1',[second.invitation_id])).rows[0].status,'revoked');
  assert.ok((await db.query("select 1 from public.audit_logs where action='institution.owner_invitation.revoked' and resource_id=$1",[second.invitation_id])).rows.length);
 });
});
