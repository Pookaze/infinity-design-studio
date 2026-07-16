-- The public renderer must be able to receive hidden rows so it can hide
-- corresponding static sections and navigation items without leaving old HTML visible.
drop policy if exists public_page_sections on public.page_sections;
create policy public_page_sections on public.page_sections for select to anon
using (exists(select 1 from public.pages p where p.id=page_id and p.status='published' and p.deleted_at is null));

drop policy if exists public_navigation on public.navigation_items;
create policy public_navigation on public.navigation_items for select to anon using (true);

alter table public.media add column if not exists sort_order integer not null default 0;
