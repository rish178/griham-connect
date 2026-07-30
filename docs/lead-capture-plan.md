# Lead Capture, Storage & Verification — Implementation Plan

Scope: the two Signature Sarvam forms (`QuickLeadForm`, `LeadForm`). Written as a
spec to implement with Claude Code. Phases are ordered by value-per-effort, and
each is independently shippable — you do not need to do all four before launch.

Context from `Campaign_Brief_Signature_Global_Sarvam.md`: ~₹40–75K/month spend at
a ₹700–1,000 blended CPL means roughly **40–100 leads/month**. That is low volume
on a ₹2.89–3.98 Cr ticket. Design accordingly — reliability and speed-to-contact
matter far more than throughput, and heavy verification machinery is not
justified at this scale.

---

## 1. What exists today

| Layer | Current state |
|---|---|
| Capture | Two forms. Hero: name + phone. Full: name, phone, configuration, budget band, best time to call, consent |
| Validation | Client-side only (`zod`), incl. Indian mobile regex |
| Attribution | `utm_source/medium/campaign/content` captured on load into `sessionStorage`, written with each lead (`src/lib/utm.ts`) |
| Transport | Browser inserts **directly** into Supabase using the publishable key (`src/lib/supabase.ts`) |
| Storage | Supabase `sarvam_leads`, RLS insert-only for `anon` with a `WITH CHECK` on consent + field lengths |
| Verification | None beyond format |
| Notification | None |
| CRM / Sheet | None |
| Meta CAPI | None |

## 2. Known gaps — read this first

These are real defects in what is deployed, not hypotheticals. Items 1, 2 and 4
are the ones that would actually cost money or leads on day one.

1. **Duplicate rows per person.** Both forms `insert`. A visitor who fills the
   hero form and then the full form creates **two rows**. Your reported lead
   count — and therefore your CPL — will be inflated, and an advisor may call the
   same person twice. This is the single most important fix.
2. **Phone numbers are not normalised.** `9876543210`, `+919876543210` and
   `+91 98765 43210` all persist as distinct strings, so dedupe by phone cannot
   work and the same person looks like three leads.
3. **The publishable key is in the JS bundle.** That is by design for Supabase,
   but it means anyone can POST inserts. The RLS `WITH CHECK` validates *shape*,
   not *authenticity* — there is no bot protection.
4. **Nobody is told a lead arrived.** The brief commits to a **5-minute
   response SLA**. With no notification path that SLA cannot be met; leads sit in
   a table until someone thinks to look.
5. **No server-side validation.** Client `zod` is trivially bypassed by posting
   straight to the Supabase REST endpoint.
6. **No Google Sheet sync.** The brief specifies a Griham-wide Sheet with a
   `Project` column as the ops surface.
7. **No Meta Conversions API.** Without a conversion signal Meta optimises
   against clicks rather than leads, which directly raises CPL. The brief has
   this as Phase 2, and the page shipping is the trigger.
8. **Silent loss on failure.** If the Supabase insert fails the visitor sees an
   error, but the lead is gone — no retry, no record, no alert.
9. **Thin consent trail.** A boolean is stored, but not the consent wording
   shown, its version, or when/where it was given. Worth tightening given India's
   DPDP Act 2023 — confirm actual obligations with counsel; this plan only makes
   the data available.

---

## 3. Target architecture

Move lead submission behind **your own Cloudflare Worker endpoint**. You are
already deploying to Workers, so this is a small step with a large payoff:
secrets stay server-side, validation becomes non-bypassable, and one place can
fan out to Supabase, Slack, the Sheet and Meta.

```
  Browser form
      │  POST /api/leads   { …fields, turnstileToken, submissionId }
      ▼
  Cloudflare Worker  ◄── secrets live here (service_role, CAPI token, webhooks)
      ├── 1. verify Turnstile token
      ├── 2. re-validate + normalise phone → E.164
      ├── 3. write to Supabase (service_role)      ← source of truth, awaited
      └── ctx.waitUntil(  ← fire-and-forget, never blocks the response
            ├── Slack / notification ping
            ├── Google Sheet via Make/Zapier hook
            └── Meta CAPI "Lead" event
          )
      ▼
  200 { ok: true }
```

