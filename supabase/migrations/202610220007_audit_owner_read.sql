grant select on public.audit_logs to authenticated;
create policy audit_logs_platform_owner_read on public.audit_logs
 for select to authenticated
 using (exists (select 1 from public.platform_owners p where p.user_id = (select auth.uid())));
