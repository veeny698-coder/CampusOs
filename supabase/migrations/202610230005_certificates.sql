-- CertiFrenzy-inspired certificate issuance on CampusOS's existing Supabase tenancy.
-- Certificates are only issued to existing event registrations by verified platform owners.
create table public.event_certificates (
 id uuid primary key default gen_random_uuid(),
 certificate_code uuid not null default gen_random_uuid() unique,
 event_id uuid not null references public.events(id) on delete cascade,
 institution_id uuid not null references public.institutions(id) on delete cascade,
 registration_id uuid not null references public.event_registrations(id) on delete cascade,
 recipient_name text not null,
 certificate_type text not null default 'participation' check (certificate_type in ('participation','appreciation')),
 issued_by uuid not null references auth.users(id),
 issued_at timestamptz not null default now(),
 revoked_at timestamptz,
 unique(registration_id,certificate_type),
 foreign key(event_id,institution_id) references public.events(id,institution_id)
);
create index event_certificates_event_idx on public.event_certificates(institution_id,event_id);
alter table public.event_certificates enable row level security;
revoke all on public.event_certificates from public,anon,authenticated;
grant select on public.event_certificates to authenticated;
create policy event_certificates_owner_read on public.event_certificates
 for select to authenticated
 using (exists(select 1 from public.platform_owners p where p.user_id=(select auth.uid())));

-- Restrict anonymous verification to non-sensitive fields and only known codes.
create or replace function public.verify_event_certificate(p_code uuid)
returns table(recipient_name text,event_name text,certificate_type text,issued_at timestamptz,status text)
language sql security definer set search_path='' stable as $$
 select c.recipient_name,e.title,c.certificate_type,c.issued_at,
        case when c.revoked_at is null then 'valid' else 'revoked' end
 from public.event_certificates c join public.events e on e.id=c.event_id
 where c.certificate_code=p_code
 limit 1;
$$;
revoke all on function public.verify_event_certificate(uuid) from public;
grant execute on function public.verify_event_certificate(uuid) to anon,authenticated;

create or replace function public.issue_event_certificate(p_registration_id uuid,p_type text default 'participation')
returns uuid language plpgsql security definer set search_path='' as $$
declare v_actor uuid;v_registration public.event_registrations%rowtype;v_code uuid;v_certificate uuid;
begin
 v_actor := (select auth.uid());
 if v_actor is null or not exists(select 1 from public.platform_owners p where p.user_id=v_actor)
 then raise exception 'Not authorized' using errcode='42501'; end if;
 if p_type not in ('participation','appreciation') then raise exception 'Invalid certificate type' using errcode='22023'; end if;
 select * into v_registration from public.event_registrations where id=p_registration_id;
 if not found then raise exception 'Registration not found' using errcode='22023'; end if;
 insert into public.event_certificates(event_id,institution_id,registration_id,recipient_name,certificate_type,issued_by)
 values(v_registration.event_id,v_registration.institution_id,v_registration.id,v_registration.full_name,p_type,v_actor)
 on conflict(registration_id,certificate_type) do update set recipient_name=excluded.recipient_name
 returning certificate_code,id into v_code,v_certificate;
 insert into public.audit_logs(actor_user_id,action,resource_type,resource_id,details)
 values(v_actor,'certificate.issued','event_certificate',v_certificate,
 pg_catalog.jsonb_build_object('event_id',v_registration.event_id,'type',p_type));
 return v_code;
end;
$$;
revoke all on function public.issue_event_certificate(uuid,text) from public,anon;
grant execute on function public.issue_event_certificate(uuid,text) to authenticated;
