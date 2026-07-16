(function () {
  'use strict';
  const field = (key, label, en, zh, type = 'text') => ({ key, label, type, en, zh });
  const categoryFields = [
    field('card1Label', 'Category 1 label', '01 / BRAND SYSTEMS', '01 / 品牌系统'), field('card1Title', 'Category 1 title', 'Branding & Identity', '品牌与视觉识别'), field('card1Text', 'Category 1 description', 'Logo systems, identities, business cards and packaging.', '标志系统、品牌识别、名片与包装设计。', 'textarea'), field('card1Button', 'Category 1 button', 'View Services', '查看服务'), field('card1Link', 'Category 1 link', 'work/branding-identity/', 'work/branding-identity/', 'url'),
    field('card2Label', 'Category 2 label', '02 / CAMPAIGNS', '02 / 营销活动'), field('card2Title', 'Category 2 title', 'Marketing Design', '营销设计'), field('card2Text', 'Category 2 description', 'Social media, posters, flyers, banners and menu design.', '社交媒体、海报、传单、横幅与菜单设计。', 'textarea'), field('card2Button', 'Category 2 button', 'View Services', '查看服务'), field('card2Link', 'Category 2 link', 'work/marketing-design/', 'work/marketing-design/', 'url'),
    field('card3Label', 'Category 3 label', '03 / DIGITAL', '03 / 数字体验'), field('card3Title', 'Category 3 title', 'Website Design', '网站设计'), field('card3Text', 'Category 3 description', 'Responsive websites, landing pages and foundational SEO.', '响应式网站、落地页与基础 SEO。', 'textarea'), field('card3Button', 'Category 3 button', 'View Services', '查看服务'), field('card3Link', 'Category 3 link', 'work/website-design/', 'work/website-design/', 'url')
  ];
  window.INFINITY_VISUAL_SCHEMA = Object.freeze([
    { key: 'home', label: 'Hero', description: 'The first section visitors see.', icon: '00', fields: [
      field('eyebrow', 'Small heading', 'Branding · Marketing · Website Design', '品牌 · 营销 · 网站设计'),
      field('titleLine1', 'Title — first line', 'Designing brands.', '设计品牌。'), field('titlePrefix', 'Title — second line beginning', 'Building ', '创造'), field('titleAccent', 'Highlighted title', 'impact.', '影响力。'), field('titleSuffix', 'Title — second line ending', '', ''),
      field('description', 'Introduction', 'INfinity Design Studio helps businesses grow through strategic branding, marketing design and modern websites.', 'INfinity Design Studio 通过策略性品牌设计、营销设计与现代网站，助力企业成长。', 'textarea'),
      field('primaryButtonText', 'Primary button text', 'View Selected Work', '查看精选作品'), field('primaryButtonLink', 'Primary button link', '#portfolio', '#portfolio', 'url'),
      field('secondaryButtonText', 'Secondary button text', 'Start a Project', '开始项目'), field('secondaryButtonLink', 'Secondary button link', '#contact', '#contact', 'url'),
      field('scrollText', 'Scroll prompt', 'Scroll to explore', '滚动探索'), field('scrollLink', 'Scroll destination', '#about', '#about', 'url')
    ]},
    { key: 'about', label: 'About', description: 'Studio introduction and truthful service points.', icon: '01', fields: [
      field('kicker', 'Section label', 'About the studio', '关于工作室'), field('titleLine1', 'Title — first line', 'Clear thinking.', '清晰思考。'), field('titleAccent', 'Highlighted title', 'Distinctive design.', '独特设计。'),
      field('lead', 'Main paragraph', 'We combine strategy, design and practical execution to create brand experiences that are clear, memorable and ready to grow.', '我们结合策略、设计与务实执行，打造清晰、易记并具成长力的品牌体验。', 'textarea'),
      field('body', 'Supporting paragraph', 'INfinity Design Studio works directly with businesses through a focused, collaborative process in English and Simplified Chinese.', 'INfinity Design Studio 以专注、协作的方式，直接为企业提供英语与简体中文服务。', 'textarea'),
      field('metric1Value', 'Point 1 title', 'Custom', '定制'), field('metric1Label', 'Point 1 label', 'Design', '设计'), field('metric2Value', 'Point 2 title', 'Bilingual', '双语'), field('metric2Label', 'Point 2 label', 'Service', '服务'), field('metric3Value', 'Point 3 title', 'Remote', '远程'), field('metric3Label', 'Point 3 label', 'Collaboration', '协作')
    ]},
    { key: 'services', label: 'Services & Pricing', description: 'The three service categories on the homepage.', icon: '02', fields: [
      field('kicker', 'Section label', 'Services & Pricing', '服务与价格'), field('titleLine1', 'Title — first line', 'Focused services for', '为成长中的品牌'), field('titleAccent', 'Highlighted title', 'growing brands.', '提供专注服务。'), field('intro', 'Introduction', 'Browse each category for service details, pricing and available project work.', '浏览各类别的服务详情、价格与可查看的项目作品。', 'textarea'), ...categoryFields
    ]},
    { key: 'portfolio', label: 'Selected Work', description: 'The three project categories shown on the homepage.', icon: '03', fields: [
      field('kicker', 'Section label', 'Selected Work', '精选作品'), field('titleLine1', 'Title — first line', 'Ideas, made', '将创意化为'), field('titleAccent', 'Highlighted title', 'tangible.', '真实成果。'), field('intro', 'Introduction', 'Browse selected work across our three core disciplines.', '浏览我们三个核心领域的精选作品。', 'textarea'), ...categoryFields.map(item => ({ ...item, en: item.key.includes('Button') ? 'View Projects' : item.en, zh: item.key.includes('Button') ? '查看项目' : item.zh }))
    ]},
    { key: 'process', label: 'Simple Process', description: 'The three-step studio process.', icon: '04', fields: [
      field('kicker', 'Section label', 'Simple Process', '简洁流程'), field('titleLine1', 'Title — first line', 'A simple path from', '从需求到上线的'), field('titleAccent', 'Highlighted title', 'brief to launch.', '清晰路径。'), field('intro', 'Introduction', 'Three focused stages keep every project clear, collaborative and efficient.', '三个专注阶段，让每个项目保持清晰、协作与高效。', 'textarea'),
      field('step1Title', 'Step 1 title', 'Discover', '探索'), field('step1Text', 'Step 1 description', 'Goals, audience, requirements.', '目标、受众、需求。', 'textarea'), field('step2Title', 'Step 2 title', 'Design', '设计'), field('step2Text', 'Step 2 description', 'Concepts, direction, refinement.', '概念、方向、优化。', 'textarea'), field('step3Title', 'Step 3 title', 'Deliver', '交付'), field('step3Text', 'Step 3 description', 'Final files, launch support.', '最终文件、上线支持。', 'textarea')
    ]},
    { key: 'contact', label: 'Contact', description: 'Project enquiry introduction and WhatsApp action.', icon: '05', fields: [
      field('kicker', 'Section label', 'Contact', '联系'), field('titleLine1', 'Title — first line', 'Ready to start', '准备开始'), field('titleLine2', 'Title — second line', 'your next ', '您的下一个'), field('titleAccent', 'Highlighted title', 'project?', '项目吗？'), field('description', 'Introduction', 'Tell us what you need and we will reply with the next steps.', '告诉我们您的需求，我们会回复后续步骤。', 'textarea'),
      field('whatsappText', 'WhatsApp button text', 'Chat on WhatsApp ↗', 'WhatsApp 联系 ↗'), field('whatsappLink', 'WhatsApp link', '#', '#', 'url'), field('submitText', 'Form submit button', 'Send Inquiry', '提交咨询')
    ]}
  ]);
})();
