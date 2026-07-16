-- Server-side CMS privileges.
-- RLS remains enabled for browser roles. The trusted service_role still needs
-- PostgreSQL object privileges before its BYPASSRLS attribute can take effect.

grant usage on schema public to service_role;

grant select, insert, update, delete on table
  public.admin_users,
  public.pages,
  public.page_sections,
  public.service_categories,
  public.services,
  public.projects,
  public.project_sections,
  public.media,
  public.project_media,
  public.navigation_items,
  public.theme_settings,
  public.site_settings,
  public.seo_settings,
  public.content_versions,
  public.activity_logs
to service_role;

grant usage, select, update on all sequences in schema public to service_role;

grant execute on function public.is_admin(public.admin_role[]) to service_role;
grant execute on function public.record_admin_login() to service_role;

-- Preserve the same access for CMS objects created by later migrations.
alter default privileges in schema public
  grant select, insert, update, delete on tables to service_role;
alter default privileges in schema public
  grant usage, select, update on sequences to service_role;
alter default privileges in schema public
  grant execute on functions to service_role;

-- Storage is accessed through the Supabase Storage API. Its service_role JWT
-- bypasses object RLS; authenticated administrators remain constrained to the
-- cms-media bucket by the policies created in the foundation migration.

