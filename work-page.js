(function () {
  'use strict';
  const body = document.body;
  const root = body.dataset.root || '../';
  const pageType = body.dataset.page;
  const pageKey = body.dataset.key || '';
  const data = window.infinityWork;
  let lang = 'en';
  try { lang = localStorage.getItem('infinity-language') || 'en'; } catch (_) {}
  const pick = value => Array.isArray(value) ? value[lang === 'zh' ? 1 : 0] : value;
  const ui = {
    en: {home:'Home',about:'About',services:'Services',work:'Work',contact:'Contact',start:'Start a project',viewServices:'View Services',viewService:'View Service',viewProject:'View Project',viewCase:'View Case Study',backCategory:'Back to service category',backService:'Back to Service',backProjects:'Back to Projects',whatIncluded:"What's included",serviceDetails:'Service Details',examples:'Example Previews',archive:'Selected Work',projects:'Projects',projectGallery:'Project Gallery',mockups:'Mockup Presentation',overview:'Project Overview',challenge:'Project Challenge',solution:'Design Solution',approach:'Design Approach',results:'Results',client:'Client',industry:'Industry',year:'Year',provided:'Services provided',previous:'Previous Project',next:'Next Project',placeholder:'Professional placeholder content prepared for your final project material.',rights:'© 2026 INfinity Design Studio. All rights reserved.',privacy:'Privacy Policy',terms:'Terms of Service',backHome:'Back to Home',updated:'Last updated: July 2026'},
    zh: {home:'首页',about:'关于我们',services:'服务',work:'作品',contact:'联系我们',start:'开始项目',viewServices:'查看服务',viewService:'查看服务',viewProject:'查看项目',viewCase:'查看案例',backCategory:'返回服务类别',backService:'返回服务',backProjects:'返回项目',whatIncluded:'服务内容',serviceDetails:'服务详情',examples:'示例预览',archive:'精选作品',projects:'项目',projectGallery:'项目图库',mockups:'模型展示',overview:'项目概述',challenge:'项目挑战',solution:'设计方案',approach:'设计方法',results:'项目成果',client:'客户',industry:'行业',year:'年份',provided:'提供的服务',previous:'上一个项目',next:'下一个项目',placeholder:'专业占位内容已准备好，可随时替换为最终项目资料。',rights:'© 2026 INfinity Design Studio。保留所有权利。',privacy:'隐私政策',terms:'服务条款',backHome:'返回首页',updated:'最后更新：2026年7月'}
  };
  const t = key => ui[lang][key];
  const img = path => root + path;
  const homeUrl = root + 'index.html';
  const categoryUrl = key => root + 'work/' + key + '/';
  const serviceUrl = service => root + 'work/' + service.category + '/' + Object.keys(data.services).find(key => data.services[key] === service) + '/';
  const projectsUrl = service => serviceUrl(service) + 'projects/';
  const serviceByKey = key => data.services[key];
  const allServices = Object.entries(data.services);

  function header() {
    return `<header class="header scrolled">
      <a class="logo image-logo" href="${homeUrl}#home" aria-label="INfinity Design Studio home"><img class="brand-mark" src="${img('assets/images/brand/infinity-logo.png')}" width="640" height="314" alt=""><span><b>INfinity Design Studio</b><small>${lang === 'zh' ? '高端平面设计' : 'PREMIUM GRAPHIC DESIGN'}</small></span></a>
      <button class="menu-toggle" type="button" aria-label="Open navigation" aria-expanded="false"><span></span><span></span></button>
      <nav class="nav" aria-label="Main navigation"><a href="${homeUrl}#home">${t('home')}</a><a href="${homeUrl}#about">${t('about')}</a><a href="${root}work/">${t('services')}</a><a href="${homeUrl}#portfolio">${t('work')}</a><div class="language-switcher" role="group" aria-label="Language"><button class="${lang === 'en' ? 'active' : ''}" type="button" data-lang="en">English</button><span>/</span><button class="${lang === 'zh' ? 'active' : ''}" type="button" data-lang="zh">中文（简体）</button></div><a href="${homeUrl}#contact" class="nav-cta">${t('start')} <span>↗</span></a></nav>
    </header>`;
  }

  function footer() {
    return `<footer class="inner-footer"><a class="logo image-logo" href="${homeUrl}#home" aria-label="INfinity Design Studio home"><img class="brand-mark" src="${img('assets/images/brand/infinity-logo.png')}" width="640" height="314" alt=""><span><b>INfinity Design Studio</b><small>${lang === 'zh' ? '高端平面设计' : 'PREMIUM GRAPHIC DESIGN'}</small></span></a><p>${t('rights')}</p><div class="footer-end"><div class="footer-legal"><a href="${root}privacy-policy/">${t('privacy')}</a><a href="${root}terms-of-service/">${t('terms')}</a></div></div></footer>`;
  }

  function crumbs(items) {
    return `<nav class="breadcrumbs" aria-label="Breadcrumb">${items.map((item, index) => index === items.length - 1 ? `<span aria-current="page">${item.label}</span>` : `<a href="${item.url}">${item.label}</a>`).join('<span aria-hidden="true">/</span>')}</nav>`;
  }

  function hero(title, intro, trail, kicker) {
    return `<section class="inner-hero section">${crumbs(trail)}<p class="inner-kicker">${kicker}</p><h1 class="inner-title">${title}</h1><p class="inner-intro">${intro}</p></section>`;
  }

  function categoryCard(key, category) {
    return `<a class="content-card" href="${categoryUrl(key)}"><div class="content-card-image"><img src="${img(category.image)}" alt="${pick(category.title)} ${lang === 'zh' ? '预览' : 'preview'}" loading="lazy"></div><div class="content-card-copy"><h2>${pick(category.title)}</h2><p>${pick(category.intro)}</p><span class="card-action">${t('viewServices')} <span>→</span></span></div></a>`;
  }

  function serviceCard(key, service) {
    return `<a class="content-card" href="${serviceUrl(service)}"><div class="content-card-image"><img src="${img(service.image)}" alt="${pick(service.title)} ${lang === 'zh' ? '预览' : 'preview'}" loading="lazy"></div><div class="content-card-copy"><h2>${pick(service.title)}</h2><small>${lang === 'zh' ? '专业设计服务' : service.title[1]}</small><p>${pick(service.description)}</p><span class="card-action">${t('viewService')} <span>→</span></span></div></a>`;
  }

  function workPage() {
    const trail = [{label:t('home'),url:homeUrl},{label:t('work')}];
    return hero(t('work'), lang === 'zh' ? '探索品牌、营销与网站三大核心设计领域。' : 'Explore our three core disciplines, each built around clear thinking and distinctive execution.', trail, lang === 'zh' ? 'INFINITY / 作品' : 'INFINITY / WORK') + `<section class="content-section"><div class="card-grid">${Object.entries(data.categories).map(([key,value]) => categoryCard(key,value)).join('')}</div></section>`;
  }

  function categoryPage(categoryKey) {
    const category = data.categories[categoryKey];
    if (!category) return notFound();
    const trail = [{label:t('home'),url:homeUrl},{label:t('work'),url:root+'work/'},{label:pick(category.title)}];
    const cards = category.services.map(key => serviceCard(key, serviceByKey(key))).join('');
    return hero(pick(category.title), pick(category.intro), trail, lang === 'zh' ? 'INFINITY / 服务' : 'INFINITY / SERVICES') + `<section class="content-section"><div class="card-grid">${cards}</div></section>`;
  }

  function galleryImage(service, index) {
    if (service.gallery === 'website') return `assets/images/portfolio/website/project-${Math.min(index,4)}.webp`;
    return `assets/images/portfolio/${service.gallery}/project-${index}.webp`;
  }

  function servicePage(serviceKey) {
    const service = serviceByKey(serviceKey);
    if (!service) return notFound();
    const category = data.categories[service.category];
    const trail = [{label:t('home'),url:homeUrl},{label:t('work'),url:root+'work/'},{label:pick(category.title),url:categoryUrl(service.category)},{label:pick(service.title)}];
    const included = service.includes.map(item => `<div>${pick(item)}</div>`).join('');
    const previews = [1,2,3].map(index => `<figure><img src="${img(galleryImage(service,index))}" alt="${pick(service.title)} ${lang === 'zh' ? '示例预览' : 'example preview'} ${index}" loading="lazy"></figure>`).join('');
    return hero(pick(service.title), pick(service.description), trail, lang === 'zh' ? 'INFINITY / 服务详情' : 'INFINITY / SERVICE') + `<section class="content-section"><div class="service-showcase"><div><p class="inner-kicker">${t('examples')}</p><div class="service-preview-grid">${previews}</div></div><div class="service-detail-copy"><p class="inner-kicker">${t('serviceDetails')}</p><h2>${pick(service.title)}</h2><p>${pick(service.description)}</p><div class="included"><h3>${t('whatIncluded')}</h3><div class="included-list">${included}</div></div><a class="btn btn-gold service-project-cta" href="${projectsUrl(service)}"><b class="button-label">${t('viewProject')}</b><span>→</span></a></div></div><a class="back-link" href="${categoryUrl(service.category)}">← ${t('backCategory')}</a></section>`;
  }

  function projectsPage(serviceKey) {
    const service = serviceByKey(serviceKey);
    if (!service) return notFound();
    const category = data.categories[service.category];
    const pageTitle = `${pick(service.title)} ${t('projects')}`;
    const trail = [{label:t('home'),url:homeUrl},{label:t('work'),url:root+'work/'},{label:pick(category.title),url:categoryUrl(service.category)},{label:pick(service.title),url:serviceUrl(service)},{label:pageTitle}];
    const projects = [1,2,3].map(index => `<article class="content-card"><a class="content-card-image" href="${root}project/project-name/?service=${serviceKey}&project=${index}"><img src="${img(galleryImage(service,index))}" alt="${pick(service.title)} ${lang === 'zh' ? '项目' : 'project'} ${index}" loading="lazy"></a><div class="content-card-copy"><h2>${lang === 'zh' ? '精选概念' : 'Signature Concept'} ${String(index).padStart(2,'0')}</h2><small>${pick(service.title)}</small><p>${t('placeholder')}</p><a class="card-action" href="${root}project/project-name/?service=${serviceKey}&project=${index}">${t('viewCase')} <span>→</span></a></div></article>`).join('');
    return hero(pageTitle, pick(service.description), trail, t('archive')) + `<section class="content-section"><div class="card-grid">${projects}</div><a class="back-link" href="${serviceUrl(service)}">← ${t('backService')}</a></section>`;
  }

  function caseStudyPage() {
    const params = new URLSearchParams(location.search);
    const serviceKey = params.get('service') || 'logo-design';
    const service = serviceByKey(serviceKey) || serviceByKey('logo-design');
    const category = data.categories[service.category];
    const project = Math.max(1, Math.min(3, Number(params.get('project')) || 1));
    const title = `${lang === 'zh' ? '精选概念' : 'Signature Concept'} ${String(project).padStart(2,'0')}`;
    const projectsTitle = `${pick(service.title)} ${t('projects')}`;
    const trail = [{label:t('home'),url:homeUrl},{label:t('work'),url:root+'work/'},{label:pick(category.title),url:categoryUrl(service.category)},{label:pick(service.title),url:serviceUrl(service)},{label:projectsTitle,url:projectsUrl(service)},{label:title}];
    const previous = project === 1 ? 3 : project - 1;
    const next = project === 3 ? 1 : project + 1;
    const cover = img(galleryImage(service, project));
    const story = lang === 'zh' ? {
      overview:'本案例模板展示项目背景、目标与最终视觉方向，可在收到真实资料后快速替换。',challenge:'在竞争激烈的市场中建立清晰、独特且可持续扩展的视觉表达。',solution:'以策略为基础建立简洁而有辨识度的设计系统，并在关键触点保持一致。',approach:'从受众、定位与品牌个性出发，形成明确的视觉原则与应用方法。',results:'占位成果区域可替换为真实的业务表现、客户反馈与项目影响。'
    } : {
      overview:'This reusable case-study template presents the project context, goals and final visual direction, ready for your real content.',challenge:'Create a clear, distinctive and scalable visual expression in a competitive market.',solution:'Build a concise, recognisable design system grounded in strategy and applied consistently across priority touchpoints.',approach:'Define visual principles and applications through audience, positioning and brand personality.',results:'Replace this placeholder with real business outcomes, client feedback and measurable project impact.'
    };
    return hero(title, pick(service.description), trail, pick(service.title)) + `<div class="case-hero-image"><img src="${cover}" alt="${title} hero project image"></div><section class="content-section"><dl class="case-meta"><div><dt>${t('client')}</dt><dd>${lang === 'zh' ? '客户名称占位' : 'Client Name Placeholder'}</dd></div><div><dt>${t('industry')}</dt><dd>${lang === 'zh' ? '创意与生活方式' : 'Creative & Lifestyle'}</dd></div><div><dt>${t('year')}</dt><dd>2026</dd></div><div><dt>${t('provided')}</dt><dd>${pick(service.title)}</dd></div></dl><div class="story-grid"><h2>${t('overview')}</h2><div class="story-copy"><article><h3>${t('overview')}</h3><p>${story.overview}</p></article><article><h3>${t('challenge')}</h3><p>${story.challenge}</p></article><article><h3>${t('solution')}</h3><p>${story.solution}</p></article><article><h3>${t('approach')}</h3><p>${story.approach}</p></article><article><h3>${t('results')}</h3><p>${story.results}</p></article></div></div><div class="case-gallery" aria-label="${t('projectGallery')}"><figure><img src="${img(galleryImage(service,project))}" alt="${title} primary mockup" loading="lazy"></figure><figure><img src="${img(galleryImage(service,next))}" alt="${title} supporting mockup" loading="lazy"></figure><figure><img src="${img(galleryImage(service,previous))}" alt="${title} detail mockup" loading="lazy"></figure></div><div class="case-navigation"><a class="btn-link" href="${root}project/project-name/?service=${serviceKey}&project=${previous}">← ${t('previous')}</a><a class="btn-link" href="${projectsUrl(service)}">${t('backProjects')}</a><a class="btn btn-gold" href="${root}project/project-name/?service=${serviceKey}&project=${next}"><b class="button-label">${t('next')}</b><span>→</span></a><a class="btn btn-gold" href="${homeUrl}#contact"><b class="button-label">${t('start')}</b><span>↗</span></a></div></section>`;
  }

  function legalPage(key) {
    const privacy = key === 'privacy';
    const title = privacy ? t('privacy') : t('terms');
    const trail = [{label:t('home'),url:homeUrl},{label:title}];
    const content = lang === 'zh' ? (privacy ? [
      ['我们收集的信息','当您主动提交联系表单或发送电子邮件时，我们可能会收到您的姓名、电子邮箱、企业名称与项目资料。'],
      ['信息使用方式','这些资料仅用于回复咨询、准备项目建议、提供设计服务及改善网站体验。'],
      ['数据共享与保留','除非法律要求或为提供您明确要求的服务所必需，我们不会出售或公开您的个人资料。'],
      ['您的选择','您可以通过电子邮件联系我们，要求查阅、更正或删除您提交的个人资料。']
    ] : [
      ['服务范围','项目范围、时间、交付物与费用将以双方确认的书面提案或协议为准。'],
      ['付款与进度','项目通常需要预付款才能开始。未按时付款或反馈可能影响原定时间。'],
      ['修改与交付','修改轮次与最终文件格式以项目协议为准。超出范围的工作可能另行报价。'],
      ['知识产权','在全额付款后，最终获选成果的使用权将按项目协议转让；未获选概念仍归工作室所有。']
    ]) : (privacy ? [
      ['Information we collect','We may receive your name, email address, business name and project information when you voluntarily submit the contact form or email us.'],
      ['How information is used','We use this information only to respond to enquiries, prepare project recommendations, provide design services and improve the website experience.'],
      ['Sharing and retention','We do not sell or publicly disclose personal information unless required by law or necessary to provide a service you explicitly request.'],
      ['Your choices','You may contact us by email to request access to, correction of or deletion of personal information you submitted.']
    ] : [
      ['Scope of services','Project scope, timing, deliverables and fees are defined in the written proposal or agreement accepted by both parties.'],
      ['Payment and schedule','Projects generally require an initial payment before work begins. Late payment or feedback may affect the agreed schedule.'],
      ['Revisions and delivery','Revision rounds and final file formats follow the project agreement. Work outside scope may require an additional quotation.'],
      ['Intellectual property','After full payment, usage rights for the approved final work transfer as stated in the project agreement. Unselected concepts remain studio property.']
    ]);
    return hero(title, t('updated'), trail, lang === 'zh' ? 'INFINITY / 法律信息' : 'INFINITY / LEGAL') + `<section class="content-section"><div class="legal-copy">${content.map(item => `<section><h2>${item[0]}</h2><p>${item[1]}</p></section>`).join('')}<a class="back-link" href="${homeUrl}">← ${t('backHome')}</a></div></section>`;
  }

  function notFound() {
    return hero(lang === 'zh' ? '页面未找到' : 'Page not found', lang === 'zh' ? '请返回作品页面继续浏览。' : 'Please return to Work and continue browsing.', [{label:t('home'),url:homeUrl},{label:'404'}], 'INFINITY / 404');
  }

  function render() {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    let main = '';
    if (pageType === 'work') main = workPage();
    else if (pageType === 'category') main = categoryPage(pageKey);
    else if (pageType === 'service') main = servicePage(pageKey);
    else if (pageType === 'projects') main = projectsPage(pageKey);
    else if (pageType === 'case-study') main = caseStudyPage();
    else if (pageType === 'legal') main = legalPage(pageKey);
    else main = notFound();
    body.innerHTML = `<div class="inner-loader" aria-hidden="true"><b>IN∞</b></div><div class="cursor-glow" aria-hidden="true"></div><div class="ambient" aria-hidden="true"><i></i><i></i></div>${header()}<main class="inner-main">${main}</main>${footer()}`;
    const pageTitle = body.querySelector('h1')?.textContent || 'INfinity Design Studio';
    document.title = `${pageTitle} — INfinity Design Studio`;
    bind();
  }

  function bind() {
    const menu = body.querySelector('.menu-toggle');
    const nav = body.querySelector('.nav');
    menu.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menu.setAttribute('aria-expanded', String(open));
      menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      body.style.overflow = open ? 'hidden' : '';
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { nav.classList.remove('open'); menu.setAttribute('aria-expanded','false'); menu.setAttribute('aria-label','Open navigation'); body.style.overflow=''; }));
    body.querySelectorAll('.language-switcher button').forEach(button => button.addEventListener('click', () => {
      lang = button.dataset.lang;
      try { localStorage.setItem('infinity-language', lang); } catch (_) {}
      render();
    }));
    const gallery = body.querySelector('.case-gallery');
    if (gallery) gallery.insertAdjacentHTML('beforebegin', `<div class="case-gallery-heading"><p class="inner-kicker">${t('projectGallery')}</p><h2>${t('mockups')}</h2></div>`);
    body.querySelector('.inner-loader')?.classList.add('loaded');
  }

  render();
})();