**Why the Worker, not Supabase Edge Functions:** you already own the Cloudflare
deploy and the domain, so this adds no new platform. If you would rather not
introduce a Worker script at all, the fallback is to keep direct-to-Supabase and
drive side effects from a Supabase Database Webhook into Make/Zapier — cheaper to
build, but the anon key stays exposed and Meta CAPI still needs a server.

### Two-table model

Split the event log from the person. This is what fixes duplicate counting
without losing data.

- **`lead_submissions`** — append-only. One row per form submit, ever. Never
  updated. Your audit trail and the thing you count "form fills" from.
- **`sarvam_leads`** — one row per **person**, keyed on normalised phone.
  Enriched on each submission, never duplicated. This is what the sales team
  works and what you count *leads* from.

---

## 4. Schema

```sql
-- Phase 1 migration: supabase/migrations/<ts>_lead_capture_v2.sql

-- 4a. Append-only submission log ------------------------------------------
CREATE TABLE public.lead_submissions (
  id                UUID PRIMARY KEY,            -- client-generated, = Meta event_id
  project_slug      TEXT NOT NULL DEFAULT 'signature-sarvam',
  form_variant      TEXT NOT NULL,               -- 'hero_quick' | 'full'
  full_name         TEXT NOT NULL,
  phone_raw         TEXT NOT NULL,               -- exactly as typed
  phone_e164        TEXT NOT NULL,               -- +919876543210
  configuration     TEXT,
  budget_band       TEXT,
  best_time_to_call TEXT,
  -- consent audit
  consent           BOOLEAN NOT NULL,
  consent_text      TEXT,                        -- wording actually shown
  consent_version   TEXT,
  -- attribution
  utm_source        TEXT,
  utm_medium        TEXT,
  utm_campaign      TEXT,
  utm_content       TEXT,
  fbclid            TEXT,
  gclid             TEXT,
  fbp               TEXT,                        -- _fbp cookie, for CAPI match
  fbc               TEXT,                        -- derived from fbclid
  referrer          TEXT,
  landing_path      TEXT,
  -- request context
  ip                INET,
  user_agent        TEXT,
  country           TEXT,                        -- request.cf.country
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ON public.lead_submissions (phone_e164);
CREATE INDEX ON public.lead_submissions (created_at DESC);

-- 4b. Deduplicated person -------------------------------------------------
DROP TABLE IF EXISTS public.sarvam_leads;   -- pre-launch only; migrate if live

CREATE TABLE public.sarvam_leads (
  phone_e164        TEXT PRIMARY KEY,
  project_slug      TEXT NOT NULL DEFAULT 'signature-sarvam',
  full_name         TEXT NOT NULL,
  configuration     TEXT,
  budget_band       TEXT,
  best_time_to_call TEXT,
  submission_count  INT  NOT NULL DEFAULT 1,
  -- first-touch attribution: what the media buyer should be credited for
  first_utm_source   TEXT,
  first_utm_medium   TEXT,
  first_utm_campaign TEXT,
  first_utm_content  TEXT,
  -- last-touch: what finally converted them
  last_utm_source    TEXT,
  last_utm_medium    TEXT,
  last_utm_campaign  TEXT,
  last_utm_content   TEXT,
  -- sales workflow
  status            TEXT NOT NULL DEFAULT 'new',  -- new|contacted|qualified|visit_booked|junk|lost
  notes             TEXT,
  first_seen_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4c. Lock the client out entirely; only the Worker (service_role) writes.
ALTER TABLE public.lead_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sarvam_leads     ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.lead_submissions FROM anon, authenticated;
REVOKE ALL ON public.sarvam_leads     FROM anon, authenticated;
GRANT ALL ON public.lead_submissions TO service_role;
GRANT ALL ON public.sarvam_leads     TO service_role;
```

### The upsert — never overwrite known data with null

