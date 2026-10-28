-- Delivery Phase 5: provider-neutral commercial foundation.
-- Additive only. This migration deliberately does not seed plans, prices,
-- currencies, taxes, invoice payloads, providers, or contract wording.
begin;
do $$begin
  if exists(select 1 from pg_tables where schemaname='public' and tablename like 'commercial_%') then
    raise exception 'Commercial schema already exists; reconcile migration history before applying';
  end if;
end;$$;

create table if not exists public.commercial_plans (
  id uuid primary key default gen_random_uuid(),
  plan_key text not null unique check (plan_key ~ '^[a-z][a-z0-9_]{2,79}$'),
  name text not null check (length(btrim(name)) between 2 and 120),
  plan_kind text not null check (plan_kind in ('complimentary','trial','paid','enterprise')),
  status text not null default 'draft' check (status in ('draft','active','retired')),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  retired_at timestamptz,
  retired_by uuid references auth.users(id) on delete set null,
  check ((status = 'retired') = (retired_at is not null))
);

create table if not exists public.commercial_plan_versions (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.commercial_plans(id) on delete restrict,
  version integer not null check (version > 0),
  status text not null default 'draft' check (status in ('draft','published','superseded','retired')),
  terms_reference text,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  published_at timestamptz,
  published_by uuid references auth.users(id) on delete set null,
  unique(plan_id, version),
  check (length(coalesce(terms_reference,'')) <= 500),
  check ((status = 'draft') = (published_at is null))
);

create table if not exists public.commercial_plan_entitlements (
  id uuid primary key default gen_random_uuid(),
  plan_version_id uuid not null references public.commercial_plan_versions(id) on delete restrict,
  entitlement_key text not null check (entitlement_key ~ '^[a-z][a-z0-9_]{2,79}$'),
  enabled boolean not null default true,
  quota_limit bigint check (quota_limit is null or quota_limit >= 0),
  created_at timestamptz not null default now(),
  unique(plan_version_id, entitlement_key)
);

create table if not exists public.commercial_contracts (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete restrict,
  contract_reference text not null check (length(btrim(contract_reference)) between 2 and 200),
  status text not null default 'draft' check (status in ('draft','negotiating','signed','expired','cancelled')),
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  unique(institution_id, contract_reference),
  unique(id,institution_id),
  check (ends_at is null or starts_at is null or ends_at > starts_at)
);

create table if not exists public.commercial_subscriptions (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete restrict,
  plan_version_id uuid not null references public.commercial_plan_versions(id) on delete restrict,
  contract_id uuid,
  status text not null check (status in ('trial','active','grace','suspended','cancelled')),
  starts_at timestamptz not null,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  cancelled_at timestamptz,
  cancelled_by uuid references auth.users(id) on delete set null,
  unique(id,institution_id),
  foreign key(contract_id,institution_id) references public.commercial_contracts(id,institution_id) on delete restrict,
  check (ends_at is null or ends_at > starts_at),
  check ((status = 'cancelled') = (cancelled_at is not null))
);
create unique index if not exists commercial_subscriptions_one_current_per_institution
  on public.commercial_subscriptions(institution_id)
  where status in ('trial','active','grace','suspended');

create table if not exists public.commercial_billing_records (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete restrict,
  subscription_id uuid,
  record_type text not null check (record_type in ('quote','invoice','credit','payment','adjustment')),
  external_reference text not null check (length(btrim(external_reference)) between 2 and 200),
  status text not null default 'recorded' check (status in ('draft','recorded','void','settled')),
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  unique(institution_id, record_type, external_reference),
  foreign key(subscription_id,institution_id) references public.commercial_subscriptions(id,institution_id) on delete restrict
);

create table if not exists public.commercial_usage_meters (
  id uuid primary key default gen_random_uuid(),
  meter_key text not null unique check (meter_key ~ '^[a-z][a-z0-9_]{2,79}$'),
  label text not null check (length(btrim(label)) between 2 and 120),
  unit_kind text not null check (unit_kind in ('count','bytes','units')),
  entitlement_key text not null check (entitlement_key ~ '^[a-z][a-z0-9_]{2,79}$'),
  status text not null default 'active' check (status in ('active','retired')),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null
);

