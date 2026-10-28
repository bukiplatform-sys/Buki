-- Runtime settings are returned only to the trusted Edge Functions service role.
create or replace function public.buki_support_runtime() returns jsonb
language sql security definer set search_path='' as $$
 select coalesce(jsonb_object_agg(
  case name
   when 'buki_support_bot_token' then 'TELEGRAM_BOT_TOKEN'
   when 'buki_support_webhook_secret' then 'TELEGRAM_WEBHOOK_SECRET'
   when 'buki_support_worker_secret' then 'SUPPORT_WORKER_SECRET'
   when 'buki_support_chat_id' then 'TELEGRAM_CHAT_ID'
   when 'buki_support_admin_id' then 'TELEGRAM_ADMIN_ID'
  end,decrypted_secret),'{}'::jsonb)
 from vault.decrypted_secrets
 where name in ('buki_support_bot_token','buki_support_webhook_secret','buki_support_worker_secret','buki_support_chat_id','buki_support_admin_id');
$$;
revoke all on function public.buki_support_runtime() from public,anon,authenticated;
grant execute on function public.buki_support_runtime() to service_role;
