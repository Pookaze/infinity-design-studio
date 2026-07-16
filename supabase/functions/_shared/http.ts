export function corsHeaders(request: Request) {
  const allowed = (Deno.env.get('ALLOWED_ADMIN_ORIGIN') || '').split(',').map(v => v.trim()).filter(Boolean);
  const origin = request.headers.get('origin') || '';
  return {
    'Access-Control-Allow-Origin': allowed.includes(origin) ? origin : allowed[0] || 'null',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-bootstrap-secret, x-reset-token',
    'Access-Control-Allow-Methods': 'POST, PATCH, DELETE, OPTIONS',
    'Vary': 'Origin',
    'Content-Type': 'application/json; charset=utf-8'
  };
}

export function json(request: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders(request) });
}
