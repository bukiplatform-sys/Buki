import {makeService} from '../_shared/support.mjs';
import {runtimeLoader} from '../_shared/runtime.mjs';
const config=runtimeLoader(Deno.env.toObject());
Deno.serve(async req=>{try{return await makeService(await config()).webhook(req);}catch{return Response.json({error:'support_setup'},{status:503});}});
