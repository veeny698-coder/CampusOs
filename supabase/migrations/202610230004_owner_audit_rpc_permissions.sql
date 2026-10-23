-- The platform-owner RPCs write private audit logs. Authenticated clients intentionally
-- have no audit_logs INSERT grant. Run the already owner-checked RPC bodies as
-- database owner while retaining their explicit auth.uid() authorization checks.
-- Do not grant direct audit log writes to browser clients.
alter function public.create_event_draft(uuid,text) security definer;
alter function public.set_event_publication(uuid,boolean) security definer;
alter function public.check_in_event_ticket(uuid) security definer;

revoke all on function public.create_event_draft(uuid,text) from public,anon;
revoke all on function public.set_event_publication(uuid,boolean) from public,anon;
revoke all on function public.check_in_event_ticket(uuid) from public,anon;
grant execute on function public.create_event_draft(uuid,text) to authenticated;
grant execute on function public.set_event_publication(uuid,boolean) to authenticated;
grant execute on function public.check_in_event_ticket(uuid) to authenticated;
