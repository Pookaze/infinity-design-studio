-- Keep each CMS profile's login email available to authenticated Owners without
-- exposing the auth schema or a server key to the browser.

alter table public.admin_users
  add column if not exists email text;

update public.admin_users as profile
set email = auth_user.email
from auth.users as auth_user
where auth_user.id = profile.user_id
  and profile.email is distinct from auth_user.email;

create unique index if not exists admin_users_email_lower_key
  on public.admin_users (lower(email));

create or replace function public.set_admin_login_email()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if new.email is null or btrim(new.email) = '' then
    select auth_user.email into new.email
    from auth.users as auth_user
    where auth_user.id = new.user_id;
  end if;
  return new;
end;
$$;

revoke all on function public.set_admin_login_email() from public;

drop trigger if exists set_admin_login_email on public.admin_users;
create trigger set_admin_login_email
before insert or update of user_id on public.admin_users
for each row execute function public.set_admin_login_email();

comment on column public.admin_users.email is
  'Supabase Auth login email shown to Owners in the CMS administrator list.';

