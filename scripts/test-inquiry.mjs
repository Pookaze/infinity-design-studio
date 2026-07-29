import assert from 'node:assert/strict';
import handler from '../api/inquiries.js';

process.env.SUPABASE_URL = 'https://test-project.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role';
process.env.RESEND_API_KEY = 'test-resend-key';
process.env.INQUIRY_FROM_EMAIL = 'Infinity Design Studio <inquiries@example.test>';

const calls = [];
global.fetch = async (url, options = {}) => {
  calls.push({url:String(url),options});
  if (String(url).includes('site_settings?')) {
    return new Response(JSON.stringify([{contact_email:'owner@outlook.com'}]), {status:200});
  }
  if (String(url).includes('/inquiries?on_conflict=')) {
    return new Response(JSON.stringify([{id:'stored'}]), {status:201});
  }
  if (String(url) === 'https://api.resend.com/emails') {
    return new Response(JSON.stringify({id:'email_test_123'}), {status:200});
  }
  if (options.method === 'PATCH') return new Response(null, {status:204});
  throw new Error(`Unexpected request: ${url}`);
};

const request = {
  method:'POST',
  headers:{'content-length':'400'},
  body:{
    submissionId:'6f9619ff-8b86-4be5-a5f1-3c4f2e7dc001',
    name:'Test Customer',
    contact:'customer@example.com',
    service:'Brand Identity',
    currency:'MYR',
    budgetAmount:'2500',
    message:'A production-compatible inquiry test.'
  }
};
let statusCode;
let responseBody;
const response = {
  headers:{},
  setHeader(name, value) { this.headers[name] = value; },
  status(value) { statusCode = value; return this; },
  json(value) { responseBody = value; return value; }
};

await handler(request, response);
assert.equal(statusCode, 200);
assert.deepEqual(responseBody, {ok:true});

const settingsCall = calls.find(call => call.url.includes('site_settings?'));
const storageCall = calls.find(call => call.url.includes('/inquiries?on_conflict='));
const emailCall = calls.find(call => call.url === 'https://api.resend.com/emails');
const statusCall = calls.find(call => call.options.method === 'PATCH');
assert.ok(settingsCall, 'CMS recipient was retrieved');
assert.ok(storageCall, 'Inquiry was stored');
assert.ok(emailCall, 'Resend API was called');
assert.ok(statusCall, 'Stored inquiry was marked sent');

const stored = JSON.parse(storageCall.options.body);
assert.equal(stored.recipient_email, 'owner@outlook.com');
assert.equal(stored.currency, 'MYR');
assert.equal(stored.budget_amount, 2500);

const email = JSON.parse(emailCall.options.body);
assert.deepEqual(email.to, ['owner@outlook.com']);
assert.equal(email.subject, 'New Project Inquiry — Infinity Design Studio');
assert.equal(email.reply_to, 'customer@example.com');
assert.match(email.text, /MYR 2500/);
assert.match(email.text, /Test Customer/);
assert.match(email.text, /Brand Identity/);
assert.match(email.text, /production-compatible inquiry test/i);
assert.match(emailCall.options.headers['Idempotency-Key'], /6f9619ff/);

console.log('Inquiry integration test passed: CMS recipient → Supabase storage → Resend request → sent status.');
