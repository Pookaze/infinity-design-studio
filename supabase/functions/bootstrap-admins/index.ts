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
  let secretKey='';
  try{secretKey=JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS')||'{}').default||''}catch{secretKey=''}
  secretKey=secretKey||Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'';
  if(!secretKey)return json(request,{error:'Server administrator key is unavailable'},500);
  const supabaseUrl=Deno.env.get('SUPABASE_URL')!;
  // New Supabase secret keys must be sent only as `apikey`. supabase-js also
  // adds an Authorization Bearer header, which makes Auth reject sb_secret_ keys.
  const adminHeaders={apikey:secretKey,'Content-Type':'application/json'};
  const userListResponse=await fetch(`${supabaseUrl}/auth/v1/admin/users?page=1&per_page=100`,{headers:adminHeaders});
  if(!userListResponse.ok){console.error('setup-state',userListResponse.status,await userListResponse.text());return json(request,{error:'Unable to verify setup state'},500)}
  const userList=await userListResponse.json() as {users?:Array<{email?:string}>};
  const setupEmails=new Set(fixedAccounts.map(account=>account.email));
  if((userList.users||[]).some(user=>setupEmails.has(user.email||'')))return json(request,{error:'Administrator setup is already complete.'},409);
  let body:{passwords?:Record<string,string>};try{body=await request.json()}catch{return json(request,{error:'Invalid JSON'},400)}
  for(const account of fixedAccounts){const password=body.passwords?.[account.username];if(!password||password.length<12)return json(request,{error:`${account.displayName} requires a password of at least 12 characters.`},422)}
  const created:string[]=[];
  try{
    for(const account of fixedAccounts){
      const createResponse=await fetch(`${supabaseUrl}/auth/v1/admin/users`,{method:'POST',headers:adminHeaders,body:JSON.stringify({email:account.email,password:body.passwords![account.username],email_confirm:true,user_metadata:{display_name:account.displayName,username:account.username}})});
      const createPayload=await createResponse.json();
      const user=createPayload.user||createPayload;
      if(!createResponse.ok||!user.id)throw new Error(createPayload.message||createPayload.error_description||`Unable to create ${account.displayName}`);
      created.push(user.id);
      const profileResponse=await fetch(`${supabaseUrl}/rest/v1/admin_users`,{method:'POST',headers:{...adminHeaders,Prefer:'return=minimal'},body:JSON.stringify({user_id:user.id,username:account.username,display_name:account.displayName,role:account.role})});
      if(!profileResponse.ok)throw new Error((await profileResponse.text())||`Unable to save ${account.displayName}`);
    }
    return json(request,{ok:true,accounts:fixedAccounts.map(({username,displayName,role})=>({username,displayName,role}))},201);
  }catch(error){for(const id of created)await fetch(`${supabaseUrl}/auth/v1/admin/users/${id}`,{method:'DELETE',headers:adminHeaders});return json(request,{error:error instanceof Error?error.message:'Setup failed and was rolled back.'},500)}
});
