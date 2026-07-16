const header = document.querySelector('.header');
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
const navLinks = [...document.querySelectorAll('.nav a')];
const sections = [...document.querySelectorAll('main section[id]')];
const loader = document.querySelector('.loader');
const loaderCount = document.querySelector('.loader-meta b');
const whatsappNumber = '';
const originalText = new WeakMap();
const originalPlaceholders = new WeakMap();
let currentLanguage = 'en';

function translateValue(value, language = currentLanguage) {
  return language === 'zh' ? (window.siteTranslations.zh[value] || value) : value;
}

function applyLanguage(language, root = document.body) {
  currentLanguage = language;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(node => {
    if (node.parentElement?.closest('script, style, svg, .no-translate')) return;
    if (!originalText.has(node)) originalText.set(node, node.nodeValue);
    const original = originalText.get(node);
    const clean = original.trim();
    if (!clean) return;
    node.nodeValue = original.replace(clean, translateValue(clean, language));
  });
  root.querySelectorAll?.('[placeholder]').forEach(field => {
    if (!originalPlaceholders.has(field)) originalPlaceholders.set(field, field.placeholder);
    const original = originalPlaceholders.get(field);
    field.placeholder = language === 'zh' ? (window.siteTranslations.placeholders.zh[original] || original) : original;
  });
  document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
  document.title = language === 'zh' ? 'INfinity Design Studio — 品牌、营销与网站设计' : 'INfinity Design Studio — Branding, Marketing & Website Design';
  document.querySelectorAll('.language-switcher button').forEach(button => button.classList.toggle('active', button.dataset.lang === language));
  renderSocialLinks();
}

