-- Owner-only event publishing with audit, and public read access to published events.
-- All updates must go through the checked RPC, not broad client update grants.
grant update(status) on public.events to authenticated;
create policy events_platform_owner_update on public.events
 for update to authenticated
 using (exists(select 1 from public.platform_owners p where p.user_id=(select auth.uid())))
 with check (exists(select 1 from public.platform_owners p where p.user_id=(select auth.uid())));

create policy events_public_published_read on public.events
 for select to anon
 using (status='published');

grant select(id,title,status,institution_id,created_at) on public.events to anon;

create or replace function public.set_event_publication(p_event_id uuid,p_publish boolean)
returns void language plpgsql security invoker set search_path='' as $$
declare v_old text; v_new text; v_institution uuid;
begin
 if (select auth.uid()) is null or not exists(select 1 from public.platform_owners where user_id=(select auth.uid()))
 then raise exception 'Not authorized' using errcode='42501'; end if;
 select status,institution_id into v_old,v_institution from public.events where id=p_event_id for update;
 if not found then raise exception 'Event not found' using errcode='22023'; end if;
 if v_old not in ('draft','published') then raise exception 'Only draft or published events can be changed' using errcode='22023'; end if;
 v_new:=case when p_publish then 'published' else 'draft' end;
 if v_old=v_new then return; end if;
 update public.events set status=v_new where id=p_event_id;
 insert into public.audit_logs(actor_user_id,action,resource_type,resource_id,details)
 values((select auth.uid()),case when p_publish then 'event.published' else 'event.unpublished' end,
 'event',p_event_id,pg_catalog.jsonb_build_object('old_status',v_old,'new_status',v_new,'institution_id',v_institution));
end;
$$;
revoke all on function public.set_event_publication(uuid,boolean) from public,anon;
grant execute on function public.set_event_publication(uuid,boolean) to authenticated;
