const ownerUsername = 'owner';

function corsHeaders(request:Request) {
  const allowed=(Deno.env.get('ALLOWED_ADMIN_ORIGIN')||'').split(',').map(value=>value.trim()).filter(Boolean);
  const origin=request.headers.get('origin')||'';
  return {
    'Access-Control-Allow-Origin':allowed.includes(origin)?origin:allowed[0]||'null',
    'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods':'POST, OPTIONS',
    'Vary':'Origin','Content-Type':'application/json; charset=utf-8'
  };
}
function json(request:Request,body:unknown,status=200){return new Response(JSON.stringify(body),{status,headers:corsHeaders(request)});}
function strongPassword(value:string){return value.length>=12&&/[A-Z]/.test(value)&&/[a-z]/.test(value)&&/\d/.test(value);}
function validEmail(value:string){return /^\S+@\S+\.\S+$/.test(value);}
function validUsername(value:string){return /^[a-z0-9][a-z0-9-]{2,31}$/.test(value);}

Deno.serve(async request=>{
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:corsHeaders(request)});
  if(request.method!=='POST')return json(request,{error:'Method not allowed'},405);

  const authorization=request.headers.get('authorization')||'';
  if(!authorization.startsWith('Bearer '))return json(request,{error:'Unauthorized'},401);
  let secretKey='';
  try{secretKey=JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS')||'{}').default||'';}catch{secretKey='';}
  secretKey=secretKey||Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'';
  const supabaseUrl=Deno.env.get('SUPABASE_URL')||'';
  const anonKey=Deno.env.get('SUPABASE_ANON_KEY')||'';
  if(!secretKey||!supabaseUrl||!anonKey)return json(request,{error:'Administrator service unavailable'},500);

  const adminHeaders={apikey:secretKey,'Content-Type':'application/json'};
  const userResponse=await fetch(`${supabaseUrl}/auth/v1/user`,{headers:{apikey:anonKey,Authorization:authorization}});
  if(!userResponse.ok)return json(request,{error:'Unauthorized'},401);
  const caller=await userResponse.json() as {id:string,email?:string};
  const profileResponse=await fetch(`${supabaseUrl}/rest/v1/admin_users?user_id=eq.${caller.id}&select=*`,{headers:adminHeaders});
  const profiles=profileResponse.ok?await profileResponse.json() as Array<Record<string,unknown>>:[];
  const callerProfile=profiles[0];
  if(!callerProfile||callerProfile.is_active!==true)return json(request,{error:'Administrator access disabled'},403);

  let body:Record<string,unknown>={};
  try{body=await request.json();}catch{return json(request,{error:'Invalid request'},400);}
  const action=String(body.action||'list');

  if(action==='session'){
    const forwarded=(request.headers.get('cf-connecting-ip')||request.headers.get('x-forwarded-for')||'').split(',')[0].trim();
    const safeIp=/^[0-9a-f:.]{3,45}$/i.test(forwarded)?forwarded:null;
    await fetch(`${supabaseUrl}/rest/v1/admin_users?user_id=eq.${caller.id}`,{method:'PATCH',headers:{...adminHeaders,Prefer:'return=minimal'},body:JSON.stringify({last_login_at:new Date().toISOString(),last_ip:safeIp})});
    await fetch(`${supabaseUrl}/rest/v1/activity_logs`,{method:'POST',headers:{...adminHeaders,Prefer:'return=minimal'},body:JSON.stringify({actor_id:caller.id,action:'login',entity_table:'admin_users',entity_id:caller.id,metadata:{source:'cms'}})});
    return json(request,{ok:true});
  }

  if(callerProfile.role!=='owner')return json(request,{error:'Owner access required'},403);

  if(action==='list'){
    const [allProfilesResponse,authUsersResponse,logsResponse]=await Promise.all([
      fetch(`${supabaseUrl}/rest/v1/admin_users?select=*&order=created_at.asc`,{headers:adminHeaders}),
      fetch(`${supabaseUrl}/auth/v1/admin/users?page=1&per_page=100`,{headers:adminHeaders}),
      fetch(`${supabaseUrl}/rest/v1/activity_logs?select=id,actor_id,action,entity_table,metadata,created_at&order=created_at.desc&limit=300`,{headers:adminHeaders})
    ]);
    if(!allProfilesResponse.ok||!authUsersResponse.ok||!logsResponse.ok)return json(request,{error:'Unable to load administrator records'},500);
    const allProfiles=await allProfilesResponse.json() as Array<Record<string,unknown>>;
    const authPayload=await authUsersResponse.json() as {users?:Array<Record<string,unknown>>};
    const logs=await logsResponse.json() as Array<Record<string,unknown>>;
    const authById=new Map((authPayload.users||[]).map(user=>[user.id,user]));
    return json(request,{users:allProfiles.map(profile=>{
      const auth=authById.get(profile.user_id) as Record<string,unknown>|undefined;
      return {...profile,email:auth?.email||profile.email,last_sign_in_at:auth?.last_sign_in_at||profile.last_login_at,history:logs.filter(log=>log.actor_id===profile.user_id).slice(0,20)};
    })});
  }

  if(action==='create'){
    const username=String(body.username||'').trim().toLowerCase();
    const email=String(body.email||'').trim().toLowerCase();
    const displayName=String(body.displayName||'').trim().slice(0,80);
    const password=String(body.password||'');
    const role=body.role==='owner'?'owner':'editor';
    if(!validUsername(username)||!validEmail(email)||!displayName||!strongPassword(password))return json(request,{error:'Valid username, email, display name and strong password are required'},422);
    const createResponse=await fetch(`${supabaseUrl}/auth/v1/admin/users`,{method:'POST',headers:adminHeaders,body:JSON.stringify({email,password,email_confirm:true,user_metadata:{display_name:displayName,username}})});
    const created=await createResponse.json() as {id?:string,user?:{id:string},message?:string};
    const userId=created.user?.id||created.id;
    if(!createResponse.ok||!userId)return json(request,{error:created.message||'Unable to create administrator'},400);
    const saveResponse=await fetch(`${supabaseUrl}/rest/v1/admin_users`,{method:'POST',headers:{...adminHeaders,Prefer:'return=minimal'},body:JSON.stringify({user_id:userId,username,email,display_name:displayName,role})});
    if(!saveResponse.ok){await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`,{method:'DELETE',headers:adminHeaders});return json(request,{error:'Unable to create administrator profile'},500);}
    return json(request,{ok:true,userId},201);
  }

  const userId=String(body.userId||'');
  if(!/^[0-9a-f-]{36}$/i.test(userId))return json(request,{error:'Valid administrator required'},422);
  const targetResponse=await fetch(`${supabaseUrl}/rest/v1/admin_users?user_id=eq.${userId}&select=*`,{headers:adminHeaders});
  const targetRows=targetResponse.ok?await targetResponse.json() as Array<Record<string,unknown>>:[];
  const target=targetRows[0];
  if(!target)return json(request,{error:'Administrator not found'},404);
  const protectedOwner=target.username===ownerUsername;

  if(action==='reset-password'){
    if(protectedOwner&&caller.id!==userId)return json(request,{error:'Only Owner can change their own password'},403);
    const password=String(body.password||'');
    if(!strongPassword(password))return json(request,{error:'Use at least 12 characters with uppercase, lowercase and a number'},422);
    const response=await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`,{method:'PUT',headers:adminHeaders,body:JSON.stringify({password})});
    return response.ok?json(request,{ok:true}):json(request,{error:'Unable to reset password'},400);
  }

  if(action==='update'){
    const displayName=String(body.displayName||target.display_name||'').trim().slice(0,80);
    const email=String(body.email||target.email||'').trim().toLowerCase();
    if(!displayName||!validEmail(email))return json(request,{error:'Valid display name and email required'},422);
    if(protectedOwner&&caller.id!==userId)return json(request,{error:'Owner information is protected'},403);
    const role=protectedOwner?'owner':body.role==='owner'?'owner':'editor';
    const isActive=protectedOwner?true:body.isActive!==false;
    if(email!==target.email){
      const authUpdate=await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`,{method:'PUT',headers:adminHeaders,body:JSON.stringify({email,email_confirm:true})});
      if(!authUpdate.ok)return json(request,{error:'Unable to update login email'},400);
    }
    const updateResponse=await fetch(`${supabaseUrl}/rest/v1/admin_users?user_id=eq.${userId}`,{method:'PATCH',headers:{...adminHeaders,Prefer:'return=minimal'},body:JSON.stringify({display_name:displayName,email,role,is_active:isActive})});
    return updateResponse.ok?json(request,{ok:true}):json(request,{error:'Unable to update administrator'},400);
  }

  if(action==='delete'){
    if(protectedOwner)return json(request,{error:'Owner cannot be deleted'},409);
    const deleteResponse=await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`,{method:'DELETE',headers:adminHeaders});
    return deleteResponse.ok?json(request,{ok:true}):json(request,{error:'Unable to delete administrator'},400);
  }

  return json(request,{error:'Unsupported action'},400);
});
