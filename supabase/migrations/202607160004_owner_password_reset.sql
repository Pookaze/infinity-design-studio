-- One-time Owner password reset tokens. Only the trusted service_role can read
-- or consume these rows; browser roles receive no table or function access.

create table if not exists public.owner_password_reset_tokens (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique check (token_hash ~ '^[0-9a-f]{64}$'),
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now(),
  check (expires_at > created_at)
);

alter table public.owner_password_reset_tokens enable row level security;
revoke all on public.owner_password_reset_tokens from anon, authenticated;
grant select, insert, update, delete on public.owner_password_reset_tokens to service_role;

create or replace function public.consume_owner_password_reset_token(p_token_hash text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  consumed_id uuid;
begin
  update public.owner_password_reset_tokens
  set used_at = now()
  where token_hash = p_token_hash
    and used_at is null
    and expires_at > now()
  returning id into consumed_id;

  return consumed_id is not null;
end;
$$;

revoke all on function public.consume_owner_password_reset_token(text) from public, anon, authenticated;
grant execute on function public.consume_owner_password_reset_token(text) to service_role;

