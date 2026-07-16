do $$
declare home_id uuid;
begin
  select id into home_id from public.pages where slug='home' and deleted_at is null limit 1;
  if home_id is null then raise exception 'Published home page not found'; end if;

  update public.page_sections set
    content_en=jsonb_set(jsonb_set(jsonb_set(content_en,'{fields,card1Link}','"services/branding-identity/"'),'{fields,card2Link}','"services/marketing-design/"'),'{fields,card3Link}','"services/website-design/"'),
    content_zh=jsonb_set(jsonb_set(jsonb_set(content_zh,'{fields,card1Link}','"services/branding-identity/"'),'{fields,card2Link}','"services/marketing-design/"'),'{fields,card3Link}','"services/website-design/"')
  where page_id=home_id and section_key='services';

  update public.page_sections set
    content_en=jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(content_en,'{fields,card1Link}','"work/branding-identity/"'),'{fields,card2Link}','"work/marketing-design/"'),'{fields,card3Link}','"work/website-design/"'),'{fields,card1Button}','"Explore Category"'),'{fields,card2Button}','"Explore Category"'),'{fields,card3Button}','"Explore Category"'),
    content_zh=jsonb_set(jsonb_set(jsonb_set(content_zh,'{fields,card1Link}','"work/branding-identity/"'),'{fields,card2Link}','"work/marketing-design/"'),'{fields,card3Link}','"work/website-design/"')
  where page_id=home_id and section_key='portfolio';

  update public.services s set project_url='/work/'||c.slug||'/?service='||s.slug||'#projects'
  from public.service_categories c where c.id=s.category_id and s.deleted_at is null;
end $$;
