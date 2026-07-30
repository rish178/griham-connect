-- Ad-attribution fields so each enquiry can be traced back to the campaign,
-- ad set and creative that produced it. Required for cost-per-qualified-lead
-- reporting back to the media buying side.

ALTER TABLE public.sarvam_leads
  ADD COLUMN IF NOT EXISTS utm_source text,
  ADD COLUMN IF NOT EXISTS utm_medium text,
  ADD COLUMN IF NOT EXISTS utm_campaign text,
  ADD COLUMN IF NOT EXISTS utm_content text;
