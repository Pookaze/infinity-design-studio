const ownerEmail = 'owner@cms.infinity.local';

function corsHeaders(request: Request) {
  const allowed = (Deno.env.get('ALLOWED_ADMIN_ORIGIN') || '').split(',').map(value => value.trim()).filter(Boolean);
  const origin = request.headers.get('origin') || '';
  return {
    'Access-Control-Allow-Origin': allowed.includes(origin) ? origin : allowed[0] || 'null',
    'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type, x-reset-token',
    'Access-Control-Allow-Methods':'POST, OPTIONS',
    'Vary':'Origin',
    'Content-Type':'application/json; charset=utf-8'
  };
}

function json(request: Request, body:unknown, status=200) {
  return new Response(JSON.stringify(body), { status, headers:corsHeaders(request) });
}

async function sha256(value: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response(null, { status:204, headers:corsHeaders(request) });
  if (request.method !== 'POST') return json(request, { error:'Method not allowed' }, 405);

  const resetToken = request.headers.get('x-reset-token') || '';
  if (resetToken.length < 32) return json(request, { error:'This reset link is invalid or expired.' }, 410);

  let body:{ password?:string };
  try { body = await request.json(); } catch { return json(request, { error:'Invalid request' }, 400); }
  const password = String(body.password || '');
  if (password.length < 12 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
    return json(request, { error:'Use at least 12 characters with uppercase, lowercase and a number.' }, 422);
  }

  let secretKey = '';
  try { secretKey = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') || '{}').default || ''; } catch { secretKey = ''; }
  secretKey = secretKey || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  if (!secretKey || !supabaseUrl) return json(request, { error:'Password reset service is unavailable.' }, 500);

  const adminHeaders = { apikey:secretKey, 'Content-Type':'application/json' };
  const tokenHash = await sha256(resetToken);
  const consumeResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/consume_owner_password_reset_token`, {
    method:'POST', headers:adminHeaders, body:JSON.stringify({ p_token_hash:tokenHash })
  });
  const consumed = consumeResponse.ok && await consumeResponse.json() === true;
  if (!consumed) return json(request, { error:'This reset link is invalid, expired or has already been used.' }, 410);

  const usersResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users?page=1&per_page=100`, { headers:adminHeaders });
  if (!usersResponse.ok) return json(request, { error:'Unable to verify the Owner account.' }, 500);
  const usersPayload = await usersResponse.json() as { users?:Array<{id:string,email?:string}> };
  const owner = (usersPayload.users || []).find(user => user.email === ownerEmail);
  if (!owner) return json(request, { error:'Owner account is unavailable.' }, 404);

  const updateResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users/${owner.id}`, {
    method:'PUT', headers:adminHeaders, body:JSON.stringify({ password })
  });
  if (!updateResponse.ok) {
    console.error('owner-password-update', updateResponse.status, await updateResponse.text());
    return json(request, { error:'Unable to update the Owner password.' }, 500);
  }

  return json(request, { ok:true, email:ownerEmail });
});
