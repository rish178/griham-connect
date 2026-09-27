-- Griham Connect content/product schema: the data-driven backbone for the
-- Property Health intelligence product (see cluade_skills/griham-connect-*).
--
-- This is a separate content domain from lead_submissions/sarvam_leads
-- (the ad-microsite lead capture in apps/landing) — same Supabase project,
-- unrelated tables. Nothing here touches those.
--
-- Access model: every table here is read and written exclusively by
-- apps/web server code (Route Handlers / Server Components) using the
-- service_role key, which never reaches the browser. There is no anon-key
-- client-side Supabase usage in Griham Connect, so RLS simply locks
-- everything to service_role, same pattern as lead_capture_v2.sql.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Content domain: human-managed marketing content ------------------------

CREATE TABLE public.hero_campaigns (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name               TEXT NOT NULL,
  eyebrow            TEXT,
  headline           TEXT NOT NULL,
  description        TEXT,
  desktop_image_url  TEXT,
  mobile_image_url   TEXT,
  image_position     TEXT NOT NULL DEFAULT 'right',
  overlay_strength   NUMERIC NOT NULL DEFAULT 0.9,
  theme              TEXT NOT NULL DEFAULT 'paper',
  cta_label          TEXT,
  cta_action         TEXT,
  priority           INT NOT NULL DEFAULT 0,
  is_active          BOOLEAN NOT NULL DEFAULT true,
  starts_at          TIMESTAMPTZ,
  ends_at            TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ON public.hero_campaigns (is_active, priority DESC);

CREATE TABLE public.cities (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug               TEXT UNIQUE NOT NULL,
  name               TEXT NOT NULL,
  display_name       TEXT NOT NULL,
  short_description  TEXT,
  image_url          TEXT,
  icon               TEXT,
  is_active          BOOLEAN NOT NULL DEFAULT true,
  sort_order         INT NOT NULL DEFAULT 0,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ON public.cities (is_active, sort_order);

CREATE TABLE public.tools (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key                  TEXT UNIQUE NOT NULL,
  name                 TEXT NOT NULL,
  description          TEXT,
  icon                 TEXT,
  component_type       TEXT NOT NULL, -- must match an allowlisted key in the frontend TOOL_COMPONENTS registry
  is_active            BOOLEAN NOT NULL DEFAULT true,
  sort_order           INT NOT NULL DEFAULT 0,
  configuration_json   JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ON public.tools (is_active, sort_order);

-- 2. Property/product domain: system-controlled operational data ------------

CREATE TABLE public.builders (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                      TEXT UNIQUE NOT NULL,
  name                      TEXT NOT NULL,
  logo_url                  TEXT,
  description               TEXT,
  website_url               TEXT,
  years_in_business         INT,
  projects_delivered        INT,
  average_delay_months      NUMERIC,
  rera_case_count           INT,
  google_rating             NUMERIC,
  financial_stability_note  TEXT,
  metadata_json             JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.locations (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id        UUID NOT NULL REFERENCES public.cities(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  latitude       NUMERIC,
  longitude      NUMERIC,
  description    TEXT,
  metadata_json  JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ON public.locations (city_id);

CREATE TABLE public.properties (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id          UUID NOT NULL REFERENCES public.cities(id),
  builder_id       UUID REFERENCES public.builders(id),
  location_id      UUID REFERENCES public.locations(id),
  slug             TEXT UNIQUE NOT NULL,
  name             TEXT NOT NULL,
  sector           TEXT,
  configuration    TEXT,        -- e.g. "2, 3, 4 BHK"
  price_from       NUMERIC,
  price_to         NUMERIC,
  currency         TEXT NOT NULL DEFAULT 'INR',
  possession_date  DATE,
  description      TEXT,
  hero_image_url   TEXT,
  status           TEXT NOT NULL DEFAULT 'active', -- active|inactive|draft
  is_sample        BOOLEAN NOT NULL DEFAULT false,  -- demo/seed data, surfaced to users as such
  is_featured      BOOLEAN NOT NULL DEFAULT false,
  sort_order       INT NOT NULL DEFAULT 0,
  latitude         NUMERIC,
  longitude        NUMERIC,
  metadata_json    JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ON public.properties (city_id, status, is_sample, sort_order);
CREATE INDEX ON public.properties (city_id, name);

CREATE TABLE public.property_assets (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id    UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  asset_type     TEXT NOT NULL, -- hero|gallery|floor_plan|amenity|master_plan|video|thumbnail
  url            TEXT NOT NULL,
  mobile_url     TEXT,
  alt_text       TEXT,
  sort_order     INT NOT NULL DEFAULT 0,
  is_active      BOOLEAN NOT NULL DEFAULT true,
  metadata_json  JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ON public.property_assets (property_id, asset_type, sort_order);

-- One row per property, feeding @grihamconnect/scoring's published GC Score
-- methodology (SCORE_WEIGHTS / calculateGcScore / deriveRiskLevel). Column
-- names mirror packages/types ProjectScores exactly.
CREATE TABLE public.project_scores (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id            UUID UNIQUE NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  builder_score          NUMERIC NOT NULL,
  location_score         NUMERIC NOT NULL,
  investment_score       NUMERIC NOT NULL,
  rental_score           NUMERIC NOT NULL,
  connectivity_score     NUMERIC NOT NULL,
  construction_score     NUMERIC NOT NULL,
  livability_score       NUMERIC NOT NULL,
  legal_score            NUMERIC NOT NULL,
  price_fairness_score   NUMERIC NOT NULL,
  score_version          TEXT NOT NULL,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Analysis pipeline (dynamic — the frontend renders whatever the backend sends) --

-- Default step catalogue/order. Editable without touching the pipeline UI
-- component: add/reorder/deactivate a row here, the running pipeline picks
-- it up on the next run.
CREATE TABLE public.analysis_step_templates (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_key     TEXT UNIQUE NOT NULL,
  label        TEXT NOT NULL,
  description  TEXT,
  sort_order   INT NOT NULL DEFAULT 0,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.analysis_runs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id    UUID NOT NULL REFERENCES public.properties(id),
  city_id        UUID NOT NULL REFERENCES public.cities(id),
  request_text   TEXT NOT NULL,
  status         TEXT NOT NULL DEFAULT 'queued', -- queued|running|completed|failed|cancelled
  error_code     TEXT,
  error_message  TEXT,
  started_at     TIMESTAMPTZ,
  completed_at   TIMESTAMPTZ,
  metadata_json  JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ON public.analysis_runs (property_id, created_at DESC);

CREATE TABLE public.analysis_steps (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id         UUID NOT NULL REFERENCES public.analysis_runs(id) ON DELETE CASCADE,
  step_key       TEXT NOT NULL,
  label          TEXT NOT NULL,
  description    TEXT,
  status         TEXT NOT NULL DEFAULT 'pending', -- pending|running|completed|failed
  progress       INT NOT NULL DEFAULT 0,
  sort_order     INT NOT NULL DEFAULT 0,
  started_at     TIMESTAMPTZ,
  completed_at   TIMESTAMPTZ,
  error_message  TEXT,
  metadata_json  JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX ON public.analysis_steps (run_id, sort_order);

-- 4. Structured report (never arbitrary HTML — sections_json is an array of
-- typed blocks whose `type` must match the frontend's allowlisted
-- REPORT_COMPONENTS registry; unknown types are dropped at render time) ----

CREATE TABLE public.reports (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id                 UUID NOT NULL REFERENCES public.properties(id),
  run_id                      UUID REFERENCES public.analysis_runs(id),
  version                     INT NOT NULL DEFAULT 1,
  gc_score                    INT NOT NULL,
  risk_level                  TEXT NOT NULL, -- Low|Moderate|High
  summary_title               TEXT,
  summary_text                TEXT,
  sections_json               JSONB NOT NULL DEFAULT '[]'::jsonb,
  pros                        TEXT[] NOT NULL DEFAULT '{}',
  cons                        TEXT[] NOT NULL DEFAULT '{}',
  recommended_for             TEXT[] NOT NULL DEFAULT '{}',
  not_recommended_for         TEXT[] NOT NULL DEFAULT '{}',
  alternative_property_slugs  TEXT[] NOT NULL DEFAULT '{}',
  sources_json                JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ON public.reports (property_id, created_at DESC);
CREATE INDEX ON public.reports (run_id);

-- 5. Lock everything to service_role (apps/web server code only) ------------

DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN
    SELECT unnest(ARRAY[
      'hero_campaigns', 'cities', 'tools', 'builders', 'locations',
      'properties', 'property_assets', 'project_scores',
      'analysis_step_templates', 'analysis_runs', 'analysis_steps', 'reports'
    ])
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('REVOKE ALL ON public.%I FROM anon, authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
  END LOOP;
END $$;
