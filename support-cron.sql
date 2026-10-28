-- Run after support-schema.sql. Supabase Dashboard: enable pg_cron and pg_net.
create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;
-- Create two secrets in Supabase Vault BEFORE this script:
-- buki_support_url = https://YOUR_PROJECT.supabase.co/functions/v1/buki-support
-- buki_support_worker_secret = same random value as SUPPORT_WORKER_SECRET in Edge secrets
do $$ begin
 if not exists(select 1 from vault.decrypted_secrets where name='buki_support_url')
 or not exists(select 1 from vault.decrypted_secrets where name='buki_support_worker_secret') then
 raise exception 'Create buki_support_url and buki_support_worker_secret in Vault first'; end if;
end $$;
select cron.schedule('buki-support-maintenance','* * * * *','select public.buki_support_cleanup();');
select cron.schedule('buki-support-delivery','* * * * *',$job$
 select net.http_post(
  url:=(select decrypted_secret from vault.decrypted_secrets where name='buki_support_url' limit 1),
  headers:=jsonb_build_object('Content-Type','application/json','x-buki-worker-secret',(select decrypted_secret from vault.decrypted_secrets where name='buki_support_worker_secret' limit 1)),
  body:='{}'::jsonb,timeout_milliseconds:=60000)
 where exists(select 1 from public.buki_support_messages where sender='student' and delivery in ('pending','sending') and retry_at<=now() and expires_at>now());
$job$);
