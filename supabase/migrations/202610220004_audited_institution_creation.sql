create table public.audit_logs (
 id bigint generated always as identity primary key,
 actor_user_id uuid references auth.users(id) on delete set null,
 action text not null,
 resource_type text not null,
 resource_id uuid,
 details jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now()
);
alter table public.audit_logs enable row level security;
revoke all on public.audit_logs from anon,authenticated;
create or replace function public.create_institution(p_name text,p_slug text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_actor uuid;v_id uuid;v_name text;v_slug text;
begin
 v_actor := (select auth.uid());
 if v_actor is null or not exists (select 1 from public.platform_owners where user_id=v_actor) then
  raise exception 'Not authorized' using errcode='42501';
 end if;
 v_name := btrim(p_name);v_slug := lower(btrim(p_slug));
 if length(v_name)<2 or length(v_name)>200 or v_slug !~ '^[a-z0-9][a-z0-9-]{2,62}$' then
  raise exception 'Invalid institution name or slug' using errcode='22023';
 end if;
 insert into public.institutions(name,slug) values(v_name,v_slug) returning id into v_id;
 insert into public.audit_logs(actor_user_id,action,resource_type,resource_id,details)
 values(v_actor,'institution.created','institution',v_id,jsonb_build_object('name',v_name,'slug',v_slug));
 return v_id;
end;
$$;
revoke all on function public.create_institution(text,text) from public,anon;
grant execute on function public.create_institution(text,text) to authenticated;
