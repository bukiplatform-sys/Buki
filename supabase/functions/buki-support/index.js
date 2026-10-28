import {makeService} from '../_shared/support.mjs';
Deno.serve(req=>{try{return makeService(Deno.env.toObject()).worker(req);}catch{return Response.json({error:'support_setup'},{status:503});}});
