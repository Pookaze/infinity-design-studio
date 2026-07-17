(function () {
  'use strict';
  const body = document.body;
  const root = body.dataset.root || '../';
  const pageType = body.dataset.page;
  const pageKey = body.dataset.key || '';
  const requestedProjectSlug = pageType === 'project-slug' ? (new URLSearchParams(location.search).get('slug') || decodeURIComponent(location.pathname.split('/').filter(Boolean).pop() || '')) : '';
  let data = window.infinityWork;
  let caseStudies = window.infinityCaseStudies || {};
  let categoryProjects = [];
  let categoryProjectsLoaded = false;
  let dynamicProjectServiceKey = '';
  let lang = 'en';
  try { lang = localStorage.getItem('infinity-language') || 'en'; } catch (_) {}
  const pick = value => Array.isArray(value) ? value[lang === 'zh' ? 1 : 0] : value;
  const ui = {
    en: {home:'Home',about:'About',services:'Services',work:'Work',contact:'Contact',start:'Start a project',viewCategory:'Explore Category',viewProject:'View Project',viewProjects:'View Projects',backCategory:'Back to category',projects:'Projects',rights:'© 2026 INfinity Design Studio. All rights reserved.',privacy:'Privacy Policy',terms:'Terms of Service',backHome:'Back to Home',updated:'Last updated: July 2026'},
    zh: {home:'首页',about:'关于我们',services:'服务',work:'作品',contact:'联系我们',start:'开始项目',viewCategory:'浏览类别',viewProject:'查看项目',viewProjects:'查看项目',backCategory:'返回类别',projects:'项目',rights:'© 2026 INfinity Design Studio。保留所有权利。',privacy:'隐私政策',terms:'服务条款',backHome:'返回首页',updated:'最后更新：2026年7月'}
  };
  const t = key => ui[lang][key];
  const img = path => /^(?:https?:|data:|blob:)/.test(path || '') ? path : root + path;
  const homeUrl = root + 'index.html';
  const categoryUrl = key => root + 'work/' + key + '/';
  const serviceCategoryUrl = key => root + 'services/' + key + '/';
  const serviceUrl = service => root + 'work/' + service.category + '/' + Object.keys(data.services).find(key => data.services[key] === service) + '/';
  const projectsUrl = service => serviceUrl(service) + 'projects/';
  const projectDetailUrl = slug => root + 'projects/' + encodeURIComponent(slug) + '/';
  const serviceByKey = key => data.services[key];
  const allServices = Object.entries(data.services);
  const posterProjectRoutes = {
    poster: 'projects/signal-three/'
  };
  let pageObserver;
  async function loadCmsConfig() {
    if (window.INFINITY_CMS_CONFIG) return window.INFINITY_CMS_CONFIG;
    await new Promise(resolve => {
      const script = document.createElement('script');
      script.src = root + 'cms-config.js';
      script.onload = script.onerror = resolve;
      document.head.append(script);
    });
    return window.INFINITY_CMS_CONFIG || {};
  }

  async function cmsRequest(path, config) {
    const response = await fetch(`${config.supabaseUrl}/rest/v1/${path}`, {
      headers: { apikey:config.supabaseAnonKey, Authorization:`Bearer ${config.supabaseAnonKey}` },
      cache: 'no-store',
      signal: AbortSignal.timeout ? AbortSignal.timeout(5000) : undefined
    });
    if (!response.ok) throw new Error(`CMS request failed (${response.status})`);
    return response.json();
  }

  function applyCmsTheme(theme) {
    if (!theme?.colors) return;
    const map = { primary:'--gold', accent:'--accent', background:'--black', surface:'--surface', text:'--white', muted:'--muted', border:'--line' };
    Object.entries(map).forEach(([key,token]) => theme.colors[key] && document.documentElement.style.setProperty(token,theme.colors[key]));
    const fonts = theme.fonts || {};
    if (fonts.heading) document.documentElement.style.setProperty('--font-display',`"${fonts.heading}",sans-serif`);
    if (fonts.body) document.documentElement.style.setProperty('--font-body',`"${fonts.body}",sans-serif`);
  }

  async function hydrateProjectRecord(project, studyKey, config) {
    const media = await cmsRequest(`project_media?select=caption_en,caption_zh,sort_order,section_key,media(public_url,width,height,alt_en,alt_zh)&project_id=eq.${project.id}&order=sort_order`,config);
    const cover = project.cover_media_id ? await cmsRequest(`media?select=public_url,width,height,alt_en,alt_zh&id=eq.${project.cover_media_id}&limit=1`,config) : [];
    const sections = project.project_sections || [];
    const section = key => sections.find(item => item.section_key === key) || {};
    const overview = section('overview'), system = section('design-system'), deliverables = section('deliverables');
    const images = [...cover,...media.map(item => item.media).filter(Boolean)].map(item => ({src:item.public_url,width:item.width||1600,height:item.height||1000,alt:[item.alt_en||project.title_en,item.alt_zh||project.title_zh]}));
    if (!images.length) return;
    caseStudies = {...caseStudies,[studyKey]:{
      title:[project.title_en,project.title_zh], brand:project.client_en||project.title_en, accent:'#d6ad60', layout:'editorial', year:project.year||'',
      overview:[overview.content_en?.text||project.short_description_en,overview.content_zh?.text||project.short_description_zh],
      client:[project.client_en,project.client_zh], images,
      colors:system.content_en?.colors||[],
      type:[system.content_en?.typography||'',system.content_zh?.typography||''],
      deliverables:(deliverables.content_en?.items||project.services_en||[]).map((item,index)=>[item,(deliverables.content_zh?.items||project.services_zh||[])[index]||item])
    }};
    dynamicProjectServiceKey = project.services?.slug || dynamicProjectServiceKey;
  }

  async function hydrateFromCms() {
    try {
      const config = await loadCmsConfig();
      if (!/^https:\/\/.+\.supabase\.co$/.test(config.supabaseUrl || '') || !config.supabaseAnonKey) return;
      const [categories, services, themes] = await Promise.all([
        cmsRequest('service_categories?select=slug,title_en,title_zh,description_en,description_zh,sort_order&is_visible=eq.true&order=sort_order',config),
        cmsRequest('services?select=slug,title_en,title_zh,description_en,description_zh,price_en,price_zh,included_items_en,included_items_zh,turnaround_en,turnaround_zh,project_url,sort_order,service_categories!inner(slug)&status=eq.published&is_visible=eq.true&deleted_at=is.null&order=sort_order',config),
        cmsRequest('theme_settings?select=colors,fonts&limit=1',config)
      ]);
      applyCmsTheme(themes[0]);
      if (categories.length && services.length) {
        const next = { categories:{}, services:{} };
        categories.forEach(category => {
          const fallback = data.categories[category.slug] || {};
          next.categories[category.slug] = { title:[category.title_en,category.title_zh], intro:[category.description_en || fallback.intro?.[0] || '',category.description_zh || fallback.intro?.[1] || ''], services:[] };
        });
        services.forEach(service => {
          const category = service.service_categories.slug;
          const fallback = data.services[service.slug] || {};
          const includedEn = service.included_items_en?.length ? service.included_items_en : (fallback.includes || []).map(item => item[0]);
          const includedZh = service.included_items_zh?.length ? service.included_items_zh : (fallback.includes || []).map(item => item[1]);
          next.services[service.slug] = { category, title:[service.title_en,service.title_zh], description:[service.description_en || fallback.description?.[0] || '',service.description_zh || fallback.description?.[1] || ''], price:[service.price_en || 'Contact for quotation',service.price_zh || '联系获取报价'], includes:includedEn.map((item,index)=>[item,includedZh[index]||item]), turnaround:[service.turnaround_en||'',service.turnaround_zh||''], projectUrl:service.project_url };
          next.categories[category]?.services.push(service.slug);
        });
        const canonical = {
          'branding-identity':['logo-design','brand-identity','business-card','packaging'],
          'marketing-design':['social-media','poster','flyer','banner','menu'],
          'website-design':['business-website','landing-page','portfolio-website','restaurant-website','responsive-design','basic-seo']
        };
        Object.entries(canonical).forEach(([category,order]) => next.categories[category] && next.categories[category].services.sort((a,b) => order.indexOf(a)-order.indexOf(b)));
        data = next;
      }
      if (pageType === 'category' && pageKey) {
        const projects = await cmsRequest('projects?select=id,slug,title_en,title_zh,short_description_en,short_description_zh,year,status,cover:media!projects_cover_media_id_fkey(public_url,width,height,alt_en,alt_zh),services!inner(slug,title_en,title_zh,service_categories!inner(slug))&status=eq.published&deleted_at=is.null&order=published_at.desc',config);
        categoryProjects = projects.filter(project => project.services?.service_categories?.slug === pageKey);
        categoryProjectsLoaded = true;
      }
      if (pageType === 'projects' && pageKey) {
        const projects = await cmsRequest(`projects?select=id,slug,title_en,title_zh,short_description_en,short_description_zh,client_en,client_zh,industry_en,industry_zh,year,services_en,services_zh,cover_media_id,project_sections(*),services!inner(slug,title_en,title_zh,service_categories(slug))&services.slug=eq.${encodeURIComponent(pageKey)}&status=eq.published&deleted_at=is.null&order=published_at.desc&limit=1`,config);
        if (projects[0]) await hydrateProjectRecord(projects[0],pageKey,config);
      }
      if (pageType === 'project-slug' && requestedProjectSlug) {
        const projects = await cmsRequest(`projects?select=id,slug,title_en,title_zh,short_description_en,short_description_zh,client_en,client_zh,industry_en,industry_zh,year,services_en,services_zh,cover_media_id,project_sections(*),services!inner(slug,title_en,title_zh,service_categories(slug))&slug=eq.${encodeURIComponent(requestedProjectSlug)}&status=eq.published&deleted_at=is.null&limit=1`,config);
        if (projects[0]) await hydrateProjectRecord(projects[0],requestedProjectSlug,config);
      }
    } catch (error) {
      console.warn('CMS unavailable; using the verified static website content.', error);
    }
  }
  function restorePageScroll(resetPosition) {
    const roots = [document.documentElement, body];
    roots.forEach(element => {
      element.classList.remove('scroll-lock', 'no-scroll', 'menu-open', 'modal-open', 'nav-open');
      ['overflow', 'overflow-x', 'overflow-y', 'height', 'max-height', 'position', 'touch-action'].forEach(property => element.style.removeProperty(property));
    });
    body.classList.add('ready');
    if (resetPosition) window.scrollTo(0, 0);
  }

  function header() {
    return `<header class="header scrolled">
      <a class="logo image-logo" href="${homeUrl}#home" aria-label="INfinity Design Studio home"><img class="brand-mark" src="${img('assets/images/brand/infinity-logo.png')}" width="640" height="314" alt=""><span><b>INfinity Design Studio</b><small>${lang === 'zh' ? '高端平面设计' : 'PREMIUM GRAPHIC DESIGN'}</small></span></a>
      <button class="menu-toggle" type="button" aria-label="Open navigation" aria-expanded="false"><span></span><span></span></button>
      <nav class="nav" aria-label="Main navigation"><a href="${homeUrl}#home">${t('home')}</a><a href="${homeUrl}#about">${t('about')}</a><a href="${homeUrl}#services">${t('services')}</a><a href="${homeUrl}#portfolio">${t('work')}</a><a href="${homeUrl}#contact">${t('contact')}</a><div class="language-switcher" role="group" aria-label="Language"><button class="${lang === 'en' ? 'active' : ''}" type="button" data-lang="en">English</button><span>/</span><button class="${lang === 'zh' ? 'active' : ''}" type="button" data-lang="zh">中文</button></div><a href="${homeUrl}#contact" class="nav-cta">${t('start')} <span>↗</span></a></nav>
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
    return `<a class="content-card text-card" href="${categoryUrl(key)}"><div class="content-card-copy"><small>INFINITY / ${String(Object.keys(data.categories).indexOf(key) + 1).padStart(2, '0')}</small><h2>${pick(category.title)}</h2><p>${pick(category.intro)}</p><span class="card-action">${t('viewCategory')} <span>→</span></span></div></a>`;
  }

  function serviceCard(key, service) {
    const category = data.categories[service.category];
    const number = String(category.services.indexOf(key) + 1).padStart(2,'0');
    const includes = (service.includes || []).map(item => `<li>${pick(item)}</li>`).join('');
    const price = pick(service.price || ['Contact for quotation','联系获取报价']);
    const turnaround = pick(service.turnaround || ['', '']);
    return `<article class="content-card text-card service-detail-card"><div class="content-card-copy"><small>${number} / ${lang === 'zh' ? '专业设计服务' : 'PROFESSIONAL DESIGN SERVICE'}</small><h2>${pick(service.title)}</h2><p>${pick(service.description)}</p><div class="service-card-meta"><p><span>${lang === 'zh' ? '价格' : 'Price'}</span><strong>${price}</strong></p>${turnaround ? `<p><span>${lang === 'zh' ? '交付时间' : 'Turnaround'}</span><strong>${turnaround}</strong></p>` : ''}</div>${includes ? `<ul class="service-includes">${includes}</ul>` : ''}<div class="service-card-actions"><a class="card-action primary" href="${homeUrl}#contact">${t('start')} <span>↗</span></a></div></div></article>`;
  }

  function workPage() {
    const trail = [{label:t('home'),url:homeUrl},{label:t('work')}];
    return hero(t('work'), lang === 'zh' ? '探索品牌、营销与网站三大核心设计领域。' : 'Explore our three core disciplines, each built around clear thinking and distinctive execution.', trail, lang === 'zh' ? 'INFINITY / 作品' : 'INFINITY / WORK') + `<section class="content-section"><div class="card-grid">${Object.entries(data.categories).map(([key,value]) => categoryCard(key,value)).join('')}</div></section>`;
  }

  function serviceCategoryPage(categoryKey) {
    const category = data.categories[categoryKey];
    if (!category) return notFound();
    const trail = [{label:t('home'),url:homeUrl},{label:t('services'),url:homeUrl+'#services'},{label:pick(category.title)}];
    const cards = category.services.map(key => serviceCard(key, serviceByKey(key))).join('');
    return hero(pick(category.title), pick(category.intro), trail, lang === 'zh' ? 'INFINITY / 服务' : 'INFINITY / SERVICES') + `<section class="content-section" id="services-list"><div class="card-grid service-card-grid">${cards}</div></section>`;
  }

  function fallbackCategoryProjects(categoryKey) {
    const category = data.categories[categoryKey];
    return (category?.services || []).map(serviceKey => {
      const service = serviceByKey(serviceKey), study = caseStudies[serviceKey];
      if (!service || !study?.images?.[0]) return null;
      return { slug:`${serviceKey}-showcase`, title_en:study.title[0], title_zh:study.title[1], short_description_en:study.overview[0], short_description_zh:study.overview[1], year:study.year||2026, cover:{public_url:study.images[0].src,width:study.images[0].width,height:study.images[0].height,alt_en:study.images[0].alt[0],alt_zh:study.images[0].alt[1]}, services:{slug:serviceKey,title_en:service.title[0],title_zh:service.title[1]} };
    }).filter(Boolean);
  }

  function projectCard(project, index) {
    const cover = project.cover;
    const title = lang === 'zh' ? project.title_zh : project.title_en;
    const description = lang === 'zh' ? project.short_description_zh : project.short_description_en;
    const service = lang === 'zh' ? project.services?.title_zh : project.services?.title_en;
    const src = cover?.public_url ? img(cover.public_url) : '';
    return `<a class="project-grid-card project-reveal" style="--reveal-index:${index}" href="${projectDetailUrl(project.slug)}" aria-label="${t('viewProject')}: ${title}">${src ? `<figure><img src="${src}" width="${cover.width||1600}" height="${cover.height||1000}" alt="${lang === 'zh' ? cover.alt_zh||title : cover.alt_en||title}" ${index<2?'fetchpriority="high"':'loading="lazy"'} decoding="async"></figure>` : ''}<div><p class="inner-kicker">${service||''}</p><h2>${title}</h2><p>${description||''}</p><span class="card-action">${t('viewProject')} <span>→</span></span></div></a>`;
  }

  function categoryPage(categoryKey) {
    const category = data.categories[categoryKey];
    if (!category) return notFound();
    const selectedService = new URLSearchParams(location.search).get('service');
    const source = categoryProjectsLoaded ? categoryProjects : fallbackCategoryProjects(categoryKey);
    const projects = selectedService ? source.filter(project => project.services?.slug === selectedService) : source;
    const service = selectedService ? serviceByKey(selectedService) : null;
    const title = service ? pick(service.title) : pick(category.title);
    const intro = service ? pick(service.description) : pick(category.intro);
    const trail = [{label:t('home'),url:homeUrl},{label:t('work'),url:root+'work/'},{label:pick(category.title)}];
    const cards = projects.map(projectCard).join('');
    const empty = `<div class="projects-empty"><h2>${lang === 'zh'?'作品即将上线。':'Projects coming soon.'}</h2><p>${lang === 'zh'?'我们最新的作品将会展示在这里。':'Our latest work will be added here.'}</p></div>`;
    return hero(title, intro, trail, lang === 'zh' ? 'INFINITY / 作品' : 'INFINITY / WORK') + `<section class="content-section" id="projects"><div class="project-category-grid">${cards||empty}</div></section>`;
  }

  function studyLabels() {
    return lang === 'zh' ? {
      project:'项目', overview:'项目概览', client:'客户背景', system:'设计系统', palette:'色彩系统', typography:'字体系统', gallery:'项目展示', deliverables:'最终交付', service:'服务', year:'年份', fictional:'虚构品牌项目', back:'返回服务类别'
    } : {
      project:'Project', overview:'Project Overview', client:'Client Background', system:'Design System', palette:'Color Palette', typography:'Typography', gallery:'Project Showcase', deliverables:'Final Deliverables', service:'Service', year:'Year', fictional:'Fictional brand project', back:'Back to Service Category'
    };
  }

  function sectionMarker(label, index) {
    return `<p class="study-marker"><span>${String(index).padStart(2, '0')}</span>${label}</p>`;
  }

  function renderCaseStudy(serviceKey, service, trail) {
    const study = caseStudies[serviceKey];
    if (!study) return notFound();
    const labels = studyLabels();
    const heroImage = study.images[0];
    const colors = (study.colors || []).map(color => `<li><i style="--swatch:${color[0]}"></i><span>${color[lang === 'zh' ? 2 : 1]}</span><code>${color[0]}</code></li>`).join('');
    const typography = `<div class="study-type-sample"><span>Aa</span><div><strong>${lang === 'zh' ? '展示字体' : 'Display Typeface'}</strong><p>${pick(study.type)}</p></div></div><div class="study-type-sample"><span>Ag</span><div><strong>${lang === 'zh' ? '现代无衬线体' : 'Modern Sans Serif'}</strong><p>${lang === 'zh' ? '用于正文、说明与数字界面，确保各种尺寸下均清晰易读。' : 'Used for body copy, information and digital interfaces to remain clear at every size.'}</p></div></div>`;
    const gallery = study.images.slice(1).map((image, index) => `<figure class="study-gallery-item project-reveal" style="--reveal-index:${index};--media-ratio:${image.width} / ${image.height}"><div class="study-image-frame"><img src="${img(image.src)}" width="${image.width}" height="${image.height}" alt="${pick(image.alt)}" loading="lazy" decoding="async"></div><figcaption><span>${String(index + 2).padStart(2, '0')}</span>${pick(image.alt)}</figcaption></figure>`).join('');
    const deliverables = (study.deliverables || []).map((item, index) => `<li><span>${String(index + 1).padStart(2, '0')}</span>${pick(item)}</li>`).join('');
    const systemSection = colors || pick(study.type) ? `<section class="study-section study-system section"><div class="study-section-heading">${sectionMarker(labels.system, 3)}<h2>${labels.system}</h2></div><div class="study-system-grid">${colors ? `<article><h3>${labels.palette}</h3><ul class="study-palette">${colors}</ul></article>` : ''}${pick(study.type) ? `<article><h3>${labels.typography}</h3><div class="study-type">${typography}</div></article>` : ''}</div></section>` : '';
    return `<article class="case-study case-study-${study.layout}" style="--study-accent:${study.accent}">
      <header class="project-compact-head section"><div class="breadcrumbs">${trail.map((item,index) => index < trail.length - 1 ? `<a href="${item.url}">${item.label}</a><span>/</span>` : `<b>${item.label}</b>`).join('')}</div><p class="inner-kicker">${pick(service.title)}</p><h1>${pick(study.title)}</h1></header>
      <section class="study-section study-overview section"><div class="study-overview-grid"><div class="project-reveal">${sectionMarker(labels.overview, 1)}<h2>${labels.overview}</h2><p>${pick(study.overview)}</p></div><aside><dl><div><dt>${labels.service}</dt><dd>${pick(service.title)}</dd></div><div><dt>${labels.year}</dt><dd>${study.year||2026}</dd></div></dl></aside></div></section>
      <section class="study-section study-showcase section"><div class="study-section-heading">${sectionMarker(labels.gallery, 2)}<h2>${labels.gallery}</h2></div><figure class="study-cover project-reveal" style="--media-ratio:${heroImage.width} / ${heroImage.height}"><img src="${img(heroImage.src)}" width="${heroImage.width}" height="${heroImage.height}" alt="${pick(heroImage.alt)}" fetchpriority="high" decoding="async"><figcaption>${pick(heroImage.alt)} · ${labels.fictional}</figcaption></figure><div class="study-gallery">${gallery}</div></section>
      ${systemSection}
      ${deliverables ? `<section class="study-section study-deliverables section"><div class="study-section-heading">${sectionMarker(labels.deliverables, 4)}<h2>${labels.deliverables}</h2></div><ol>${deliverables}</ol><a class="btn btn-gold" href="${categoryUrl(service.category)}"><b class="button-label">${labels.back}</b><span>←</span></a></section>` : ''}
    </article>`;
  }

  function projectsPage(serviceKey) {
    const service = serviceByKey(serviceKey);
    if (!service) return notFound();
    const category = data.categories[service.category];
    const study = caseStudies[serviceKey];
    const pageTitle = study ? pick(study.title) : `${pick(service.title)} ${t('projects')}`;
    const trail = [{label:t('home'),url:homeUrl},{label:t('work'),url:root+'work/'},{label:pick(category.title),url:categoryUrl(service.category)},{label:pageTitle}];
    return renderCaseStudy(serviceKey, service, trail);
  }

  function projectSlugPage() {
    if (!requestedProjectSlug) return notFound();
    const fallbackServiceKey = requestedProjectSlug.replace(/-showcase$/,'');
    const serviceKey = dynamicProjectServiceKey || fallbackServiceKey;
    const service = serviceByKey(serviceKey);
    if (!service) return notFound();
    if (!caseStudies[requestedProjectSlug] && caseStudies[fallbackServiceKey]) caseStudies = {...caseStudies,[requestedProjectSlug]:caseStudies[fallbackServiceKey]};
    const study = caseStudies[requestedProjectSlug];
    if (!study) return notFound();
    const category = data.categories[service.category];
    const trail = [{label:t('home'),url:homeUrl},{label:t('work'),url:root+'work/'},{label:pick(category.title),url:categoryUrl(service.category)},{label:pick(study.title)}];
    return renderCaseStudy(requestedProjectSlug,service,trail);
  }

  function projectDetailPage(projectKey) {
    const service = serviceByKey('poster');
    const category = data.categories[service.category];
    const study = caseStudies[projectKey];
    if (!study || !posterProjectRoutes[projectKey]) return notFound();
    const projectsLabel = lang === 'zh' ? '海报设计项目' : 'Poster Design Projects';
    const trail = [{label:t('home'),url:homeUrl},{label:t('work'),url:root+'work/'},{label:pick(category.title),url:categoryUrl(service.category)},{label:projectsLabel,url:projectsUrl(service)},{label:pick(study.title)}];
    return renderCaseStudy(projectKey, service, trail);
  }

  function caseStudyPage() {
    const params = new URLSearchParams(location.search);
    const serviceKey = params.get('service') || 'logo-design';
    return projectsPage(serviceKey);
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
    restorePageScroll(true);
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    if (pageType === 'service') {
      const service = serviceByKey(pageKey);
      if (service) {
        location.replace(projectsUrl(service));
        return;
      }
    }
    let main = '';
    if (pageType === 'work') main = workPage();
    else if (pageType === 'service-category') main = serviceCategoryPage(pageKey);
    else if (pageType === 'category') main = categoryPage(pageKey);
    else if (pageType === 'projects') main = projectsPage(pageKey);
    else if (pageType === 'project-slug') main = projectSlugPage();
    else if (pageType === 'project-detail') main = projectDetailPage(pageKey);
    else if (pageType === 'case-study') main = caseStudyPage();
    else if (pageType === 'legal') main = legalPage(pageKey);
    else main = notFound();
    body.innerHTML = `<div class="inner-loader" aria-hidden="true"><b>IN∞</b></div><div class="cursor-glow" aria-hidden="true"></div><div class="ambient" aria-hidden="true"><i></i><i></i></div>${header()}<main class="inner-main">${main}</main>${footer()}`;
    restorePageScroll(true);
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
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { nav.classList.remove('open'); menu.setAttribute('aria-expanded','false'); menu.setAttribute('aria-label','Open navigation'); restorePageScroll(false); }));
    body.querySelectorAll('.language-switcher button').forEach(button => button.addEventListener('click', () => {
      lang = button.dataset.lang;
      try { localStorage.setItem('infinity-language', lang); } catch (_) {}
      render();
    }));
    if (pageObserver) pageObserver.disconnect();
    const revealItems = body.querySelectorAll('.project-reveal');
    if (revealItems.length) {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
        revealItems.forEach(item => item.classList.add('is-visible'));
      } else {
        pageObserver = new IntersectionObserver(entries => {
          entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            pageObserver.unobserve(entry.target);
          });
        }, {rootMargin:'0px 0px -8% 0px', threshold:.08});
        revealItems.forEach(item => pageObserver.observe(item));
      }
    }
    body.querySelector('.inner-loader')?.classList.add('loaded');
    restorePageScroll(false);
  }

  window.addEventListener('pageshow', () => restorePageScroll(false));
  window.addEventListener('load', () => restorePageScroll(false));
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  hydrateFromCms().finally(render);
})();
