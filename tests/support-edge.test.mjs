import test from 'node:test';import assert from 'node:assert/strict';
import {makeService,signature,parentFromReply,sameSecret} from '../supabase/functions/_shared/support.mjs';
const env={SUPABASE_URL:'https://unit.invalid',SUPABASE_SERVICE_ROLE_KEY:'test-service',TELEGRAM_BOT_TOKEN:'123:test-token',TELEGRAM_CHAT_ID:'456',TELEGRAM_ADMIN_ID:'456',TELEGRAM_WEBHOOK_SECRET:'test-webhook-secret',SUPPORT_WORKER_SECRET:'test-worker-secret'};
const id='00000000-0000-4000-8000-000000000001';
test('Telegram routing requires administrator, chat, bot identity and valid signed parent',async()=>{
const m={chat:{id:456},from:{id:456},reply_to_message:{from:{id:123,is_bot:true},text:'BUKI:'+id+':'+await signature(id,env.TELEGRAM_WEBHOOK_SECRET)+'\nMessage'}};
assert.equal(await parentFromReply(m,env),id);assert.equal(await parentFromReply({...m,from:{id:789}},env),null);assert.equal(await parentFromReply({...m,chat:{id:789}},env),null);assert.equal(await parentFromReply({...m,reply_to_message:{...m.reply_to_message,from:{id:999,is_bot:true}}},env),null);assert.equal(await parentFromReply({...m,reply_to_message:{...m.reply_to_message,text:m.reply_to_message.text.replace(id,'00000000-0000-4000-8000-000000000002')}},env),null);assert.equal(sameSecret('',undefined),false);
});
test('Webhook rejects unsigned requests without touching Telegram or database',async()=>{
let calls=0;const service=makeService(env,async()=>{calls++;throw Error();});const r=await service.webhook(new Request('https://unit.invalid',{method:'POST',body:'{}'}));assert.equal(r.status,401);assert.equal(calls,0);
});
test('Forwarding does not require Telegram auto-delete',async()=>{
let calls=[];const service=makeService(env,async(url)=>{calls.push(url);return Response.json([]);});const r=await service.worker(new Request('https://unit.invalid',{method:'POST',headers:{'x-buki-worker-secret':env.SUPPORT_WORKER_SECRET}}));assert.equal(r.status,200);assert.equal(calls.length,1);assert.ok(calls[0].endsWith('buki_support_claim'));
});
test('Worker queues the signed message and acknowledges delivery only after Telegram succeeds',async()=>{
const calls=[];const service=makeService(env,async(url,options)=>{const body=JSON.parse(options.body||'{}');calls.push({url,body});if(url.endsWith('/getChat'))return Response.json({ok:true,result:{message_auto_delete_time:864000}});if(url.endsWith('buki_support_claim'))return Response.json([{id,claim:id,thread_id:id,body:'Student text',nick:'A < B',title:'Question',expires_at:new Date(Date.now()+100000).toISOString()}]);if(url.endsWith('/sendMessage'))return Response.json({ok:true,result:{message_id:42}});return Response.json(null);});
const r=await service.worker(new Request('https://unit.invalid',{method:'POST',headers:{'x-buki-worker-secret':env.SUPPORT_WORKER_SECRET}}));assert.equal(r.status,200);const sent=calls.find(x=>x.url.endsWith('/sendMessage'));assert.ok(sent.body.text.startsWith('BUKI:'+id+':'));assert.equal(sent.body.parse_mode,undefined);assert.equal(sent.body.protect_content,true);assert.equal(calls.at(-1).body.success,true);assert.equal(calls.at(-1).body.tg_message,42);
});
test('Valid Telegram reply is bound to signed parent, not a client-supplied user or conversation',async()=>{
let args;const service=makeService(env,async(url,options)=>{if(url.endsWith('/getChat'))return Response.json({ok:true,result:{message_auto_delete_time:864000}});args=JSON.parse(options.body);return Response.json({ok:true});});
const m={chat:{id:456},from:{id:456},text:'Administrator reply',message_id:99,date:Math.floor(Date.now()/1000),reply_to_message:{from:{id:123,is_bot:true},text:'BUKI:'+id+':'+await signature(id,env.TELEGRAM_WEBHOOK_SECRET)+'\nStudent text'}};
const r=await service.webhook(new Request('https://unit.invalid',{method:'POST',headers:{'X-Telegram-Bot-Api-Secret-Token':env.TELEGRAM_WEBHOOK_SECRET},body:JSON.stringify({message:m})}));assert.equal(r.status,200);assert.equal(args.parent_id,id);assert.equal(args.reply_body,m.text);assert.equal(args.tg_message,99);assert.equal(args.user_id,undefined);
});
