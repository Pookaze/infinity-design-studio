(function () {
  'use strict';

  const pair = (en, zh) => [en, zh];
  const image = (src, en, zh, width = 900, height = 900) => ({ src, alt: pair(en, zh), width, height });
  const portfolio = (folder, names) => names.map((name, index) => image(
    `assets/images/portfolio/${folder}/project-${index + 1}.webp`,
    name[0], name[1]
  ));
  const website = (folder, heroAlt, extras) => [
    image(`assets/images/projects/${folder}/hero.webp`, heroAlt[0], heroAlt[1], 1536, 1024),
    ...extras.map((alt, index) => image(`assets/images/portfolio/website/project-${index + 1}.webp`, alt[0], alt[1]))
  ];

  window.infinityCaseStudies = {
    'logo-design': {
      layout: 'editorial', accent: '#c5a46d', brand: 'Aurelia Atelier',
      title: pair('Aurelia — A Mark Made to Endure', 'Aurelia —— 经得起时间考验的品牌标志'),
      overview: pair('A refined identity for a fictional made-to-measure fashion house, balancing a sculpted monogram with quiet, modern restraint.', '为虚构高级定制服装品牌打造的精致形象，以雕塑感字母标志结合克制、现代的视觉语言。'),
      client: pair('Aurelia Atelier creates small-run tailoring for clients who value craft, provenance and a deeply personal fit.', 'Aurelia Atelier 专注小批量高级定制，为重视工艺、传承与个人化剪裁的顾客服务。'),
      objectives: [pair('Create an ownable monogram with strong small-size recognition.', '打造在小尺寸下仍具辨识度的专属字母标志。'), pair('Express luxury without relying on decorative excess.', '以克制方式传达奢华感，避免过度装饰。'), pair('Build a mark that works across print, signage and digital touchpoints.', '确保标志适用于印刷、招牌与数码接触点。')],
      process: [pair('Brand audit', '品牌审视'), pair('Symbol exploration', '符号探索'), pair('Optical refinement', '视觉校正'), pair('Application testing', '应用测试')],
      colors: [['#0b0b0b', 'Atelier Black', '工坊黑'], ['#c5a46d', 'Antique Gold', '古金色'], ['#f0ece4', 'Silk Ivory', '丝绸象牙白']],
      type: pair('A high-contrast display serif carries the fashion voice, supported by a neutral grotesk for practical information.', '以高对比展示衬线体承载时装气质，并以中性无衬线体处理实用信息。'),
      deliverables: [pair('Primary monogram', '主字母标志'), pair('Wordmark system', '标准字系统'), pair('Usage guide', '使用规范'), pair('Application mockups', '应用效果图')],
      images: portfolio('logo', [["Gold monogram pressed into black stock", '烫金字母标志压印于黑色纸材'], ["Metal technology mark on brushed steel", '拉丝钢材上的金属科技标志'], ["Premium circular café sign in warm light", '暖光中的精品咖啡圆形招牌'], ["Minimal restaurant wordmark on textured paper", '纹理纸上的简约餐厅字标'], ["Embossed real-estate mark on a dark card", '深色卡片上的房地产压印标志'], ["Modern startup office-wall signage", '现代初创公司办公室墙面标志']])
    },
    'brand-identity': {
      layout: 'mosaic', accent: '#9a8060', brand: 'Noema House',
      title: pair('Noema House — A Complete Living Identity', 'Noema House —— 完整的生活方式品牌形象'),
      overview: pair('A warm, architectural identity system for a fictional boutique residence and home-goods concept.', '为虚构精品住宅与家居概念打造温暖、建筑感鲜明的完整品牌识别系统。'),
      client: pair('Noema House brings considered objects, intimate stays and slow-living experiences under one roof.', 'Noema House 将精选家居、精品住宿与慢生活体验整合于同一品牌之下。'),
      objectives: [pair('Unify hospitality and retail under one memorable system.', '以统一且易记的系统连接住宿与零售。'), pair('Translate architectural calm into tactile brand materials.', '将建筑空间的宁静转化为可触摸的品牌材质。'), pair('Create flexible guidelines for a growing in-house team.', '建立便于内部团队持续扩展的灵活规范。')],
      process: [pair('Positioning', '品牌定位'), pair('Visual territory', '视觉领域'), pair('System design', '系统设计'), pair('Guideline build', '规范建立')],
      colors: [['#12110f', 'Noema Ink', 'Noema 墨黑'], ['#a48962', 'Burnished Brass', '抛光黄铜'], ['#e8e0d3', 'Limestone', '石灰岩色'], ['#716b61', 'Warm Slate', '暖灰岩']],
      type: pair('An elegant editorial serif gives the brand warmth; a disciplined sans serif keeps wayfinding and packaging clear.', '优雅编辑衬线体赋予品牌温度，严谨无衬线体确保导视与包装清晰。'),
      deliverables: [pair('Identity standards', '品牌识别规范'), pair('Stationery suite', '办公文具套装'), pair('Retail packaging', '零售包装'), pair('Hospitality collateral', '酒店物料')],
      images: portfolio('branding', [["Luxury identity guideline spread", '奢华品牌规范内页'], ["Business stationery identity suite", '品牌办公文具系统'], ["Shopping bag and retail packaging family", '购物袋与零售包装系列'], ["Letterhead and envelope presentation", '信纸与信封展示'], ["Notebook and brand collateral", '笔记本与品牌物料'], ["Complete identity system presentation", '完整品牌识别系统展示']])
    },
    'business-card': {
      layout: 'split', accent: '#d0ad6a', brand: 'Vanta Partners',
      title: pair('Vanta Partners — Precision in Every Introduction', 'Vanta Partners —— 每次介绍都精准有力'),
      overview: pair('A tactile business-card system for a fictional private advisory firm, designed to feel assured before a word is spoken.', '为虚构私人顾问公司打造触感鲜明的名片系统，在开口之前便传达稳重与信任。'),
      client: pair('Vanta Partners advises founders and family-owned companies through high-stakes moments of change.', 'Vanta Partners 为创办人及家族企业的重要转型时刻提供顾问服务。'),
      objectives: [pair('Signal discretion and authority through material choice.', '通过材质选择传达谨慎与权威。'), pair('Keep dense contact details exceptionally legible.', '确保完整联系信息仍保持高度易读。'), pair('Create role variants without weakening brand consistency.', '建立不同职位版本，同时保持品牌一致性。')],
      process: [pair('Content hierarchy', '信息层级'), pair('Paper testing', '纸材测试'), pair('Finish trials', '工艺测试'), pair('Production artwork', '生产文件')],
      colors: [['#080808', 'Carbon', '碳黑'], ['#d0ad6a', 'Foil Gold', '烫金色'], ['#f4f1ea', 'Cotton White', '棉纸白']],
      type: pair('A contemporary sans serif sets concise details with generous spacing; restrained capitals add ceremony.', '现代无衬线体以宽松间距处理简洁信息，克制的大写字母增添仪式感。'),
      deliverables: [pair('Partner cards', '合伙人名片'), pair('Team variants', '团队版本'), pair('Foil specification', '烫金工艺规范'), pair('Print-ready files', '印刷成品文件')],
      images: portfolio('business-card', [["Black and gold foil business cards", '黑金烫金名片'], ["Minimal white cotton cards", '简约白色棉纸名片'], ["Close-up foil detail", '烫金细节特写'], ["Deep embossed card pair", '深压印名片组合'], ["Rounded-corner card system", '圆角名片系统'], ["Business card held naturally in hand", '手持名片真实效果']])
    },
    'packaging': {
      layout: 'stacked', accent: '#b08b55', brand: 'Solenne Botanics',
      title: pair('Solenne Botanics — Ritual, Bottled', 'Solenne Botanics —— 将仪式感装入瓶中'),
      overview: pair('A premium packaging family for a fictional botanical skincare studio, uniting responsible materials with shelf presence.', '为虚构植物护肤工作室设计的高级包装系列，兼顾环保材质与货架吸引力。'),
      client: pair('Solenne Botanics produces low-volume oils and balms from traceable plant ingredients.', 'Solenne Botanics 以可追溯植物原料，小批量制作精油与香膏。'),
      objectives: [pair('Build a recognisable family across varied container formats.', '在不同容器形式之间建立清晰的产品家族。'), pair('Make ingredients and usage information easy to navigate.', '让成分与使用说明易于查阅。'), pair('Elevate recyclable materials through considered finishing.', '以精细工艺提升可回收材质的质感。')],
      process: [pair('Range architecture', '产品架构'), pair('Dieline design', '刀模设计'), pair('Material sampling', '材质打样'), pair('Press proofing', '印刷校样')],
      colors: [['#17150f', 'Forest Ink', '森林墨色'], ['#b08b55', 'Herbal Gold', '草本金'], ['#ded4c3', 'Clay', '陶土色'], ['#74765e', 'Sage', '鼠尾草绿']],
      type: pair('A graceful serif adds an apothecary note while a compact sans serif keeps labels compliant and readable.', '优雅衬线体带来药房气质，紧凑无衬线体确保标签合规且清晰。'),
      deliverables: [pair('Six-SKU system', '六款产品系统'), pair('Primary packaging', '主包装'), pair('Shipping set', '运输包装'), pair('Production guide', '生产规范')],
      images: portfolio('packaging', [["Premium coffee pouch packaging", '精品咖啡袋包装'], ["Perfume carton and bottle presentation", '香水盒与瓶身展示'], ["Botanical cosmetic packaging family", '植物护肤包装系列'], ["Premium food box presentation", '高级食品盒展示'], ["Bottle label system", '瓶身标签系统'], ["Luxury shopping bag and shipping box", '奢华购物袋与运输箱']])
    },
    'social-media': {
      layout: 'campaign', accent: '#c99577', brand: 'Eira Skin',
      title: pair('Eira Skin — The Quiet Glow Campaign', 'Eira Skin —— 静谧光泽整合传播'),
      overview: pair('A modular launch campaign for a fictional skincare brand, designed for coherent storytelling across feeds, stories and paid media.', '为虚构护肤品牌打造模块化上市传播，在动态、限时内容与广告之间形成连贯故事。'),
      client: pair('Eira Skin creates fragrance-free formulas for sensitive urban skin and a design-aware audience.', 'Eira Skin 为敏感都市肌肤与重视设计的消费者研发无香配方。'),
      objectives: [pair('Introduce the product benefit without clinical coldness.', '介绍产品功效，同时避免临床式冷漠感。'), pair('Create recognisable assets across social formats.', '在不同社交媒体尺寸中建立辨识度。'), pair('Balance education, product desire and conversion.', '平衡知识教育、产品吸引力与转化。')],
      process: [pair('Content pillars', '内容支柱'), pair('Art direction', '美术指导'), pair('Template system', '模板系统'), pair('Campaign rollout', '传播执行')],
      colors: [['#211915', 'Cocoa Ink', '可可墨色'], ['#c99577', 'Skin Rose', '肤色玫瑰'], ['#efe4da', 'Oat Milk', '燕麦奶色']],
      type: pair('A humanist sans serif keeps educational copy approachable; a soft display serif adds editorial warmth.', '人文无衬线体让知识内容更亲切，柔和展示衬线体增添编辑温度。'),
      deliverables: [pair('Launch feed', '上市动态系列'), pair('Carousel system', '轮播模板系统'), pair('Story templates', '限时动态模板'), pair('Paid ad set', '付费广告系列')],
      images: portfolio('social', [["Luxury skincare feed shown in a phone", '手机中的奢华护肤动态'], ["Educational carousel design", '知识型轮播设计'], ["Vertical story campaign", '竖版限时动态传播'], ["Facebook campaign post", 'Facebook 品牌传播贴文'], ["Paid product advertisement", '产品付费广告'], ["Coordinated social campaign grid", '统一社交媒体传播网格']])
    },
    'poster': {
      layout: 'mosaic', accent: '#d29a50', brand: 'Signal / Three',
      title: pair('Signal / Three — Commercial Poster Series', 'Signal / Three —— 商业海报系列'),
      overview: pair('Three high-impact posters for fictional fintech, retail and property launches, unified by disciplined hierarchy and cinematic composition.', '为虚构金融科技、零售与地产项目打造三款高冲击力海报，以严谨层级和电影感构图统一呈现。'),
      client: pair('Signal / Three is a fictional campaign collection exploring how distinct sectors can share a confident commercial finish.', 'Signal / Three 是一个虚构传播系列，探索不同行业如何共享坚定、成熟的商业表现。'),
      objectives: [pair('Create immediate hierarchy at street-view distance.', '在街头观看距离下建立即时信息层级。'), pair('Give each sector a distinct visual world.', '为每个行业建立独特视觉世界。'), pair('Prepare adaptable artwork for print and digital placements.', '制作适用于印刷与数码投放的可变文件。')],
      process: [pair('Message framing', '信息规划'), pair('Composition studies', '构图研究'), pair('Image direction', '影像指导'), pair('Print preparation', '印前准备')],
      colors: [['#0a0a0b', 'Night', '夜黑'], ['#d29a50', 'Signal Amber', '信号琥珀'], ['#f1efe9', 'Paper White', '纸白'], ['#315fd8', 'Digital Blue', '数码蓝']],
      type: pair('Condensed display typography drives impact while a neutral sans serif manages supporting campaign information.', '窄体展示字体负责视觉冲击，中性无衬线体承载辅助传播信息。'),
      deliverables: [pair('Three key visuals', '三款主视觉'), pair('Street formats', '街头广告尺寸'), pair('Digital crops', '数码裁切版本'), pair('Print masters', '印刷母版')],
      images: [image('assets/images/projects/poster-design/usdt-fee-check-poster.webp', 'Fintech fee-check campaign poster', '金融科技手续费查询传播海报', 1254, 1254), image('assets/images/projects/poster-design/amazon-shop-smarter-poster.webp', 'E-commerce product promotion poster', '电商产品推广海报', 1254, 1254), image('assets/images/projects/poster-design/sunway-velocity-two-poster.webp', 'Property launch campaign poster', '地产项目上市传播海报', 1280, 960), image('assets/images/projects/poster-design/after-sams-pizza-poster.jpg', "After Sam's pizza promotion poster with a 30 percent discount offer", "After Sam's 披萨促销海报，展示七折优惠", 1448, 1086), image('assets/images/projects/poster-design/velvet-noir-grand-opening-poster.webp', 'Velvet Noir bar grand opening poster', 'Velvet Noir 酒吧盛大开幕海报', 1254, 1254), image('assets/images/projects/poster-design/byd-malaysia-premium-ev-showcase-poster.webp', 'BYD Malaysia premium EV showcase poster', '比亚迪马来西亚高端电动车展示海报', 1254, 1254)]
    },
    'flyer': {
      layout: 'editorial', accent: '#c5a05a', brand: 'Common Ground',
      title: pair('Common Ground — A Print Series for Local Places', 'Common Ground —— 为本地空间打造的印刷系列'),
      overview: pair('A versatile flyer system for a fictional neighbourhood collective, giving six different events one recognisable voice.', '为虚构社区品牌设计的多用途传单系统，让六类活动拥有一致且易识别的声音。'),
      client: pair('Common Ground connects independent restaurants, studios, property teams and community events.', 'Common Ground 连接独立餐厅、工作室、地产团队与社区活动。'),
      objectives: [pair('Create a repeatable print hierarchy.', '建立可重复使用的印刷层级。'), pair('Keep practical information fast to scan.', '让实用信息可快速浏览。'), pair('Allow each event to feel distinct within one family.', '让每项活动在同一系统内保持个性。')],
      process: [pair('Format grid', '版式网格'), pair('Information mapping', '信息规划'), pair('Image treatment', '影像处理'), pair('Press checks', '印刷检查')],
      colors: [['#111111', 'Process Black', '印刷黑'], ['#c5a05a', 'Warm Gold', '暖金色'], ['#f3eee3', 'Uncoated', '自然纸色']],
      type: pair('A bold grotesk creates quick hierarchy, paired with a compact text face for schedules and contact details.', '粗体无衬线体建立快速层级，并搭配紧凑正文字体处理日程与联系资料。'),
      deliverables: [pair('Six flyer concepts', '六款传单概念'), pair('A5 print files', 'A5 印刷文件'), pair('Digital versions', '数码版本'), pair('Template guide', '模板指南')],
      images: portfolio('flyer', [["Restaurant flyer on realistic paper", '真实纸张上的餐厅传单'], ["Corporate event flyer", '企业活动传单'], ["Live event flyer presentation", '现场活动传单展示'], ["Fitness campaign flyer", '健身传播传单'], ["Real-estate flyer mockup", '房地产传单效果图'], ["Coffee-shop flyer on a tabletop", '桌面上的咖啡店传单']])
    },
    'banner': {
      layout: 'split', accent: '#c9a55f', brand: 'Axis Forum',
      title: pair('Axis Forum — One Campaign, Every Scale', 'Axis Forum —— 一个传播概念，覆盖所有尺度'),
      overview: pair('A scalable banner campaign for a fictional innovation forum, moving seamlessly from digital headers to physical environments.', '为虚构创新论坛打造可扩展横幅传播，从数码页首无缝延伸至实体空间。'),
      client: pair('Axis Forum brings together technology, design and policy leaders for a three-day annual event.', 'Axis Forum 每年汇聚科技、设计与政策领袖，举办为期三天的交流活动。'),
      objectives: [pair('Protect hierarchy across extreme aspect ratios.', '在极端宽高比中保持信息层级。'), pair('Create instant recognition at distance.', '在远距离下建立即时辨识度。'), pair('Keep production practical across digital and print.', '确保数码与印刷生产均高效可行。')],
      process: [pair('Key visual', '主视觉'), pair('Responsive grid', '响应式网格'), pair('Format adaptation', '尺寸适配'), pair('Production rollout', '生产执行')],
      colors: [['#0b0c0f', 'Forum Black', '论坛黑'], ['#c9a55f', 'Axis Gold', '轴线金'], ['#e8e9eb', 'Light', '亮灰'], ['#344a73', 'Signal Navy', '信号海军蓝']],
      type: pair('A geometric sans serif anchors the system; oversized numerals create rhythm and wayfinding value.', '几何无衬线体稳固系统，超大数字形成节奏并提供导视价值。'),
      deliverables: [pair('Website banners', '网站横幅'), pair('Social covers', '社交媒体封面'), pair('Roll-up system', '易拉宝系统'), pair('Outdoor suite', '户外广告系列')],
      images: portfolio('banner', [["Wide website campaign hero", '宽幅网站传播页首'], ["Facebook cover design", 'Facebook 封面设计'], ["LinkedIn event banner", 'LinkedIn 活动横幅'], ["Roll-up banner in an event space", '活动空间中的易拉宝'], ["Trade-show banner system", '展会横幅系统'], ["Outdoor advertising presentation", '户外广告展示']])
    },
    'menu': {
      layout: 'stacked', accent: '#b78d50', brand: 'Morrow Table',
      title: pair('Morrow Table — A Menu with a Sense of Place', 'Morrow Table —— 一份有地域感的菜单'),
      overview: pair('A tactile menu system for a fictional seasonal restaurant, designed to support discovery without slowing the dining experience.', '为虚构季节餐厅打造触感鲜明的菜单系统，鼓励探索，同时保持点餐体验流畅。'),
      client: pair('Morrow Table serves ingredient-led dishes that change with small farms and coastal suppliers.', 'Morrow Table 以食材为核心，菜单随小型农场与沿海供应商的时令供给而变化。'),
      objectives: [pair('Make changing seasonal sections easy to update.', '让季节栏目便于持续更新。'), pair('Guide diners through a considered meal progression.', '引导顾客顺畅理解用餐顺序。'), pair('Create a durable object that belongs on the table.', '打造耐用且与餐桌环境相融的实体菜单。')],
      process: [pair('Content architecture', '内容架构'), pair('Reading flow', '阅读动线'), pair('Material prototypes', '材质原型'), pair('Table testing', '餐桌测试')],
      colors: [['#13110e', 'Charred Oak', '炭化橡木'], ['#b78d50', 'Brass', '黄铜'], ['#e6ddce', 'Linen', '亚麻色'], ['#5e6657', 'Herb', '香草绿']],
      type: pair('A literary serif gives dishes character; a crisp sans serif keeps ingredients, notes and dietary markers precise.', '文学感衬线体赋予菜品个性，清晰无衬线体精确处理食材、说明与饮食标记。'),
      deliverables: [pair('Dinner menu', '晚餐菜单'), pair('Cocktail list', '鸡尾酒单'), pair('Dessert card', '甜品卡'), pair('Editable template', '可编辑模板')],
      images: portfolio('menu', [["Cafe menu on a warm table", '暖色餐桌上的咖啡馆菜单'], ["Restaurant menu spread", '餐厅菜单展开页'], ["Fine-dining menu presentation", '精致餐饮菜单展示'], ["Cocktail-bar menu in low light", '低光环境中的鸡尾酒单'], ["Dessert-shop menu card", '甜品店菜单卡'], ["Complete tabletop menu family", '完整餐桌菜单系列']])
    },
    'business-website': {
      layout: 'technical', accent: '#b27a4c', brand: 'Northline Advisory',
      title: pair('Northline Advisory — Clarity in Complexity', 'Northline Advisory —— 在复杂中建立清晰'),
      overview: pair('A responsive corporate website for a fictional architectural advisory, turning complex expertise into an assured digital narrative.', '为虚构建筑顾问公司打造响应式企业网站，将复杂专业能力转化为可信、清晰的数码叙事。'),
      client: pair('Northline Advisory helps organisations plan ambitious cultural and commercial spaces.', 'Northline Advisory 协助机构规划具雄心的文化与商业空间。'),
      objectives: [pair('Clarify a broad advisory offer.', '厘清广泛的顾问服务内容。'), pair('Build trust through projects and expertise.', '通过项目与专业能力建立信任。'), pair('Create a fast, accessible responsive experience.', '建立快速、无障碍的响应式体验。')],
      process: [pair('Content strategy', '内容策略'), pair('UX architecture', '体验架构'), pair('Interface design', '界面设计'), pair('Responsive QA', '响应式测试')],
      colors: [['#111111', 'Structure', '结构黑'], ['#b27a4c', 'Copper', '铜色'], ['#ece7de', 'Stone', '石色']],
      type: pair('A confident editorial serif frames strategic ideas; a modern sans serif keeps navigation and long-form content effortless.', '自信的编辑衬线体呈现战略观点，现代无衬线体保证导航与长文阅读轻松。'),
      deliverables: [pair('UX framework', '体验框架'), pair('Responsive UI', '响应式界面'), pair('Component library', '组件库'), pair('Launch QA', '上线测试')],
      images: website('business-website', ['Northline Advisory responsive website across desktop laptop and tablet', 'Northline Advisory 在桌面、笔记本与平板上的响应式网站'], [["Business website project overview screen", '企业网站项目概览界面'], ["Corporate website service interface", '企业网站服务界面'], ["Business website mobile presentation", '企业网站移动端展示']])
    },
    'landing-page': {
      layout: 'campaign', accent: '#f2a11d', brand: 'Aster Ride',
      title: pair('Aster Ride — The Ride That Moves Everything', 'Aster Ride —— 驱动每一次前行'),
      overview: pair('A focused launch landing page for a fictional electric bicycle, balancing product drama with a clear conversion path.', '为虚构电动自行车打造聚焦上市的落地页，在产品张力与清晰转化路径之间取得平衡。'),
      client: pair('Aster Ride engineers premium electric bicycles for design-conscious urban explorers.', 'Aster Ride 为重视设计的都市探索者研发高级电动自行车。'),
      objectives: [pair('Make the product value clear above the fold.', '在首屏清晰说明产品价值。'), pair('Build desire through cinematic product storytelling.', '以电影感产品叙事激发购买欲望。'), pair('Keep the test-ride action visible throughout.', '在全页保持试骑行动清晰可见。')],
      process: [pair('Message hierarchy', '信息层级'), pair('Conversion flow', '转化流程'), pair('Visual direction', '视觉指导'), pair('Performance pass', '性能优化')],
      colors: [['#0d0e10', 'Asphalt', '沥青黑'], ['#f2a11d', 'Charge Amber', '充能琥珀'], ['#efede7', 'Road Dust', '道路灰白']],
      type: pair('A bold grotesk carries performance claims while a single expressive italic-free display face adds campaign energy.', '粗体无衬线体承载性能信息，单一醒目展示字体为传播注入能量，全程不使用斜体。'),
      deliverables: [pair('Landing-page UX', '落地页体验'), pair('Responsive UI', '响应式界面'), pair('Conversion states', '转化状态'), pair('Performance assets', '性能优化素材')],
      images: website('landing-page', ['Aster Ride launch landing page on laptop and phone', 'Aster Ride 在笔记本与手机上的上市落地页'], [["Landing-page product story section", '落地页产品故事栏目'], ["Conversion-focused feature section", '转化导向功能栏目'], ["Mobile landing-page interface", '移动端落地页界面']])
    },
    'portfolio-website': {
      layout: 'editorial', accent: '#9b7651', brand: 'Mara Vale',
      title: pair('Mara Vale — Spaces That Endure', 'Mara Vale —— 经得起时间的空间'),
      overview: pair('An editorial portfolio for a fictional furniture and spatial designer, giving imagery room to lead while keeping every project easy to explore.', '为虚构家具与空间设计师打造的编辑式作品网站，让影像成为主角，同时保持项目浏览清晰顺畅。'),
      client: pair('Mara Vale designs quiet, materially honest furniture and residential interiors.', 'Mara Vale 专注宁静、忠于材质本质的家具与住宅室内设计。'),
      objectives: [pair('Let project imagery lead without sacrificing context.', '让项目影像主导，同时保留必要背景。'), pair('Create a recognisable editorial rhythm.', '建立鲜明的编辑节奏。'), pair('Make the experience elegant on touch devices.', '确保触控设备上的体验同样优雅。')],
      process: [pair('Portfolio edit', '作品筛选'), pair('Narrative structure', '叙事结构'), pair('Art direction', '美术指导'), pair('Interaction polish', '互动打磨')],
      colors: [['#171614', 'Walnut', '胡桃木黑'], ['#9b7651', 'Patina', '包浆棕'], ['#ede9e1', 'Plaster', '灰泥白']],
      type: pair('A restrained display serif echoes architectural publishing, paired with a precise sans serif for project facts.', '克制的展示衬线体呼应建筑出版，并以精准无衬线体处理项目资料。'),
      deliverables: [pair('Portfolio architecture', '作品架构'), pair('Editorial UI', '编辑式界面'), pair('Project template', '项目模板'), pair('Responsive gallery', '响应式画廊')],
      images: website('portfolio-website', ['Mara Vale portfolio website on desktop and tablet', 'Mara Vale 在桌面与平板上的作品网站'], [["Portfolio website project index", '作品网站项目索引'], ["Editorial project detail layout", '编辑式项目详情版式'], ["Portfolio mobile gallery", '作品网站移动画廊']])
    },
    'restaurant-website': {
      layout: 'stacked', accent: '#ad8b4d', brand: 'Kado House',
      title: pair('Kado House — Tradition Meets Intention', 'Kado House —— 传统与匠心相遇'),
      overview: pair('A cinematic hospitality website for a fictional contemporary Japanese restaurant, connecting atmosphere, menu and reservation in one seamless journey.', '为虚构现代日式餐厅打造电影感酒店餐饮网站，将氛围、菜单与预订整合为流畅旅程。'),
      client: pair('Kado House interprets regional Japanese ingredients through a restrained contemporary tasting menu.', 'Kado House 以克制的现代品鉴菜单重新诠释日本地方食材。'),
      objectives: [pair('Translate the dining atmosphere before arrival.', '在到店前传达用餐氛围。'), pair('Make menu discovery rich but effortless.', '让菜单探索丰富而轻松。'), pair('Reduce friction in mobile reservations.', '减少移动端预订阻力。')],
      process: [pair('Guest journey', '顾客旅程'), pair('Content direction', '内容指导'), pair('Reservation UX', '预订体验'), pair('Device testing', '设备测试')],
      colors: [['#070706', 'Ink', '墨黑'], ['#ad8b4d', 'Aged Gold', '陈金色'], ['#e4ddd0', 'Rice Paper', '和纸白'], ['#3b2834', 'Plum', '梅紫']],
      type: pair('An elegant serif brings ceremony to headings; a restrained sans serif supports reservations and practical details.', '优雅衬线体为标题增添仪式感，克制无衬线体承载预订与实用信息。'),
      deliverables: [pair('Website strategy', '网站策略'), pair('Responsive UI', '响应式界面'), pair('Reservation flow', '预订流程'), pair('Menu system', '菜单系统')],
      images: website('restaurant-website', ['Kado House restaurant website on desktop and phone', 'Kado House 在桌面与手机上的餐厅网站'], [["Restaurant atmosphere page", '餐厅氛围页面'], ["Digital restaurant menu", '餐厅数码菜单'], ["Mobile reservation experience", '移动端预订体验']])
    },
    'responsive-design': {
      layout: 'technical', accent: '#65724d', brand: 'Rove Field',
      title: pair('Rove Field — Built for Every Screen', 'Rove Field —— 为每一种屏幕而生'),
      overview: pair('A responsive commerce system for a fictional sustainable outdoor brand, designed around content priority rather than simple shrinking.', '为虚构可持续户外品牌打造响应式电商系统，以内容优先级而非简单缩放为核心。'),
      client: pair('Rove Field makes durable, low-impact equipment for thoughtful travel and everyday exploration.', 'Rove Field 为理性旅行与日常探索打造耐用、低环境影响的装备。'),
      objectives: [pair('Preserve product storytelling at every breakpoint.', '在每个断点保留产品叙事。'), pair('Keep shopping actions thumb-friendly on mobile.', '确保移动端购物操作适合拇指触控。'), pair('Eliminate layout shift and horizontal overflow.', '消除布局偏移与水平滚动。')],
      process: [pair('Content priority', '内容优先级'), pair('Breakpoint model', '断点模型'), pair('Component states', '组件状态'), pair('Cross-device QA', '跨设备测试')],
      colors: [['#1d281e', 'Forest', '森林绿'], ['#65724d', 'Moss', '苔藓绿'], ['#e7e3da', 'Mineral', '矿物灰白']],
      type: pair('A robust sans serif supports product utility, with strong numerical styles for specifications and comparisons.', '坚实无衬线体支持产品功能表达，并以清晰数字样式处理规格与比较。'),
      deliverables: [pair('Responsive audit', '响应式审视'), pair('Adaptive components', '自适应组件'), pair('Device prototypes', '设备原型'), pair('QA report', '测试报告')],
      images: website('responsive-design', ['Rove Field website adapting across four device sizes', 'Rove Field 网站在四种设备尺寸上的自适应展示'], [["Desktop responsive product grid", '桌面响应式产品网格'], ["Tablet responsive collection layout", '平板响应式系列版式'], ["Mobile responsive shopping interface", '移动响应式购物界面']])
    },
    'basic-seo': {
      layout: 'technical', accent: '#6b7d55', brand: 'Hearth & Form',
      title: pair('Hearth & Form — Search Foundations for Growth', 'Hearth & Form —— 为增长建立搜索基础'),
      overview: pair('A foundational SEO setup for a fictional homeware retailer, aligning technical health, page intent and measurable search visibility.', '为虚构家居零售品牌建立基础 SEO，将技术健康、页面意图与可衡量的搜索曝光统一起来。'),
      client: pair('Hearth & Form curates sustainable objects and small-batch furniture for modern homes.', 'Hearth & Form 为现代家居精选可持续生活物件与小批量家具。'),
      objectives: [pair('Resolve crawl and metadata inconsistencies.', '解决抓取与元数据不一致问题。'), pair('Map search intent to priority pages.', '将搜索意图对应至重点页面。'), pair('Create a clear measurement baseline.', '建立清晰的衡量基线。')],
      process: [pair('Technical audit', '技术审视'), pair('Keyword mapping', '关键词规划'), pair('On-page setup', '页面优化设置'), pair('Measurement plan', '衡量计划')],
      colors: [['#172019', 'Search Green', '搜索绿'], ['#6b7d55', 'Growth', '增长绿'], ['#eeeae1', 'Canvas', '画布白'], ['#b89b60', 'Marker Gold', '标记金']],
      type: pair('A clean sans serif prioritises scanability across dashboards, audit notes and implementation documentation.', '清晰无衬线体优先保证仪表板、审视记录与实施文档的可浏览性。'),
      deliverables: [pair('Technical audit', '技术审视'), pair('Metadata set', '元数据设置'), pair('Structured data', '结构化数据'), pair('Tracking baseline', '追踪基线')],
      images: website('basic-seo', ['Hearth and Form SEO dashboard and website preview', 'Hearth & Form 的 SEO 仪表板与网站预览'], [["SEO page-health overview", 'SEO 页面健康概览'], ["Keyword and content mapping view", '关键词与内容规划界面'], ["Performance audit presentation", '性能审视展示']])
    }
  };
})();
