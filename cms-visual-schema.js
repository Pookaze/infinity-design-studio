(function () {
  'use strict';
  const field = (key, label, en, zh, type = 'text') => ({ key, label, type, en, zh });
  window.INFINITY_VISUAL_SCHEMA = Object.freeze([
    {
      key: 'home', label: 'Hero Section', description: 'The first section visitors see.', icon: '✦',
      fields: [
        field('eyebrow', 'Small heading', 'A premium independent design studio creating distinctive brands and digital experiences.', '打造独特品牌与数字体验的高端独立设计工作室。'),
        field('titleLine1', 'Title — first line', 'Ideas that become inevitable.', '让创意成为必然。'),
        field('titlePrefix', 'Title — second line beginning', 'with ', '创造'), field('titleAccent', 'Highlighted title word', 'lasting', '长久'), field('titleSuffix', 'Title — second line ending', ' impact.', '影响力。'),
        field('description', 'Introduction', 'INfinity is an independent design studio crafting distinctive identities, websites, packaging and campaigns for businesses ready to stand apart.', 'INfinity 是一家独立设计工作室，为希望脱颖而出的企业打造独特的品牌形象、网站、包装与营销活动。', 'textarea'),
        field('primaryButtonText', 'Primary button text', 'View selected work', '查看精选作品'),
        field('primaryButtonLink', 'Primary button link', '#portfolio', '#portfolio', 'url'),
        field('secondaryButtonText', 'Secondary button text', 'Work with us', '与我们合作'),
        field('secondaryButtonLink', 'Secondary button link', '#contact', '#contact', 'url'),
        field('scrollText', 'Scroll prompt', 'Scroll to explore', '滚动探索'),
        field('scrollLink', 'Scroll destination', '#about', '#about', 'url')
      ]
    },
    {
      key: 'about', label: 'About Section', description: 'Studio introduction and headline metrics.', icon: '01',
      fields: [
        field('kicker', 'Section label', 'About the studio', '关于工作室'),
        field('titleLine1', 'Title — first line', 'About INfinity', '关于 INfinity'),
        field('titleAccent', 'Highlighted title', 'Design with purpose.', '以目标为导向的设计。'),
        field('lead', 'Main paragraph', 'We build visual systems with clarity, character and commercial purpose.', '我们以清晰思维、鲜明个性与商业目标构建视觉系统。', 'textarea'),
        field('body', 'Supporting paragraph', 'INfinity Design Studio partners with founders and forward-thinking businesses to build visual worlds that are coherent, memorable and made to endure.', 'INfinity Design Studio 与创始人及前瞻型企业合作，构建统一、难忘且经久不衰的视觉世界。', 'textarea'),
        field('metric1Value', 'Metric 1 value', '100+', '100+'), field('metric1Label', 'Metric 1 label', 'Projects crafted', '完成项目'),
        field('metric2Value', 'Metric 2 value', '8+', '8+'), field('metric2Label', 'Metric 2 label', 'Years of practice', '设计经验'),
        field('metric3Value', 'Metric 3 value', '96%', '96%'), field('metric3Label', 'Metric 3 label', 'Client referrals', '客户推荐')
      ]
    },
    {
      key: 'portfolio', label: 'Selected Work Section', description: 'The three main Work categories shown on the homepage.', icon: '03',
      fields: [
        field('kicker', 'Section label', 'Selected Work', '精选作品'),
        field('titleLine1', 'Title — first line', 'Ideas, made', '将创意化为'), field('titleAccent', 'Highlighted title', 'tangible.', '真实成果。'),
        field('intro', 'Introduction', 'Published projects from the studio.', '工作室已发布的项目作品。', 'textarea'),
        field('card1Label', 'Category 1 label', '01 / BRAND SYSTEMS', '01 / 品牌系统'), field('card1Title', 'Category 1 title', 'Branding & Identity', '品牌与视觉识别'), field('card1Text', 'Category 1 description', 'Distinctive logos, identity systems, business cards and packaging designed to build recognition.', '通过独特的标志、视觉系统、名片与包装设计建立品牌认知。', 'textarea'), field('card1Button', 'Category 1 button', 'Explore Category', '浏览类别'), field('card1Link', 'Category 1 link', 'work/branding-identity/', 'work/branding-identity/', 'url'),
        field('card2Label', 'Category 2 label', '02 / CAMPAIGNS', '02 / 营销活动'), field('card2Title', 'Category 2 title', 'Marketing Design', '营销设计'), field('card2Text', 'Category 2 description', 'Strategic social media, posters, flyers, banners and menus that make every message stand out.', '以策略性的社交媒体、海报、宣传单、横幅与菜单设计，让每一条信息脱颖而出。', 'textarea'), field('card2Button', 'Category 2 button', 'Explore Category', '浏览类别'), field('card2Link', 'Category 2 link', 'work/marketing-design/', 'work/marketing-design/', 'url'),
        field('card3Label', 'Category 3 label', '03 / DIGITAL', '03 / 数字体验'), field('card3Title', 'Category 3 title', 'Website Design', '网站设计'), field('card3Text', 'Category 3 description', 'Modern, responsive websites and landing pages designed for clarity, credibility and conversion.', '打造现代响应式网站与落地页，提升清晰度、可信度与转化表现。', 'textarea'), field('card3Button', 'Category 3 button', 'Explore Category', '浏览类别'), field('card3Link', 'Category 3 link', 'work/website-design/', 'work/website-design/', 'url')
      ]
    },
    {
      key: 'process', label: 'Design Process', description: 'The five-step studio process.', icon: '04',
      fields: [
        field('kicker', 'Section label', 'Design Process', '设计流程'), field('titleLine1', 'Title — first line', 'A clear path to', '通往卓越作品的'), field('titleAccent', 'Highlighted title', 'exceptional work.', '清晰路径。'), field('intro', 'Introduction', 'Our focused process keeps every project collaborative, considered and moving forward.', '我们专注的流程确保每个项目协作顺畅、思考周全并持续推进。', 'textarea'),
        field('step1Title', 'Step 1 title', 'Discovery', '探索'), field('step1Text', 'Step 1 description', 'We learn your goals, audience and competitive landscape.', '了解您的目标、受众和竞争环境。', 'textarea'),
        field('step2Title', 'Step 2 title', 'Concept', '概念'), field('step2Text', 'Step 2 description', 'We define the creative direction and strategic idea.', '明确创意方向与策略理念。', 'textarea'),
        field('step3Title', 'Step 3 title', 'Design', '设计'), field('step3Text', 'Step 3 description', 'We translate the direction into a distinctive visual system.', '将方向转化为独特的视觉系统。', 'textarea'),
        field('step4Title', 'Step 4 title', 'Refinement', '优化'), field('step4Text', 'Step 4 description', 'We sharpen every detail through focused collaboration.', '通过专注协作打磨每个细节。', 'textarea'),
        field('step5Title', 'Step 5 title', 'Delivery', '交付'), field('step5Text', 'Step 5 description', 'You receive organized, high-resolution, commercial-ready files.', '交付整理完善、高分辨率且可商用的文件。', 'textarea')
      ]
    },
    {
      key: 'why-us', label: 'Why Choose Us', description: 'Studio advantages and reasons to choose INfinity.', icon: '05',
      fields: [
        field('kicker', 'Section label', 'Why choose INfinity', '为何选择 INfinity'), field('titleLine1', 'Title — first line', 'Small studio.', '小型工作室。'), field('titleAccent', 'Highlighted title', 'Serious impact.', '创造深远影响。'), field('intro', 'Introduction', 'Direct collaboration, senior-level thinking and craft that never gets delegated down the line.', '直接协作、资深思维与始终如一的精湛工艺。', 'textarea'),
        field('reason1Title', 'Reason 1 title', 'Original custom design', '原创定制设计'), field('reason1Text', 'Reason 1 description', 'No templates or borrowed trends—only original work shaped around your story.', '拒绝模板和跟风，只为您的故事打造原创作品。', 'textarea'),
        field('reason2Title', 'Reason 2 title', 'Professional communication', '专业沟通'), field('reason2Text', 'Reason 2 description', 'A clear, collaborative process with thoughtful updates at every stage.', '清晰协作的流程，并在每个阶段提供周到更新。', 'textarea'),
        field('reason3Title', 'Reason 3 title', 'Fast turnaround', '快速交付'), field('reason3Text', 'Reason 3 description', 'Focused project schedules keep momentum high without compromising craft.', '专注的项目安排，在不牺牲品质的前提下保持高效推进。', 'textarea'),
        field('reason4Title', 'Reason 4 title', 'Multiple revisions', '多轮修改'), field('reason4Text', 'Reason 4 description', 'Structured refinement rounds make sure every detail feels right.', '结构化的优化轮次，确保每个细节都恰到好处。', 'textarea'),
        field('reason5Title', 'Reason 5 title', 'High-resolution files', '高分辨率文件'), field('reason5Text', 'Reason 5 description', 'Organized final assets for print, web, social and every application.', '为印刷、网站、社交媒体及各类应用提供整理完善的最终文件。', 'textarea'),
        field('reason6Title', 'Reason 6 title', 'Commercial-ready output', '可商用成果'), field('reason6Text', 'Reason 6 description', 'Flexible systems created to perform consistently in the real world.', '打造灵活系统，在真实商业环境中保持一致表现。', 'textarea')
      ]
    },
    {
      key: 'testimonials', label: 'Client Testimonial', description: 'The featured client quote.', icon: '06',
      fields: [
        field('kicker', 'Section label', 'Client words', '客户评价'),
        field('quote', 'Client quote', "INfinity didn't just redesign our identity—they gave our business a new level of confidence. Every detail feels intentional, premium and unmistakably ours.", 'INfinity 不仅重新设计了我们的品牌形象，更为企业带来了全新的自信。每个细节都精心考量、高级且独具特色。', 'textarea'),
        field('author', 'Client name', 'Amelia Reed', '阿米莉亚·里德'), field('role', 'Client role', 'Founder, Maison & Co.', '美颂公司创始人')
      ]
    },
    {
      key: 'faq', label: 'FAQ Section', description: 'Frequently asked questions and answers.', icon: '07',
      fields: [
        field('kicker', 'Section label', 'Frequently asked', '常见问题'), field('titleLine1', 'Title — first line', 'Questions,', '问题，'), field('titleAccent', 'Highlighted title', 'answered.', '为您解答。'), field('intro', 'Introduction', 'Need something else? Send us a note and we’ll be happy to help.', '还有其他问题？欢迎联系我们，我们很乐意提供帮助。', 'textarea'),
        field('q1', 'Question 1', 'What does a typical project include?', '一个常规项目包含哪些内容？'), field('a1', 'Answer 1', 'Every engagement is tailored, but typically includes discovery, creative direction, concept development, refinement and production-ready final assets.', '每个项目都会量身定制，通常包括探索、创意方向、概念开发、优化以及可直接使用的最终文件。', 'textarea'),
        field('q2', 'Question 2', 'How long does a branding project take?', '品牌项目通常需要多长时间？'), field('a2', 'Answer 2', 'Most identity projects take four to eight weeks, depending on scope, feedback cadence and the number of required applications.', '大多数品牌项目需要四到八周，具体取决于项目范围、反馈节奏和所需应用数量。', 'textarea'),
        field('q3', 'Question 3', 'Do you work with international clients?', '你们是否与国际客户合作？'), field('a3', 'Answer 3', 'Yes. Our process is designed for seamless remote collaboration with businesses anywhere in the world.', '是的，我们的流程专为顺畅的远程协作而设计，可服务全球企业。', 'textarea'),
        field('q4', 'Question 4', 'What do you need to get started?', '开始项目需要准备什么？'), field('a4', 'Answer 4', 'A clear brief, your goals and an initial conversation are enough. We will guide you through everything else.', '一份清晰的需求、您的目标和一次初步沟通就足够了，其余部分我们会全程引导。', 'textarea')
      ]
    },
    {
      key: 'contact', label: 'Contact Section', description: 'The contact introduction and primary actions.', icon: '08',
      fields: [
        field('kicker', 'Section label', 'Start a conversation', '开始沟通'), field('titleLine1', 'Title — first line', 'Start a Project', '开始项目'), field('titleLine2', 'Title — second line', 'something', '一些'), field('titleAccent', 'Highlighted title', 'iconic.', '标志性的作品。'), field('description', 'Introduction', 'Tell us about your goals, audience and timeline.', '告诉我们您的目标、受众和时间计划。', 'textarea'),
        field('emailText', 'Email button text', 'Email us ↗', '发送邮件 ↗'), field('emailLink', 'Email address', 'mailto:hello@infinitydesignstudio.com', 'mailto:hello@infinitydesignstudio.com', 'url'),
        field('whatsappText', 'WhatsApp button text', 'WhatsApp ↗', '即时通讯 ↗'), field('whatsappLink', 'WhatsApp link', '#', '#', 'url'), field('submitText', 'Form submit button', 'Send inquiry', '提交咨询')
      ]
    }
  ]);
})();
