const header = document.querySelector('.header');
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
const navLinks = [...document.querySelectorAll('.nav a')];
const sections = [...document.querySelectorAll('main section[id]')];
const loader = document.querySelector('.loader');
const loaderCount = document.querySelector('.loader-meta b');
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
  document.title = language === 'zh' ? 'INfinity Design Studio — 高端平面设计' : 'INfinity Design Studio — Premium Graphic Design';
  if (root === document.body) document.querySelector('.hero h1').innerHTML = language === 'zh' ? '我们打造具有<br><em>长久影响力</em>的品牌。' : 'We create brands<br>with <em>lasting</em> impact.';
  document.querySelectorAll('.language-switcher button').forEach(button => button.classList.toggle('active', button.dataset.lang === language));
  renderSocialLinks();
}

function renderSocialLinks() {
  const container = document.querySelector('#socialLinks');
  if (!container) return;
  container.innerHTML = window.socialLinks.map(link => `<a href="${link.url}" target="_blank" rel="noopener noreferrer" aria-label="${link.label}" title="${link.label}">${link.icon}<span>${currentLanguage === 'zh' ? link.zhLabel : link.label}</span></a>`).join('');
}

document.querySelectorAll('.language-switcher button').forEach(button => button.addEventListener('click', () => {
  try { localStorage.setItem('infinity-language', button.dataset.lang); } catch (_) {}
  applyLanguage(button.dataset.lang);
  showTestimonial(testimonialIndex);
}));
try { currentLanguage = localStorage.getItem('infinity-language') || 'en'; } catch (_) { currentLanguage = 'en'; }
applyLanguage(currentLanguage);

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
  document.body.style.overflow = '';
}));

const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); }
}), { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));

document.querySelectorAll('.accordion article button').forEach(button => button.addEventListener('click', () => {
  const item = button.parentElement;
  const wasOpen = item.classList.contains('open');
  document.querySelectorAll('.accordion article').forEach(article => {
    article.classList.remove('open');
    article.querySelector('button').setAttribute('aria-expanded', 'false');
    article.querySelector('button i').textContent = '+';
  });
  if (!wasOpen) { item.classList.add('open'); button.setAttribute('aria-expanded', 'true'); button.querySelector('i').textContent = '−'; }
}));

const testimonials = [
  { quote: "INfinity didn't just redesign our identity—they gave our business a new level of confidence. Every detail feels intentional, premium and unmistakably ours.", initials: 'AR', name: 'Amelia Reed', role: 'Founder, Maison & Co.' },
  { quote: 'The process was clear, collaborative and genuinely strategic. Our new visual system finally reflects the quality of the business behind it.', initials: 'DK', name: 'Daniel Koh', role: 'Director, Vertex Systems' },
  { quote: 'From packaging to digital launch assets, everything felt connected. The result was polished, distinctive and ready for real commercial use.', initials: 'SM', name: 'Sara Malik', role: 'Founder, Aurelia' }
];
let testimonialIndex = 0;
const quoteWrap = document.querySelector('.quote-wrap');
const quoteButtons = [...quoteWrap.querySelectorAll('.quote-nav button')];
function showTestimonial(index) {
  testimonialIndex = (index + testimonials.length) % testimonials.length;
  const item = testimonials[testimonialIndex];
  quoteWrap.querySelector('blockquote').textContent = translateValue(item.quote);
  quoteWrap.querySelector('.quote-author>span').textContent = item.initials;
  quoteWrap.querySelector('.quote-author b').textContent = translateValue(item.name);
  quoteWrap.querySelector('.quote-author small').textContent = translateValue(item.role);
  quoteWrap.querySelector('.quote-nav i').style.width = `${((testimonialIndex + 1) / testimonials.length) * 100}%`;
}
quoteButtons[0].addEventListener('click', () => showTestimonial(testimonialIndex - 1));
quoteButtons[1].addEventListener('click', () => showTestimonial(testimonialIndex + 1));

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
  const requiredFields = [...event.currentTarget.querySelectorAll('[required]')];
  const invalidFields = requiredFields.filter(field => !field.checkValidity());
  requiredFields.forEach(field => {
    const invalid = invalidFields.includes(field);
    field.classList.toggle('invalid', invalid);
    if (invalid) field.setAttribute('aria-invalid', 'true'); else field.removeAttribute('aria-invalid');
  });
  if (invalidFields.length) {
    status.className = 'form-status error';
    status.textContent = translateValue(invalidFields[0].type === 'email' ? 'Please enter a valid email address.' : 'Please complete all required fields.');
    invalidFields[0].focus();
    return;
  }
  status.className = 'form-status success';
  status.textContent = translateValue('Your details are ready. Connect Formspree or EmailJS to send this form.');
  event.currentTarget.reset();
});

const filterButtons = [...document.querySelectorAll('.work-filters button')];
const portfolioCards = [...document.querySelectorAll('.work-card')];
filterButtons.forEach(button => button.addEventListener('click', () => {
  filterButtons.forEach(item => item.classList.toggle('active', item === button));
  portfolioCards.forEach(card => {
    const show = button.dataset.filter === 'all' || card.dataset.category === button.dataset.filter;
    card.classList.toggle('filtered-out', !show);
    card.setAttribute('aria-hidden', String(!show));
  });
}));

const lightbox = document.querySelector('.image-lightbox');
const lightboxImage = lightbox.querySelector('img');
const lightboxTitle = lightbox.querySelector('.lightbox-info h2');
const lightboxDescription = lightbox.querySelector('.lightbox-info p');
const lightboxCategory = lightbox.querySelector('.lightbox-info small');
let lightboxTrigger = null;
function openImageLightbox(image, title, description, category, trigger = null) {
  lightboxTrigger = trigger || image.closest('button');
  lightboxImage.src = image.src;
  lightboxImage.alt = image.alt;
  lightboxTitle.textContent = translateValue(title);
  lightboxDescription.textContent = translateValue(description);
  lightboxCategory.textContent = translateValue(category);
  lightbox.hidden = false;
  document.body.style.overflow = 'hidden';
  lightbox.querySelector('button').focus();
}
function closeLightbox() {
  lightbox.hidden = true;
  lightboxImage.src = '';
  document.body.style.overflow = '';
  if (lightboxTrigger) lightboxTrigger.focus();
}
document.querySelectorAll('.lightbox-open').forEach(button => button.addEventListener('click', () => {
  const image = button.querySelector('img');
  const card = button.closest('.work-card');
  openImageLightbox(image, card.querySelector('h3').textContent, card.querySelector('p').textContent, card.dataset.category.replace('-', ' '), button);
}));
lightbox.querySelector('button').addEventListener('click', closeLightbox);
lightbox.addEventListener('click', event => { if (event.target === lightbox) closeLightbox(); });

document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  if (!lightbox.hidden) closeLightbox();
});

