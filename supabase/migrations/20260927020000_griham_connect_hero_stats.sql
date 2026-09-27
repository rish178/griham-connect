-- Adds the editorial accent line ("Better information. Brighter tomorrows.")
-- and the hero stat counters (200+ data points, 50+ cities, ...) as content,
-- not hardcoded JSX — same rule as everything else in hero_campaigns.

ALTER TABLE public.hero_campaigns
  ADD COLUMN accent_text TEXT,
  ADD COLUMN stats_json JSONB NOT NULL DEFAULT '[]'::jsonb;

UPDATE public.hero_campaigns
SET
  accent_text = 'Better information. Brighter tomorrows.',
  stats_json = '[
    {"value": "200+", "label": "Data points analysed"},
    {"value": "50+", "label": "Cities covered"},
    {"value": "10,000+", "label": "Home buyers guided"}
  ]'::jsonb
WHERE name = 'default';
