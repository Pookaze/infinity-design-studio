(function () {
  'use strict';
  const config = window.INFINITY_CMS_CONFIG || {};
  if (!/^https:\/\/.+\.supabase\.co$/.test(config.supabaseUrl || '') || !config.supabaseAnonKey) return;
  const headers = { apikey:config.supabaseAnonKey, Authorization:`Bearer ${config.supabaseAnonKey}` };
  const request = async path => {
    const response = await fetch(`${config.supabaseUrl}/rest/v1/${path}`, { headers, cache:'no-store' });
    if (!response.ok) throw new Error(`CMS ${response.status}`);
    return response.json();
  };
  const language = () => {
    try { return localStorage.getItem('infinity-language') === 'zh' ? 'zh' : 'en'; } catch (_) { return 'en'; }
  };
  let content = null;
  const safeLink = value => /^(?:#|\/|https:\/\/|mailto:|tel:)/i.test(String(value || '')) ? value : '#';
  function sectionElement(section) {
    const layout=section.layout||{},cloneKey=section.section_key;
    if (layout.clone_of) {
      let clone=document.querySelector(`[data-cms-clone="${CSS.escape(cloneKey)}"]`);
      if (!clone) {
        const source=document.getElementById(layout.clone_of);
        if (!source) return null;
        clone=source.cloneNode(true);clone.id=cloneKey;clone.dataset.cmsClone=cloneKey;clone.querySelectorAll('[id]').forEach(node=>node.removeAttribute('id'));source.after(clone);
      }
      return clone;
    }
    return document.getElementById(cloneKey)||document.querySelector(`[data-cms-section="${CSS.escape(cloneKey)}"]`);
  }
  function applySection(section,lang) {
    const element=sectionElement(section);if(!element)return;element.hidden=!section.is_visible;
    const sectionContent=section.content||section[`content_${lang}`]||{},fields=sectionContent.fields;
    if(fields&&typeof fields==='object')Object.entries(fields).forEach(([key,value])=>{const target=element.querySelector(`[data-cms-field="${CSS.escape(key)}"]`);if(!target)return;const attribute=target.dataset.cmsAttr;if(attribute==='href')target.setAttribute('href',safeLink(value));else if(attribute==='src')target.setAttribute('src',String(value||''));else target.textContent=String(value??'')});
    else {
      const heading=element.querySelector('h1,h2,h3'),paragraph=element.querySelector('p'),title=section[`title_${lang}`],body=sectionContent.text;
      if(heading&&title)heading.textContent=title;if(paragraph&&body)paragraph.textContent=body;
    }
    const image=element.querySelector('img');if(image&&sectionContent.image_url){image.src=sectionContent.image_url;image.removeAttribute('srcset')}
    const layout=section.layout||{};if(layout.textAlign&&['left','center','right'].includes(layout.textAlign))element.style.textAlign=layout.textAlign;if(Number.isFinite(layout.paddingTop))element.style.paddingTop=`${Math.max(0,Math.min(240,layout.paddingTop))}px`;if(Number.isFinite(layout.paddingBottom))element.style.paddingBottom=`${Math.max(0,Math.min(240,layout.paddingBottom))}px`;
    return element;
  }
  function reorderSections(sections,lang){const main=document.querySelector('main');if(!main)return;sections.forEach(section=>applySection(section,lang));['home','about','services','portfolio','process','contact'].forEach(key=>{const element=document.getElementById(key);if(element)main.append(element)})}
  function applyTheme(theme){if(!theme)return;const colors=theme.colors||{},map={primary:'--gold',accent:'--gold-light',background:'--black',surface:'--panel',text:'--white',muted:'--muted',border:'--line'};Object.entries(map).forEach(([key,token])=>colors[key]&&document.documentElement.style.setProperty(token,colors[key]));const fonts=theme.fonts||{};if(fonts.body)document.body.style.fontFamily=`'${fonts.body}',sans-serif`;if(fonts.heading)document.querySelectorAll('h1,h2,h3,.display').forEach(node=>node.style.fontFamily=`'${fonts.heading}',sans-serif`);if(fonts.button)document.querySelectorAll('.btn,button').forEach(node=>node.style.fontFamily=`'${fonts.button}',sans-serif`);if(fonts.navigation)document.querySelectorAll('header nav').forEach(node=>node.style.fontFamily=`'${fonts.navigation}',sans-serif`);const layout=theme.layout||{};if(Number.isFinite(layout.sectionSpacing))document.querySelectorAll('.section').forEach(node=>{node.style.paddingTop=`${Math.max(48,Math.min(220,layout.sectionSpacing))}px`;node.style.paddingBottom=`${Math.max(48,Math.min(220,layout.sectionSpacing))}px`});if(Number.isFinite(layout.buttonRadius))document.querySelectorAll('.btn,.nav-cta,.contact-actions a').forEach(node=>node.style.borderRadius=`${Math.max(0,Math.min(50,layout.buttonRadius))}px`)}
  function apply() {
    if (!content) return;
    const lang = language();
    const page = content.page;
    if (page) {
      document.title = `${page[`title_${lang}`]} — INfinity Design Studio`;
      const description = document.querySelector('meta[name="description"]');
      if (description && page[`description_${lang}`]) description.content = page[`description_${lang}`];
    }
    if(content.sections.some(section=>section[`content_${lang}`]?.fields))reorderSections(content.sections,lang);else content.sections.forEach(section=>applySection(section,lang));
    content.navigation.forEach(item => {
      const link = [...document.querySelectorAll('header nav a')].find(node => node.getAttribute('href') === item.url || new URL(node.href,location.href).pathname === item.url);
      if (link) { link.textContent = item[`label_${lang}`]; link.hidden = !item.is_visible || (innerWidth < 821 && !item.mobile_visible); }
    });
    if (content.settings) {
      document.querySelectorAll('footer>p').forEach(node => node.textContent = content.settings[`copyright_${lang}`] || node.textContent);
      const email = document.querySelector('a[href^="mailto:"]');
      if (email && content.settings.contact_email) email.href = `mailto:${content.settings.contact_email}`;
      const whatsapp = document.querySelector('.whatsapp-link');
      if (whatsapp && content.settings.whatsapp_url) { whatsapp.href=safeLink(content.settings.whatsapp_url); whatsapp.removeAttribute('aria-disabled'); whatsapp.removeAttribute('title'); whatsapp.target='_blank'; whatsapp.rel='noopener noreferrer'; }
    }
    applyTheme(content.theme);
  }
  Promise.all([
    request('pages?select=*&slug=in.(home,about,services,work,contact)&status=eq.published&deleted_at=is.null'),
    request('page_sections?select=*,pages!inner(slug,status)&pages.status=eq.published&order=sort_order'),
    request('navigation_items?select=*&is_visible=eq.true&order=sort_order'),
    request('site_settings?select=*&limit=1'), request('theme_settings?select=*&limit=1')
  ]).then(([pages,sections,navigation,settings,themes]) => {
    const preferred={home:'home',about:'about',services:'services',portfolio:'work',contact:'contact'};
    const grouped=new Map();sections.forEach(section=>{const current=grouped.get(section.section_key);if(!current||section.pages?.slug==='home')grouped.set(section.section_key,section)});
    const liveSections=[...grouped.values()].filter(section=>section.pages?.slug==='home'||section.pages?.slug===preferred[section.section_key]);
    content={page:pages.find(page=>page.slug==='home'),sections:liveSections,navigation,settings:settings[0],theme:themes[0]};apply();
  })
    .catch(error => console.warn('CMS unavailable; static home content remains active.',error));
  new MutationObserver(apply).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  addEventListener('message',event=>{if(event.origin!==location.origin||event.data?.type!=='infinity-cms-preview'||!Array.isArray(event.data.sections))return;const lang=event.data.lang==='zh'?'zh':'en';reorderSections(event.data.sections.map(section=>({...section,content:section.content||{}})),lang)});
  addEventListener('message',event=>{if(event.origin!==location.origin||event.data?.type!=='infinity-theme-preview')return;applyTheme(event.data.theme)});
})();
