create extension if not exists pgcrypto;
create table public.institutions (id uuid primary key default gen_random_uuid(), name text not null check (length(trim(name)) between 2 and 200), slug text not null unique, created_at timestamptz not null default now());
create table public.institution_memberships (institution_id uuid not null references public.institutions(id) on delete cascade, user_id uuid not null references auth.users(id) on delete cascade, role text not null check (role in ('owner','admin','member')), created_at timestamptz not null default now(), primary key(institution_id,user_id));
create table public.organizations (id uuid primary key default gen_random_uuid(), institution_id uuid not null references public.institutions(id) on delete cascade, name text not null, kind text not null check (kind in ('department','society','committee','club')), created_at timestamptz not null default now(), unique(id,institution_id));
create table public.organization_memberships (organization_id uuid not null references public.organizations(id) on delete cascade, user_id uuid not null references auth.users(id) on delete cascade, role text not null check (role in ('head','faculty','member')), primary key(organization_id,user_id));
create table public.events (id uuid primary key default gen_random_uuid(), institution_id uuid not null references public.institutions(id) on delete cascade, organization_id uuid, parent_event_id uuid, title text not null, status text not null default 'draft' check(status in ('draft','published','completed','cancelled')), created_at timestamptz not null default now(), unique(id,institution_id), foreign key(organization_id,institution_id) references public.organizations(id,institution_id), foreign key(parent_event_id,institution_id) references public.events(id,institution_id));
alter table public.institutions enable row level security;
alter table public.institution_memberships enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_memberships enable row level security;
alter table public.events enable row level security;
create policy institutions_member_read on public.institutions for select to authenticated using (exists(select 1 from public.institution_memberships m where m.institution_id=id and m.user_id=(select auth.uid())));
create policy organizations_member_read on public.organizations for select to authenticated using (exists(select 1 from public.institution_memberships m where m.institution_id=organizations.institution_id and m.user_id=(select auth.uid())));
create policy events_member_read on public.events for select to authenticated using (exists(select 1 from public.institution_memberships m where m.institution_id=events.institution_id and m.user_id=(select auth.uid())));
-- Membership tables intentionally have no client policies until audited security-definer authorization helpers are implemented.
-- No client write policies: privileged writes require separately reviewed server authorization.
