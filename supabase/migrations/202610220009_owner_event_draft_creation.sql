-- Owner-only draft events. Applied to development Supabase project.
grant insert on public.events to authenticated;
create policy events_platform_owner_insert on public.events for insert to authenticated with check (exists(select 1 from public.platform_owners po where po.user_id=(select auth.uid())));
create or replace function public.create_event_draft(p_institution_id uuid,p_title text)
returns uuid language plpgsql security invoker set search_path='' as $$
declare v_id uuid;v_title text;
begin
 if (select auth.uid()) is null or not exists(select 1 from public.platform_owners where user_id=(select auth.uid())) then raise exception 'Not authorized' using errcode='42501'; end if;
 v_title:=pg_catalog.btrim(p_title);
 if pg_catalog.length(v_title)<3 or pg_catalog.length(v_title)>180 then raise exception 'Invalid event title' using errcode='22023'; end if;
 if not exists(select 1 from public.institutions where id=p_institution_id) then raise exception 'Institution not found' using errcode='22023'; end if;
 insert into public.events(institution_id,title,status) values(p_institution_id,v_title,'draft') returning id into v_id;
 insert into public.audit_logs(actor_user_id,action,resource_type,resource_id,details) values((select auth.uid()),'event.created','event',v_id,pg_catalog.jsonb_build_object('title',v_title,'institution_id',p_institution_id));
 return v_id;
end;
$$;
revoke all on function public.create_event_draft(uuid,text) from public,anon;
grant execute on function public.create_event_draft(uuid,text) to authenticated;