```sql
-- 4d. Called once per submission by the Worker.
CREATE OR REPLACE FUNCTION public.record_lead_submission(payload JSONB)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO lead_submissions
    SELECT * FROM jsonb_populate_record(NULL::lead_submissions, payload);

  INSERT INTO sarvam_leads AS l (
    phone_e164, project_slug, full_name, configuration, budget_band,
    best_time_to_call,
    first_utm_source, first_utm_medium, first_utm_campaign, first_utm_content,
    last_utm_source,  last_utm_medium,  last_utm_campaign,  last_utm_content
  )
  VALUES (
    payload->>'phone_e164', payload->>'project_slug', payload->>'full_name',
    payload->>'configuration', payload->>'budget_band',
    payload->>'best_time_to_call',
    payload->>'utm_source', payload->>'utm_medium',
    payload->>'utm_campaign', payload->>'utm_content',
    payload->>'utm_source', payload->>'utm_medium',
    payload->>'utm_campaign', payload->>'utm_content'
  )
  ON CONFLICT (phone_e164) DO UPDATE SET
    -- richer answers win; a blank second submission never erases a first
    full_name         = COALESCE(NULLIF(EXCLUDED.full_name, ''),         l.full_name),
    configuration     = COALESCE(NULLIF(EXCLUDED.configuration, ''),     l.configuration),
    budget_band       = COALESCE(NULLIF(EXCLUDED.budget_band, ''),       l.budget_band),
    best_time_to_call = COALESCE(NULLIF(EXCLUDED.best_time_to_call, ''), l.best_time_to_call),
    last_utm_source   = COALESCE(EXCLUDED.last_utm_source,   l.last_utm_source),
    last_utm_medium   = COALESCE(EXCLUDED.last_utm_medium,   l.last_utm_medium),
    last_utm_campaign = COALESCE(EXCLUDED.last_utm_campaign, l.last_utm_campaign),
    last_utm_content  = COALESCE(EXCLUDED.last_utm_content,  l.last_utm_content),
    submission_count  = l.submission_count + 1,
    last_seen_at      = now();
END;
$$;
```

---

## 5. What "verify" means here — five distinct layers

Worth separating, because they solve different problems and only the first three
are worth building now.

| Layer | Catches | Recommendation |
|---|---|---|
| **Format** | Typos, wrong-length numbers | Already done client-side; **duplicate the check server-side** |
| **Automation** | Bots, scrapers, competitor spam | **Cloudflare Turnstile** (free, same platform) + honeypot field + WAF rate limit on `/api/leads` |
| **Deduplication** | Same person counted twice | Phone-keyed upsert, §4 |
| **Reachability** | Fake but well-formed numbers | **Skip OTP for now** — see below |
| **Qualification** | Real but not a buyer | Human. The budget/config questions already collected are the input |

### On phone OTP — recommend deferring

At 40–100 leads/month with an advisor calling every one inside 5 minutes, **the
call itself is the reachability check**. OTP inserts a verification step into the
middle of the funnel, and the drop-off in completed submissions typically costs
more genuine leads than the fake ones it prevents. It also adds an SMS/WhatsApp
provider and its cost.

Revisit if you actually observe a junk-number problem — you will be able to
measure it precisely, because `status = 'junk'` in `sarvam_leads` gives you the
rate. If you want it available without paying the conversion cost now, build it
behind a flag (`ENABLE_OTP`) and launch with it off.

---

## 6. Phased implementation

### Phase 0 — Fix duplicate counting *(do this first; no new infra)*

Highest value for the least work, and it is a correctness bug rather than an
enhancement. Can ship against the current direct-to-Supabase setup.

1. Add `src/lib/phone.ts` — `normalisePhoneE164(input: string): string | null`.
   Strip spaces/dashes/parens, drop a leading `0`, accept optional `+91`/`91`
   prefix, require `[6-9]` + 9 digits, return `+91XXXXXXXXXX`.
2. Add `src/lib/session.ts` — a `crypto.randomUUID()` per tab in
   `sessionStorage`, reused as `submissionId`.
