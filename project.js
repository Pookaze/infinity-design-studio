const projectId = Number(document.body.dataset.projectId);
const project = window.projectData.find(item => item.id === projectId) || window.projectData[0];
const labels = {
  en:{home:'Home',about:'About',work:'Work',contact:'Contact',start:'Start a project',archive:'Project Archive',client:'Client',services:'Services provided',category:'Category',gallery:'Project Gallery',galleryTitle:'More of the project.',galleryNote:'Gallery placeholders are ready for final project imagery.',placeholder:'Gallery image placeholder',back:'Back to Portfolio',next:'Next Project',rights:'All rights reserved.',subtitle:'PREMIUM GRAPHIC DESIGN',privacy:'Privacy Policy',terms:'Terms of Service'},
  zh:{home:'首页',about:'关于我们',work:'作品',contact:'联系我们',start:'开始项目',archive:'项目档案',client:'客户',services:'提供的服务',category:'类别',gallery:'项目图库',galleryTitle:'更多项目展示。',galleryNote:'图库占位区域已准备好，可随时替换为最终项目图片。',placeholder:'项目图片占位',back:'返回作品集',next:'下一个项目',rights:'版权所有。',subtitle:'高端平面设计',privacy:'隐私政策',terms:'服务条款'}
};
let projectLanguage = 'en';
try { projectLanguage = localStorage.getItem('infinity-language') || 'en'; } catch (_) {}
const projectServiceRoutes = {
  1:'work/branding-identity/logo-design/',2:'work/branding-identity/brand-identity/',3:'work/marketing-design/social-media/',4:'work/marketing-design/poster/',5:'work/marketing-design/flyer/',6:'work/marketing-design/banner/',7:'work/branding-identity/business-card/',8:'work/marketing-design/menu/',9:'work/branding-identity/packaging/',10:'work/branding-identity/logo-design/',11:'work/branding-identity/brand-identity/',12:'work/branding-identity/packaging/',13:'work/website-design/business-website/',14:'work/website-design/portfolio-website/',15:'work/website-design/restaurant-website/',16:'work/website-design/landing-page/'
};

function renderProject() {
  const text = labels[projectLanguage];
  const content = project[projectLanguage];
  const nextId = project.id === window.projectData.length ? 1 : project.id + 1;
  document.documentElement.lang = projectLanguage === 'zh' ? 'zh-CN' : 'en';
  document.title = `${content.title} — INfinity Design Studio`;
  let breadcrumbs = document.querySelector('.project-breadcrumbs');
  if (!breadcrumbs) {
    breadcrumbs = document.createElement('nav');
    breadcrumbs.className = 'project-breadcrumbs';
    breadcrumbs.setAttribute('aria-label','Breadcrumb');
    document.querySelector('.project-hero').prepend(breadcrumbs);
  }
  breadcrumbs.innerHTML = `<a href="../../index.html#home">${text.home}</a><span aria-hidden="true">/</span><a href="../../work/">${text.work}</a><span aria-hidden="true">/</span><a href="../../${projectServiceRoutes[project.id]}">${content.category}</a><span aria-hidden="true">/</span><span aria-current="page">${content.title}</span>`;
  document.querySelector('[data-nav="home"]').textContent = text.home;
  document.querySelector('[data-nav="about"]').textContent = text.about;
  document.querySelector('[data-nav="work"]').textContent = text.work;
  document.querySelector('[data-nav="contact"]').textContent = text.contact;
  document.querySelector('[data-nav="start"]').firstChild.textContent = `${text.start} `;
  document.querySelector('[data-project-label]').textContent = `${text.archive} / ${String(project.id).padStart(2,'0')}`;
  document.querySelector('[data-project-title]').textContent = content.title;
  document.querySelector('[data-project-description]').textContent = content.description;
  document.querySelector('[data-meta-client-label]').textContent = text.client;
  document.querySelector('[data-meta-client]').textContent = content.client;
  document.querySelector('[data-meta-services-label]').textContent = text.services;
  document.querySelector('[data-meta-services]').textContent = content.services;
  document.querySelector('[data-meta-category-label]').textContent = text.category;
  document.querySelector('[data-meta-category]').textContent = content.category;
  const cover = document.querySelector('[data-project-cover]');
  cover.src = `../../${project.image}`;
  cover.alt = projectLanguage === 'zh' ? `${content.title}项目封面` : `${content.title} project cover`;
  document.querySelector('[data-gallery-label]').textContent = text.gallery;
  document.querySelector('[data-gallery-title]').textContent = text.galleryTitle;
  document.querySelector('[data-gallery-note]').textContent = text.galleryNote;
  document.querySelectorAll('[data-gallery-placeholder]').forEach((element,index) => element.innerHTML = `<b>${String(index+1).padStart(2,'0')}</b><span>${text.placeholder}</span>`);
  document.querySelector('[data-back]').textContent = `← ${text.back}`;
  const next = document.querySelector('[data-next]');
  next.href = `../project-${nextId}/`;
  next.querySelector('.button-label').textContent = text.next;
  document.querySelectorAll('.image-logo small').forEach(element => element.textContent = text.subtitle);
  document.querySelector('[data-rights]').textContent = `© 2026 INfinity Design Studio. ${text.rights}`;
  document.querySelector('.loader-meta small').textContent = text.archive;
  const legalLinks = document.querySelectorAll('.footer-legal a');
  legalLinks[0].textContent = text.privacy;
  legalLinks[1].textContent = text.terms;
  legalLinks[0].href = '../../privacy-policy/';
  legalLinks[1].href = '../../terms-of-service/';
  document.querySelectorAll('.language-switcher button').forEach(button => button.classList.toggle('active',button.dataset.lang === projectLanguage));
  renderProjectSocials();
}

function renderProjectSocials(){
  const container=document.querySelector('#socialLinks');
  container.innerHTML=window.socialLinks.map(link=>`<a href="${link.url}" target="_blank" rel="noopener noreferrer" aria-label="${link.label}">${link.icon}<span>${projectLanguage==='zh'?link.zhLabel:link.label}</span></a>`).join('');
}

document.querySelectorAll('.language-switcher button').forEach(button=>button.addEventListener('click',()=>{
  projectLanguage=button.dataset.lang;
  try{localStorage.setItem('infinity-language',projectLanguage)}catch(_){}
  renderProject();
}));

const projectMenu=document.querySelector('.menu-toggle');
const projectNav=document.querySelector('.nav');
projectMenu.addEventListener('click',()=>{
  const open=projectNav.classList.toggle('open');
  projectMenu.setAttribute('aria-expanded',String(open));
  projectMenu.setAttribute('aria-label',open?'Close navigation':'Open navigation');
  document.body.style.overflow=open?'hidden':'';
});
projectNav.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{projectNav.classList.remove('open');projectMenu.setAttribute('aria-expanded','false');projectMenu.setAttribute('aria-label','Open navigation');document.body.style.overflow='';}));
const projectReveal=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');projectReveal.unobserve(entry.target);}}),{threshold:.1});
document.querySelectorAll('.reveal').forEach(element=>projectReveal.observe(element));
window.addEventListener('scroll',()=>document.querySelector('.header').classList.toggle('scrolled',window.scrollY>25),{passive:true});
window.addEventListener('load',()=>{document.querySelector('.loader').classList.add('loaded');document.body.classList.add('ready');});
window.setTimeout(()=>{document.querySelector('.loader').classList.add('loaded');document.body.classList.add('ready');},1800);
renderProject();
