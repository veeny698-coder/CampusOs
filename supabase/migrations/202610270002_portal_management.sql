-- Portal management slice. No table/data deletion; preserves the existing RPC signature.
begin;
create or replace function public.set_portal_assignment(
  p_key text,p_institution uuid,p_user uuid,p_enabled boolean,
  p_organization uuid default null,p_event uuid default null,
  p_expires_at timestamptz default null,p_reason text default null
) returns uuid language plpgsql security definer set search_path='' as $$
declare v_actor uuid:=(select auth.uid()); v_id uuid; v_reason text:=nullif(btrim(p_reason),'');
begin
  if v_actor is null or not exists(select 1 from public.platform_owners where user_id=v_actor) then
    raise exception 'Not authorized' using errcode='42501';
  end if;
  if p_enabled is null or v_reason is null or length(v_reason) not between 3 and 500 then
    raise exception 'A valid action and reason are required' using errcode='22023';
  end if;
  if p_event is not null and p_organization is not null then
    raise exception 'Choose one resource scope' using errcode='22023';
  end if;
  -- Revocation must remain possible after membership removal, module disablement,
  -- tenant suspension, or expiry. No eligibility gates belong in this branch.
  if not p_enabled then
    select id into v_id from public.portal_assignments
    where portal_key=p_key and institution_id=p_institution and user_id=p_user
      and organization_id is not distinct from p_organization and event_id is not distinct from p_event
    for update;
    if v_id is null then raise exception 'Assignment not found' using errcode='22023'; end if;
    update public.portal_assignments set revoked_at=now(),revoked_by=v_actor,reason=v_reason
      where id=v_id and revoked_at is null;
    if found then
      insert into public.audit_logs(actor_user_id,action,resource_type,resource_id,details)
      values(v_actor,'portal.assignment.revoked','portal_assignment',v_id,
        jsonb_build_object('institution_id',p_institution,'reason',v_reason));
    end if;
    return v_id;
  end if;
  if p_key is null or not exists(select 1 from public.portal_catalog where key=p_key and enabled) then
    raise exception 'Portal unavailable' using errcode='22023'; end if;
  if not exists(select 1 from public.institutions where id=p_institution and lifecycle_status='active') then
    raise exception 'Institution unavailable' using errcode='22023'; end if;
  -- Lock the membership to prevent concurrent removal during grant creation.
  perform 1 from public.institution_memberships where institution_id=p_institution and user_id=p_user for share;
  if not found then raise exception 'Current institution membership required' using errcode='42501'; end if;
  if p_event is not null and not exists(select 1 from public.events where id=p_event and institution_id=p_institution) then
    raise exception 'Event institution mismatch' using errcode='22023'; end if;
  if p_organization is not null then
    if not exists(select 1 from public.organizations where id=p_organization and institution_id=p_institution) then
      raise exception 'Organization institution mismatch' using errcode='22023'; end if;
    perform 1 from public.organization_memberships where organization_id=p_organization and user_id=p_user for share;
    if not found then raise exception 'Current organization membership required' using errcode='42501'; end if;
  end if;
  if p_expires_at is not null and (not isfinite(p_expires_at) or p_expires_at<=now()) then
    raise exception 'Expiry must be a finite future timestamp' using errcode='22023'; end if;
  insert into public.portal_assignments(portal_key,institution_id,user_id,organization_id,event_id,assigned_by,starts_at,expires_at,reason)
    values(p_key,p_institution,p_user,p_organization,p_event,v_actor,now(),p_expires_at,v_reason)
    on conflict(portal_key,institution_id,user_id,coalesce(organization_id,'00000000-0000-0000-0000-000000000000'::uuid),coalesce(event_id,'00000000-0000-0000-0000-000000000000'::uuid))
    do update set assigned_by=excluded.assigned_by,starts_at=excluded.starts_at,expires_at=excluded.expires_at,
      revoked_at=null,revoked_by=null,reason=excluded.reason returning id into v_id;
  insert into public.audit_logs(actor_user_id,action,resource_type,resource_id,details)
    values(v_actor,'portal.assignment.granted','portal_assignment',v_id,
      jsonb_build_object('institution_id',p_institution,'portal',p_key,'event_id',p_event,
        'organization_id',p_organization,'user_id',p_user,'expires_at',p_expires_at,'reason',v_reason));
  return v_id;
end;$$;
revoke all on function public.set_portal_assignment(text,uuid,uuid,boolean,uuid,uuid,timestamptz,text) from public,anon;
grant execute on function public.set_portal_assignment(text,uuid,uuid,boolean,uuid,uuid,timestamptz,text) to authenticated;

create or replace function public.portal_management_ready()
returns boolean language sql stable security invoker set search_path='' as $$
  select exists(select 1 from public.platform_owners where user_id=(select auth.uid()));
$$;
revoke all on function public.portal_management_ready() from public,anon;
grant execute on function public.portal_management_ready() to authenticated;
commit;
