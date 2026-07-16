alter table public.services
  add column if not exists price_en text not null default '',
  add column if not exists price_zh text not null default '',
  add column if not exists included_items_en text[] not null default '{}',
  add column if not exists included_items_zh text[] not null default '{}',
  add column if not exists turnaround_en text not null default '',
  add column if not exists turnaround_zh text not null default '';

comment on column public.services.price_en is 'Public English price or quotation message';
comment on column public.services.price_zh is 'Public Simplified Chinese price or quotation message';
comment on column public.services.included_items_en is 'English inclusions displayed as a list';
comment on column public.services.included_items_zh is 'Simplified Chinese inclusions displayed as a list';
comment on column public.services.turnaround_en is 'Optional English turnaround estimate';
comment on column public.services.turnaround_zh is 'Optional Simplified Chinese turnaround estimate';

grant select on public.services to anon, authenticated;
grant insert, update, delete on public.services to authenticated, service_role;
