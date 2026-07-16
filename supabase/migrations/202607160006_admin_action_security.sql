-- Atomic server-side rate limits for sensitive administrator actions.

create table if not exists public.admin_action_rate_limits (
  actor_id uuid not null references public.admin_users(user_id) on delete cascade,
  action text not null check (action in ('create','update','reset-password','delete')),
  window_start timestamptz not null,
  attempts integer not null default 1 check (attempts > 0),
  primary key (actor_id, action, window_start)
);

alter table public.admin_action_rate_limits enable row level security;
revoke all on public.admin_action_rate_limits from anon, authenticated;
grant select, insert, update, delete on public.admin_action_rate_limits to service_role;

create or replace function public.take_admin_action_slot(
  p_actor_id uuid,
  p_action text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path=public
as $$
declare
  bucket timestamptz;
  current_attempts integer;
begin
  if p_action not in ('create','update','reset-password','delete')
     or p_limit < 1 or p_window_seconds < 60 then
    return false;
  end if;
  bucket := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  insert into public.admin_action_rate_limits(actor_id,action,window_start,attempts)
  values(p_actor_id,p_action,bucket,1)
  on conflict(actor_id,action,window_start)
  do update set attempts=public.admin_action_rate_limits.attempts+1
  returning attempts into current_attempts;
  delete from public.admin_action_rate_limits where window_start < now()-interval '1 day';
  return current_attempts <= p_limit;
end;
$$;

revoke all on function public.take_admin_action_slot(uuid,text,integer,integer) from public, anon, authenticated;
grant execute on function public.take_admin_action_slot(uuid,text,integer,integer) to service_role;

