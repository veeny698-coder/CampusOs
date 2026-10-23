alter table public.event_certificates add column custom_fields jsonb not null default '{}'::jsonb;

create or replace function public.set_certificate_feedback_settings(p_event uuid,p_questions jsonb,p_open boolean)
returns void language plpgsql security definer set search_path='' as $$
declare actor uuid;institution uuid;q jsonb;seen text[]:=array[]::text[];
begin
actor:=(select auth.uid());
if actor is null or not exists(select 1 from public.platform_owners where user_id=actor)
then raise exception 'Not authorized' using errcode='42501';end if;
select institution_id into institution from public.events where id=p_event;
if institution is null then raise exception 'Event not found' using errcode='22023';end if;
if jsonb_typeof(p_questions)<>'array' or jsonb_array_length(p_questions) not between 1 and 15
then raise exception 'Must provide 1 to 15 questions' using errcode='22023';end if;
for q in select value from jsonb_array_elements(p_questions) loop
if coalesce(q->>'id','') !~ '^[a-z][a-z0-9_]{0,39}$'
or length(coalesce(q->>'label','')) not between 2 and 160
or coalesce(q->>'type','') not in ('rating','text','certificate_text')
or q->>'id'=any(seen)
then raise exception 'Invalid or duplicate feedback question' using errcode='22023';end if;
seen:=array_append(seen,q->>'id');
end loop;
insert into public.certificate_templates(event_id,institution_id,feedback_open,feedback_questions)
values(p_event,institution,p_open,p_questions)
on conflict(event_id) do update set feedback_open=excluded.feedback_open,feedback_questions=excluded.feedback_questions;
insert into public.audit_logs(actor_user_id,action,resource_type,resource_id,details)
values(actor,'certificate.feedback.settings','event',p_event,pg_catalog.jsonb_build_object('open',p_open));
end;$$;

create or replace function public.claim_certificate_after_feedback(p_ticket uuid)
returns uuid language plpgsql security definer set search_path='' as $$
declare r public.event_registrations%rowtype;certificate uuid;
questions jsonb;q jsonb;answers jsonb;print_fields jsonb:='{}'::jsonb;value text;
begin
select * into r from public.event_registrations where ticket_token=p_ticket;
if not found then raise exception 'Invalid ticket' using errcode='22023';end if;
if not exists(select 1 from public.events where id=r.event_id and status='published')
then raise exception 'Event unavailable' using errcode='22023';end if;
select f.answers into answers from public.certificate_feedback f where f.registration_id=r.id;
if answers is null then raise exception 'Feedback required' using errcode='42501';end if;
questions:=coalesce((select feedback_questions from public.certificate_templates where event_id=r.event_id),
 '[{"id":"rating","type":"rating"},{"id":"feedback","type":"text"}]'::jsonb);
for q in select item.value from jsonb_array_elements(questions) as item loop
 if q->>'type'='certificate_text' then
  value:=pg_catalog.btrim(coalesce(answers->>(q->>'id'),''));
  if length(value)>160 then value:=left(value,160);end if;
  print_fields:=print_fields||pg_catalog.jsonb_build_object(q->>'id',value);
 end if;
end loop;
insert into public.event_certificates(event_id,institution_id,registration_id,recipient_name,certificate_type,issued_by,custom_fields)
values(r.event_id,r.institution_id,r.id,r.full_name,'participation',null,print_fields)
on conflict(registration_id,certificate_type) do update set
 recipient_name=excluded.recipient_name,custom_fields=excluded.custom_fields
returning certificate_code into certificate;
return certificate;
end;$$;

drop function public.verify_event_certificate(uuid);
create function public.verify_event_certificate(p_code uuid)
returns table(recipient_name text,event_name text,certificate_type text,issued_at timestamptz,status text,
 title text,subtitle text,footer text,primary_color text,background_color text,text_color text,
 name_y integer,qr_x integer,qr_y integer,layout text,image_path text,placeholders jsonb,custom_fields jsonb)
language sql stable security definer set search_path='' as $$
select c.recipient_name,e.title,c.certificate_type,c.issued_at,
case when c.revoked_at is null then 'valid' else 'revoked' end,
coalesce(t.title,case when c.certificate_type='appreciation' then 'Certificate of Appreciation' else 'Certificate of Participation' end),
coalesce(t.subtitle,'is proudly presented to'),coalesce(t.footer,'Issued by CampusOS'),
coalesce(t.primary_color,'#a78bfa'),coalesce(t.background_color,'#151b2f'),coalesce(t.text_color,'#ffffff'),
coalesce(t.name_y,49),coalesce(t.qr_x,86),coalesce(t.qr_y,78),coalesce(t.layout,'classic'),
t.image_path,t.participant_placeholders,c.custom_fields
from public.event_certificates c join public.events e on e.id=c.event_id
left join public.certificate_templates t on t.event_id=c.event_id
where c.certificate_code=p_code limit 1;$$;
revoke all on function public.verify_event_certificate(uuid) from public;
grant execute on function public.verify_event_certificate(uuid) to anon,authenticated;