create table if not exists public.commercial_usage_rollups (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete restrict,
  subscription_id uuid not null,
  meter_id uuid not null references public.commercial_usage_meters(id) on delete restrict,
  period_starts_at timestamptz not null,
  period_ends_at timestamptz not null,
  quantity bigint not null default 0 check (quantity >= 0),
  recorded_at timestamptz not null default now(),
  recorded_by uuid references auth.users(id) on delete set null,
  unique(subscription_id, meter_id, period_starts_at, period_ends_at),
  foreign key(subscription_id,institution_id) references public.commercial_subscriptions(id,institution_id) on delete restrict,
  check (period_ends_at > period_starts_at)
);

create table if not exists public.commercial_lifecycle_audit (
  id bigint generated always as identity primary key,
  institution_id uuid not null references public.institutions(id) on delete restrict,
  resource_type text not null check (resource_type in ('plan','plan_version','contract','subscription','billing_record','usage_meter','usage_rollup','metering_event')),
  resource_id uuid not null,
  action text not null check (length(btrim(action)) between 3 and 120),
  from_status text,
  to_status text,
  reason text,
  details jsonb not null default '{}'::jsonb,
  actor_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  check (length(coalesce(reason,'')) <= 500)
);

create index if not exists commercial_contracts_institution_status_idx on public.commercial_contracts(institution_id,status,created_at desc);
create index if not exists commercial_subscriptions_institution_status_idx on public.commercial_subscriptions(institution_id,status,starts_at desc);
create index if not exists commercial_billing_records_institution_occurred_idx on public.commercial_billing_records(institution_id,occurred_at desc);
create index if not exists commercial_usage_rollups_tenant_meter_period_idx on public.commercial_usage_rollups(institution_id,meter_id,period_starts_at desc);
create index if not exists commercial_lifecycle_audit_tenant_created_idx on public.commercial_lifecycle_audit(institution_id,created_at desc);

alter table public.commercial_plans enable row level security;
alter table public.commercial_plan_versions enable row level security;
alter table public.commercial_plan_entitlements enable row level security;
alter table public.commercial_contracts enable row level security;
alter table public.commercial_subscriptions enable row level security;
alter table public.commercial_billing_records enable row level security;
alter table public.commercial_usage_meters enable row level security;
alter table public.commercial_usage_rollups enable row level security;
alter table public.commercial_lifecycle_audit enable row level security;

revoke all on public.commercial_plans, public.commercial_plan_versions, public.commercial_plan_entitlements, public.commercial_contracts, public.commercial_subscriptions, public.commercial_billing_records, public.commercial_usage_meters, public.commercial_usage_rollups, public.commercial_lifecycle_audit from public, anon, authenticated;
grant select on public.commercial_plans, public.commercial_plan_versions, public.commercial_plan_entitlements, public.commercial_contracts, public.commercial_subscriptions, public.commercial_billing_records, public.commercial_usage_meters, public.commercial_usage_rollups, public.commercial_lifecycle_audit to authenticated;

create policy commercial_plans_platform_owner_read on public.commercial_plans for select to authenticated using (exists(select 1 from public.platform_owners p where p.user_id=(select auth.uid())));
create policy commercial_plan_versions_platform_owner_read on public.commercial_plan_versions for select to authenticated using (exists(select 1 from public.platform_owners p where p.user_id=(select auth.uid())));
create policy commercial_plan_entitlements_platform_owner_read on public.commercial_plan_entitlements for select to authenticated using (exists(select 1 from public.platform_owners p where p.user_id=(select auth.uid())));
create policy commercial_contracts_platform_owner_read on public.commercial_contracts for select to authenticated using (exists(select 1 from public.platform_owners p where p.user_id=(select auth.uid())));
create policy commercial_subscriptions_platform_owner_read on public.commercial_subscriptions for select to authenticated using (exists(select 1 from public.platform_owners p where p.user_id=(select auth.uid())));
create policy commercial_billing_records_platform_owner_read on public.commercial_billing_records for select to authenticated using (exists(select 1 from public.platform_owners p where p.user_id=(select auth.uid())));
create policy commercial_usage_meters_platform_owner_read on public.commercial_usage_meters for select to authenticated using (exists(select 1 from public.platform_owners p where p.user_id=(select auth.uid())));
create policy commercial_usage_rollups_platform_owner_read on public.commercial_usage_rollups for select to authenticated using (exists(select 1 from public.platform_owners p where p.user_id=(select auth.uid())));
create policy commercial_lifecycle_audit_platform_owner_read on public.commercial_lifecycle_audit for select to authenticated using (exists(select 1 from public.platform_owners p where p.user_id=(select auth.uid())));

