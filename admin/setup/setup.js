import { createClient } from '@supabase/supabase-js';
import { importExistingContent } from '../import-existing.js';

const app = document.querySelector('#setup-app');
const config = window.INFINITY_CMS_CONFIG || {};
const secret = location.hash.slice(1);
const esc = value => String(value || '').replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));

if (!secret || !config.supabaseUrl || !config.supabaseAnonKey) {
  app.innerHTML = '<main class="setup-shell"><section class="setup-card"><p class="eyebrow">Secure setup</p><h1>Setup link unavailable</h1><p>This one-time link is incomplete or the Production database is not connected.</p></section></main>';
} else {
  const accounts = [['owner','Owner'],['admin-2','Admin 2'],['admin-3','Admin 3']];
  app.innerHTML = `<main class="setup-shell"><form class="setup-card" id="account-setup"><div class="brand"><img src="../../assets/images/brand/infinity-logo.png" alt=""><span><b>INfinity CMS</b><small>ONE-TIME SETUP</small></span></div><p class="eyebrow">Production administrators</p><h1>Set three passwords</h1><p>These passwords go directly to Supabase Auth. They are never stored in this website, Git, Vercel or Codex.</p>${accounts.map(([key,label])=>`<label class="field"><span>${label} password</span><input name="${key}" type="password" minlength="12" autocomplete="new-password" required></label><label class="field"><span>Confirm ${label}</span><input name="${key}-confirm" type="password" minlength="12" autocomplete="new-password" required></label>`).join('')}<button class="btn btn-primary" type="submit">Create administrators</button><p class="message" id="setup-message"></p></form></main>`;
  const form = document.querySelector('#account-setup');
  const message = document.querySelector('#setup-message');
  form.onsubmit = async event => {
    event.preventDefault();
    const values = new FormData(form), passwords = {};
    for (const [key] of accounts) {
      if (values.get(key) !== values.get(`${key}-confirm`)) {
        message.className = 'message error';
        message.textContent = `${key} passwords do not match.`;
        return;
      }
      passwords[key] = String(values.get(key));
    }
    const button = form.querySelector('button');
    button.disabled = true;
    message.className = 'message';
    message.textContent = 'Creating encrypted accounts…';
    try {
      const response = await fetch(`${config.supabaseUrl}/functions/v1/bootstrap-admins`, {
        method:'POST',
        headers:{ apikey:config.supabaseAnonKey, 'Content-Type':'application/json', 'x-bootstrap-secret':secret },
        body:JSON.stringify({ passwords })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Setup failed');
      message.textContent = 'Accounts created. Importing the existing website and media…';
      const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey, { auth:{persistSession:true,autoRefreshToken:true} });
      const {data:login,error:loginError} = await supabase.auth.signInWithPassword({email:'owner@cms.infinity.local',password:passwords.owner});
      if (loginError) throw loginError;
      const manifestResponse = await fetch('../../cms-import-manifest.json', {cache:'no-store'});
      if (!manifestResponse.ok) throw new Error('Website migration manifest is unavailable.');
      const manifest = await manifestResponse.json();
      const importResult = await importExistingContent(supabase,manifest,progress=>message.textContent=progress);
      history.replaceState(null, '', location.pathname);
      form.reset();
      Object.keys(passwords).forEach(key => passwords[key] = '');
      app.innerHTML = `<main class="setup-shell"><section class="setup-card"><p class="eyebrow">Setup complete</p><h1>Production CMS is ready</h1><p>Owner, Admin 2 and Admin 3 were created. ${esc(importResult.projects)} project showcases and ${esc(importResult.media)} media files were imported.</p><a class="btn btn-primary" href="../">Open CMS dashboard</a></section></main>`;
    } catch (error) {
      message.className = 'message error';
      message.textContent = error.message;
      button.disabled = false;
    }
  };
}