3. Apply the §4 migration and the `record_lead_submission` function.
4. Point both forms at the RPC instead of a raw `insert`.
5. Add a `submissionId` so a double-click cannot create two submissions.

**Done when:** filling the hero form and then the full form produces **one** row
in `sarvam_leads` with `submission_count = 2`, and two rows in
`lead_submissions`.

### Phase 1 — Worker endpoint + real verification

1. `npm i -D wrangler @cloudflare/workers-types`
2. Create `worker/index.ts`:
   ```ts
   export default {
     async fetch(request: Request, env: Env, ctx: ExecutionContext) {
       const url = new URL(request.url);
       if (url.pathname === "/api/leads" && request.method === "POST") {
         return handleLead(request, env, ctx);
       }
       return env.ASSETS.fetch(request);   // everything else = the SPA
     },
   } satisfies ExportedHandler<Env>;
   ```
3. Update `wrangler.toml` — keep the existing `[assets]` block and add:
   ```toml
   main = "./worker/index.ts"

   [assets]
   directory = "./dist"
   not_found_handling = "single-page-application"
   binding = "ASSETS"
   run_worker_first = ["/api/*"]
   ```
   `run_worker_first` is the reliable way to route `/api/*` to the script.
   Without it, Cloudflare's navigation-request optimisation (active on your
   `compatibility_date`) decides based on the `Sec-Fetch-Mode` header — fine for
   `fetch()` calls, confusing when you hit the URL in a browser. Requires
   Wrangler ≥ 4.20.0.
4. `handleLead` order of operations:
   1. Reject non-JSON / oversized bodies (cap at ~4 KB).
   2. Verify Turnstile: POST `secret` + `response` to
      `https://challenges.cloudflare.com/turnstile/v0/siteverify`. Reject on failure.
   3. Reject if the honeypot field is non-empty.
   4. Re-validate with the **same zod schema** as the client — import it from
      `src/lib/leadSchema.ts` so there is one definition, not two.
   5. Normalise phone. Reject if `null`.
   6. Enrich server-side: `ip` from `CF-Connecting-IP`, `user_agent`,
      `country` from `request.cf.country`, `fbp`/`fbc` from cookies.
   7. `await` the Supabase RPC. **This is the only awaited side effect.**
   8. `ctx.waitUntil(Promise.allSettled([notify(), sheet(), metaCapi()]))` —
      a Slack outage must never fail a lead submission.
   9. Return `{ ok: true }`.
5. **Failure path:** if the Supabase call throws, still fire the notification
   with the raw payload and the error, so a human can recover the lead by hand.
   Return 500 and have the UI say "please WhatsApp us instead" — the form already
   has that copy.
6. Frontend: replace `getSupabase().from(...).insert()` in both forms with
   `fetch("/api/leads", …)`. Add the Turnstile widget (use the invisible/managed
   variant to avoid visible friction). `src/lib/supabase.ts` can then be deleted
   — the browser no longer talks to Supabase.
7. Add a Cloudflare WAF rate-limiting rule on `/api/leads`. Note the Free plan
   allows 1 rule, path-matching only, counted by IP, with a **10-second** window
   (a 1-minute window needs Pro). So the realistic rule is "20 requests / 10s /
   IP → block". That blocks a flood and nothing subtler — Turnstile and the
   honeypot are the actual protection. See `docs/cloudflare-setup.md` §3.1.

### Phase 2 — Notification + Google Sheet *(unblocks the 5-minute SLA)*

- **Notification:** Slack incoming webhook is the pragmatic instant channel.
  Include name, phone, configuration, budget band, best time to call, campaign —
  and a `https://wa.me/91XXXXXXXXXX` deep link to the lead's own number so the
  advisor replies in one tap. Email fallback if there is no Slack.
- **Sheet:** POST to a Make/Zapier catch hook that appends to the Griham-wide
  Sheet, per the brief. Include the `Project` column. Doing it via the hook
  rather than the Google Sheets API avoids service-account JWT signing inside
  the Worker.
