alter table public.certificate_templates
 add column feedback_open boolean not null default true,
 add column feedback_questions jsonb not null default
 '[{"id":"rating","label":"How would you rate this event?","type":"rating","required":true},{"id":"feedback","label":"Share your feedback","type":"text","required":true}]'::jsonb;

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
or coalesce(q->>'type','') not in ('rating','text')
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
revoke all on function public.set_certificate_feedback_settings(uuid,jsonb,boolean) from public,anon;
grant execute on function public.set_certificate_feedback_settings(uuid,jsonb,boolean) to authenticated;

drop function public.get_certificate_feedback_event(uuid);
create function public.get_certificate_feedback_event(p_ticket uuid)
returns table(event_title text,participant_name text,already_submitted boolean,feedback_open boolean,feedback_questions jsonb)
language sql stable security definer set search_path='' as $$
select e.title,r.full_name,exists(select 1 from public.certificate_feedback f where f.registration_id=r.id),
coalesce(t.feedback_open,true),coalesce(t.feedback_questions,'[{"id":"rating","label":"How would you rate this event?","type":"rating","required":true},{"id":"feedback","label":"Share your feedback","type":"text","required":true}]'::jsonb)
from public.event_registrations r join public.events e on e.id=r.event_id
left join public.certificate_templates t on t.event_id=r.event_id
where r.ticket_token=p_ticket and e.status='published' limit 1;$$;
revoke all on function public.get_certificate_feedback_event(uuid) from public;
grant execute on function public.get_certificate_feedback_event(uuid) to anon,authenticated;

create or replace function public.submit_certificate_feedback(p_ticket uuid,p_answers jsonb)
returns uuid language plpgsql security definer set search_path='' as $$
declare r public.event_registrations%rowtype;qs jsonb;q jsonb;answer text;fid uuid;
begin
select * into r from public.event_registrations where ticket_token=p_ticket;
if not found then raise exception 'Ticket not found' using errcode='22023';end if;
if not exists(select 1 from public.events e where e.id=r.event_id and e.status='published')
then raise exception 'Event unavailable' using errcode='22023';end if;
if coalesce((select not feedback_open from public.certificate_templates where event_id=r.event_id),false)
then raise exception 'Feedback is closed' using errcode='42501';end if;
qs:=coalesce((select feedback_questions from public.certificate_templates where event_id=r.event_id),
'[{"id":"rating","label":"How would you rate this event?","type":"rating","required":true},{"id":"feedback","label":"Share your feedback","type":"text","required":true}]'::jsonb);
if jsonb_typeof(p_answers)<>'object' or length(p_answers::text)>16000
then raise exception 'Invalid answers' using errcode='22023';end if;
for q in select value from jsonb_array_elements(qs) loop
answer:=pg_catalog.btrim(coalesce(p_answers->>(q->>'id'),''));
if coalesce((q->>'required')::boolean,false) and answer=''
then raise exception 'Required answer missing' using errcode='22023';end if;
if q->>'type'='rating' and answer<>'' and answer not in ('1','2','3','4','5')
then raise exception 'Invalid rating' using errcode='22023';end if;
if length(answer)>2000 then raise exception 'Answer too long' using errcode='22023';end if;
end loop;
insert into public.certificate_feedback(registration_id,event_id,answers)
values(r.id,r.event_id,p_answers)
on conflict(registration_id) do update set answers=excluded.answers,submitted_at=now()
returning id into fid;
return fid;
end;$$;