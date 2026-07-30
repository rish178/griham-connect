# Griham Connect

Real estate landing pages for Griham-managed builder projects. One React app,
one project per wildcard subdomain (or `/projects/:slug` in dev/preview).

## Stack

React · Vite · TypeScript · Tailwind CSS · Framer Motion · Cloudflare · Supabase

## Local development

```bash
cp .env.example .env.local   # fill in the Supabase URL and publishable key
npm install
npm run dev
```

Then open the Signature Sarvam page at http://localhost:5173/projects/signature-sarvam

```bash
npm run build     # type-check + production build to dist/
npm run preview   # preview the production build locally
```

Without Supabase env vars the page still renders; only form submission fails.

## Folder architecture

```
cluade_skills/          Agent role playbooks (chief-architect, landing-page-architect,
                         ui-ux-designer, brochure-parser, seo-conversion,
                         cloudflare-devops, supabase-backend, marketing,
                         performance-reviewer)
projects/                Raw per-project intake: brochures, briefs, campaign data
public/
  projects/<slug>/        Per-project static images (hero, logo, gallery)
  _redirects              SPA fallback
src/
  components/
    Layout/               Header, Footer (shared site chrome only)
    ui/                   Reusable primitives (Button, Container, ...)
  pages/                  HomePage, ProjectLandingPage, NotFoundPage
  routes/                 Router config
  lib/
    subdomain.ts          Wildcard subdomain -> project slug resolution
    projectRegistry.ts    slug -> { project data, optional bespoke page }
    supabase.ts           Lazy Supabase client for lead capture
    utm.ts                Ad-attribution capture (sessionStorage-backed)
    useSeo.ts             Per-page title/meta/OG/JSON-LD
  projects/
    types.ts               Shared Project/Unit/Amenity types
    signature-sarvam/       Landing page, content data, and form components
supabase/migrations/     Lead table schema (source of truth)
wrangler.toml            Cloudflare config
```

## Adding a new project

1. Parse the builder brochure into structured data
   (`cluade_skills/04-brochure-parser.md`), matching the `Project` type in
   `src/projects/types.ts`. Never invent a RERA number, price, or possession date.
2. Create `src/projects/<slug>/data.ts` exporting that data.
3. Drop images into `public/projects/<slug>/`.
4. Optionally build a bespoke `<Slug>Page.tsx` in the same folder. Projects
   without one fall back to the generic layout in `pages/ProjectLandingPage.tsx`.
5. Register it in `src/lib/projectRegistry.ts`.
6. In Cloudflare: add `<slug>.grihamconnect.com` as a custom domain (wildcard
   DNS already covers it).

## Landing page conventions

These are deliberate and worth preserving when editing pages:

- **Conversion order.** Quick 2-field capture sits in the hero (above the fold),
  pricing is surfaced early to pre-qualify paid-social traffic, and the full
  qualifying form follows the emotional peak (amenities) rather than sitting at
  the very bottom. Sticky call-back and WhatsApp CTAs persist after the hero.
- **Attribution.** `utm_source/medium/campaign/content` are captured on load and
  written with every lead. Don't remove the hidden fields — media buying reporting
  depends on them.
- **Compliance.** The RERA number and pricing disclaimer must stay visible on
  every screenful. No possession dates until the RERA-filed date is confirmed in
  writing. No guaranteed-return, appreciation, or fixed-yield language. No
  artificial scarcity unless the claim is backed by a real, documented cap.

## Leads

Submissions land in the Supabase `sarvam_leads` table (insert-only for anonymous
visitors; see `supabase/migrations/`). Apply migrations with the Supabase CLI or
paste them into the SQL editor.
