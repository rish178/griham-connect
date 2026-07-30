# Cloudflare Setup Checklist

Everything that has to exist in the Cloudflare dashboard for `griham-connect` to
serve the Signature Sarvam page and capture leads. Grouped so you can stop after
Phase A and have a live site.

All of it fits inside Cloudflare's **free** tier at your expected traffic — see
§6.

---

## 0. Prerequisites

- [ ] **Cloudflare account** created.
- [ ] **`grihamconnect.com` registered** and added to the account
      (*Add a domain* → choose Free plan).
- [ ] **Nameservers switched** at your registrar to the two Cloudflare
      nameservers shown. Zone status must read **Active** before Workers routes
      or SSL will behave. This can take a few hours to propagate.

> If the domain sits with another registrar and you cannot move nameservers, you
> would be on a CNAME (partial) setup — workable, but Cloudflare will **not**
> auto-provision the wildcard certificate, so read §5 before committing.

---

## 1. Phase A — Get the page live

- [ ] **`wrangler login`** locally (opens a browser, authorises the CLI).
- [ ] **First deploy:** `npm run build && npx wrangler deploy`. This creates the
      Worker named `griham-connect` from your `wrangler.toml` and uploads `dist/`
      as static assets. Verify at `griham-connect.<subdomain>.workers.dev`.
- [ ] **Custom domain for the project.** Worker → **Settings → Domains & Routes
      → Add → Custom Domain** → `sarvam.grihamconnect.com`. Cloudflare creates
      the proxied DNS record and issues the certificate for you — no manual DNS.
- [ ] **Apex/marketing domain** (optional now): add `grihamconnect.com` and
      `www.grihamconnect.com` the same way.
- [ ] **SSL/TLS → Overview:** encryption mode **Full (strict)**.
- [ ] **SSL/TLS → Edge Certificates:** *Always Use HTTPS* **On**, *Automatic
      HTTPS Rewrites* **On**, Minimum TLS **1.2**.
- [ ] Confirm Universal SSL shows **Active** under Edge Certificates.

That is the whole requirement to have a working, HTTPS, globally-cached landing
page. Everything below is about lead capture and hardening.

---

## 2. Phase B — Lead capture backend

Needed once you implement the Worker API from `docs/lead-capture-plan.md`.

### 2.1 Turnstile (bot protection — this is the real defence)

- [ ] Dashboard → **Turnstile → Add widget**.
- [ ] Name: `griham-connect-forms`. Hostnames: `grihamconnect.com`,
      `sarvam.grihamconnect.com`, and `localhost` for local dev.
- [ ] Widget mode: **Managed** (or **Invisible** if you want zero visible
      friction — worth preferring here, since this is a paid-traffic conversion
      page).
- [ ] Copy the **Site Key** → build-time env `VITE_TURNSTILE_SITE_KEY` (public,
      safe in the bundle).
- [ ] Copy the **Secret Key** → Worker secret `TURNSTILE_SECRET_KEY`.

### 2.2 Worker secrets

Set each with `npx wrangler secret put <NAME>`, or Worker → **Settings →
Variables and Secrets**. Never commit these.

- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` — full database access; Worker only
- [ ] `TURNSTILE_SECRET_KEY`
- [ ] `SLACK_WEBHOOK_URL` — instant lead notification
- [ ] `SHEET_WEBHOOK_URL` — Make/Zapier catch hook that appends to the Sheet
- [ ] `META_PIXEL_ID` (plain var is fine)
- [ ] `META_CAPI_ACCESS_TOKEN`

For local development put the same keys in `.dev.vars` (already gitignored via
`.env`/`*.local`? — confirm `.dev.vars` is listed in `.gitignore`).

### 2.3 Routing for the API

Handled in `wrangler.toml`, not the dashboard — `run_worker_first = ["/api/*"]`
plus `binding = "ASSETS"`. See the plan doc §6 Phase 1. Nothing to click.

---

## 3. Phase C — Hardening and measurement

### 3.1 Rate limiting — set expectations correctly

- [ ] **Security → WAF → Rate limiting rules → Create rule**
      - Expression: `URI Path equals /api/leads`
      - Requests: e.g. `20` · Period: `10 seconds` · Action: **Block**

**Be aware of what the Free plan actually gives you:** 1 rule, matching on
**Path only**, counting by **IP**, with the counting period and mitigation
timeout both fixed at **10 seconds**. That stops a crude flood and nothing more
— a bot submitting one request per second is entirely unaffected. Treat this as a
seatbelt, not the lock. **Turnstile plus the honeypot is what actually protects
the form.** If you ever need genuine limits, either move to Pro (2 rules, up to
1-minute windows) or implement counting inside the Worker with KV — but at
40–100 leads/month that is almost certainly wasted effort.

*(This corrects the "5 per minute" figure in an earlier draft of the plan — a
60-second window is not available on Free.)*

### 3.2 Analytics

- [ ] **Web Analytics** → add `grihamconnect.com`. Free, privacy-friendly RUM,
      and it reports **Core Web Vitals** — which matter here beyond vanity, since
      load speed feeds both conversion rate and Meta's ad quality ranking.
- [ ] Worker → **Metrics** tab: watch invocations and error rate after launch. A
      spike in Worker errors means leads are failing to save.

### 3.3 Optional

- [ ] **Bot Fight Mode** (Security → Bots). Free and cheap insurance. Re-test
      form submission after enabling — it challenges automated traffic and you
      want to be certain it does not catch real visitors.
- [ ] **Zaraz** (Tag management). If you want the *browser-side* Meta Pixel
      without hand-rolling the script, Zaraz can inject it and keeps it off the
      critical path. Remember to fire the same `event_id` as the server-side CAPI
      event or Meta will double-count.
- [ ] **Email Routing** — gives you `leads@grihamconnect.com` forwarding to your
      inbox, useful as a notification fallback.
- [ ] **Workers Builds** (CI): Worker → **Settings → Builds → Connect** →
      `rish178/griham-connect`. Build `npm run build`, deploy
      `npx wrangler deploy`. Auto-deploys on push to `main` and gives per-branch
      preview URLs — worth it so you stop deploying from your laptop.

---

## 4. Do **not** set these up

- **Cloudflare Pages** — you deliberately moved to Workers. Running both for one
  site causes confusing precedence bugs.
- **Cloudflare for SaaS / Custom Hostnames** — only relevant if builders bring
  their *own* domains (e.g. `sarvam.signatureglobal.in`). Not needed for
  subdomains you own.
- **KV / D1 / R2 / Durable Objects** — Supabase is the database. Adding a second
  store now buys nothing.
- **Pro/Business plan** — nothing in this stack requires it yet. The one thing
  Pro would buy you is better rate limiting (§3.1).

---

## 5. Domain strategy: per-project domains now, wildcard later

The repo is written for wildcard subdomains (`src/lib/subdomain.ts`), and the
comment in `wrangler.toml` says to add `*.grihamconnect.com` under **Domains &
Routes**. One correction: **Custom Domains do not accept wildcards.** A wildcard
has to be a **Route**, and Routes additionally require a proxied DNS record to
already exist for the hostname.

**Recommendation: use one Custom Domain per project for now.** With a single live
project, adding `sarvam.grihamconnect.com` as a Custom Domain is one click,
Cloudflare handles DNS and the certificate, and you avoid the dummy-DNS-record
workaround entirely. The path routing (`/projects/:slug`) already works for
previews and QA. Revisit the wildcard when adding a domain per project actually
becomes a chore — realistically past 8–10 projects.

**When you do want the wildcard:**

1. **DNS → Records → Add record:** Type `A`, Name `*`, IPv4 `192.0.2.1`
   (a reserved documentation address — it is never contacted; the proxy
   intercepts first), Proxy status **Proxied**. Proxied wildcard records are
   available on all plans, including Free.
2. **Worker → Settings → Domains & Routes → Add → Route:**
   `*.grihamconnect.com/*`, zone `grihamconnect.com`.
3. Add a **separate** route or Custom Domain for the apex — `*.grihamconnect.com/*`
   matches subdomains only, **not** `grihamconnect.com` itself.
4. Certificates: on a full nameserver setup, Universal SSL covers
   `grihamconnect.com` and `*.grihamconnect.com`. Note it is **one level only** —
   `sarvam.grihamconnect.com` is covered, `a.b.grihamconnect.com` is not.
5. More specific patterns win, so a per-project Custom Domain will still override
   the wildcard route if you keep both.

---

## 6. Cost

| Item | Tier | Notes |
|---|---|---|
| Zone / DNS / Universal SSL | Free | |
| Workers static assets | Free | Asset requests are not billed and do not invoke the Worker |
| Worker invocations | Free | 100,000/day. With `run_worker_first = ["/api/*"]` only form posts invoke it — you will use a rounding error of this |
| Turnstile | Free | |
| Rate limiting (1 rule) | Free | Constrained as described in §3.1 |
| Web Analytics | Free | |
| Workers Builds | Free tier available | Generous build minutes |

Realistically **₹0/month on Cloudflare** for this project. Your actual spend is
ad budget and Supabase.

---

## 7. Post-deploy verification

- [ ] `https://sarvam.grihamconnect.com` loads over HTTPS with a valid cert
- [ ] Hard refresh on a deep path (`/projects/signature-sarvam`) returns the app,
      not a 404 — confirms `not_found_handling` is working
- [ ] `curl -X POST https://sarvam.grihamconnect.com/api/leads` reaches the
      Worker (a validation error is the correct response, not an HTML page)
- [ ] Submitting the real form writes a row in Supabase and fires the
      notification
- [ ] Worker **Metrics** shows invocations only for `/api/*`, not every page view
- [ ] Web Analytics is recording pageviews and Core Web Vitals
- [ ] Test from mobile data, not just office wifi — Indian mobile networks are
      where your ad traffic actually comes from
