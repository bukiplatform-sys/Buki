// Secrets stay in Vault and server memory, never in static site assets.
export function runtimeLoader(base,fetcher=fetch){
 let cached=null,until=0;
 return async function(){
  if(cached&&Date.now()<until)return cached;
  const r=await fetcher(base.SUPABASE_URL+'/rest/v1/rpc/buki_support_runtime',{
   method:'POST',headers:{apikey:base.SUPABASE_SERVICE_ROLE_KEY,Authorization:'Bearer '+base.SUPABASE_SERVICE_ROLE_KEY,'Content-Type':'application/json'},body:'{}',signal:AbortSignal.timeout(10000)
  });
  if(!r.ok)throw Error('configuration');
  const data=await r.json();cached={...base,...data};until=Date.now()+30000;return cached;
 };
}
