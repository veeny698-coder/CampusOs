-- Secure owner-invitation acceptance. This deliberately does not provision an
-- Auth user or send email: the link is handed to the approved delivery channel
-- by a platform owner and can only be accepted by an already verified account.
begin;
alter table public.institution_owner_invitations add column if not exists accepted_at timestamptz;
alter table public.institution_owner_invitations add column if not exists accepted_by uuid references auth.users(id) on delete set null;
create table public.owner_invitation_tokens (
 invitation_id uuid primary key references public.institution_owner_invitations(id) on delete cascade,
 token_hash text not null unique check(token_hash ~ '^[0-9a-f]{64}$')
);
create table public.owner_invitation_attempts (
 user_id uuid primary key references auth.users(id) on delete cascade,
 window_started timestamptz not null,attempts integer not null check(attempts>0)
);
alter table public.owner_invitation_tokens enable row level security;
alter table public.owner_invitation_attempts enable row level security;
revoke all on public.owner_invitation_tokens,public.owner_invitation_attempts from public,anon,authenticated;

create function public.issue_owner_invitation_link(p_invitation uuid,p_expires_at timestamptz,p_reason text)
returns text language plpgsql security definer set search_path='' as $$
declare actor uuid:=(select auth.uid());item public.institution_owner_invitations%rowtype;token text;begin
 if actor is null or not exists(select 1 from public.platform_owners where user_id=actor) then raise exception 'Owner required' using errcode='42501';end if;
 if p_reason is null or length(btrim(p_reason)) not between 3 and 500 or p_expires_at is null or not isfinite(p_expires_at) or p_expires_at<=now() then raise exception 'Valid reason and future expiry required' using errcode='22023';end if;
 select * into item from public.institution_owner_invitations where id=p_invitation for update;
 if not found or item.status not in ('pending','expired') or not exists(select 1 from public.institutions where id=item.institution_id and lifecycle_status='active') then raise exception 'Invitation unavailable' using errcode='22023';end if;
 token:=replace(pg_catalog.gen_random_uuid()::text||pg_catalog.gen_random_uuid()::text,'-','');
 insert into public.owner_invitation_tokens(invitation_id,token_hash) values(p_invitation,pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(token,'UTF8')),'hex'))
 on conflict(invitation_id) do update set token_hash=excluded.token_hash;
 update public.institution_owner_invitations set status='pending',expires_at=p_expires_at where id=p_invitation;
 insert into public.audit_logs(actor_user_id,action,resource_type,resource_id,details)
 values(actor,'institution.owner_invitation.link_rotated','institution_owner_invitation',p_invitation,jsonb_build_object('institution_id',item.institution_id,'reason',btrim(p_reason)));
 return token;
end;$$;

create function public.create_owner_invitation_link(p_institution uuid,p_email text,p_expires_at timestamptz,p_reason text)
returns table(invitation_id uuid,token text) language plpgsql security definer set search_path='' as $$
declare item uuid;begin
 if p_email is null or length(btrim(p_email))>320 or p_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
 or p_expires_at is null or not isfinite(p_expires_at) or p_expires_at<=now() then raise exception 'Invalid invitation' using errcode='22023';end if;
 item:=public.create_institution_owner_invitation(p_institution,p_email,p_expires_at);
 return query select item,public.issue_owner_invitation_link(item,p_expires_at,p_reason);
end;$$;

create function public.revoke_owner_invitation_link(p_invitation uuid,p_reason text)
returns void language plpgsql security definer set search_path='' as $$
declare actor uuid:=(select auth.uid());begin
 if actor is null or not exists(select 1 from public.platform_owners where user_id=actor) then raise exception 'Owner required' using errcode='42501';end if;
 if p_reason is null or length(btrim(p_reason)) not between 3 and 500 then raise exception 'Reason required' using errcode='22023';end if;
 update public.institution_owner_invitations set status='revoked',revoked_at=now(),revoked_by=actor where id=p_invitation and status in ('pending','expired');
 if not found then raise exception 'Invitation unavailable' using errcode='22023';end if;
 delete from public.owner_invitation_tokens where invitation_id=p_invitation;
 insert into public.audit_logs(actor_user_id,action,resource_type,resource_id,details) values(actor,'institution.owner_invitation.revoked','institution_owner_invitation',p_invitation,jsonb_build_object('reason',btrim(p_reason)));
end;$$;

create function public.accept_owner_invitation(p_token text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare actor uuid:=(select auth.uid());attempt_count integer;token_digest text;target uuid;
 item public.institution_owner_invitations%rowtype;verified_email text;begin
 if actor is null then raise exception 'Authentication required' using errcode='42501';end if;
 -- Ten attempts per account per UTC minute. Failures return a generic result,
 -- so the counter commits instead of rolling back with an exception.
 insert into public.owner_invitation_attempts(user_id,window_started,attempts)
 values(actor,date_trunc('minute',clock_timestamp()),1)
 on conflict(user_id) do update set window_started=excluded.window_started,
 attempts=case when public.owner_invitation_attempts.window_started=excluded.window_started then public.owner_invitation_attempts.attempts+1 else 1 end
 returning attempts into attempt_count;
 if attempt_count>10 or p_token is null or p_token !~ '^[0-9a-f]{64}$' then return jsonb_build_object('ok',false);end if;
 select lower(email) into verified_email from auth.users where id=actor and email_confirmed_at is not null and (banned_until is null or banned_until<=now());
 if verified_email is null then return jsonb_build_object('ok',false);end if;
 token_digest:=pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(p_token,'UTF8')),'hex');
 select invitation_id into target from public.owner_invitation_tokens where token_hash=token_digest;
 if target is null then return jsonb_build_object('ok',false);end if;
 select * into item from public.institution_owner_invitations where id=target for update;
 -- Recheck the token after acquiring the invitation lock; a concurrent rotation
 -- must invalidate the old token even if lookup happened before the lock wait.
 if not found or item.status<>'pending' or item.expires_at<=clock_timestamp() or item.email<>verified_email
 or not exists(select 1 from public.owner_invitation_tokens where invitation_id=target and token_hash=token_digest) then return jsonb_build_object('ok',false);end if;
 perform 1 from public.institutions where id=item.institution_id and lifecycle_status='active' for share;
 if not found then return jsonb_build_object('ok',false);end if;
 insert into public.institution_memberships(institution_id,user_id,role) values(item.institution_id,actor,'owner')
 on conflict(institution_id,user_id) do update set role='owner';
 update public.institution_owner_invitations set status='accepted',accepted_at=now(),accepted_by=actor where id=target;
 delete from public.owner_invitation_tokens where invitation_id=target;
 insert into public.audit_logs(actor_user_id,action,resource_type,resource_id,details)
 values(actor,'institution.owner_invitation.accepted','institution_owner_invitation',target,jsonb_build_object('institution_id',item.institution_id));
 return jsonb_build_object('ok',true,'institution_id',item.institution_id);
end;$$;
revoke all on function public.issue_owner_invitation_link(uuid,timestamptz,text),public.create_owner_invitation_link(uuid,text,timestamptz,text),public.revoke_owner_invitation_link(uuid,text),public.accept_owner_invitation(text) from public,anon;
grant execute on function public.issue_owner_invitation_link(uuid,timestamptz,text),public.create_owner_invitation_link(uuid,text,timestamptz,text),public.revoke_owner_invitation_link(uuid,text),public.accept_owner_invitation(text) to authenticated;
commit;
