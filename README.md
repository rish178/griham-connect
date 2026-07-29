# Griham Connect

Real estate landing pages for Griham-managed builder projects. One React app,
one project per wildcard subdomain (or `/projects/:slug` in dev/preview).

## Stack

React · Vite · TypeScript · Tailwind CSS · Framer Motion · Cloudflare Pages

## Folder architecture

```
cluade_skills/          Agent role playbooks (chief-architect, landing-page-architect,
                         ui-ux-designer, brochure-parser, seo-conversion,
                         cloudflare-devops, supabase-backend, marketing,
                         performance-reviewer)
projects/                Raw per-project intake: brochures, briefs, campaign data
src/
  components/
    Layout/               Header, Footer
    ui/                   Reusable primitives (Button, Container, ...)
  pages/                  Route-level pages (HomePage, ProjectLandingPage, NotFoundPage)
  routes/                 Router config
  lib/
    subdomain.ts          Wildcard subdomain -> project slug resolution
    projectRegistry.ts    slug -> Project lookup
  projects/
    types.ts               Shared Project/Unit/Amenity types
    <project-slug>/         One folder per project once it's built (data + assets)
public/
  _redirects              Cloudflare Pages SPA fallback
wrangler.toml             Cloudflare Pages config
```

## Adding a new project

1. Parse the builder brochure into structured data (`cluade_skills/04-brochure-parser.md`),
   matching the `Project` type in `src/projects/types.ts`.
2. Create `src/projects/<slug>/data.ts` exporting that data.
3. Register it in `src/lib/projectRegistry.ts`.
4. Build the landing page in `src/pages/ProjectLandingPage.tsx` or a
   project-specific page component if it needs a custom layout.
5. In Cloudflare: add `<slug>.grihamconnect.com` as a custom domain on the
   Pages project (wildcard DNS already covers it).

## Local development

```bash
npm install
npm run dev
```

```bash
npm run build     # type-check + production build to dist/
npm run preview   # preview the production build locally
```
