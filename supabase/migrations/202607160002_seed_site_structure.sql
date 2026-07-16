insert into public.pages(slug,title_en,title_zh,description_en,description_zh,status,published_at) values
('home','Home','首页','Premium branding, marketing and website design by INfinity Design Studio.','INfinity Design Studio 提供高端品牌、营销与网站设计。','published',now()),
('about','About','关于我们','The story and approach behind INfinity Design Studio.','了解 INfinity Design Studio 的理念与方法。','published',now()),
('services','Services','服务','Branding, marketing and website design services.','品牌、营销与网站设计服务。','published',now()),
('work','Work','作品','Selected design work and project showcases.','精选设计作品与项目展示。','published',now()),
('contact','Contact','联系我们','Start a project with INfinity Design Studio.','与 INfinity Design Studio 开始新项目。','published',now())
on conflict(slug) do nothing;

insert into public.page_sections(page_id,section_key,section_type,title_en,title_zh,content_en,content_zh,sort_order)
select p.id,v.section_key,v.section_type,v.title_en,v.title_zh,jsonb_build_object('text',v.body_en),jsonb_build_object('text',v.body_zh),v.ord
from public.pages p join (values
('home','home','hero','Ideas that become inevitable.','让创意成为必然。','A premium independent design studio creating distinctive brands and digital experiences.','独立高端设计工作室，打造独特品牌与数字体验。',1),
('home','about','text','Small studio. Serious impact.','小型工作室，成就非凡影响。','Direct collaboration, senior-level thinking and craft that never gets delegated.','直接协作、资深思考与始终如一的专业工艺。',2),
('home','portfolio','project-cards','Selected Work','精选作品','Explore branding, marketing and website design.','探索品牌、营销与网站设计作品。',3),
('about','about','text','About INfinity','关于 INfinity','We build visual systems with clarity, character and commercial purpose.','我们以清晰思考、鲜明个性与商业目标构建视觉系统。',1),
('services','services','project-cards','Services','服务','Focused creative services for ambitious businesses.','为有抱负的企业提供专注的创意服务。',1),
('work','portfolio','project-cards','Selected Work','精选作品','Published projects from the studio.','工作室已发布的项目作品。',1),
('contact','contact','cta','Start a Project','开始项目','Tell us about your goals, audience and timeline.','告诉我们您的目标、受众和时间计划。',1)
) v(page_slug,section_key,section_type,title_en,title_zh,body_en,body_zh,ord) on p.slug=v.page_slug
on conflict(page_id,section_key) do nothing;

insert into public.navigation_items(label_en,label_zh,url,sort_order) values
('Home','首页','/#home',1),('About','关于我们','/#about',2),('Services','服务','/work/',3),('Work','作品','/#portfolio',4),('Contact','联系我们','/#contact',5)
on conflict do nothing;

update public.site_settings set
  contact_email='hello@infinitydesignstudio.com',
  copyright_en='© 2026 INfinity Design Studio. All rights reserved.',
  copyright_zh='© 2026 INfinity Design Studio。保留所有权利。',
  footer_en='{"privacy":"Privacy Policy","terms":"Terms of Service"}',
  footer_zh='{"privacy":"隐私政策","terms":"服务条款"}'
where id=true;
