-- Small authenticated chat pilot. No prompts or answers stored in this table.
create schema if not exists buki_private;
revoke all on schema buki_private from public,anon,authenticated;
create table if not exists buki_private.ai_usage (
 user_id uuid primary key references auth.users(id) on delete cascade,
 minute_at timestamptz not null default now(), minute_count integer not null default 0,
 day_at date not null default current_date, day_count integer not null default 0
);
alter table buki_private.ai_usage enable row level security;
create or replace function public.buki_ai_chat_runtime(p_user uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare usage buki_private.ai_usage; config jsonb;
begin
 if not exists(select 1 from public.keys where user_id=p_user) then raise exception 'access'; end if;
 perform pg_advisory_xact_lock(hashtextextended('buki-ai-chat',0));
 insert into buki_private.ai_usage(user_id) values(p_user) on conflict do nothing;
 select * into usage from buki_private.ai_usage where user_id=p_user for update;
 if usage.minute_at < now()-interval '1 minute' then usage.minute_at:=now(); usage.minute_count:=0; end if;
 if usage.day_at <> current_date then usage.day_at:=current_date; usage.day_count:=0; end if;
 if usage.minute_count>=3 or usage.day_count>=30 or (select coalesce(sum(minute_count),0) from buki_private.ai_usage where minute_at>now()-interval '1 minute')>=20 then raise exception 'rate'; end if;
 update buki_private.ai_usage set minute_at=usage.minute_at,minute_count=usage.minute_count+1,day_at=usage.day_at,day_count=usage.day_count+1 where user_id=p_user;
 select jsonb_object_agg(name,decrypted_secret) into config from vault.decrypted_secrets where name in ('buki_nvidia_api_key','buki_ai_model');
 return config;
end $$;
revoke all on function public.buki_ai_chat_runtime(uuid) from public,anon,authenticated;
grant execute on function public.buki_ai_chat_runtime(uuid) to service_role;
