-- Stores public contact submissions. Inserts and updates are performed only by
-- the server-side Vercel Function through the Supabase service-role key.

alter table public.site_settings
  drop constraint if exists site_settings_contact_email_format;
alter table public.site_settings
  add constraint site_settings_contact_email_format
  check (contact_email = '' or contact_email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$');

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null unique,
  customer_name text not null,
  customer_contact text not null,
  service text not null,
  currency text not null check (currency in ('MYR','USD','SGD','CNY','EUR','GBP')),
  budget_amount numeric not null check (budget_amount >= 0),
  details text not null,
  recipient_email text not null,
  submitted_at timestamptz not null default now(),
  email_status text not null default 'pending' check (email_status in ('pending','sent','failed')),
  email_provider_id text,
  email_sent_at timestamptz,
  email_error text
);

alter table public.inquiries enable row level security;
revoke all on public.inquiries from anon, authenticated;
grant select, insert, update on public.inquiries to service_role;

drop policy if exists owner_read_inquiries on public.inquiries;
create policy owner_read_inquiries on public.inquiries
for select to authenticated
using (public.is_admin(array['owner']::public.admin_role[]));
grant select on public.inquiries to authenticated;
