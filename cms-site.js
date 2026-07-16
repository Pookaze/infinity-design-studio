(function () {
  'use strict';
  const config = window.INFINITY_CMS_CONFIG || {};
  if (!/^https:\/\/.+\.supabase\.co$/.test(config.supabaseUrl || '') || !config.supabaseAnonKey) return;
  const headers = { apikey:config.supabaseAnonKey, Authorization:`Bearer ${config.supabaseAnonKey}` };
  const request = async path => {
    const response = await fetch(`${config.supabaseUrl}/rest/v1/${path}`, { headers });
    if (!response.ok) throw new Error(`CMS ${response.status}`);
    return response.json();
  };
  const language = () => {
    try { return localStorage.getItem('infinity-language') === 'zh' ? 'zh' : 'en'; } catch (_) { return 'en'; }
  };
  let content = null;
  function apply() {
    if (!content) return;
    const lang = language();
    const page = content.page;
    if (page) {
      document.title = `${page[`title_${lang}`]} — INfinity Design Studio`;
      const description = document.querySelector('meta[name="description"]');
      if (description && page[`description_${lang}`]) description.content = page[`description_${lang}`];
    }
    content.sections.forEach(section => {
      const element = document.getElementById(section.section_key) || document.querySelector(`[data-cms-section="${CSS.escape(section.section_key)}"]`);
      if (!element) return;
      element.hidden = !section.is_visible;
      const heading = element.querySelector('h1,h2,h3');
      const paragraph = element.querySelector('p');
      const title = section[`title_${lang}`];
      const body = section[`content_${lang}`]?.text;
      if (heading && title) heading.textContent = title;
      if (paragraph && body) paragraph.textContent = body;
      const layout = section.layout || {};
      if (layout.textAlign && ['left','center','right'].includes(layout.textAlign)) element.style.textAlign = layout.textAlign;
      if (Number.isFinite(layout.paddingTop)) element.style.paddingTop = `${Math.max(0,Math.min(240,layout.paddingTop))}px`;
      if (Number.isFinite(layout.paddingBottom)) element.style.paddingBottom = `${Math.max(0,Math.min(240,layout.paddingBottom))}px`;
    });
    content.navigation.forEach(item => {
      const link = [...document.querySelectorAll('header nav a')].find(node => node.getAttribute('href') === item.url || new URL(node.href,location.href).pathname === item.url);
      if (link) { link.textContent = item[`label_${lang}`]; link.hidden = !item.is_visible || (innerWidth < 821 && !item.mobile_visible); }
    });
    if (content.settings) {
      document.querySelectorAll('footer>p').forEach(node => node.textContent = content.settings[`copyright_${lang}`] || node.textContent);
      const email = document.querySelector('a[href^="mailto:"]');
      if (email && content.settings.contact_email) email.href = `mailto:${content.settings.contact_email}`;
      const whatsapp = document.querySelector('.whatsapp-link');
      if (whatsapp && content.settings.whatsapp_url) { whatsapp.href=content.settings.whatsapp_url; whatsapp.removeAttribute('aria-disabled'); }
    }
    if (content.theme?.colors) {
      const map={primary:'--gold',accent:'--accent',background:'--black',surface:'--surface',text:'--white',muted:'--muted',border:'--line'};
      Object.entries(map).forEach(([key,token])=>content.theme.colors[key]&&document.documentElement.style.setProperty(token,content.theme.colors[key]));
    }
  }
  Promise.all([
    request('pages?select=*&slug=eq.home&status=eq.published&deleted_at=is.null&limit=1'),
    request('page_sections?select=*&is_visible=eq.true&pages!inner(slug,status)&pages.slug=eq.home&pages.status=eq.published&order=sort_order'),
    request('navigation_items?select=*&is_visible=eq.true&order=sort_order'),
    request('site_settings?select=*&limit=1'), request('theme_settings?select=*&limit=1')
  ]).then(([pages,sections,navigation,settings,themes]) => { content={page:pages[0],sections,navigation,settings:settings[0],theme:themes[0]};apply(); })
    .catch(error => console.warn('CMS unavailable; static home content remains active.',error));
  new MutationObserver(apply).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
})();
