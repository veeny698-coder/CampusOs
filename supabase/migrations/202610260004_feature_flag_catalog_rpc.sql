-- Phase 4 catalog mutation. Kept separate because the foundation migration is
-- already applied to the live project.
create or replace function public.create_feature_flag(p_key text,p_label text,p_description text,p_default_enabled boolean default false)
returns text language plpgsql security definer set search_path='' as $$
declare v_actor uuid;v_key text;v_label text;
begin
 v_actor:=(select auth.uid());v_key:=pg_catalog.lower(pg_catalog.btrim(p_key));v_label:=pg_catalog.btrim(p_label);
 if v_actor is null or not exists(select 1 from public.platform_owners where user_id=v_actor) then raise exception 'Not authorized' using errcode='42501';end if;
 if v_key !~ '^[a-z][a-z0-9_]{2,79}$' or pg_catalog.length(v_label) not between 2 and 120 or pg_catalog.length(coalesce(p_description,''))>1000 then raise exception 'Invalid feature flag' using errcode='22023';end if;
 insert into public.feature_flags(key,label,description,default_enabled,created_by) values(v_key,v_label,coalesce(p_description,''),p_default_enabled,v_actor);
 insert into public.audit_logs(actor_user_id,action,resource_type,resource_id,details) values(v_actor,'feature_flag.created','feature_flag',null,pg_catalog.jsonb_build_object('key',v_key,'default_enabled',p_default_enabled));
 return v_key;
end;$$;
revoke all on function public.create_feature_flag(text,text,text,boolean) from public,anon;
grant execute on function public.create_feature_flag(text,text,text,boolean) to authenticated;
