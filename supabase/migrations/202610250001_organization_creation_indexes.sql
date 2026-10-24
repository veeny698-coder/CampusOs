-- Create departments, societies, clubs and committees with tenant-safe audited authority.
create unique index if not exists organizations_unique_name_per_kind
 on public.organizations(institution_id,kind,lower(btrim(name)));
create or replace function public.create_campus_organization(p_institution uuid,p_kind text,p_name text)
returns uuid language plpgsql security definer set search_path='' as $$
declare v_actor uuid;v_id uuid;v_name text;
begin
 v_actor:=(select auth.uid());v_name:=pg_catalog.btrim(p_name);
 if v_actor is null or not exists(select 1 from public.platform_owners where user_id=v_actor)
 then raise exception 'Not authorized' using errcode='42501';end if;
 if p_kind not in ('department','society','committee','club') or
   pg_catalog.length(v_name) not between 2 and 120
 then raise exception 'Invalid organization' using errcode='22023';end if;
 if not exists(select 1 from public.institutions where id=p_institution)
 then raise exception 'Institution not found' using errcode='22023';end if;
 insert into public.organizations(institution_id,name,kind)
 values(p_institution,v_name,p_kind) returning id into v_id;
 insert into public.audit_logs(actor_user_id,action,resource_type,resource_id,details)
 values(v_actor,'organization.created','organization',v_id,
  pg_catalog.jsonb_build_object('institution_id',p_institution,'kind',p_kind));
 return v_id;
end;$$;
revoke all on function public.create_campus_organization(uuid,text,text) from public,anon;
grant execute on function public.create_campus_organization(uuid,text,text) to authenticated;
create index if not exists portal_assignments_user_portal_lookup
 on public.portal_assignments(user_id,portal_key);
create index if not exists organizations_tenant_listing
 on public.organizations(institution_id,created_at desc);