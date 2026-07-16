-- Infinity Design Studio CMS foundation
-- Apply with `supabase db push` or paste into the Supabase SQL editor.
create extension if not exists pgcrypto;

do $$ begin
  create type public.admin_role as enum ('owner', 'editor');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.content_status as enum ('draft', 'published', 'hidden', 'archived');
exception when duplicate_object then null; end $$;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9][a-z0-9-]{2,31}$'),
  display_name text not null check (char_length(display_name) between 1 and 80),
  role public.admin_role not null default 'editor',
  is_active boolean not null default true,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title_en text not null, title_zh text not null,
  description_en text not null default '', description_zh text not null default '',
  status public.content_status not null default 'draft',
  published_at timestamptz, scheduled_at timestamptz, deleted_at timestamptz,
  created_by uuid references public.admin_users(user_id),
  updated_by uuid references public.admin_users(user_id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.page_sections (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages(id) on delete cascade,
  section_key text not null,
  section_type text not null check (section_type in ('hero','text','image-text','full-image','two-column','three-column','image-grid','project-cards','cta','spacer','divider','gallery')),
  title_en text not null default '', title_zh text not null default '',
  content_en jsonb not null default '{}'::jsonb, content_zh jsonb not null default '{}'::jsonb,
  layout jsonb not null default '{}'::jsonb,
  is_visible boolean not null default true, sort_order integer not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(page_id, section_key)
);

create table if not exists public.service_categories (
  id uuid primary key default gen_random_uuid(), slug text not null unique,
  title_en text not null, title_zh text not null,
  description_en text not null default '', description_zh text not null default '',
  is_visible boolean not null default true, sort_order integer not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.service_categories(id) on delete restrict,
  slug text not null unique, title_en text not null, title_zh text not null,
  description_en text not null default '', description_zh text not null default '',
  cover_media_id uuid, project_url text not null default '',
  status public.content_status not null default 'published', is_visible boolean not null default true,
  sort_order integer not null default 0, deleted_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  service_id uuid references public.services(id) on delete set null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title_en text not null, title_zh text not null,
  short_description_en text not null default '', short_description_zh text not null default '',
  client_en text not null default '', client_zh text not null default '',
  industry_en text not null default '', industry_zh text not null default '',
  year smallint check (year between 1900 and 2200), services_en text[] not null default '{}', services_zh text[] not null default '{}',
  cover_media_id uuid, share_media_id uuid,
  featured boolean not null default false, status public.content_status not null default 'draft',
  seo_title_en text not null default '', seo_title_zh text not null default '',
  seo_description_en text not null default '', seo_description_zh text not null default '',
  published_at timestamptz, scheduled_at timestamptz, deleted_at timestamptz,
  created_by uuid references public.admin_users(user_id), updated_by uuid references public.admin_users(user_id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.project_sections (
  id uuid primary key default gen_random_uuid(), project_id uuid not null references public.projects(id) on delete cascade,
  section_key text not null check (section_key in ('overview','showcase','design-system','deliverables')),
  section_number smallint not null check (section_number between 1 and 4),
  title_en text not null, title_zh text not null,
  content_en jsonb not null default '{}'::jsonb, content_zh jsonb not null default '{}'::jsonb,
  layout text not null default 'standard' check (layout in ('standard','full-width','two-column','grid')),
  is_visible boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(project_id, section_key), unique(project_id, section_number)
);

create table if not exists public.media (
  id uuid primary key default gen_random_uuid(), bucket text not null default 'cms-media', object_path text not null unique,
  public_url text not null, original_name text not null, mime_type text not null check (mime_type in ('image/jpeg','image/png','image/webp','image/avif')),
  width integer check (width > 0), height integer check (height > 0), size_bytes bigint not null check (size_bytes between 1 and 10485760),
  alt_en text not null default '', alt_zh text not null default '', title_en text not null default '', title_zh text not null default '',
  focal_x numeric(5,4) not null default .5 check (focal_x between 0 and 1), focal_y numeric(5,4) not null default .5 check (focal_y between 0 and 1),
  uploaded_by uuid references public.admin_users(user_id), created_at timestamptz not null default now(), deleted_at timestamptz
);
alter table public.services drop constraint if exists services_cover_media_id_fkey;
alter table public.services add constraint services_cover_media_id_fkey foreign key (cover_media_id) references public.media(id) on delete set null;
alter table public.projects drop constraint if exists projects_cover_media_id_fkey;
alter table public.projects add constraint projects_cover_media_id_fkey foreign key (cover_media_id) references public.media(id) on delete set null;
alter table public.projects drop constraint if exists projects_share_media_id_fkey;
alter table public.projects add constraint projects_share_media_id_fkey foreign key (share_media_id) references public.media(id) on delete set null;

create table if not exists public.project_media (
  project_id uuid not null references public.projects(id) on delete cascade,
  media_id uuid not null references public.media(id) on delete restrict,
  section_key text not null check (section_key in ('overview','showcase','design-system','deliverables')),
  caption_en text not null default '', caption_zh text not null default '',
  layout text not null default 'standard', sort_order integer not null default 0,
  primary key(project_id, media_id, section_key)
);

create table if not exists public.navigation_items (
  id uuid primary key default gen_random_uuid(), parent_id uuid references public.navigation_items(id) on delete cascade,
  label_en text not null, label_zh text not null, url text not null check (url ~ '^(\/|#|https:\/\/)'),
  target text not null default '_self' check (target in ('_self','_blank')), is_visible boolean not null default true,
  mobile_visible boolean not null default true, sort_order integer not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.theme_settings (
  id boolean primary key default true check (id),
  colors jsonb not null default '{"primary":"#d6ad60","secondary":"#ffffff","accent":"#d6ad60","background":"#070707","surface":"#121212","text":"#f6f3ed","muted":"#a8a39a","button":"#d6ad60","link":"#d6ad60","border":"#3a3225","dark":"#070707"}',
  fonts jsonb not null default '{"heading":"Manrope","body":"Inter","button":"Inter","navigation":"Inter"}',
  typography jsonb not null default '{}', layout jsonb not null default '{}', mode text not null default 'dark' check (mode in ('light','dark')),
  updated_by uuid references public.admin_users(user_id), updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id boolean primary key default true check (id),
  studio_name text not null default 'INfinity Design Studio', logo_media_id uuid references public.media(id) on delete set null,
  favicon_media_id uuid references public.media(id) on delete set null, contact_email text not null default '', whatsapp_url text not null default '',
  social_links jsonb not null default '{}'::jsonb, copyright_en text not null default '', copyright_zh text not null default '',
  footer_en jsonb not null default '{}'::jsonb, footer_zh jsonb not null default '{}'::jsonb,
  default_language text not null default 'en' check (default_language in ('en','zh')),
  website_status text not null default 'live' check (website_status in ('live','maintenance')),
  updated_by uuid references public.admin_users(user_id), updated_at timestamptz not null default now()
);

create table if not exists public.seo_settings (
  id uuid primary key default gen_random_uuid(), page_key text not null unique,
  title_en text not null default '', title_zh text not null default '', description_en text not null default '', description_zh text not null default '',
  canonical_url text not null default '', og_media_id uuid references public.media(id) on delete set null,
  robots_index boolean not null default true, robots_follow boolean not null default true,
  updated_by uuid references public.admin_users(user_id), updated_at timestamptz not null default now()
);

create table if not exists public.content_versions (
  id bigint generated always as identity primary key, entity_table text not null, entity_id uuid not null,
  operation text not null check (operation in ('insert','update','delete','publish','restore')),
  before_data jsonb, after_data jsonb, actor_id uuid references public.admin_users(user_id), created_at timestamptz not null default now()
);
create table if not exists public.activity_logs (
  id bigint generated always as identity primary key, actor_id uuid references public.admin_users(user_id), action text not null,
  entity_table text, entity_id uuid, metadata jsonb not null default '{}'::jsonb, ip_hash text, created_at timestamptz not null default now()
);

create or replace function public.is_admin(check_roles public.admin_role[] default array['owner','editor']::public.admin_role[])
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.admin_users where user_id = auth.uid() and is_active and role = any(check_roles)); $$;
revoke all on function public.is_admin(public.admin_role[]) from public;
grant execute on function public.is_admin(public.admin_role[]) to anon, authenticated;

create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

do $$ declare tab text; begin
  foreach tab in array array['admin_users','pages','page_sections','service_categories','services','projects','project_sections','navigation_items'] loop
    execute format('drop trigger if exists set_updated_at on public.%I', tab);
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', tab);
  end loop;
end $$;

create or replace function public.capture_cms_change() returns trigger language plpgsql security definer set search_path = public as $$
declare row_id uuid; begin
  row_id := coalesce((to_jsonb(new)->>'id')::uuid, (to_jsonb(old)->>'id')::uuid);
  insert into public.content_versions(entity_table, entity_id, operation, before_data, after_data, actor_id)
  values (tg_table_name, row_id, lower(tg_op), case when tg_op <> 'INSERT' then to_jsonb(old) end, case when tg_op <> 'DELETE' then to_jsonb(new) end, auth.uid());
  insert into public.activity_logs(actor_id, action, entity_table, entity_id)
  values (auth.uid(), lower(tg_op), tg_table_name, row_id);
  return coalesce(new, old);
end $$;

do $$ declare tab text; begin
  foreach tab in array array['pages','page_sections','service_categories','services','projects','project_sections','media','navigation_items','seo_settings'] loop
    execute format('drop trigger if exists capture_cms_change on public.%I', tab);
    execute format('create trigger capture_cms_change after insert or update or delete on public.%I for each row execute function public.capture_cms_change()', tab);
  end loop;
end $$;

-- Public content can only be read when published/visible and not soft-deleted.
do $$ declare tab text; begin
  foreach tab in array array['pages','page_sections','service_categories','services','projects','project_sections','media','project_media','navigation_items','theme_settings','site_settings','seo_settings'] loop
    execute format('alter table public.%I enable row level security', tab);
    execute format('drop policy if exists admin_all on public.%I', tab);
    execute format('create policy admin_all on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', tab);
  end loop;
end $$;
alter table public.admin_users enable row level security;
alter table public.content_versions enable row level security;
alter table public.activity_logs enable row level security;

create policy public_pages on public.pages for select to anon using (status='published' and deleted_at is null and (published_at is null or published_at <= now()));
create policy public_page_sections on public.page_sections for select to anon using (is_visible and exists(select 1 from public.pages p where p.id=page_id and p.status='published' and p.deleted_at is null));
create policy public_categories on public.service_categories for select to anon using (is_visible);
create policy public_services on public.services for select to anon using (status='published' and is_visible and deleted_at is null);
create policy public_projects on public.projects for select to anon using (status='published' and deleted_at is null and (published_at is null or published_at <= now()));
create policy public_project_sections on public.project_sections for select to anon using (is_visible and exists(select 1 from public.projects p where p.id=project_id and p.status='published' and p.deleted_at is null));
create policy public_media on public.media for select to anon using (deleted_at is null);
create policy public_project_media on public.project_media for select to anon using (exists(select 1 from public.projects p where p.id=project_id and p.status='published' and p.deleted_at is null));
create policy public_navigation on public.navigation_items for select to anon using (is_visible);
create policy public_theme on public.theme_settings for select to anon using (true);
create policy public_site_settings on public.site_settings for select to anon using (true);
create policy public_seo on public.seo_settings for select to anon using (robots_index);

-- Owner-only direct profile changes; account creation/deletion still happens in the server Edge Function.
drop policy if exists admin_all on public.admin_users;
drop policy if exists admin_read_admin_users on public.admin_users;
drop policy if exists owner_manage_admin_users on public.admin_users;
create policy admin_read_admin_users on public.admin_users for select to authenticated using (public.is_admin());
create policy owner_manage_admin_users on public.admin_users for all to authenticated
using (public.is_admin(array['owner']::public.admin_role[])) with check (public.is_admin(array['owner']::public.admin_role[]));
drop policy if exists admin_read_versions on public.content_versions;
create policy admin_read_versions on public.content_versions for select to authenticated using (public.is_admin());
drop policy if exists admin_read_activity on public.activity_logs;
drop policy if exists admin_insert_activity on public.activity_logs;
create policy admin_read_activity on public.activity_logs for select to authenticated using (public.is_admin());
create policy admin_insert_activity on public.activity_logs for insert to authenticated with check (public.is_admin() and actor_id=auth.uid());

create or replace function public.protect_last_owner() returns trigger language plpgsql security definer set search_path=public as $$
begin
  if old.role='owner' and (tg_op='DELETE' or new.role<>'owner' or not new.is_active) and
     (select count(*) from public.admin_users where role='owner' and is_active and user_id<>old.user_id)=0 then
    raise exception 'The last active Owner cannot be removed or disabled.';
  end if;
  return coalesce(new,old);
end $$;
drop trigger if exists protect_last_owner on public.admin_users;
create trigger protect_last_owner before update or delete on public.admin_users for each row execute function public.protect_last_owner();

create or replace function public.record_admin_login() returns void language plpgsql security definer set search_path=public as $$
begin
  if not public.is_admin() then raise exception 'Administrator access required'; end if;
  update public.admin_users set last_login_at=now() where user_id=auth.uid();
  insert into public.activity_logs(actor_id,action,entity_table,entity_id) values(auth.uid(),'login','admin_users',auth.uid());
end $$;
revoke all on function public.record_admin_login() from public;
grant execute on function public.record_admin_login() to authenticated;

grant select on public.pages, public.page_sections, public.service_categories, public.services, public.projects, public.project_sections, public.media, public.project_media, public.navigation_items, public.theme_settings, public.site_settings, public.seo_settings to anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('cms-media','cms-media',true,10485760,array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do update set file_size_limit=excluded.file_size_limit, allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists cms_media_admin_select on storage.objects;
drop policy if exists cms_media_admin_insert on storage.objects;
drop policy if exists cms_media_admin_update on storage.objects;
drop policy if exists cms_media_admin_delete on storage.objects;
create policy cms_media_admin_select on storage.objects for select to authenticated using (bucket_id='cms-media' and public.is_admin());
create policy cms_media_admin_insert on storage.objects for insert to authenticated with check (bucket_id='cms-media' and public.is_admin() and (storage.foldername(name))[1]=auth.uid()::text);
create policy cms_media_admin_update on storage.objects for update to authenticated using (bucket_id='cms-media' and public.is_admin()) with check (bucket_id='cms-media' and public.is_admin());
create policy cms_media_admin_delete on storage.objects for delete to authenticated using (bucket_id='cms-media' and public.is_admin());

insert into public.theme_settings(id) values (true) on conflict do nothing;
insert into public.site_settings(id) values (true) on conflict do nothing;

-- Initial service taxonomy; existing public files remain the front-end fallback until content is published.
insert into public.service_categories(slug,title_en,title_zh,sort_order) values
('branding-identity','Branding & Identity','品牌与视觉识别',1),('marketing-design','Marketing Design','营销设计',2),('website-design','Website Design','网站设计',3)
on conflict(slug) do nothing;
insert into public.services(category_id,slug,title_en,title_zh,sort_order,project_url)
select c.id,v.slug,v.en,v.zh,v.ord,'/work/'||c.slug||'/'||v.slug||'/projects/' from public.service_categories c join (values
('branding-identity','logo-design','Logo Design','标志设计',1),('branding-identity','brand-identity','Brand Identity','品牌视觉系统',2),('branding-identity','business-card','Business Card','名片设计',3),('branding-identity','packaging','Packaging','包装设计',4),
('marketing-design','social-media','Social Media Design','社交媒体设计',1),('marketing-design','poster','Poster Design','海报设计',2),('marketing-design','flyer','Flyer Design','宣传单设计',3),('marketing-design','banner','Banner Design','横幅设计',4),('marketing-design','menu','Menu Design','菜单设计',5),
('website-design','business-website','Business Website','企业网站',1),('website-design','landing-page','Landing Page','落地页',2),('website-design','portfolio-website','Portfolio Website','作品集网站',3),('website-design','restaurant-website','Restaurant Website','餐厅网站',4),('website-design','responsive-design','Responsive Design','响应式设计',5),('website-design','basic-seo','Basic SEO Setup','基础 SEO 设置',6)
) v(category,slug,en,zh,ord) on c.slug=v.category on conflict(slug) do nothing;
