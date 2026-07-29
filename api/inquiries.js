const CURRENCIES = new Set(['MYR', 'USD', 'SGD', 'CNY', 'EUR', 'GBP']);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[\d\s()\-]{8,20}$/;

function respond(response, status, body) {
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  return response.status(status).json(body);
}

function clean(value, maximum) {
  return String(value ?? '').trim().slice(0, maximum);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  })[character]);
}

async function supabaseRequest(path, options = {}) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase server configuration is missing');
  const result = await fetch(`${url.replace(/\/$/, '')}/rest/v1/${path}`, {
    ...options,
    headers:{
      apikey:key,
      Authorization:`Bearer ${key}`,
      'Content-Type':'application/json',
      ...options.headers
    }
  });
  if (!result.ok) {
    const detail = await result.text();
    throw new Error(`Supabase request failed (${result.status}): ${detail.slice(0, 300)}`);
  }
  if (result.status === 204) return null;
  return result.json();
}

function emailContent(inquiry, submittedAt) {
  const malaysiaTime = new Intl.DateTimeFormat('en-MY', {
    dateStyle:'full',
    timeStyle:'long',
    timeZone:'Asia/Kuala_Lumpur'
  }).format(new Date(submittedAt));
  const rows = [
    ['Customer name', inquiry.name],
    ['Email or WhatsApp', inquiry.contact],
    ['Selected service', inquiry.service],
    ['Budget', `${inquiry.currency} ${inquiry.budgetAmount}`],
    ['Submission date and time', `${malaysiaTime} (Asia/Kuala_Lumpur)`]
  ];
  const text = [
    'New Project Inquiry — Infinity Design Studio',
    '',
    ...rows.map(([label,value]) => `${label}: ${value}`),
    '',
    'Inquiry details:',
    inquiry.message
  ].join('\n');
  const htmlRows = rows.map(([label,value]) =>
    `<tr><th align="left" style="padding:8px 14px 8px 0;color:#74664b">${escapeHtml(label)}</th><td style="padding:8px 0">${escapeHtml(value)}</td></tr>`
  ).join('');
  const html = `<div style="font-family:Arial,sans-serif;line-height:1.55;color:#191919"><h1 style="font-size:22px">New Project Inquiry</h1><table>${htmlRows}</table><h2 style="font-size:16px;margin-top:24px">Inquiry details</h2><p style="white-space:pre-wrap">${escapeHtml(inquiry.message)}</p></div>`;
  return { text, html };
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return respond(response, 405, { error:'Method not allowed.' });
  }
  if (Number(request.headers['content-length'] || 0) > 20_000) {
    return respond(response, 413, { error:'Inquiry is too large.' });
  }

  let body;
  try {
    body = typeof request.body === 'string' ? JSON.parse(request.body || '{}') : (request.body || {});
  } catch (_) {
    return respond(response, 400, { error:'Invalid request body.' });
  }
  if (body.website) return respond(response, 200, { ok:true });
  const inquiry = {
    submissionId:clean(body.submissionId, 36),
    name:clean(body.name, 100),
    contact:clean(body.contact, 160),
    service:clean(body.service, 120),
    currency:clean(body.currency, 3).toUpperCase(),
    budgetAmount:clean(body.budgetAmount, 32),
    message:clean(body.message, 5000)
  };
  const amount = Number(inquiry.budgetAmount);
  const validId = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(inquiry.submissionId);
  if (!validId || inquiry.name.length < 2 || !inquiry.service || !inquiry.message ||
      (!EMAIL_PATTERN.test(inquiry.contact) && !PHONE_PATTERN.test(inquiry.contact)) ||
      !CURRENCIES.has(inquiry.currency) || inquiry.budgetAmount === '' ||
      !Number.isFinite(amount) || amount < 0 || amount > 1_000_000_000_000_000) {
    return respond(response, 422, { error:'Please check all inquiry fields and try again.' });
  }

  try {
    const settings = await supabaseRequest('site_settings?select=contact_email&limit=1');
    const recipient = clean(settings?.[0]?.contact_email, 320).toLowerCase();
    if (!EMAIL_PATTERN.test(recipient)) {
      console.error('Inquiry rejected: CMS recipient email is missing or invalid.');
      return respond(response, 503, { error:'Inquiry email is not configured. Please contact us by WhatsApp.' });
    }
    if (!process.env.RESEND_API_KEY || !process.env.INQUIRY_FROM_EMAIL) {
      console.error('Inquiry rejected: Resend server configuration is missing.');
      return respond(response, 503, { error:'Inquiry email is temporarily unavailable. Please contact us by WhatsApp.' });
    }

    const submittedAt = new Date().toISOString();
    const stored = await supabaseRequest('inquiries?on_conflict=submission_id', {
      method:'POST',
      headers:{Prefer:'resolution=ignore-duplicates,return=representation'},
      body:JSON.stringify({
        submission_id:inquiry.submissionId,
        customer_name:inquiry.name,
        customer_contact:inquiry.contact,
        service:inquiry.service,
        currency:inquiry.currency,
        budget_amount:amount,
        details:inquiry.message,
        recipient_email:recipient,
        submitted_at:submittedAt,
        email_status:'pending'
      })
    });
    if (!stored.length) {
      const existing = await supabaseRequest(`inquiries?submission_id=eq.${encodeURIComponent(inquiry.submissionId)}&select=email_status`);
      if (existing?.[0]?.email_status === 'sent') return respond(response, 200, { ok:true, duplicate:true });
    }

    const content = emailContent(inquiry, submittedAt);
    const emailPayload = {
      from:process.env.INQUIRY_FROM_EMAIL,
      to:[recipient],
      subject:'New Project Inquiry — Infinity Design Studio',
      text:content.text,
      html:content.html
    };
    if (EMAIL_PATTERN.test(inquiry.contact)) emailPayload.reply_to = inquiry.contact;
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method:'POST',
      headers:{
        Authorization:`Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type':'application/json',
        'Idempotency-Key':`infinity-inquiry-${inquiry.submissionId}`
      },
      body:JSON.stringify(emailPayload)
    });
    const emailResult = await emailResponse.json().catch(() => ({}));
    if (!emailResponse.ok || !emailResult.id) {
      console.error('Resend inquiry request failed.', { status:emailResponse.status, code:emailResult.name || emailResult.statusCode || 'unknown' });
      await supabaseRequest(`inquiries?submission_id=eq.${encodeURIComponent(inquiry.submissionId)}`, {
        method:'PATCH',
        headers:{Prefer:'return=minimal'},
        body:JSON.stringify({email_status:'failed',email_error:`Provider response ${emailResponse.status}`})
      }).catch(error => console.error('Unable to record inquiry email failure.', error.message));
      return respond(response, 502, { error:'Your inquiry was saved, but the email could not be sent. Please try again.' });
    }

    await supabaseRequest(`inquiries?submission_id=eq.${encodeURIComponent(inquiry.submissionId)}`, {
      method:'PATCH',
      headers:{Prefer:'return=minimal'},
      body:JSON.stringify({email_status:'sent',email_provider_id:emailResult.id,email_sent_at:new Date().toISOString(),email_error:null})
    }).catch(error => console.error('Email was accepted, but its inquiry status could not be updated.', error.message));
    return respond(response, 200, { ok:true });
  } catch (error) {
    console.error('Inquiry submission failed.', error instanceof Error ? error.message : String(error));
    return respond(response, 500, { error:'Unable to send your inquiry right now. Please try again.' });
  }
}