create or replace function public.commercial_entitlement_check(p_institution uuid, p_entitlement_key text, p_requested_quantity bigint default 0)
returns boolean language sql stable security definer set search_path='' as $$
  with permitted as (
    select (select auth.uid()) is not null and p_requested_quantity is not null and p_requested_quantity>=0
      and exists(select 1 from public.institutions where id=p_institution and lifecycle_status='active')
      and (exists(select 1 from public.platform_owners p where p.user_id=(select auth.uid()))
      or exists(select 1 from public.institution_memberships m where m.user_id=(select auth.uid()) and m.institution_id=p_institution)) as allowed
  ), subscription as (
    select s.id,s.plan_version_id from public.commercial_subscriptions s
    where s.institution_id=p_institution and s.status in ('trial','active','grace') and s.starts_at<=now() and (s.ends_at is null or s.ends_at>now())
    order by s.starts_at desc limit 1
  ), entitlement as (
    select e.quota_limit,e.enabled from public.commercial_plan_entitlements e join subscription s on s.plan_version_id=e.plan_version_id
    where e.entitlement_key=p_entitlement_key
  ), usage as (
    select coalesce(sum(r.quantity),0) as quantity from public.commercial_usage_rollups r join subscription s on s.id=r.subscription_id
    join public.commercial_usage_meters m on m.id=r.meter_id and m.entitlement_key=p_entitlement_key
  )
  select (select allowed from permitted)
    and coalesce((select enabled from entitlement),false)
    and ((select quota_limit from entitlement) is null
      or (select quantity from usage)+greatest(p_requested_quantity,0)<=(select quota_limit from entitlement));
$$;
revoke all on function public.commercial_entitlement_check(uuid,text,bigint) from public,anon;
grant execute on function public.commercial_entitlement_check(uuid,text,bigint) to authenticated;

create or replace function public.create_commercial_plan(p_key text,p_name text,p_kind text,p_reason text)
returns uuid language plpgsql security definer set search_path='' as $$
declare v_actor uuid;v_id uuid;begin
  v_actor:=(select auth.uid());
  if v_actor is null or not exists(select 1 from public.platform_owners where user_id=v_actor) then raise exception 'Not authorized' using errcode='42501'; end if;
  if p_key is null or p_name is null or p_kind is null or p_key !~ '^[a-z][a-z0-9_]{2,79}$' or length(btrim(p_name)) not between 2 and 120 or p_kind not in ('complimentary','trial','paid','enterprise') then raise exception 'Invalid plan' using errcode='22023'; end if;
  perform public.commercial_require_owner(p_reason);
  insert into public.commercial_plans(plan_key,name,plan_kind,created_by) values(lower(btrim(p_key)),btrim(p_name),p_kind,v_actor) returning id into v_id;
  insert into public.audit_logs(actor_user_id,action,resource_type,resource_id,details) values(v_actor,'commercial.plan.created','commercial_plan',v_id,jsonb_build_object('key',lower(btrim(p_key)),'kind',p_kind,'reason',btrim(p_reason)));
  return v_id;
end;$$;
revoke all on function public.create_commercial_plan(text,text,text,text) from public,anon;
grant execute on function public.create_commercial_plan(text,text,text,text) to authenticated;

create or replace function public.create_commercial_plan_version(p_plan uuid,p_terms_reference text,p_reason text)
returns uuid language plpgsql security definer set search_path='' as $$
declare v_actor uuid;v_id uuid;v_version integer;v_reference text;begin
  v_actor:=(select auth.uid());v_reference:=nullif(btrim(p_terms_reference),'');
  if v_actor is null or not exists(select 1 from public.platform_owners where user_id=v_actor) then raise exception 'Not authorized' using errcode='42501'; end if;
  perform public.commercial_require_owner(p_reason);
  perform 1 from public.commercial_plans where id=p_plan and status in ('draft','active') for update;
  if not found or length(coalesce(v_reference,''))>500 then raise exception 'Invalid plan version' using errcode='22023'; end if;
  select coalesce(max(version),0)+1 into v_version from public.commercial_plan_versions where plan_id=p_plan;
  insert into public.commercial_plan_versions(plan_id,version,terms_reference,created_by) values(p_plan,v_version,v_reference,v_actor) returning id into v_id;
  insert into public.audit_logs(actor_user_id,action,resource_type,resource_id,details) values(v_actor,'commercial.plan_version.created','commercial_plan_version',v_id,jsonb_build_object('plan_id',p_plan,'version',v_version,'reason',btrim(p_reason)));
  return v_id;
