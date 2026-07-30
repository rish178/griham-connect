-- Lead capture v2: splits the append-only submission log from the
-- deduplicated person record, and locks writes to the Worker's service_role.
--
-- Why: the current single-table sarvam_leads gets one row per form *submit*.
-- A visitor who fills the hero form then the full form creates two rows for
-- one person, inflating the reported lead count (and the derived CPL), and
-- risking an advisor calling the same person twice. See
-- docs/lead-capture-plan.md §2 for the full defect list this fixes.
--
-- Pre-launch only: no real leads exist yet in sarvam_leads, so this drops and
-- recreates it rather than migrating rows. Do not run this against a table
-- with real data without adapting it into a data-preserving migration first.

-- 1. Append-only submission log ---------------------------------------------
-- One row per form submit, ever. Never updated. This is the audit trail and
-- the thing "how many times was the form filled" is counted from.
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
  -- consent audit: DPDP-friendly record of what was actually agreed to
  consent           BOOLEAN NOT NULL,
  consent_text      TEXT,
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
  -- request context, filled in by the Worker (never trusted from the client)
  ip                INET,
  user_agent        TEXT,
  country           TEXT,                        -- request.cf.country
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ON public.lead_submissions (phone_e164);
CREATE INDEX ON public.lead_submissions (created_at DESC);

-- 2. Deduplicated person ------------------------------------------------------
-- One row per person, keyed on normalised phone. This is what the sales team
-- works and what "how many leads" is counted from.
DROP TABLE IF EXISTS public.sarvam_leads;

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

-- 3. Lock the client out entirely ---------------------------------------------
-- The publishable key in the JS bundle let anyone POST an insert directly.
-- Only the Worker (using the service_role key, which never reaches the
-- browser) may read or write these tables now; validation happens server-side
-- where it can't be bypassed by hitting the REST endpoint directly.
ALTER TABLE public.lead_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sarvam_leads     ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.lead_submissions FROM anon, authenticated;
REVOKE ALL ON public.sarvam_leads     FROM anon, authenticated;
GRANT ALL ON public.lead_submissions TO service_role;
GRANT ALL ON public.sarvam_leads     TO service_role;

-- 4. The upsert: never overwrite known data with null -------------------------
-- Called once per submission by the Worker. Wraps both inserts in one
-- transaction (implicit, since it's a single function call) so a submission
-- either fully records or fully fails — never a log entry with no matching
-- person, or vice versa.
CREATE OR REPLACE FUNCTION public.record_lead_submission(payload JSONB)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- jsonb_populate_record fills only the keys present in payload; any column
  -- the Worker omits (created_at) comes out NULL rather than falling back to
  -- the table's DEFAULT. Merge in now() first so payload can still override
  -- it (right-hand side of || wins) but a genuinely absent key gets today's
  -- default instead of an explicit NULL that violates the NOT NULL constraint.
  INSERT INTO lead_submissions
    SELECT * FROM jsonb_populate_record(
      NULL::lead_submissions,
      jsonb_build_object('created_at', now()) || payload
    );

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

-- SECURITY DEFINER runs as the function owner (bypassing the caller's RLS),
-- which is exactly why access to *calling* it must itself be locked down.
REVOKE ALL ON FUNCTION public.record_lead_submission(JSONB) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_lead_submission(JSONB) TO service_role;
