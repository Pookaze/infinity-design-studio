import { createClient } from '@supabase/supabase-js';

const app = document.querySelector('#reset-app');
const config = window.INFINITY_CMS_CONFIG || {};
const token = location.hash.slice(1);
const ownerEmail = 'owner@cms.infinity.local';

if (!token || !config.supabaseUrl || !config.supabaseAnonKey) {
  app.innerHTML = '<main class="setup-shell"><section class="setup-card"><p class="eyebrow">Owner recovery</p><h1>Reset link unavailable</h1><p>This one-time link is incomplete, expired or the Production database is not connected.</p></section></main>';
} else {
  app.innerHTML = `<main class="setup-shell"><form class="setup-card" id="owner-reset"><div class="brand"><img src="../../assets/images/brand/infinity-logo.png" alt=""><span><b>INfinity CMS</b><small>OWNER RECOVERY</small></span></div><p class="eyebrow">One-time secure reset</p><h1>Choose a new Owner password</h1><p>The password is sent directly to Supabase over HTTPS. It is never stored in this website, Git, Vercel or Codex.</p><label class="field"><span>New password</span><input name="password" type="password" minlength="12" autocomplete="new-password" required></label><label class="field"><span>Confirm new password</span><input name="confirm" type="password" minlength="12" autocomplete="new-password" required></label><p class="message">Use at least 12 characters with uppercase, lowercase and a number.</p><button class="btn btn-primary" type="submit">Reset Owner password</button><p class="message" id="reset-message" aria-live="polite"></p></form></main>`;
  const form = document.querySelector('#owner-reset');
  const message = document.querySelector('#reset-message');

  form.onsubmit = async event => {
    event.preventDefault();
    const values = new FormData(form);
    const password = String(values.get('password') || '');
    if (password !== String(values.get('confirm') || '')) {
      message.className = 'message error';
      message.textContent = 'Passwords do not match.';
      return;
    }

    const button = form.querySelector('button');
    button.disabled = true;
    message.className = 'message';
    message.textContent = 'Resetting Owner password…';
    try {
      const response = await fetch(`${config.supabaseUrl}/functions/v1/reset-owner-password`, {
        method:'POST',
        headers:{ apikey:config.supabaseAnonKey, 'Content-Type':'application/json', 'x-reset-token':token },
        body:JSON.stringify({ password })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Password reset failed.');

      history.replaceState(null, '', location.pathname);
      const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey, { auth:{persistSession:true,autoRefreshToken:true} });
      const { error:loginError } = await supabase.auth.signInWithPassword({ email:ownerEmail, password });
      form.reset();
      if (loginError) {
        app.innerHTML = `<main class="setup-shell"><section class="setup-card"><p class="eyebrow">Password updated</p><h1>Owner password reset complete</h1><p>Your one-time link is now expired. Supabase is still cooling down the earlier login attempts. Wait a few minutes, then sign in using <strong>owner</strong> or <strong>${ownerEmail}</strong>.</p><a class="btn btn-primary" href="../">Return to login</a></section></main>`;
        return;
      }
      app.innerHTML = '<main class="setup-shell"><section class="setup-card"><p class="eyebrow">Verified</p><h1>Owner access restored</h1><p>The password was reset, the one-time link has expired, and the Owner login was verified successfully.</p><a class="btn btn-primary" href="../">Open CMS dashboard</a></section></main>';
    } catch (error) {
      message.className = 'message error';
      message.textContent = error.message;
      button.disabled = false;
    }
  };
}