end;$$;
revoke all on function public.create_commercial_plan_version(uuid,text,text) from public,anon;
grant execute on function public.create_commercial_plan_version(uuid,text,text) to authenticated;

create or replace function public.create_commercial_subscription(p_institution uuid,p_plan_version uuid,p_contract uuid,p_status text,p_starts_at timestamptz,p_ends_at timestamptz,p_reason text)
returns uuid language plpgsql security definer set search_path='' as $$
declare v_actor uuid;v_id uuid;v_reason text;begin
  v_actor:=(select auth.uid());v_reason:=btrim(p_reason);
  if v_actor is null or not exists(select 1 from public.platform_owners where user_id=v_actor) then raise exception 'Not authorized' using errcode='42501'; end if;
  if p_status is null or v_reason is null or p_status not in ('trial','active') or p_starts_at is null or not isfinite(p_starts_at) or (p_ends_at is not null and (not isfinite(p_ends_at) or p_ends_at<=p_starts_at)) or length(v_reason) not between 3 and 500 then raise exception 'Invalid subscription' using errcode='22023'; end if;
  if not exists(select 1 from public.institutions where id=p_institution) or not exists(select 1 from public.commercial_plan_versions where id=p_plan_version and status='published') then raise exception 'Unknown institution or published plan version' using errcode='22023'; end if;
  perform 1 from public.commercial_plans p join public.commercial_plan_versions v on v.plan_id=p.id where v.id=p_plan_version and p.status='active' for share of p;
  if not found then raise exception 'Plan unavailable for new subscriptions' using errcode='22023'; end if;
  if p_contract is not null then
    perform 1 from public.commercial_contracts where id=p_contract and institution_id=p_institution and status='signed'
      and starts_at<=p_starts_at and (ends_at is null or (p_ends_at is not null and p_ends_at<=ends_at)) for share;
    if not found then raise exception 'Signed contract must cover this institution and term' using errcode='22023'; end if;
  end if;
  insert into public.commercial_subscriptions(institution_id,plan_version_id,contract_id,status,starts_at,ends_at,created_by) values(p_institution,p_plan_version,p_contract,p_status,p_starts_at,p_ends_at,v_actor) returning id into v_id;
  insert into public.commercial_lifecycle_audit(institution_id,resource_type,resource_id,action,to_status,reason,actor_user_id) values(p_institution,'subscription',v_id,'subscription.created',p_status,v_reason,v_actor);
  insert into public.audit_logs(actor_user_id,action,resource_type,resource_id,details) values(v_actor,'commercial.subscription.created','commercial_subscription',v_id,jsonb_build_object('institution_id',p_institution,'status',p_status));
  return v_id;
end;$$;
revoke all on function public.create_commercial_subscription(uuid,uuid,uuid,text,timestamptz,timestamptz,text) from public,anon;
grant execute on function public.create_commercial_subscription(uuid,uuid,uuid,text,timestamptz,timestamptz,text) to authenticated;

create or replace function public.transition_commercial_subscription(p_subscription uuid,p_status text,p_reason text)
returns void language plpgsql security definer set search_path='' as $$
declare v_actor uuid;v_subscription public.commercial_subscriptions%rowtype;v_reason text;begin
  v_actor:=(select auth.uid());v_reason:=btrim(p_reason);
  if v_actor is null or not exists(select 1 from public.platform_owners where user_id=v_actor) then raise exception 'Not authorized' using errcode='42501'; end if;
  select * into v_subscription from public.commercial_subscriptions where id=p_subscription for update;
  if not found or p_status is null or v_reason is null or p_status not in ('trial','active','grace','suspended','cancelled') or length(v_reason) not between 3 and 500 or (v_subscription.status='cancelled') then raise exception 'Invalid subscription transition' using errcode='22023'; end if;
  if (v_subscription.status,p_status) not in (('trial','active'),('trial','cancelled'),('active','grace'),('active','suspended'),('active','cancelled'),('grace','active'),('grace','suspended'),('grace','cancelled'),('suspended','active'),('suspended','cancelled')) then raise exception 'Transition not allowed' using errcode='22023'; end if;
  update public.commercial_subscriptions set status=p_status,cancelled_at=case when p_status='cancelled' then now() else null end,cancelled_by=case when p_status='cancelled' then v_actor else null end where id=p_subscription;
  insert into public.commercial_lifecycle_audit(institution_id,resource_type,resource_id,action,from_status,to_status,reason,actor_user_id) values(v_subscription.institution_id,'subscription',p_subscription,'subscription.transitioned',v_subscription.status,p_status,v_reason,v_actor);
  insert into public.audit_logs(actor_user_id,action,resource_type,resource_id,details) values(v_actor,'commercial.subscription.transitioned','commercial_subscription',p_subscription,jsonb_build_object('from',v_subscription.status,'to',p_status,'reason',v_reason));
