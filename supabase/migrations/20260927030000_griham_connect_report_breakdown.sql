-- Persist the full score-methodology breakdown alongside each report, so a
-- reloaded/shared report can render the score grid without recomputing it.
ALTER TABLE public.reports
  ADD COLUMN breakdown_json JSONB NOT NULL DEFAULT '[]'::jsonb;
