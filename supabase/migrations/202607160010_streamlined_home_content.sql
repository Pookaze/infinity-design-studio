do $$
declare home_id uuid;
begin
  select id into home_id from public.pages where slug='home' and deleted_at is null limit 1;
  if home_id is null then raise exception 'Published home page not found'; end if;

  update public.page_sections set sort_order=90, is_visible=false
  where page_id=home_id and section_key in ('why-us','testimonials','faq');

  update public.page_sections set sort_order=0, is_visible=true,
    content_en=jsonb_build_object('fields',jsonb_build_object('eyebrow','Branding · Marketing · Website Design','titleLine1','Designing brands.','titlePrefix','Building ','titleAccent','impact.','titleSuffix','','description','INfinity Design Studio helps businesses grow through strategic branding, marketing design and modern websites.','primaryButtonText','View Selected Work','primaryButtonLink','#portfolio','secondaryButtonText','Start a Project','secondaryButtonLink','#contact','scrollText','Scroll to explore','scrollLink','#about')),
    content_zh=jsonb_build_object('fields',jsonb_build_object('eyebrow','品牌 · 营销 · 网站设计','titleLine1','设计品牌。','titlePrefix','创造','titleAccent','影响力。','titleSuffix','','description','INfinity Design Studio 通过策略性品牌设计、营销设计与现代网站，助力企业成长。','primaryButtonText','查看精选作品','primaryButtonLink','#portfolio','secondaryButtonText','开始项目','secondaryButtonLink','#contact','scrollText','滚动探索','scrollLink','#about'))
  where page_id=home_id and section_key='home';

  update public.page_sections set sort_order=1, is_visible=true,
    content_en=jsonb_build_object('fields',jsonb_build_object('kicker','About the studio','titleLine1','Clear thinking.','titleAccent','Distinctive design.','lead','We combine strategy, design and practical execution to create brand experiences that are clear, memorable and ready to grow.','body','INfinity Design Studio works directly with businesses through a focused, collaborative process in English and Simplified Chinese.','metric1Value','Custom','metric1Label','Design','metric2Value','Bilingual','metric2Label','Service','metric3Value','Remote','metric3Label','Collaboration')),
    content_zh=jsonb_build_object('fields',jsonb_build_object('kicker','关于工作室','titleLine1','清晰思考。','titleAccent','独特设计。','lead','我们结合策略、设计与务实执行，打造清晰、易记并具成长力的品牌体验。','body','INfinity Design Studio 以专注、协作的方式，直接为企业提供英语与简体中文服务。','metric1Value','定制','metric1Label','设计','metric2Value','双语','metric2Label','服务','metric3Value','远程','metric3Label','协作'))
  where page_id=home_id and section_key='about';

  insert into public.page_sections(page_id,section_key,section_type,title_en,title_zh,content_en,content_zh,sort_order,is_visible)
  values(home_id,'services','three-column','Services & Pricing','服务与价格',
    jsonb_build_object('fields',jsonb_build_object('kicker','Services & Pricing','titleLine1','Focused services for','titleAccent','growing brands.','intro','Browse each category for service details, pricing and available project work.','card1Label','01 / BRAND SYSTEMS','card1Title','Branding & Identity','card1Text','Logo systems, identities, business cards and packaging.','card1Button','View Services','card1Link','work/branding-identity/','card2Label','02 / CAMPAIGNS','card2Title','Marketing Design','card2Text','Social media, posters, flyers, banners and menu design.','card2Button','View Services','card2Link','work/marketing-design/','card3Label','03 / DIGITAL','card3Title','Website Design','card3Text','Responsive websites, landing pages and foundational SEO.','card3Button','View Services','card3Link','work/website-design/')),
    jsonb_build_object('fields',jsonb_build_object('kicker','服务与价格','titleLine1','为成长中的品牌','titleAccent','提供专注服务。','intro','浏览各类别的服务详情、价格与可查看的项目作品。','card1Label','01 / 品牌系统','card1Title','品牌与视觉识别','card1Text','标志系统、品牌识别、名片与包装设计。','card1Button','查看服务','card1Link','work/branding-identity/','card2Label','02 / 营销活动','card2Title','营销设计','card2Text','社交媒体、海报、传单、横幅与菜单设计。','card2Button','查看服务','card2Link','work/marketing-design/','card3Label','03 / 数字体验','card3Title','网站设计','card3Text','响应式网站、落地页与基础 SEO。','card3Button','查看服务','card3Link','work/website-design/')),2,true)
  on conflict(page_id,section_key) do update set content_en=excluded.content_en,content_zh=excluded.content_zh,sort_order=excluded.sort_order,is_visible=true;

  update public.page_sections set sort_order=3, is_visible=true,
    content_en=jsonb_set(jsonb_set(jsonb_set(content_en,'{fields,card1Button}','"View Projects"'),'{fields,card2Button}','"View Projects"'),'{fields,card3Button}','"View Projects"'),
    content_zh=jsonb_set(jsonb_set(jsonb_set(content_zh,'{fields,card1Button}','"查看项目"'),'{fields,card2Button}','"查看项目"'),'{fields,card3Button}','"查看项目"')
  where page_id=home_id and section_key='portfolio';

  update public.page_sections set sort_order=4, is_visible=true,
    content_en=jsonb_build_object('fields',jsonb_build_object('kicker','Simple Process','titleLine1','A simple path from','titleAccent','brief to launch.','intro','Three focused stages keep every project clear, collaborative and efficient.','step1Title','Discover','step1Text','Goals, audience, requirements.','step2Title','Design','step2Text','Concepts, direction, refinement.','step3Title','Deliver','step3Text','Final files, launch support.')),
    content_zh=jsonb_build_object('fields',jsonb_build_object('kicker','简洁流程','titleLine1','从需求到上线的','titleAccent','清晰路径。','intro','三个专注阶段，让每个项目保持清晰、协作与高效。','step1Title','探索','step1Text','目标、受众、需求。','step2Title','设计','step2Text','概念、方向、优化。','step3Title','交付','step3Text','最终文件、上线支持。'))
  where page_id=home_id and section_key='process';

  update public.page_sections set sort_order=5, is_visible=true,
    content_en=jsonb_build_object('fields',jsonb_build_object('kicker','Contact','titleLine1','Ready to start','titleLine2','your next ','titleAccent','project?','description','Tell us what you need and we will reply with the next steps.','whatsappText','Chat on WhatsApp ↗','whatsappLink',coalesce(content_en#>>'{fields,whatsappLink}',''),'submitText','Send Inquiry')),
    content_zh=jsonb_build_object('fields',jsonb_build_object('kicker','联系','titleLine1','准备开始','titleLine2','您的下一个','titleAccent','项目吗？','description','告诉我们您的需求，我们会回复后续步骤。','whatsappText','WhatsApp 联系 ↗','whatsappLink',coalesce(content_zh#>>'{fields,whatsappLink}',''),'submitText','提交咨询'))
  where page_id=home_id and section_key='contact';
end $$;