end;$$;
revoke all on function public.transition_commercial_subscription(uuid,text,text) from public,anon;
grant execute on function public.transition_commercial_subscription(uuid,text,text) to authenticated;

-- Quantities are cumulative for one subscription term. No implicit monthly reset,
-- currency, overage charge, payment action or external provider is introduced.
create table public.commercial_metering_events (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id),
  subscription_id uuid not null,
  meter_id uuid not null references public.commercial_usage_meters(id),
  quantity bigint not null check(quantity>0),
  idempotency_key text not null check(length(btrim(idempotency_key)) between 8 and 200),
  source_reference text not null check(length(btrim(source_reference)) between 3 and 500),
  created_at timestamptz not null default now(),
  created_by uuid not null references auth.users(id),
  foreign key(subscription_id,institution_id) references public.commercial_subscriptions(id,institution_id),
  unique(institution_id,idempotency_key)
);
create index commercial_metering_events_subscription_idx on public.commercial_metering_events(subscription_id,meter_id);
alter table public.commercial_metering_events enable row level security;
revoke all on public.commercial_metering_events from public,anon,authenticated;
grant select on public.commercial_metering_events to authenticated;
create policy commercial_metering_events_owner_read on public.commercial_metering_events for select to authenticated
  using(exists(select 1 from public.platform_owners where user_id=(select auth.uid())));

create function public.commercial_require_owner(p_reason text) returns uuid
language plpgsql security invoker set search_path='' as $$
declare actor uuid:=(select auth.uid()); begin
  if actor is null or not exists(select 1 from public.platform_owners where user_id=actor) then
    raise exception 'Not authorized' using errcode='42501'; end if;
  if p_reason is null or length(btrim(p_reason)) not between 3 and 500 then
    raise exception 'Reason required' using errcode='22023'; end if;
  return actor;
end;$$;
revoke all on function public.commercial_require_owner(text) from public,anon,authenticated;

create function public.commercial_protect_history() returns trigger
language plpgsql set search_path='' as $$
begin
  if TG_TABLE_NAME in ('commercial_metering_events','commercial_lifecycle_audit') then
    raise exception 'Append-only history' using errcode='55000';
  elsif TG_TABLE_NAME='commercial_plan_versions' then
    if OLD.status<>'draft' then raise exception 'Published version is immutable' using errcode='55000'; end if;
  elsif TG_TABLE_NAME='commercial_plan_entitlements' then
    if exists(select 1 from public.commercial_plan_versions where id=case when TG_OP='DELETE' then OLD.plan_version_id else NEW.plan_version_id end and status<>'draft')
      or (TG_OP='UPDATE' and exists(select 1 from public.commercial_plan_versions where id=OLD.plan_version_id and status<>'draft')) then
      raise exception 'Published entitlements are immutable' using errcode='55000'; end if;
  elsif TG_TABLE_NAME='commercial_billing_records' and OLD.status<>'draft' then
    if TG_OP='DELETE' or (to_jsonb(NEW)-'status') is distinct from (to_jsonb(OLD)-'status') then
      raise exception 'Finalized billing reference is immutable' using errcode='55000'; end if;
  elsif TG_TABLE_NAME='commercial_contracts' and OLD.status in ('signed','expired','cancelled') then
    if TG_OP='DELETE' or (to_jsonb(NEW)-'status') is distinct from (to_jsonb(OLD)-'status') then
      raise exception 'Final contract reference is immutable' using errcode='55000'; end if;
  end if;
  if TG_OP='DELETE' then return OLD; end if; return NEW;
