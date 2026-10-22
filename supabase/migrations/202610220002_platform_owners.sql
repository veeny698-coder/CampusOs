-- No public grants: only a trusted server-side provisioning process can assign platform owners.
create table public.platform_owners (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.platform_owners enable row level security;
revoke all on public.platform_owners from anon, authenticated;
grant select on public.platform_owners to authenticated;
create policy platform_owner_self_read on public.platform_owners for select to authenticated using (user_id = (select auth.uid()));
-- Never create INSERT, UPDATE or DELETE policies for end users.
