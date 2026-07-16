-- Owner-only administrator management and activity visibility.

alter table public.admin_users add column if not exists last_ip inet;

drop policy if exists admin_read_admin_users on public.admin_users;
drop policy if exists self_read_admin_users on public.admin_users;
create policy self_read_admin_users on public.admin_users
for select to authenticated
using (user_id = auth.uid());

-- owner_manage_admin_users remains the only policy permitting profile writes.
drop policy if exists admin_read_activity on public.activity_logs;
drop policy if exists admin_insert_activity on public.activity_logs;
drop policy if exists owner_read_activity on public.activity_logs;
create policy owner_read_activity on public.activity_logs
for select to authenticated
using (public.is_admin(array['owner']::public.admin_role[]));

create or replace function public.protect_last_owner()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
begin
  if old.username='owner' then
    if tg_op='DELETE' then
      raise exception 'The Owner account cannot be deleted.';
    end if;
    if new.user_id is distinct from old.user_id
       or new.username is distinct from old.username
       or new.role is distinct from 'owner'::public.admin_role
       or new.is_active is distinct from true then
      raise exception 'The Owner identity, role and active status are protected.';
    end if;
  elsif old.role='owner' and
    (tg_op='DELETE' or new.role<>'owner' or not new.is_active) and
    (select count(*) from public.admin_users where role='owner' and is_active and user_id<>old.user_id)=0 then
    raise exception 'The last active Owner cannot be removed or disabled.';
  end if;
  return coalesce(new,old);
end;
$$;

drop trigger if exists protect_last_owner on public.admin_users;
create trigger protect_last_owner
before update or delete on public.admin_users
for each row execute function public.protect_last_owner();