function renderSocialLinks() {
  const container = document.querySelector('#socialLinks');
  if (!container) return;
  container.innerHTML = (window.socialLinks || [])
    .filter(link => /^https:\/\//i.test(link.url || '') && !/yourusername|youruserid/i.test(link.url))
    .map(link => `<a href="${link.url}" target="_blank" rel="noopener noreferrer" aria-label="${link.label}" title="${link.label}">${link.icon}<span>${currentLanguage === 'zh' ? link.zhLabel : link.label}</span></a>`)
    .join('');
}

document.querySelectorAll('.language-switcher button').forEach(button => button.addEventListener('click', () => {
  try { localStorage.setItem('infinity-language', button.dataset.lang); } catch (_) {}
  applyLanguage(button.dataset.lang);
  if (typeof showTestimonial === 'function') showTestimonial(testimonialIndex);
}));
try { currentLanguage = localStorage.getItem('infinity-language') || 'en'; } catch (_) { currentLanguage = 'en'; }
applyLanguage(currentLanguage);

const whatsappLink = document.querySelector('.whatsapp-link, .contact-actions a[href*="whatsapp"], .contact-actions a[href*="wa.me"]');
if (whatsappLink) {
  const message = encodeURIComponent('Hello INfinity Design Studio, I would like to discuss a project.');
  if (/^\d{8,15}$/.test(whatsappNumber)) {
    whatsappLink.href = `https://wa.me/${whatsappNumber}?text=${message}`;
    whatsappLink.target = '_blank';
    whatsappLink.rel = 'noopener noreferrer';
  } else {
    whatsappLink.href = '#';
    whatsappLink.removeAttribute('target');
    whatsappLink.setAttribute('aria-disabled', 'true');
    whatsappLink.setAttribute('title', 'WhatsApp number required');
    whatsappLink.addEventListener('click', event => { if (whatsappLink.getAttribute('aria-disabled') === 'true') event.preventDefault(); });
  }
}

let progress = 0;
const ticker = window.setInterval(() => {
  progress = Math.min(progress + Math.ceil(Math.random() * 11), 99);
  loaderCount.textContent = String(progress).padStart(2, '0');
}, 85);

function finishLoading() {
  window.clearInterval(ticker);
  loaderCount.textContent = '100';
  loader.classList.add('loaded');
  document.body.classList.add('ready');
}
window.addEventListener('load', () => window.setTimeout(finishLoading, 750));
window.setTimeout(finishLoading, 2400);

window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 25);
  let current = sections[0];
  sections.forEach(section => { if (window.scrollY >= section.offsetTop - 190) current = section; });
  navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${current.id}`));
}, { passive: true });

menuButton.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  document.body.style.overflow = open ? 'hidden' : '';
});
navLinks.forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open navigation');
  document.body.style.overflow = '';
}));

document.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click', event => {
  const selector = link.getAttribute('href');
  if (!selector || selector === '#') return;
  const target = document.querySelector(selector);
  if (!target) return;
  event.preventDefault();
  const visibleStart = target.querySelector('.section-kicker') || target;
  const contentTop = target.offsetTop + (visibleStart === target ? 0 : visibleStart.offsetTop);
  const top = contentTop - 104;
  window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  if (history.pushState) history.pushState(null, '', selector); else location.hash = selector;
}));

const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); }
}), { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));

if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  document.querySelectorAll('.magnetic').forEach(element => {
    element.addEventListener('pointermove', event => {
      const box = element.getBoundingClientRect();
      element.style.transform = `translate(${(event.clientX - box.left - box.width / 2) * .12}px, ${(event.clientY - box.top - box.height / 2) * .16}px)`;
    });
    element.addEventListener('pointerleave', () => element.style.transform = '');
  });
  document.querySelectorAll('.work-card').forEach(card => {
    card.addEventListener('pointermove', event => {
      const box = card.getBoundingClientRect();
      const base = 0;
      card.style.transform = `translateY(${base}px) perspective(900px) rotateX(${((event.clientY-box.top)/box.height-.5)*-2.5}deg) rotateY(${((event.clientX-box.left)/box.width-.5)*2.5}deg)`;
    });
    card.addEventListener('pointerleave', () => card.style.transform = '');
  });
}

const glow = document.querySelector('.cursor-glow');
const art = document.querySelector('.hero-art');
let pointer = { x: innerWidth / 2, y: innerHeight / 2, pending: false };
window.addEventListener('pointermove', event => {
  pointer.x = event.clientX; pointer.y = event.clientY;
  if (!pointer.pending) window.requestAnimationFrame(() => {
    glow.style.left = `${pointer.x}px`; glow.style.top = `${pointer.y}px`;
    if (innerWidth > 1000) art.style.transform = `translate3d(${(pointer.x/innerWidth-.5)*22}px, ${(pointer.y/innerHeight-.5)*16}px,0)`;
    pointer.pending = false;
  });
  pointer.pending = true;
}, { passive: true });

const contactForm = document.querySelector('#contactForm');
contactForm.querySelectorAll('input, select, textarea').forEach(field => {
  field.addEventListener('input', () => {
    field.classList.remove('invalid');
    field.removeAttribute('aria-invalid');
  });
});
contactForm.addEventListener('submit', event => {
  event.preventDefault();
  const status = event.currentTarget.querySelector('.form-status');
  const submit = event.currentTarget.querySelector('[type="submit"]');
  const requiredFields = [...event.currentTarget.querySelectorAll('[required]')];
  const contactField = event.currentTarget.querySelector('[data-contact]');
  const contactValue = contactField?.value.trim() || '';
  const contactValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactValue) || /^\+?[\d\s()\-]{8,20}$/.test(contactValue);
  const invalidFields = requiredFields.filter(field => !field.checkValidity() || (field === contactField && !contactValid));
  requiredFields.forEach(field => {
    const invalid = invalidFields.includes(field);
    field.classList.toggle('invalid', invalid);
    if (invalid) field.setAttribute('aria-invalid', 'true'); else field.removeAttribute('aria-invalid');
  });
  if (invalidFields.length) {
    status.className = 'form-status error';
    status.textContent = translateValue(invalidFields[0] === contactField ? 'Please enter a valid email address or WhatsApp number.' : 'Please complete all required fields.');
    invalidFields[0].focus();
    return;
  }
  if (submit.disabled) return;
  submit.disabled = true;
  status.className = 'form-status success';
  status.textContent = translateValue('Thank you. Your inquiry details are ready.');
  event.currentTarget.reset();
  window.setTimeout(() => { submit.disabled = false; }, 1500);
});

