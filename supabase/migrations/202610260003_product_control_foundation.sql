-- Phase 4, vertical slice 1: deterministic feature flags and versioned
-- platform settings. Commercial plan entitlements are deliberately deferred
-- to Phase 5.
create table if not exists public.feature_flags (
  key text primary key check (key ~ '^[a-z][a-z0-9_]{2,79}$'),
  label text not null check (length(btrim(label)) between 2 and 120),
  description text not null default '',
  default_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null
);

create table if not exists public.feature_flag_rules (
  id uuid primary key default gen_random_uuid(),
  flag_key text not null references public.feature_flags(key) on delete cascade,
  institution_id uuid references public.institutions(id) on delete cascade,
  enabled boolean not null,
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  reason text not null check (length(btrim(reason)) between 3 and 500),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  revoked_at timestamptz,
  revoked_by uuid references auth.users(id) on delete set null,
  check (expires_at is null or expires_at > starts_at)
);
create unique index if not exists feature_flag_rules_active_scope
  on public.feature_flag_rules(flag_key,coalesce(institution_id,'00000000-0000-0000-0000-000000000000'::uuid))
  where revoked_at is null;
create index if not exists feature_flag_rules_tenant_lookup
  on public.feature_flag_rules(institution_id,flag_key,starts_at) where revoked_at is null;

create table if not exists public.platform_settings_versions (
  id uuid primary key default gen_random_uuid(),
  setting_key text not null check (setting_key ~ '^[a-z][a-z0-9_]{2,79}$'),
  value jsonb not null,
  status text not null default 'draft' check (status in ('draft','published','superseded')),
  version integer not null,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  published_at timestamptz,
  published_by uuid references auth.users(id) on delete set null,
  reason text not null check (length(btrim(reason)) between 3 and 500),
  unique(setting_key,version)
);
create unique index if not exists platform_settings_one_published
  on public.platform_settings_versions(setting_key) where status='published';

alter table public.feature_flags enable row level security;
alter table public.feature_flag_rules enable row level security;
alter table public.platform_settings_versions enable row level security;
revoke all on public.feature_flags,public.feature_flag_rules,public.platform_settings_versions from anon,authenticated;
grant select on public.feature_flags,public.feature_flag_rules,public.platform_settings_versions to authenticated;
create policy feature_flags_platform_owner_read on public.feature_flags for select to authenticated using (exists(select 1 from public.platform_owners p where p.user_id=(select auth.uid())));
create policy feature_flag_rules_platform_owner_read on public.feature_flag_rules for select to authenticated using (exists(select 1 from public.platform_owners p where p.user_id=(select auth.uid())));
create policy platform_settings_platform_owner_read on public.platform_settings_versions for select to authenticated using (exists(select 1 from public.platform_owners p where p.user_id=(select auth.uid())));

create or replace function public.is_feature_enabled(p_key text,p_institution uuid default null)
returns boolean language sql stable security definer set search_path='' as $$
 with selected_rule as (
   select r.enabled from public.feature_flag_rules r
   where r.flag_key=p_key and r.revoked_at is null and r.starts_at<=now()
     and (r.expires_at is null or r.expires_at>now())
     and (r.institution_id=p_institution or r.institution_id is null)
   order by (r.institution_id is not null) desc,r.created_at desc
   limit 1
 )
 select coalesce((select enabled from selected_rule),(select f.default_enabled from public.feature_flags f where f.key=p_key),false)
$$;
revoke all on function public.is_feature_enabled(text,uuid) from public,anon;
grant execute on function public.is_feature_enabled(text,uuid) to authenticated;

create or replace function public.set_feature_flag_rule(p_key text,p_institution uuid,p_enabled boolean,p_starts_at timestamptz default now(),p_expires_at timestamptz default null,p_reason text default null)
returns uuid language plpgsql security definer set search_path='' as $$
declare v_actor uuid;v_id uuid;v_reason text;
begin
 v_actor:=(select auth.uid());v_reason:=pg_catalog.btrim(p_reason);
 if v_actor is null or not exists(select 1 from public.platform_owners where user_id=v_actor) then raise exception 'Not authorized' using errcode='42501';end if;
 if not exists(select 1 from public.feature_flags where key=p_key) then raise exception 'Unknown feature flag' using errcode='22023';end if;
 if p_institution is not null and not exists(select 1 from public.institutions where id=p_institution) then raise exception 'Institution not found' using errcode='22023';end if;
 if p_starts_at<now()-interval '5 minutes' or (p_expires_at is not null and p_expires_at<=p_starts_at) or pg_catalog.length(v_reason) not between 3 and 500 then raise exception 'Invalid feature flag rule' using errcode='22023';end if;
 update public.feature_flag_rules set revoked_at=now(),revoked_by=v_actor where flag_key=p_key and institution_id is not distinct from p_institution and revoked_at is null;
 insert into public.feature_flag_rules(flag_key,institution_id,enabled,starts_at,expires_at,reason,created_by) values(p_key,p_institution,p_enabled,p_starts_at,p_expires_at,v_reason,v_actor) returning id into v_id;
 insert into public.audit_logs(actor_user_id,action,resource_type,resource_id,details) values(v_actor,'feature_flag.rule.set','feature_flag_rule',v_id,pg_catalog.jsonb_build_object('key',p_key,'institution_id',p_institution,'enabled',p_enabled,'starts_at',p_starts_at,'expires_at',p_expires_at,'reason',v_reason));
 return v_id;
end;$$;
revoke all on function public.set_feature_flag_rule(text,uuid,boolean,timestamptz,timestamptz,text) from public,anon;
grant execute on function public.set_feature_flag_rule(text,uuid,boolean,timestamptz,timestamptz,text) to authenticated;

create or replace function public.publish_platform_setting(p_key text,p_value jsonb,p_reason text)
returns uuid language plpgsql security definer set search_path='' as $$
declare v_actor uuid;v_id uuid;v_version integer;v_reason text;
begin
 v_actor:=(select auth.uid());v_reason:=pg_catalog.btrim(p_reason);
 if v_actor is null or not exists(select 1 from public.platform_owners where user_id=v_actor) then raise exception 'Not authorized' using errcode='42501';end if;
 if p_key !~ '^[a-z][a-z0-9_]{2,79}$' or p_value is null or pg_catalog.length(v_reason) not between 3 and 500 then raise exception 'Invalid setting' using errcode='22023';end if;
 select coalesce(max(version),0)+1 into v_version from public.platform_settings_versions where setting_key=p_key;
 update public.platform_settings_versions set status='superseded' where setting_key=p_key and status='published';
 insert into public.platform_settings_versions(setting_key,value,status,version,created_by,published_at,published_by,reason) values(p_key,p_value,'published',v_version,v_actor,now(),v_actor,v_reason) returning id into v_id;
 insert into public.audit_logs(actor_user_id,action,resource_type,resource_id,details) values(v_actor,'platform_setting.published','platform_setting',v_id,pg_catalog.jsonb_build_object('key',p_key,'version',v_version,'reason',v_reason));
 return v_id;
end;$$;
revoke all on function public.publish_platform_setting(text,jsonb,text) from public,anon;
grant execute on function public.publish_platform_setting(text,jsonb,text) to authenticated;
