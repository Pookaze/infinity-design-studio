-- Preserve website content and audit history when an administrator is deleted.
-- Attribution columns become NULL; content and logs are never removed.
do $$
declare
  item record;
begin
  for item in
    select * from (values
      ('pages','pages_created_by_fkey','created_by'),
      ('pages','pages_updated_by_fkey','updated_by'),
      ('projects','projects_created_by_fkey','created_by'),
      ('projects','projects_updated_by_fkey','updated_by'),
      ('media','media_uploaded_by_fkey','uploaded_by'),
      ('theme_settings','theme_settings_updated_by_fkey','updated_by'),
      ('site_settings','site_settings_updated_by_fkey','updated_by'),
      ('seo_settings','seo_settings_updated_by_fkey','updated_by'),
      ('content_versions','content_versions_actor_id_fkey','actor_id'),
      ('activity_logs','activity_logs_actor_id_fkey','actor_id')
    ) as refs(table_name,constraint_name,column_name)
  loop
    execute format('alter table public.%I drop constraint if exists %I',item.table_name,item.constraint_name);
    execute format(
      'alter table public.%I add constraint %I foreign key (%I) references public.admin_users(user_id) on delete set null',
      item.table_name,item.constraint_name,item.column_name
    );
  end loop;
end;
$$;