end;$$;
revoke all on function public.commercial_protect_history() from public,anon,authenticated;
create trigger commercial_version_history before update or delete on public.commercial_plan_versions for each row execute function public.commercial_protect_history();
create trigger commercial_entitlement_history before insert or update or delete on public.commercial_plan_entitlements for each row execute function public.commercial_protect_history();
create trigger commercial_meter_history before update or delete on public.commercial_metering_events for each row execute function public.commercial_protect_history();
create trigger commercial_lifecycle_history before update or delete on public.commercial_lifecycle_audit for each row execute function public.commercial_protect_history();
create trigger commercial_contract_history before update or delete on public.commercial_contracts for each row execute function public.commercial_protect_history();
create trigger commercial_billing_history before update or delete on public.commercial_billing_records for each row execute function public.commercial_protect_history();

create function public.set_commercial_entitlement(p_version uuid,p_key text,p_enabled boolean,p_limit bigint,p_reason text)
returns void language plpgsql security definer set search_path='' as $$
declare actor uuid:=public.commercial_require_owner(p_reason); begin
  perform 1 from public.commercial_plan_versions where id=p_version and status='draft' for update;
  if not found or p_key is null or p_key !~ '^[a-z][a-z0-9_]{2,79}$' or p_enabled is null or p_limit<0 then
    raise exception 'Invalid draft entitlement' using errcode='22023'; end if;
  insert into public.commercial_plan_entitlements(plan_version_id,entitlement_key,enabled,quota_limit)
    values(p_version,p_key,p_enabled,p_limit) on conflict(plan_version_id,entitlement_key)
    do update set enabled=excluded.enabled,quota_limit=excluded.quota_limit;
  insert into public.audit_logs(actor_user_id,action,resource_type,resource_id,details)
    values(actor,'commercial.entitlement.updated','commercial_plan_version',p_version,jsonb_build_object('key',p_key,'enabled',p_enabled,'limit',p_limit,'reason',btrim(p_reason)));
end;$$;

create function public.publish_commercial_version(p_version uuid,p_reason text)
returns void language plpgsql security definer set search_path='' as $$
declare actor uuid:=public.commercial_require_owner(p_reason); plan uuid; begin
  select plan_id into plan from public.commercial_plan_versions where id=p_version and status='draft' for update;
  if not found or not exists(select 1 from public.commercial_plan_entitlements where plan_version_id=p_version) then
    raise exception 'Draft with explicit entitlements required' using errcode='22023'; end if;
  perform 1 from public.commercial_plans where id=plan and status<>'retired' for update;
  if not found then raise exception 'Plan retired' using errcode='22023'; end if;
  update public.commercial_plan_versions set status='published',published_at=now(),published_by=actor where id=p_version;
  update public.commercial_plans set status='active' where id=plan;
  insert into public.audit_logs(actor_user_id,action,resource_type,resource_id,details)
    values(actor,'commercial.version.published','commercial_plan_version',p_version,jsonb_build_object('reason',btrim(p_reason)));
end;$$;

create function public.retire_commercial_plan(p_plan uuid,p_reason text)
returns void language plpgsql security definer set search_path='' as $$
declare actor uuid:=public.commercial_require_owner(p_reason); begin
  update public.commercial_plans set status='retired',retired_at=now(),retired_by=actor where id=p_plan and status<>'retired';
  if not found then raise exception 'Plan unavailable' using errcode='22023'; end if;
  insert into public.audit_logs(actor_user_id,action,resource_type,resource_id,details)
    values(actor,'commercial.plan.retired','commercial_plan',p_plan,jsonb_build_object('reason',btrim(p_reason)));
end;$$;

create function public.create_commercial_contract(p_institution uuid,p_reference text,p_starts_at timestamptz,p_ends_at timestamptz,p_reason text)
returns uuid language plpgsql security definer set search_path='' as $$
declare actor uuid:=public.commercial_require_owner(p_reason); result uuid; begin
  if p_reference is null or length(btrim(p_reference)) not between 2 and 200
    or (p_starts_at is not null and not isfinite(p_starts_at)) or (p_ends_at is not null and (p_starts_at is null or not isfinite(p_ends_at) or p_ends_at<=p_starts_at)) then
    raise exception 'Invalid contract reference or dates' using errcode='22023'; end if;
  insert into public.commercial_contracts(institution_id,contract_reference,starts_at,ends_at,created_by)
    values(p_institution,btrim(p_reference),p_starts_at,p_ends_at,actor) returning id into result;
  insert into public.commercial_lifecycle_audit(institution_id,resource_type,resource_id,action,to_status,reason,actor_user_id)
    values(p_institution,'contract',result,'contract.created','draft',btrim(p_reason),actor);
  return result;
