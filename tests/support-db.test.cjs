const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {PGlite}=require('/tmp/buki-sqltest/node_modules/@electric-sql/pglite');
test('support: owner isolation, idempotence, rate limit, service-only replies and persistent history',async()=>{
const db=new PGlite(),A=crypto.randomUUID(),B=crypto.randomUUID(),id=crypto.randomUUID();
try{
await db.exec(`create role anon;create role authenticated;create role service_role;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to authenticated;grant execute on function auth.uid() to authenticated;create function public.has_access() returns boolean language sql stable as $$select auth.uid() is not null$$;create table public.scores(user_id uuid primary key,nick text);insert into auth.users values('${A}'),('${B}');insert into public.scores values('${A}','Alpha');`);
const sql=fs.readFileSync(path.join(__dirname,'../support-schema.sql'),'utf8');await db.exec(sql);
await db.exec(`select set_config('request.jwt.claim.sub','${A}',false);set role authenticated;`);
const send=async(mid,body,tid=null)=>(await db.query('select buki_support_send($1,$2,$3,$4) as j',[mid,body,tid,'Konu'])).rows[0].j;
const first=await send(id,'Hello');assert.equal((await send(id,'Hello')).thread_id,first.thread_id);
await assert.rejects(()=>send(id,'Different'),/support_conflict/);
await assert.rejects(()=>db.query('select * from buki_support_messages'),/permission denied/);
await assert.rejects(()=>db.query('select buki_support_claim()'),/permission denied/);
await assert.rejects(()=>db.query("select buki_support_reply($1,'injected',1,2,now())",[id]),/permission denied/);
await db.exec(`select set_config('request.jwt.claim.sub','${B}',false)`);
assert.equal((await db.query('select buki_support_list() as j')).rows[0].j.rows.length,0);
await assert.rejects(()=>db.query('select buki_support_list($1)',[first.thread_id]),/support_missing/);
await assert.rejects(()=>send(crypto.randomUUID(),'Cross-account',first.thread_id),/support_missing/);
await assert.rejects(()=>send(id,'Hello'),/support_conflict/);
await db.exec(`select set_config('request.jwt.claim.sub','${A}',false)`);
for(let i=0;i<4;i++)await send(crypto.randomUUID(),'Message '+i,first.thread_id);
await assert.rejects(()=>send(crypto.randomUUID(),'Too many',first.thread_id),/support_rate/);
await db.exec('reset role;set role service_role');
const claimed=(await db.query('select buki_support_claim() as j')).rows[0].j;assert.equal(claimed.length,5);assert.equal((await db.query('select buki_support_claim() as j')).rows[0].j.length,0);
const m=claimed.find(x=>x.id===id);await db.query('select buki_support_finish($1,$2,true,123,234)',[id,m.claim]);
await db.query("select buki_support_reply($1,'Hello back',123,235,now())",[id]);await db.query("select buki_support_reply($1,'Hello back',123,235,now())",[id]);
await db.exec('reset role;set role authenticated');let rows=(await db.query('select buki_support_list($1) as j',[first.thread_id])).rows[0].j.rows;
assert.equal(rows.filter(x=>x.sender==='admin').length,1);assert.equal(rows.find(x=>x.id===id).delivery,'sent');assert.ok(rows.every(x=>!('user_id'in x)&&!('claim'in x)));
await db.exec('reset role');
await db.query("update buki_support_messages set created_at=now()-interval '30 days' where user_id=$1",[A]);
await db.query('select buki_support_cleanup()');
await db.exec('set role authenticated');rows=(await db.query('select buki_support_list($1) as j',[first.thread_id])).rows[0].j.rows;assert.equal(rows.length,6);assert.ok(rows.every(x=>x.expires_at==='infinity'));
await db.exec('reset role;set role service_role');assert.equal((await db.query("select buki_support_reply($1,'Still available',123,236,now()) as j",[id])).rows[0].j.ok,true);
await db.exec('reset role');assert.equal((await db.query('select count(*)::int as n from buki_support_messages')).rows[0].n,7);
await db.exec(sql);await db.exec('set role anon');await assert.rejects(()=>db.query('select buki_support_list()'),/permission denied/);
}finally{await db.close();}
});
