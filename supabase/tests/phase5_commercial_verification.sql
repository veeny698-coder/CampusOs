-- Read-only post-migration assertions. No production fixture writes.
do $$
declare total integer; begin
 select count(*) into total from pg_tables where schemaname='public' and tablename like 'commercial_%';
 if total<>10 then raise exception 'Expected ten commercial tables, found %',total; end if;
 if exists(select 1 from pg_tables where schemaname='public' and tablename like 'commercial_%' and not rowsecurity) then
   raise exception 'Commercial RLS missing'; end if;
 if exists(select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
   where n.nspname='public' and proname like '%commercial%' and has_function_privilege('anon',p.oid,'EXECUTE')) then
   raise exception 'Unexpected anonymous function privilege'; end if;
 if exists(select 1 from pg_tables where schemaname='public' and tablename like 'commercial_%'
   and (has_table_privilege('authenticated',format('public.%I',tablename),'INSERT')
   or has_table_privilege('authenticated',format('public.%I',tablename),'UPDATE')
   or has_table_privilege('authenticated',format('public.%I',tablename),'DELETE'))) then
   raise exception 'Unexpected direct commercial write privilege'; end if;
end;$$;

-- Must return no rows: event ledger and rollup quantity reconcile.
with ledger as (
 select institution_id,subscription_id,meter_id,sum(quantity) as quantity
 from public.commercial_metering_events group by 1,2,3
), rollup as (
 select institution_id,subscription_id,meter_id,sum(quantity) as quantity
 from public.commercial_usage_rollups group by 1,2,3
)
select coalesce(l.subscription_id,r.subscription_id) as subscription_id,
 coalesce(l.meter_id,r.meter_id) as meter_id,l.quantity as ledger_quantity,r.quantity as rollup_quantity
from ledger l full join rollup r using(institution_id,subscription_id,meter_id)
where coalesce(l.quantity,0)<>coalesce(r.quantity,0);

select p.proname,p.prosecdef,p.proconfig from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public' and p.proname like '%commercial%' order by p.proname;