end;$$;

create function public.transition_commercial_contract(p_contract uuid,p_status text,p_reason text)
returns void language plpgsql security definer set search_path='' as $$
declare actor uuid:=public.commercial_require_owner(p_reason); contract public.commercial_contracts%rowtype; begin
  select * into contract from public.commercial_contracts where id=p_contract for update;
  if not found or p_status is null or (contract.status,p_status) not in (('draft','negotiating'),('draft','cancelled'),('negotiating','signed'),('negotiating','cancelled'),('signed','expired'),('signed','cancelled')) then
    raise exception 'Invalid contract transition' using errcode='22023'; end if;
  if p_status='signed' and contract.starts_at is null then raise exception 'Signed contract needs start date' using errcode='22023'; end if;
  update public.commercial_contracts set status=p_status where id=p_contract;
  insert into public.commercial_lifecycle_audit(institution_id,resource_type,resource_id,action,from_status,to_status,reason,actor_user_id)
    values(contract.institution_id,'contract',p_contract,'contract.transitioned',contract.status,p_status,btrim(p_reason),actor);
end;$$;

create function public.record_commercial_billing(p_institution uuid,p_subscription uuid,p_type text,p_reference text,p_occurred_at timestamptz,p_reason text)
returns uuid language plpgsql security definer set search_path='' as $$
declare actor uuid:=public.commercial_require_owner(p_reason); result uuid; begin
  if p_type is null or p_type not in ('quote','invoice','credit','payment','adjustment') or p_reference is null
    or length(btrim(p_reference)) not between 2 and 200 or p_occurred_at is null or not isfinite(p_occurred_at) then
    raise exception 'Invalid external billing reference' using errcode='22023'; end if;
  insert into public.commercial_billing_records(institution_id,subscription_id,record_type,external_reference,occurred_at,created_by)
    values(p_institution,p_subscription,p_type,btrim(p_reference),p_occurred_at,actor) returning id into result;
  insert into public.commercial_lifecycle_audit(institution_id,resource_type,resource_id,action,to_status,reason,actor_user_id)
    values(p_institution,'billing_record',result,'billing.recorded','recorded',btrim(p_reason),actor);
  return result;
end;$$;

create function public.transition_commercial_billing(p_record uuid,p_status text,p_reason text)
returns void language plpgsql security definer set search_path='' as $$
declare actor uuid:=public.commercial_require_owner(p_reason); item public.commercial_billing_records%rowtype; begin
  select * into item from public.commercial_billing_records where id=p_record for update;
  if not found or p_status is null or item.status<>'recorded' or p_status not in ('void','settled') then
    raise exception 'Invalid billing transition' using errcode='22023'; end if;
  update public.commercial_billing_records set status=p_status where id=p_record;
  insert into public.commercial_lifecycle_audit(institution_id,resource_type,resource_id,action,from_status,to_status,reason,actor_user_id)
    values(item.institution_id,'billing_record',p_record,'billing.transitioned',item.status,p_status,btrim(p_reason),actor);
end;$$;

create function public.create_commercial_meter(p_key text,p_label text,p_unit text,p_entitlement text,p_reason text)
returns uuid language plpgsql security definer set search_path='' as $$
declare actor uuid:=public.commercial_require_owner(p_reason); result uuid; begin
  if p_key is null or p_key !~ '^[a-z][a-z0-9_]{2,79}$' or p_label is null or length(btrim(p_label)) not between 2 and 120
    or p_unit is null or p_unit not in ('count','bytes','units') or p_entitlement is null or p_entitlement !~ '^[a-z][a-z0-9_]{2,79}$' then
    raise exception 'Invalid meter' using errcode='22023'; end if;
  insert into public.commercial_usage_meters(meter_key,label,unit_kind,entitlement_key,created_by)
    values(p_key,btrim(p_label),p_unit,p_entitlement,actor) returning id into result;
  insert into public.audit_logs(actor_user_id,action,resource_type,resource_id,details)
    values(actor,'commercial.meter.created','commercial_meter',result,jsonb_build_object('reason',btrim(p_reason)));
  return result;
