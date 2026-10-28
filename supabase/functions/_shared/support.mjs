export function sameSecret(a,b){if(!a||!b||a.length!==b.length)return false;let d=0;for(let i=0;i<a.length;i++)d|=a.charCodeAt(i)^b.charCodeAt(i);return d===0;}
export async function signature(id,secret){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);return Array.from(new Uint8Array(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(id)))).map(b=>b.toString(16).padStart(2,'0')).join('').slice(0,32);}
export async function parentFromReply(message,env){
 if(String(message.chat?.id)!==env.TELEGRAM_CHAT_ID||String(message.from?.id)!==env.TELEGRAM_ADMIN_ID||message.from?.is_bot)return null;
 const reply=message.reply_to_message;if(!reply?.from?.is_bot||String(reply.from.id)!==env.TELEGRAM_BOT_TOKEN.split(':')[0])return null;
 const match=/^BUKI:([0-9a-f-]{36}):([0-9a-f]{32})\n/.exec(reply.text||'');
 if(!match||!sameSecret(match[2],await signature(match[1],env.TELEGRAM_WEBHOOK_SECRET)))return null;
 return match[1];
}
export function makeService(env,fetcher=fetch){
 for(const key of ['SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY','TELEGRAM_BOT_TOKEN','TELEGRAM_CHAT_ID','TELEGRAM_ADMIN_ID','TELEGRAM_WEBHOOK_SECRET'])if(!env[key])throw Error('configuration');
 const json=(data,status=200,headers={})=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store',...headers}});
 async function requestJSON(url,options){const r=await fetcher(url,{...options,signal:AbortSignal.timeout(12000)});if(!r.ok)throw Error('upstream');return r.json();}
 async function rpc(name,data={},jwt=null){return requestJSON(env.SUPABASE_URL+'/rest/v1/rpc/'+name,{method:'POST',headers:{apikey:env.SUPABASE_SERVICE_ROLE_KEY,Authorization:'Bearer '+(jwt||env.SUPABASE_SERVICE_ROLE_KEY),'Content-Type':'application/json'},body:JSON.stringify(data)});}
 async function telegram(method,data){const j=await requestJSON('https://api.telegram.org/bot'+env.TELEGRAM_BOT_TOKEN+'/'+method,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});if(!j.ok)throw Error('telegram');return j.result;}
 async function readBody(req){const raw=await req.text();if(raw.length>16000)throw Error('size');return JSON.parse(raw);}
 const cors=req=>{const origin=req.headers.get('Origin');const allowed=(env.SUPPORT_ALLOWED_ORIGINS||'https://bukiplatform-sys.github.io').split(',').map(x=>x.trim());return origin&&allowed.includes(origin)?{'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'authorization, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS','Vary':'Origin'}:{};};
 async function worker(req){const headers=cors(req);if(req.method==='OPTIONS')return new Response(null,{status:204,headers});if(req.method!=='POST')return json({error:'method'},405,headers);
  try{
   let owner=null;
   if(!sameSecret(req.headers.get('x-buki-worker-secret'),env.SUPPORT_WORKER_SECRET)){
    const jwt=req.headers.get('Authorization')?.replace(/^Bearer /i,'');if(!jwt)return json({error:'auth'},401,headers);
    let user;try{user=await requestJSON(env.SUPABASE_URL+'/auth/v1/user',{headers:{apikey:env.SUPABASE_SERVICE_ROLE_KEY,Authorization:'Bearer '+jwt}});if(!user.id||await rpc('has_access',{},jwt)!==true)throw Error();}catch{return json({error:'auth'},401,headers);}owner=user.id;
   }
   const messages=await rpc('buki_support_claim',{owner_id:owner});let sent=0;
   for(const m of messages){let delivered=false,tg=null;try{
    const tag='BUKI:'+m.id+':'+await signature(m.id,env.TELEGRAM_WEBHOOK_SECRET);
    const text=tag+'\n'+String(m.nick).slice(0,40)+' · '+String(m.title).slice(0,80)+'\n\n'+m.body+'\n\n↩ Bu mesaja Yanıtla ile cevap ver.';
    tg=await telegram('sendMessage',{chat_id:env.TELEGRAM_CHAT_ID,text,protect_content:true,link_preview_options:{is_disabled:true}});delivered=true;sent++;
   }catch{/* Leave only state, never message text or tokens, in failure records. */}
   try{await rpc('buki_support_finish',{message_id:m.id,claim_id:m.claim,success:delivered,chat:delivered?Number(env.TELEGRAM_CHAT_ID):null,tg_message:tg?.message_id||null});}catch{/* Lease expires; retry may produce a duplicate Telegram notification. */}
   }
   return json({ok:true,sent},200,headers);
  }catch{return json({error:'delivery_unavailable'},503,headers);}
 }
 async function webhook(req){if(req.method!=='POST')return json({error:'method'},405);if(!sameSecret(req.headers.get('X-Telegram-Bot-Api-Secret-Token'),env.TELEGRAM_WEBHOOK_SECRET))return json({error:'auth'},401);
  try{const update=await readBody(req),m=update.message;if(!m)return json({ok:true});
   const parent=await parentFromReply(m,env);if(!parent)return json({ok:true});
   if(typeof m.text!=='string'||!m.text.trim()||m.text.trim().length>2000||!Number.isSafeInteger(m.message_id)||!Number.isSafeInteger(m.date)){
    await telegram('sendMessage',{chat_id:env.TELEGRAM_CHAT_ID,text:'Bu cevap siteye aktarılmadı. Yalnızca 1–2000 karakterlik metin gönderebilirsin.',protect_content:true});return json({ok:true});
   }
   const result=await rpc('buki_support_reply',{parent_id:parent,reply_body:m.text,chat:Number(env.TELEGRAM_CHAT_ID),tg_message:m.message_id,sent_at:new Date(m.date*1000).toISOString()});
   if(!result.ok)await telegram('sendMessage',{chat_id:env.TELEGRAM_CHAT_ID,text:'Bu cevap siteye aktarılmadı: ilgili öğrenci mesajı bulunamadı.',protect_content:true});
   return json({ok:true});
  }catch{return json({error:'temporary'},503);}
 }
 return {worker,webhook};
}
