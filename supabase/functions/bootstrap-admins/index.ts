import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, json } from '../_shared/http.ts';

const fixedAccounts = [
  { username:'owner', displayName:'Owner', role:'owner', email:'owner@cms.infinity.local' },
  { username:'admin-2', displayName:'Admin 2', role:'editor', email:'admin2@cms.infinity.local' },
  { username:'admin-3', displayName:'Admin 3', role:'editor', email:'admin3@cms.infinity.local' }
] as const;

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response(null, { status:204, headers:corsHeaders(request) });
  if (request.method !== 'POST') return json(request, { error:'Method not allowed' }, 405);
  const expected=Deno.env.get('CMS_BOOTSTRAP_SECRET'), supplied=request.headers.get('x-bootstrap-secret');
  if (!expected || !supplied || supplied !== expected) return json(request, { error:'Invalid or expired setup link' }, 401);
  const admin=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false}});
  const {count,error:countError}=await admin.from('admin_users').select('*',{count:'exact',head:true});
  if(countError)return json(request,{error:'Unable to verify setup state'},500);
  if((count||0)>0)return json(request,{error:'Administrator setup is already complete.'},409);
  let body:{passwords?:Record<string,string>};try{body=await request.json()}catch{return json(request,{error:'Invalid JSON'},400)}
  for(const account of fixedAccounts){const password=body.passwords?.[account.username];if(!password||password.length<12)return json(request,{error:`${account.displayName} requires a password of at least 12 characters.`},422)}
  const created:string[]=[];
  try{
    for(const account of fixedAccounts){
      const {data,error}=await admin.auth.admin.createUser({email:account.email,password:body.passwords![account.username],email_confirm:true,user_metadata:{display_name:account.displayName,username:account.username}});
      if(error||!data.user)throw new Error(error?.message||`Unable to create ${account.displayName}`);
      created.push(data.user.id);
      const {error:profileError}=await admin.from('admin_users').insert({user_id:data.user.id,username:account.username,display_name:account.displayName,role:account.role});
      if(profileError)throw profileError;
    }
    return json(request,{ok:true,accounts:fixedAccounts.map(({username,displayName,role})=>({username,displayName,role}))},201);
  }catch(error){for(const id of created)await admin.auth.admin.deleteUser(id);return json(request,{error:error instanceof Error?error.message:'Setup failed and was rolled back.'},500)}
});
