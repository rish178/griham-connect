-- Lead capture table for the Signature Global Sarvam landing page.
-- Mirrors the schema provisioned via Lovable so the repo is the source of truth.

CREATE TABLE public.sarvam_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  configuration TEXT,
  budget_band TEXT,
  best_time_to_call TEXT,
  consent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT INSERT ON public.sarvam_leads TO anon;
GRANT INSERT ON public.sarvam_leads TO authenticated;
GRANT ALL ON public.sarvam_leads TO service_role;

ALTER TABLE public.sarvam_leads ENABLE ROW LEVEL SECURITY;

-- Anonymous visitors may only INSERT, never read. Consent must be true and the
-- name/phone must be plausible lengths, which also blunts junk submissions.
CREATE POLICY "Anyone can submit a lead"
ON public.sarvam_leads
FOR INSERT
TO anon, authenticated
WITH CHECK (
  consent = true
  AND length(full_name) BETWEEN 1 AND 100
  AND length(phone) BETWEEN 8 AND 20
);
