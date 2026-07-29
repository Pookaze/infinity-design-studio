# Contact inquiry delivery

The public form posts to the server-only Vercel Function at `/api/inquiries`.
That function reads `site_settings.contact_email` from Supabase on every
submission, stores the inquiry, and asks Resend to send the notification.
Changing the recipient in the CMS therefore requires no code change or
redeployment.

## One-time production setup

1. Apply `supabase/migrations/202607290001_inquiry_delivery.sql` to the linked
   Supabase project (`supabase db push` or the Supabase SQL editor).
2. In Resend, add and verify a sending domain. This does not need to be the
   recipient's Outlook/Gmail/business domain.
3. Add these server-only variables to the Vercel project for Production and
   Preview:

   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `RESEND_API_KEY`
   - `INQUIRY_FROM_EMAIL` (for example,
     `Infinity Design Studio <inquiries@verified-domain.example>`)

4. Keep the existing browser variables `SUPABASE_ANON_KEY` and
   `PUBLIC_SITE_URL`. Never prefix the service-role or Resend keys with
   `NEXT_PUBLIC_` and never place them in `cms-config.js`.
5. Redeploy after changing Vercel environment variables.
6. In CMS → Website Settings, save a valid Outlook, Gmail, or business email in
   **Contact email**. This is the live recipient.

## Verification

Submit a unique test inquiry and verify all three:

1. The browser receives HTTP 200 from `/api/inquiries` and shows the success
   message.
2. Supabase `public.inquiries` contains the submission with
   `email_status = 'sent'` and a non-empty `email_provider_id`.
3. Resend's Email Logs show the same provider ID and an accepted/delivered
   event for the CMS recipient. If the recipient is Outlook, also check Junk
   and configure SPF/DKIM exactly as Resend shows for the sending domain.
