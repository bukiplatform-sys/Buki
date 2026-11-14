import {TASKS,taskPrompt,parseTask} from './tasks.mjs';
export function chatHandler(env,fetcher=fetch){
 const cors={'Access-Control-Allow-Origin':'https://bukiplatform-sys.github.io','Access-Control-Allow-Headers':'authorization,apikey,content-type,x-client-info','Access-Control-Allow-Methods':'POST, OPTIONS','Vary':'Origin','Cache-Control':'no-store'};
 const response=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{...cors,'Content-Type':'application/json'}});
 return async req=>{
  if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
  if(req.method!=='POST')return response({error:'method'},405);
  const authorization=req.headers.get('Authorization')||'';
  if(!authorization.startsWith('Bearer '))return response({error:'auth'},401);
  try{
   const text=await req.text();if(text.length>50000)return response({error:'input'},400);
   let body;try{body=JSON.parse(text);}catch{return response({error:'input'},400);}
   body.task=body.task||'chat';if(!TASKS.includes(body.task))return response({error:'input'},400);
   if(typeof body.message!=='string'||!body.message.trim()||body.message.length>(body.task==='feedback'?16000:1500)||!['A1','A2','B1','B2'].includes(body.level))return response({error:'input'},400);
   const userResult=await fetcher(env.SUPABASE_URL+'/auth/v1/user',{headers:{Authorization:authorization,apikey:env.SUPABASE_ANON_KEY},signal:AbortSignal.timeout(10000)});
   if(!userResult.ok)return response({error:'auth'},401);const user=await userResult.json();if(!user.id)return response({error:'auth'},401);
   const runtime=await fetcher(env.SUPABASE_URL+'/rest/v1/rpc/buki_ai_chat_runtime',{method:'POST',headers:{Authorization:'Bearer '+env.SUPABASE_SERVICE_ROLE_KEY,apikey:env.SUPABASE_SERVICE_ROLE_KEY,'Content-Type':'application/json'},body:JSON.stringify({p_user:user.id}),signal:AbortSignal.timeout(10000)});
   if(!runtime.ok){const detail=await runtime.text();return response({error:detail.includes('rate')?'rate':detail.includes('access')?'access':'unavailable'},detail.includes('rate')?429:403);}
   const config=await runtime.json();if(!config.buki_nvidia_api_key||!config.buki_ai_model)return response({error:'unavailable'},503);
   const history=Array.isArray(body.history)?body.history.slice(-6).filter(x=>x&&['user','assistant'].includes(x.role)&&typeof x.content==='string').map(x=>({role:x.role,content:x.content.slice(0,1500)})):[];
   const result=await fetcher('https://integrate.api.nvidia.com/v1/chat/completions',{method:'POST',headers:{Authorization:'Bearer '+config.buki_nvidia_api_key,'Content-Type':'application/json'},body:JSON.stringify({model:config.buki_ai_model,messages:[{role:'system',content:taskPrompt(body)},...(body.task==='chat'?history:[]),{role:'user',content:body.message}],max_tokens:body.task==='chat'?1400:4500,stream:false}),signal:AbortSignal.timeout(110000)});
   if(!result.ok)return response({error:result.status===429?'rate':'unavailable'},result.status===429?429:503);
   const data=await result.json(),answer=data.choices?.[0]?.message?.content;
   if(typeof answer!=='string'||!answer.trim())return response({error:'unavailable'},503);
   try{return response(parseTask(body.task,answer,body));}catch{return response({error:'invalid_output'},502);}
  }catch{return response({error:'unavailable'},503);}
 };
}
