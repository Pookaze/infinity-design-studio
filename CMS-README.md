# Infinity Design Studio CMS

This CMS extends the existing HTML/CSS/JavaScript website. It does not replace the public design, URLs, bilingual switcher, responsive layout, animations, images, or the verified static portfolio. Until Supabase is connected, the current static content remains the automatic fallback.

## Architecture

- **Public website:** existing static routes and styles, enhanced with a small Supabase published-content reader.
- **CMS:** responsive `/admin/` interface, bundled for production.
- **Authentication and database:** Supabase Auth + PostgreSQL.
- **Media:** Supabase Storage bucket `cms-media` with a 10 MB limit and JPG/PNG/WebP/AVIF allowlist.
- **Privileged account operations:** Supabase Edge Functions. The service-role key never reaches the browser.
- **Recommended hosting:** Vercel for Preview and Production. GitHub Pages can continue serving the static fallback, but cannot run trusted server code or inject production environment variables by itself.

## Local setup

1. Create a Supabase project.
2. Copy `.env.example` to `.env` and fill in `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `CMS_BOOTSTRAP_SECRET`, and `ALLOWED_ADMIN_ORIGIN`.
3. Never commit `.env`; it is ignored by Git.
4. Install dependencies with `npm install`.
5. Link the Supabase CLI project and apply migrations:

   ```text
   supabase link --project-ref YOUR_PROJECT_REF
   supabase db push
   ```

6. Configure server secrets and deploy the secure functions:

   ```text
   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=... CMS_BOOTSTRAP_SECRET=... ALLOWED_ADMIN_ORIGIN=http://127.0.0.1:4173 ADMIN_SITE_URL=http://127.0.0.1:4173/admin/
   supabase functions deploy bootstrap-owner
   supabase functions deploy admin-users
   ```

7. Run `npm run build`, then `npm run preview`.
8. Open `http://127.0.0.1:4173/admin/`.

## Create the first Owner safely

The first Owner is invited by email and sets a private password directly with Supabase. No real password is submitted to this repository, the bootstrap request, or Codex.

```text
POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/bootstrap-owner
x-bootstrap-secret: YOUR_CMS_BOOTSTRAP_SECRET
Content-Type: application/json

{"email":"owner@example.com","displayName":"Owner"}
```

The function refuses to run after the first Owner exists. Delete `CMS_BOOTSTRAP_SECRET` from function secrets afterward. The Owner follows the invitation link, opens **Change password**, and sets a unique password. The Owner then uses **Admin Users** in `/admin/` to invite two Editors. Each Editor receives an independent Supabase Auth account and sets their own password.

## Import the existing portfolio

After the migrations are applied, run `npm run cms:import`. The script:

- reads the current `work-data.js` and `case-study-data.js`;
- uploads the existing project images to `cms-media`;
- creates database Projects linked to the existing 15 Services;
- preserves the required four sections in order;
- leaves all source files and current static content untouched.

The service-role key is read from local `.env` only. Run the import once; upserts make accidental reruns non-destructive.

## Content workflow

1. Sign in at `/admin/`.
2. Edit English and 中文 fields separately.
3. Save as **Draft**. Draft, Hidden and Archived records are blocked from public access by RLS.
4. Use **Preview website** to inspect the current site. A future Preview deployment can use a dedicated preview token for private drafts.
5. Set Status to **Published** and save. The public website reads the newest published database content without a Git commit.
6. Use **Activity Log** to inspect changes or restore a previous Page/Project version.

Project pages always use:

1. `01 Project Overview` / `01 项目概览`
2. `02 Project Showcase` / `02 项目展示`
3. `03 Design System` / `03 设计系统`
4. `04 Final Deliverables` / `04 最终交付`

## Media workflow

- Upload JPG, PNG, WebP or AVIF only.
- Browser-compatible images are resized to a maximum 2560 px side and converted to quality WebP before upload.
- The bucket enforces a 10 MB source limit and allowed MIME types.
- SVG, HTML, JavaScript and executable uploads are deliberately blocked.
- Deletion first checks Services, Project covers, social images and Project galleries. Used media cannot be deleted.
- Alt text, title and focal-point fields live in the `media` table; the schema supports bilingual values and future crop UI.

## Database and security

Tables include `admin_users`, `pages`, `page_sections`, `service_categories`, `services`, `projects`, `project_sections`, `media`, `project_media`, `navigation_items`, `theme_settings`, `site_settings`, `seo_settings`, `content_versions`, and `activity_logs`.

- RLS is enabled on every exposed table.
- Anonymous visitors can only select published/visible records.
- Authenticated active administrators can edit content.
- Only Owners can manage administrator profiles; the last active Owner is protected by a database trigger.
- Auth account creation and deletion use server-only Edge Functions.
- SQL is parameterized through the Supabase client; CMS text is inserted with `textContent` or escaped before templating.
- Admin pages receive `noindex`, no-store caching, frame denial, MIME sniffing protection and a restricted permissions policy in Vercel.
- Local rate limiting adds a five-attempt pause; Supabase Auth should also have CAPTCHA and Auth rate limits enabled in the dashboard.
- CMS sessions sign out after 30 minutes of inactivity.

## Vercel deployment

1. Import the existing `Pookaze/infinity-design-studio` repository into Vercel.
2. Keep the production branch as `main`.
3. Build command: `npm run build`; output directory: `dist`.
4. Add `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `PUBLIC_SITE_URL` in Development, Preview and Production environments.
5. Do **not** add the service-role key to `VITE_*`, `PUBLIC_*`, `cms-config.js`, or browser code.
6. Deploy a Preview first, test the checklist below, then promote to Production.
7. Set `ALLOWED_ADMIN_ORIGIN` in Supabase Edge Function secrets to the final production and approved preview origins.

## Backup and recovery

- Enable Supabase database backups / point-in-time recovery appropriate to the plan.
- Keep Storage object versioning or an external backup for irreplaceable originals.
- `content_versions` preserves recent before/after records and the CMS exposes safe restore for Pages and Projects.
- Git remains the backup for the unchanged static fallback and application code.

## Release checklist

- Owner and two Editors sign in independently.
- Anonymous `/admin/` access returns the login view.
- Owner can invite; Editor cannot manage Admin Users.
- English and Simplified Chinese content save and render.
- Draft content is not publicly readable.
- Published content updates without a Git push.
- Upload, media reuse protection, project four-section editing, navigation, footer, theme and SEO work.
- Page-section drag order persists.
- Desktop, tablet, Android and iPhone layouts have no horizontal overflow.
- `npm test` and `npm run build` pass with no missing local assets.
- Browser console and network panels show no application errors, 404s or exposed secrets.