end;$$;

create function public.record_commercial_usage(p_subscription uuid,p_meter uuid,p_quantity bigint,p_idempotency_key text,p_source text,p_reason text)
returns uuid language plpgsql security definer set search_path='' as $$
declare actor uuid:=public.commercial_require_owner(p_reason); subscription public.commercial_subscriptions%rowtype;
  meter public.commercial_usage_meters%rowtype; previous public.commercial_metering_events%rowtype; result uuid; begin
  if p_quantity is null or p_quantity<=0 or p_idempotency_key is null or length(btrim(p_idempotency_key)) not between 8 and 200
    or p_source is null or length(btrim(p_source)) not between 3 and 500 then raise exception 'Invalid usage' using errcode='22023'; end if;
  select * into subscription from public.commercial_subscriptions where id=p_subscription for update;
  if not found then raise exception 'Subscription unavailable' using errcode='22023'; end if;
  select * into previous from public.commercial_metering_events where institution_id=subscription.institution_id and idempotency_key=btrim(p_idempotency_key);
  if found then
    if previous.subscription_id<>p_subscription or previous.meter_id<>p_meter or previous.quantity<>p_quantity or previous.source_reference<>btrim(p_source) then
      raise exception 'Idempotency conflict' using errcode='22023'; end if;
    return previous.id;
  end if;
  select * into meter from public.commercial_usage_meters where id=p_meter and status='active';
  if not found or not public.commercial_entitlement_check(subscription.institution_id,meter.entitlement_key,p_quantity) then
    raise exception 'Entitlement unavailable or quota exceeded' using errcode='42501'; end if;
  -- Ensure the explicitly selected subscription is the current one used by the check.
  if subscription.status not in ('trial','active','grace') or subscription.starts_at>now() or subscription.ends_at<=now() then
    raise exception 'Subscription is not current' using errcode='42501'; end if;
  insert into public.commercial_metering_events(institution_id,subscription_id,meter_id,quantity,idempotency_key,source_reference,created_by)
    values(subscription.institution_id,p_subscription,p_meter,p_quantity,btrim(p_idempotency_key),btrim(p_source),actor) returning id into result;
  insert into public.commercial_usage_rollups(institution_id,subscription_id,meter_id,period_starts_at,period_ends_at,quantity,recorded_by)
    values(subscription.institution_id,p_subscription,p_meter,subscription.starts_at,coalesce(subscription.ends_at,'infinity'::timestamptz),p_quantity,actor)
    on conflict(subscription_id,meter_id,period_starts_at,period_ends_at)
    do update set quantity=public.commercial_usage_rollups.quantity+excluded.quantity,recorded_at=now(),recorded_by=actor;
  insert into public.commercial_lifecycle_audit(institution_id,resource_type,resource_id,action,reason,actor_user_id)
    values(subscription.institution_id,'metering_event',result,'usage.recorded',btrim(p_reason),actor);
  return result;
end;$$;

-- Functions are not public APIs until explicitly granted; helper/trigger functions
-- remain inaccessible to authenticated callers.
revoke all on function public.set_commercial_entitlement(uuid,text,boolean,bigint,text),public.publish_commercial_version(uuid,text),public.retire_commercial_plan(uuid,text),public.create_commercial_contract(uuid,text,timestamptz,timestamptz,text),public.transition_commercial_contract(uuid,text,text),public.record_commercial_billing(uuid,uuid,text,text,timestamptz,text),public.transition_commercial_billing(uuid,text,text),public.create_commercial_meter(text,text,text,text,text),public.record_commercial_usage(uuid,uuid,bigint,text,text,text) from public,anon;
grant execute on function public.set_commercial_entitlement(uuid,text,boolean,bigint,text),public.publish_commercial_version(uuid,text),public.retire_commercial_plan(uuid,text),public.create_commercial_contract(uuid,text,timestamptz,timestamptz,text),public.transition_commercial_contract(uuid,text,text),public.record_commercial_billing(uuid,uuid,text,text,timestamptz,text),public.transition_commercial_billing(uuid,text,text),public.create_commercial_meter(text,text,text,text,text),public.record_commercial_usage(uuid,uuid,bigint,text,text,text) to authenticated;
commit;
