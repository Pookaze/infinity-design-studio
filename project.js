(function () {
  'use strict';

  const body = document.body;
  const projectId = Number(body.dataset.projectId) || 1;
  const projectServices = {
    1: ['Logo Design', '标志设计', 'work/branding-identity/logo-design/'],
    2: ['Brand Identity', '品牌视觉系统', 'work/branding-identity/brand-identity/'],
    3: ['Social Media Design', '社交媒体设计', 'work/marketing-design/social-media/'],
    4: ['Poster Design', '海报设计', 'work/marketing-design/poster/'],
    5: ['Flyer Design', '宣传单设计', 'work/marketing-design/flyer/'],
    6: ['Banner Design', '横幅设计', 'work/marketing-design/banner/'],
    7: ['Business Card', '名片设计', 'work/branding-identity/business-card/'],
    8: ['Menu Design', '菜单设计', 'work/marketing-design/menu/'],
    9: ['Packaging', '包装设计', 'work/branding-identity/packaging/'],
    10: ['Logo Design', '标志设计', 'work/branding-identity/logo-design/'],
    11: ['Brand Identity', '品牌视觉系统', 'work/branding-identity/brand-identity/'],
    12: ['Packaging', '包装设计', 'work/branding-identity/packaging/'],
    13: ['Business Website', '企业网站', 'work/website-design/business-website/'],
    14: ['Portfolio Website', '作品集网站', 'work/website-design/portfolio-website/'],
    15: ['Restaurant Website', '餐厅网站', 'work/website-design/restaurant-website/'],
    16: ['Landing Page', '落地页', 'work/website-design/landing-page/']
  };
  const service = projectServices[projectId] || projectServices[1];
  const labels = {
    en: {home:'Home',about:'About',work:'Work',contact:'Contact',start:'Start a project',projects:'Projects',coming:'Projects coming soon.',latest:'Our latest work will be added here.',back:'Back to Service',rights:'© 2026 INfinity Design Studio. All rights reserved.',subtitle:'PREMIUM GRAPHIC DESIGN',privacy:'Privacy Policy',terms:'Terms of Service'},
    zh: {home:'首页',about:'关于我们',work:'作品',contact:'联系我们',start:'开始项目',projects:'项目',coming:'作品即将上线。',latest:'我们最新的作品将会展示在这里。',back:'返回服务',rights:'© 2026 INfinity Design Studio。保留所有权利。',subtitle:'高端平面设计',privacy:'隐私政策',terms:'服务条款'}
  };
  let language = 'en';
  try { language = localStorage.getItem('infinity-language') || 'en'; } catch (_) {}
  let projectObserver;
  const pick = value => Array.isArray(value) ? value[language === 'zh' ? 1 : 0] : value;
  const posterProject = {
    title: ['Commercial Poster Design Series', '商业海报设计系列'],
    description: [
      'A bold three-poster collection created for fintech, e-commerce and property campaigns. Each direction combines fast-scanning hierarchy, confident colour and conversion-focused messaging.',
      '一套为金融科技、电商与房地产推广打造的三款海报。每个方向都结合清晰易读的信息层级、自信的色彩运用与转化导向的信息表达。'
    ],
    galleryTitle: ['Poster Gallery', '海报画廊'],
    galleryIntro: [
      'Three distinct visual systems, each tailored to its audience while sharing a crisp, high-impact commercial finish.',
      '三套各具特色的视觉系统，分别针对不同受众，同时保持清晰、有冲击力的商业呈现。'
    ],
    meta: [
      {label:['Category', '类别'], value:['Poster Design', '海报设计']},
      {label:['Deliverables', '交付内容'], value:['3 Poster Designs', '3 款海报设计']},
      {label:['Year', '年份'], value:['2026', '2026']}
    ],
    images: [
      {
        src:'assets/images/projects/poster-design/usdt-fee-check-poster.jpg',
        width:1254,
        height:1254,
        alt:['USDT fee-check promotional poster with a smartphone and TRON graphics', '以手机与 TRON 视觉元素呈现的 USDT 手续费查询推广海报'],
        caption:['Fintech fee-check campaign', '金融科技手续费查询推广']
      },
      {
        src:'assets/images/projects/poster-design/amazon-shop-smarter-poster.jpg',
        width:1254,
        height:1254,
        alt:['E-commerce promotional poster with parcels, shopping products and a mobile app', '以包裹、购物产品与手机应用呈现的电商推广海报'],
        caption:['E-commerce promotion', '电商推广']
      },
      {
        src:'assets/images/projects/poster-design/sunway-velocity-two-poster.jpg',
        width:1280,
        height:960,
        alt:['Property launch poster featuring a Kuala Lumpur residential tower and city skyline', '以吉隆坡住宅大楼与城市天际线呈现的房地产项目海报'],
        caption:['Property launch campaign', '房地产项目推广']
      }
    ]
  };

  function restorePageScroll(resetPosition) {
    [document.documentElement, body].forEach(element => {
      element.classList.remove('scroll-lock', 'no-scroll', 'menu-open', 'modal-open', 'nav-open');
      ['overflow', 'overflow-x', 'overflow-y', 'height', 'max-height', 'position', 'touch-action'].forEach(property => element.style.removeProperty(property));
    });
    body.classList.add('ready');
    if (resetPosition) window.scrollTo(0, 0);
  }

  function renderSocials() {
    const container = document.querySelector('#socialLinks');
    if (!container || !Array.isArray(window.socialLinks)) return;
    container.innerHTML = window.socialLinks.map(link => {
      const unavailable = /yourusername|youruserid/i.test(link.url);
      return `<a href="${unavailable ? '#' : link.url}"${unavailable ? ' aria-disabled="true"' : ' target="_blank" rel="noopener noreferrer"'} aria-label="${link.label}" title="${unavailable ? `${link.label} link coming soon` : link.label}">${link.icon}<span>${language === 'zh' ? link.zhLabel : link.label}</span></a>`;
    }).join('');
    container.querySelectorAll('[aria-disabled="true"]').forEach(link => link.addEventListener('click', event => event.preventDefault()));
  }

  function posterCaseStudy(text, serviceName) {
    const meta = posterProject.meta.map(item => `<div><span>${pick(item.label)}</span><strong>${pick(item.value)}</strong></div>`).join('');
    const gallery = posterProject.images.map((image, index) => `<figure class="poster-gallery-item project-reveal${index === 0 ? ' poster-gallery-featured' : ''}" style="--reveal-index:${index}"><div class="poster-image-frame" style="--poster-ratio:${image.width} / ${image.height}"><img src="../../${image.src}" width="${image.width}" height="${image.height}" alt="${pick(image.alt)}" ${index === 0 ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"></div><figcaption><span>0${index + 1}</span>${pick(image.caption)}</figcaption></figure>`).join('');
    return `<section class="project-hero section poster-project-hero"><nav class="project-breadcrumbs" aria-label="Breadcrumb"><a href="../../index.html#home">${text.home}</a><span aria-hidden="true">/</span><a href="../../work/">${text.work}</a><span aria-hidden="true">/</span><a href="../../work/marketing-design/poster/">${serviceName}</a><span aria-hidden="true">/</span><span aria-current="page">${pick(posterProject.title)}</span></nav><p class="project-label">INFINITY / ${serviceName.toUpperCase()}</p><h1 class="project-title">${pick(posterProject.title)}</h1><p class="project-description">${pick(posterProject.description)}</p><div class="project-meta">${meta}</div></section><section class="poster-gallery-section section"><div class="poster-gallery-intro project-reveal"><p class="project-label">${language === 'zh' ? '精选作品' : 'SELECTED WORK'}</p><h2>${pick(posterProject.galleryTitle)}</h2><p>${pick(posterProject.galleryIntro)}</p></div><div class="poster-gallery" aria-label="${pick(posterProject.galleryTitle)}">${gallery}</div><a class="btn-link poster-back-link" href="../../work/marketing-design/poster/projects/">← ${language === 'zh' ? '返回海报设计项目' : 'Back to Poster Design Projects'}</a></section>`;
  }

  function bindProjectAnimations() {
    if (projectObserver) projectObserver.disconnect();
    const items = document.querySelectorAll('.project-reveal');
    if (!items.length) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      items.forEach(item => item.classList.add('is-visible'));
      return;
    }
    projectObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        projectObserver.unobserve(entry.target);
      });
    }, {rootMargin:'0px 0px -8% 0px', threshold:.08});
    items.forEach(item => projectObserver.observe(item));
  }

  function render() {
    const text = labels[language];
    const serviceName = language === 'zh' ? service[1] : service[0];
    const isPosterProject = projectId === 4;
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
    document.title = isPosterProject ? `${pick(posterProject.title)} — INfinity Design Studio` : `${serviceName} ${text.projects} — INfinity Design Studio`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', isPosterProject ? pick(posterProject.description) : text.latest);
    document.querySelector('.project-main').innerHTML = isPosterProject ? posterCaseStudy(text, serviceName) : `<section class="project-hero section"><nav class="project-breadcrumbs" aria-label="Breadcrumb"><a href="../../index.html#home">${text.home}</a><span aria-hidden="true">/</span><a href="../../work/">${text.work}</a><span aria-hidden="true">/</span><a href="../../${service[2]}">${serviceName}</a><span aria-hidden="true">/</span><span aria-current="page">${text.projects}</span></nav><p class="project-label">INFINITY / ${text.projects.toUpperCase()}</p><h1 class="project-title">${serviceName} ${text.projects}</h1></section><section class="legacy-project-empty section" role="status"><div><h2>${text.coming}</h2><p>${text.latest}</p></div><a class="btn-link" href="../../${service[2]}">← ${text.back}</a></section>`;
    document.querySelector('[data-nav="home"]').textContent = text.home;
    document.querySelector('[data-nav="about"]').textContent = text.about;
    document.querySelector('[data-nav="work"]').textContent = text.work;
    document.querySelector('[data-nav="contact"]').textContent = text.contact;
    document.querySelector('[data-nav="start"]').firstChild.textContent = `${text.start} `;
    document.querySelectorAll('.image-logo small').forEach(element => { element.textContent = text.subtitle; });
    document.querySelector('[data-rights]').textContent = text.rights;
    const legalLinks = document.querySelectorAll('.footer-legal a');
    legalLinks[0].textContent = text.privacy;
    legalLinks[1].textContent = text.terms;
    legalLinks[0].href = '../../privacy-policy/';
    legalLinks[1].href = '../../terms-of-service/';
    document.querySelectorAll('.language-switcher button').forEach(button => button.classList.toggle('active', button.dataset.lang === language));
    document.querySelector('.loader')?.classList.add('loaded');
    renderSocials();
    bindProjectAnimations();
    restorePageScroll(true);
  }

  document.querySelectorAll('.language-switcher button').forEach(button => button.addEventListener('click', () => {
    language = button.dataset.lang;
    try { localStorage.setItem('infinity-language', language); } catch (_) {}
    render();
  }));

  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');
  menu.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    body.style.overflow = open ? 'hidden' : '';
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    nav.classList.remove('open');
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-label', 'Open navigation');
    restorePageScroll(false);
  }));
  window.addEventListener('pageshow', () => restorePageScroll(false));
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  render();
})();
