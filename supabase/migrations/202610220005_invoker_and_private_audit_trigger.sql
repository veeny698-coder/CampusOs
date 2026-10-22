-- Use an invoker RPC with RLS, and an inaccessible private audit trigger.
create schema if not exists private;
revoke all on schema private from public,anon,authenticated;
grant insert on public.institutions to authenticated;
create policy institutions_platform_owner_insert on public.institutions
for insert to authenticated with check (
 exists(select 1 from public.platform_owners p where p.user_id=(select auth.uid()))
);
create or replace function private.audit_institution_created()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_actor uuid;
begin
 v_actor := (select auth.uid());
 if v_actor is null then raise exception 'Missing actor' using errcode='42501'; end if;
 insert into public.audit_logs(actor_user_id,action,resource_type,resource_id,details)
 values(v_actor,'institution.created','institution',new.id,pg_catalog.jsonb_build_object('name',new.name,'slug',new.slug));
 return new;
end;
$$;
revoke all on function private.audit_institution_created() from public,anon,authenticated;
create trigger audit_institution_creation after insert on public.institutions
for each row execute function private.audit_institution_created();
create or replace function public.create_institution(p_name text,p_slug text)
returns uuid language plpgsql security invoker set search_path = '' as $$
declare v_actor uuid;v_id uuid;v_name text;v_slug text;
begin
 v_actor := (select auth.uid());
 if v_actor is null or not exists (select 1 from public.platform_owners where user_id=v_actor) then
  raise exception 'Not authorized' using errcode='42501';
 end if;
 v_name := pg_catalog.btrim(p_name);v_slug := pg_catalog.lower(pg_catalog.btrim(p_slug));
 if pg_catalog.length(v_name)<2 or pg_catalog.length(v_name)>200 or v_slug !~ '^[a-z0-9][a-z0-9-]{2,62}$' then
  raise exception 'Invalid institution name or slug' using errcode='22023';
 end if;
 insert into public.institutions(name,slug) values(v_name,v_slug) returning id into v_id;
 return v_id;
end;
$$;