- Set `status` handling so the Sheet and Supabase do not drift — treat Supabase
  as the source of truth and the Sheet as a read/working copy.

### Phase 3 — Meta Conversions API *(directly lowers CPL)*

Server-side `Lead` events let Meta optimise for actual leads, not clicks.

- POST to `https://graph.facebook.com/v<version>/<PIXEL_ID>/events` with the
  access token. Confirm the current Graph API version against Meta's changelog
  rather than hardcoding an old one.
- Per event: `event_name: "Lead"`, `event_time`, `action_source: "website"`,
  `event_source_url`, and `event_id = submissionId`.
- `user_data`: `ph` as **SHA-256 of digits only, country code included, no `+`**
  (`919876543210`); `em` likewise if you ever collect email. `client_ip_address`,
  `client_user_agent`, `fbc`, `fbp` are sent **unhashed**.
- If you also install the browser Pixel, fire the same `event_id` from both
  sides — Meta deduplicates on it. Mismatched IDs will double-count.
- Also set up the brief's **Conversions API for CRM** so a booking that closes
  weeks later feeds back as an offline conversion. That, not the form fill, is
  the signal actually worth optimising toward.

### Phase 4 — Optional, only if measured need

- OTP behind `ENABLE_OTP`, if junk rate justifies it.
- A `/admin` view over `sarvam_leads` (needs auth) if the Sheet stops sufficing.
- Duplicate-lead alerting when `submission_count` climbs unusually.

---

## 7. Secrets and environment

| Name | Where | Notes |
|---|---|---|
| `SUPABASE_URL` | Worker secret | |
| `SUPABASE_SERVICE_ROLE_KEY` | Worker secret | **Never** in client code or `.env.local` that ships |
| `TURNSTILE_SECRET_KEY` | Worker secret | |
| `VITE_TURNSTILE_SITE_KEY` | Build-time env | Public by design |
| `SLACK_WEBHOOK_URL` | Worker secret | |
| `SHEET_WEBHOOK_URL` | Worker secret | Make/Zapier catch hook |
| `META_PIXEL_ID` | Worker var | |
| `META_CAPI_ACCESS_TOKEN` | Worker secret | |

Set with `npx wrangler secret put <NAME>`. Update `.env.example` for the
build-time ones only, and confirm `.gitignore` still covers `.env.local` and
`.dev.vars`.

## 8. Test checklist

- [ ] Valid submission from each form → one `sarvam_leads` row, one `lead_submissions` row
- [ ] Hero form then full form, same phone → one lead, `submission_count = 2`, config/budget populated
- [ ] `9876543210`, `+919876543210`, `+91 98765 43210`, `09876543210` all collapse to one lead
- [ ] Invalid phone, missing consent, missing name → 400, nothing written
- [ ] Request with no/invalid Turnstile token → rejected
- [ ] Honeypot filled → rejected
- [ ] `curl` straight at `/api/leads` bypassing the UI → still validated and rejected
- [ ] Landing with `?utm_source=ig&utm_campaign=sarvam_always_on` → stored; without UTMs → nulls, no crash
- [ ] Simulated Supabase failure → 500 to the user **and** a notification containing the raw lead
- [ ] Simulated Slack failure → submission still succeeds
- [ ] Rate limit trips after N rapid submissions
- [ ] Real device pass on mobile Safari and Chrome Android (autofill, sticky bar not covering the submit button)
- [ ] Meta Events Manager shows the `Lead` event with good match quality and no duplicates

## 9. Open decisions for you

1. Worker endpoint (recommended) vs staying direct-to-Supabase with webhooks?
2. OTP — defer (recommended), build behind a flag, or build now?
3. Notification channel — Slack, email, or straight to a WhatsApp group?
4. Is `sarvam_leads` in Supabase the system of record, with the Sheet as a
   working copy? (Recommended. Two systems both claiming authority will drift.)
5. Data retention — how long are unconverted leads kept, and who can export
   them? Worth settling before volume accumulates rather than after.
