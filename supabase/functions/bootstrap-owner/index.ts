import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, json } from '../_shared/http.ts';

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(request) });
  if (request.method !== 'POST') return json(request, { error: 'Method not allowed' }, 405);
  const expected = Deno.env.get('CMS_BOOTSTRAP_SECRET');
  const supplied = request.headers.get('x-bootstrap-secret');
  if (!expected || !supplied || supplied !== expected) return json(request, { error: 'Unauthorized' }, 401);

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession:false } });
  const { count, error: countError } = await admin.from('admin_users').select('*', { count:'exact', head:true }).eq('role','owner');
  if (countError) return json(request, { error:'Unable to verify bootstrap state' }, 500);
  if ((count || 0) > 0) return json(request, { error:'Owner already exists; bootstrap is permanently closed.' }, 409);

  let body: { email?:string; displayName?:string };
  try { body = await request.json(); } catch { return json(request, { error:'Invalid JSON' }, 400); }
  if (!body.email || !/^\S+@\S+\.\S+$/.test(body.email))
    return json(request, { error:'A valid email is required.' }, 422);

  const redirectTo = Deno.env.get('ADMIN_SITE_URL');
  const { data, error } = await admin.auth.admin.inviteUserByEmail(body.email, { redirectTo, data:{ display_name:(body.displayName || 'Owner').slice(0,80) } });
  if (error || !data.user) return json(request, { error:error?.message || 'Account creation failed' }, 400);
  const { error: profileError } = await admin.from('admin_users').insert({ user_id:data.user.id, username:'owner', display_name:(body.displayName || 'Owner').slice(0,80), role:'owner' });
  if (profileError) {
    await admin.auth.admin.deleteUser(data.user.id);
    return json(request, { error:'Owner profile creation failed' }, 500);
  }
  return json(request, { ok:true, userId:data.user.id, invited:true }, 201);
});
