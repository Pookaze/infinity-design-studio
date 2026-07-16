import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, json } from '../_shared/http.ts';

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response(null, { status:204, headers:corsHeaders(request) });
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return json(request, { error:'Unauthorized' }, 401);
  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth:{ persistSession:false } });
  const { data:userData } = await admin.auth.getUser(token);
  if (!userData.user) return json(request, { error:'Unauthorized' }, 401);
  const { data:profile } = await admin.from('admin_users').select('role,is_active').eq('user_id',userData.user.id).maybeSingle();
  if (!profile?.is_active || profile.role !== 'owner') return json(request, { error:'Owner access required' }, 403);

  let body: Record<string, string | boolean> = {};
  try { body = await request.json(); } catch { return json(request, { error:'Invalid JSON' }, 400); }
  if (request.method === 'POST') {
    const email = String(body.email || '');
    const username = String(body.username || '').toLowerCase().trim();
    const role = body.role === 'owner' ? 'owner' : 'editor';
    if (!/^\S+@\S+\.\S+$/.test(email)) return json(request, { error:'Valid email required' }, 422);
    if (!/^[a-z0-9][a-z0-9-]{2,31}$/.test(username)) return json(request, { error:'Username must use 3–32 lowercase letters, numbers or hyphens.' }, 422);
    const { data, error } = await admin.auth.admin.inviteUserByEmail(email, { redirectTo:Deno.env.get('ADMIN_SITE_URL'), data:{ display_name:String(body.displayName || 'Editor') } });
    if (error || !data.user) return json(request, { error:error?.message || 'Invitation failed' }, 400);
    const { error: insertError } = await admin.from('admin_users').insert({ user_id:data.user.id, username, display_name:String(body.displayName || 'Editor').slice(0,80), role });
    if (insertError) return json(request, { error:'Profile creation failed' }, 500);
    return json(request, { ok:true, userId:data.user.id }, 201);
  }
  const userId = String(body.userId || '');
  if (!/^[0-9a-f-]{36}$/i.test(userId)) return json(request, { error:'Valid userId required' }, 422);
  if (request.method === 'PATCH') {
    const updates = { display_name:String(body.displayName || '').slice(0,80), role:body.role === 'owner' ? 'owner' : 'editor', is_active:body.isActive !== false };
    const { error } = await admin.from('admin_users').update(updates).eq('user_id',userId);
    return error ? json(request, { error:error.message }, 400) : json(request, { ok:true });
  }
  if (request.method === 'DELETE') {
    const { data:target } = await admin.from('admin_users').select('role').eq('user_id',userId).single();
    if (target?.role === 'owner') return json(request, { error:'Owner cannot be deleted.' }, 409);
    const { error } = await admin.auth.admin.deleteUser(userId);
    return error ? json(request, { error:error.message }, 400) : json(request, { ok:true });
  }
  return json(request, { error:'Method not allowed' }, 405);
});
