-- Buki support: install after existing Buki account/access setup.
begin;
create table if not exists public.buki_support_threads (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 title text not null check(char_length(title) between 1 and 80), created_at timestamptz not null default now()
);
create table if not exists public.buki_support_messages (
 id uuid primary key, thread_id uuid not null references public.buki_support_threads(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 sender text not null check(sender in ('student','admin')), body text not null check(char_length(body) between 1 and 2000),
 created_at timestamptz not null default now(), expires_at timestamptz not null default 'infinity'::timestamptz,
 delivery text not null default 'pending' check(delivery in ('pending','sending','sent','failed')),
 attempts integer not null default 0, retry_at timestamptz not null default now(), claim uuid,
 telegram_chat bigint, telegram_message bigint, unique(telegram_chat,telegram_message),
 check(expires_at='infinity'::timestamptz)
);
create index if not exists buki_support_owner on public.buki_support_messages(user_id,created_at desc);
create index if not exists buki_support_thread on public.buki_support_messages(thread_id,created_at,id);
create index if not exists buki_support_expiry on public.buki_support_messages(expires_at);
create index if not exists buki_support_outbox on public.buki_support_messages(retry_at) where sender='student' and delivery in ('pending','sending');
alter table public.buki_support_threads enable row level security;
alter table public.buki_support_messages enable row level security;
revoke all on public.buki_support_threads,public.buki_support_messages from public,anon,authenticated;
-- All client access uses checked RPCs; no direct table access or Realtime payloads.
create or replace function public.buki_support_send(message_id uuid,message_body text,conversation_id uuid default null,subject text default 'Destek') returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare u uuid:=auth.uid(); t uuid; existing public.buki_support_messages; b text:=btrim(message_body);
begin
 if u is null or not public.has_access() then raise exception 'support_auth'; end if;
 if message_id is null or b is null or char_length(b) not between 1 and 2000 then raise exception 'support_invalid'; end if;
 perform pg_advisory_xact_lock(hashtextextended(u::text,7341));
 select * into existing from public.buki_support_messages where id=message_id;
 if found then
  if existing.user_id<>u or existing.sender<>'student' or existing.body<>b or existing.expires_at<=now() then raise exception 'support_conflict'; end if;
  return jsonb_build_object('id',existing.id,'thread_id',existing.thread_id,'delivery',existing.delivery);
 end if;
 if (select count(*) from public.buki_support_messages where user_id=u and sender='student' and created_at>now()-interval '1 minute')>=5
 or (select count(*) from public.buki_support_messages where user_id=u and sender='student' and created_at>now()-interval '1 day')>=50 then raise exception 'support_rate'; end if;
 if conversation_id is null then
  insert into public.buki_support_threads(user_id,title) values(u,left(coalesce(nullif(btrim(subject),''),'Destek'),80)) returning id into t;
 else
  select id into t from public.buki_support_threads where id=conversation_id and user_id=u for update;
  if t is null then raise exception 'support_missing'; end if;
 end if;
 insert into public.buki_support_messages(id,thread_id,user_id,sender,body) values(message_id,t,u,'student',b);
 return jsonb_build_object('id',message_id,'thread_id',t,'delivery','pending');
end $$;
create or replace function public.buki_support_list(conversation_id uuid default null,before_time timestamptz default null,before_id uuid default null) returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare u uuid:=auth.uid(); result jsonb;
begin
 if u is null or not public.has_access() then raise exception 'support_auth'; end if;
 if conversation_id is null then
  select coalesce(jsonb_agg(to_jsonb(x) order by x.last_at desc),'[]'::jsonb) into result from (
   select t.id,t.title,max(m.created_at) as last_at,count(*) as messages from public.buki_support_threads t
   join public.buki_support_messages m on m.thread_id=t.id and m.expires_at>now()
   where t.user_id=u group by t.id,t.title order by last_at desc limit 500
  ) x;
 else
  if not exists(select 1 from public.buki_support_threads where id=conversation_id and user_id=u) then raise exception 'support_missing'; end if;
  select coalesce(jsonb_agg(to_jsonb(x) order by x.created_at,x.id),'[]'::jsonb) into result from (
   select id,sender,body,created_at,expires_at,delivery from public.buki_support_messages
   where thread_id=conversation_id and user_id=u and expires_at>now()
   and (before_time is null or (created_at,id)<(before_time,coalesce(before_id,'ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid)))
   order by created_at desc,id desc limit 50
  ) x;
 end if;
 return jsonb_build_object('rows',result,'server_now',now());
end $$;
create or replace function public.buki_support_retry(message_id uuid) returns void
language plpgsql security definer set search_path=public,pg_temp as $$
declare u uuid:=auth.uid();
begin
 if u is null or not public.has_access() then raise exception 'support_auth'; end if;
 update public.buki_support_messages set delivery='pending',attempts=0,retry_at=now(),claim=null
 where id=message_id and user_id=u and sender='student' and delivery='failed' and expires_at>now() and retry_at<now()-interval '1 minute';
end $$;
create or replace function public.buki_support_claim(owner_id uuid default null) returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare result jsonb;
begin
 with picked as (select id from public.buki_support_messages where sender='student' and expires_at>now()
  and delivery in ('pending','sending') and retry_at<=now() and attempts<6 and (owner_id is null or user_id=owner_id)
  order by created_at for update skip locked limit 5),
 changed as (update public.buki_support_messages m set delivery='sending',attempts=m.attempts+1,claim=gen_random_uuid(),retry_at=now()+interval '3 minutes'
 from picked where m.id=picked.id returning m.*)
 select coalesce(jsonb_agg(jsonb_build_object('id',c.id,'thread_id',c.thread_id,'body',c.body,'claim',c.claim,'expires_at',c.expires_at,
 'title',t.title,'nick',coalesce(s.nick,'Öğrenci'))),'[]'::jsonb) into result from changed c
 join public.buki_support_threads t on t.id=c.thread_id left join public.scores s on s.user_id=c.user_id;
 return result;
end $$;
create or replace function public.buki_support_finish(message_id uuid,claim_id uuid,success boolean,chat bigint default null,tg_message bigint default null) returns void
language plpgsql security definer set search_path=public,pg_temp as $$
begin
 update public.buki_support_messages set delivery=case when success then 'sent' when attempts>=6 then 'failed' else 'pending' end,
 telegram_chat=case when success then chat else null end,telegram_message=case when success then tg_message else null end,
 retry_at=now()+make_interval(secs=>least(1800,30*(2^attempts)::integer)),claim=null
 where id=message_id and claim=claim_id and expires_at>now();
end $$;
create or replace function public.buki_support_reply(parent_id uuid,reply_body text,chat bigint,tg_message bigint,sent_at timestamptz) returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare parent public.buki_support_messages; newid uuid:=gen_random_uuid();
begin
 if sent_at>now()+interval '5 minutes' or char_length(btrim(reply_body)) not between 1 and 2000 then return jsonb_build_object('ok',false); end if;
 select * into parent from public.buki_support_messages where id=parent_id and expires_at>now() and sender='student' for share;
 if not found then return jsonb_build_object('ok',false,'reason','expired'); end if;
 insert into public.buki_support_messages(id,thread_id,user_id,sender,body,created_at,expires_at,delivery,telegram_chat,telegram_message)
 values(newid,parent.thread_id,parent.user_id,'admin',btrim(reply_body),sent_at,'infinity'::timestamptz,'sent',chat,tg_message)
 on conflict(telegram_chat,telegram_message) do nothing;
 return jsonb_build_object('ok',true);
end $$;
create or replace function public.buki_support_cleanup() returns void
language plpgsql security definer set search_path=public,pg_temp as $$
begin
 update public.buki_support_messages set delivery='failed',claim=null where delivery='sending' and attempts>=6 and retry_at<now();
end $$;
revoke all on function public.buki_support_send(uuid,text,uuid,text),public.buki_support_list(uuid,timestamptz,uuid),public.buki_support_retry(uuid) from public,anon;
grant execute on function public.buki_support_send(uuid,text,uuid,text),public.buki_support_list(uuid,timestamptz,uuid),public.buki_support_retry(uuid) to authenticated;
revoke all on function public.buki_support_claim(uuid),public.buki_support_finish(uuid,uuid,boolean,bigint,bigint),public.buki_support_reply(uuid,text,bigint,bigint,timestamptz),public.buki_support_cleanup() from public,anon,authenticated;
grant execute on function public.buki_support_claim(uuid),public.buki_support_finish(uuid,uuid,boolean,bigint,bigint),public.buki_support_reply(uuid,text,bigint,bigint,timestamptz),public.buki_support_cleanup() to service_role;
commit;
