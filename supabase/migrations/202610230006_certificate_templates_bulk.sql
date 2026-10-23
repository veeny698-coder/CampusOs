-- Branded, per-event certificate layouts; no client-writable certificate records.
create table public.certificate_templates (
 event_id uuid primary key references public.events(id) on delete cascade,
 institution_id uuid not null references public.institutions(id) on delete cascade,
 title text not null default 'Certificate of Participation' check(length(title) between 3 and 90),
 subtitle text not null default 'is proudly presented to' check(length(subtitle) between 3 and 160),
 footer text not null default 'Issued by CampusOS' check(length(footer) between 1 and 160),
 primary_color text not null default '#a78bfa' check(primary_color ~ '^#[0-9A-Fa-f]{6}$'),
 background_color text not null default '#151b2f' check(background_color ~ '^#[0-9A-Fa-f]{6}$'),
 text_color text not null default '#ffffff' check(text_color ~ '^#[0-9A-Fa-f]{6}$'),
 name_y integer not null default 49 check(name_y between 20 and 75),
 qr_x integer not null default 86 check(qr_x between 5 and 95),
 qr_y integer not null default 78 check(qr_y between 5 and 95),
 layout text not null default 'classic' check(layout in ('classic','modern','minimal')),
 updated_at timestamptz not null default now(),
 foreign key(event_id,institution_id) references public.events(id,institution_id)
);
alter table public.certificate_templates enable row level security;
revoke all on public.certificate_templates from public,anon,authenticated;
grant select on public.certificate_templates to authenticated;
create policy certificate_templates_owner_read on public.certificate_templates for select to authenticated
using(exists(select 1 from public.platform_owners p where p.user_id=(select auth.uid())));

create or replace function public.save_certificate_template(
 p_event_id uuid,p_title text,p_subtitle text,p_footer text,p_primary text,p_background text,p_text text,
 p_name_y integer,p_qr_x integer,p_qr_y integer,p_layout text
) returns void language plpgsql security definer set search_path='' as $$
declare v_actor uuid;v_institution uuid;
begin
 v_actor:=(select auth.uid());
 if v_actor is null or not exists(select 1 from public.platform_owners where user_id=v_actor)
 then raise exception 'Not authorized' using errcode='42501'; end if;
 select institution_id into v_institution from public.events where id=p_event_id;
 if v_institution is null then raise exception 'Event not found' using errcode='22023'; end if;
 insert into public.certificate_templates(event_id,institution_id,title,subtitle,footer,primary_color,background_color,text_color,name_y,qr_x,qr_y,layout,updated_at)
 values(p_event_id,v_institution,p_title,p_subtitle,p_footer,p_primary,p_background,p_text,p_name_y,p_qr_x,p_qr_y,p_layout,now())
 on conflict(event_id) do update set
 title=excluded.title,subtitle=excluded.subtitle,footer=excluded.footer,primary_color=excluded.primary_color,
 background_color=excluded.background_color,text_color=excluded.text_color,name_y=excluded.name_y,
 qr_x=excluded.qr_x,qr_y=excluded.qr_y,layout=excluded.layout,updated_at=now();
 insert into public.audit_logs(actor_user_id,action,resource_type,resource_id,details)
 values(v_actor,'certificate.template.updated','event',p_event_id,'{}'::jsonb);
end;
$$;
revoke all on function public.save_certificate_template(uuid,text,text,text,text,text,text,integer,integer,integer,text) from public,anon;
grant execute on function public.save_certificate_template(uuid,text,text,text,text,text,text,integer,integer,integer,text) to authenticated;

create or replace function public.bulk_issue_event_certificates(p_event_id uuid,p_type text default 'participation')
returns integer language plpgsql security definer set search_path='' as $$
declare v_actor uuid;v_issued integer;
begin
 v_actor:=(select auth.uid());
 if v_actor is null or not exists(select 1 from public.platform_owners where user_id=v_actor)
 then raise exception 'Not authorized' using errcode='42501'; end if;
 if p_type not in ('participation','appreciation') then raise exception 'Invalid certificate type' using errcode='22023'; end if;
 if not exists(select 1 from public.events where id=p_event_id) then raise exception 'Event not found' using errcode='22023'; end if;
 if (select count(*) from public.event_registrations where event_id=p_event_id)>1000
 then raise exception 'Bulk issuance limited to 1000 registrations per event' using errcode='22023'; end if;
 insert into public.event_certificates(event_id,institution_id,registration_id,recipient_name,certificate_type,issued_by)
 select r.event_id,r.institution_id,r.id,r.full_name,p_type,v_actor
 from public.event_registrations r where r.event_id=p_event_id
 on conflict(registration_id,certificate_type) do nothing;
 get diagnostics v_issued = row_count;
 insert into public.audit_logs(actor_user_id,action,resource_type,resource_id,details)
 values(v_actor,'certificate.bulk_issued','event',p_event_id,pg_catalog.jsonb_build_object('type',p_type,'new_count',v_issued));
 return v_issued;
end;
$$;
revoke all on function public.bulk_issue_event_certificates(uuid,text) from public,anon;
grant execute on function public.bulk_issue_event_certificates(uuid,text) to authenticated;

-- Public verification reveals only branded presentation fields, not registration PII.
drop function public.verify_event_certificate(uuid);
create function public.verify_event_certificate(p_code uuid)
returns table(recipient_name text,event_name text,certificate_type text,issued_at timestamptz,status text,
 title text,subtitle text,footer text,primary_color text,background_color text,text_color text,
 name_y integer,qr_x integer,qr_y integer,layout text)
language sql security definer set search_path='' stable as $$
 select c.recipient_name,e.title,c.certificate_type,c.issued_at,
 case when c.revoked_at is null then 'valid' else 'revoked' end,
 coalesce(t.title, case when c.certificate_type='appreciation' then 'Certificate of Appreciation' else 'Certificate of Participation' end),
 coalesce(t.subtitle,'is proudly presented to'),coalesce(t.footer,'Issued by CampusOS'),
 coalesce(t.primary_color,'#a78bfa'),coalesce(t.background_color,'#151b2f'),
 coalesce(t.text_color,'#ffffff'),coalesce(t.name_y,49),coalesce(t.qr_x,86),coalesce(t.qr_y,78),
 coalesce(t.layout,'classic')
 from public.event_certificates c
 join public.events e on e.id=c.event_id
 left join public.certificate_templates t on t.event_id=c.event_id
 where c.certificate_code=p_code limit 1;
$$;
revoke all on function public.verify_event_certificate(uuid) from public;
grant execute on function public.verify_event_certificate(uuid) to anon,authenticated;
