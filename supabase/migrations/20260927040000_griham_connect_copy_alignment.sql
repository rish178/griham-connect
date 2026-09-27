-- Aligns hero copy, analysis-step wording and the tool set with the final
-- approved art-direction/copy brief (supersedes the placeholder copy from
-- earlier milestones — see the "DO NOT CHANGE THESE COPY ELEMENTS" section
-- of that brief for the exact strings below).

UPDATE public.hero_campaigns
SET
  eyebrow = 'REAL ESTATE INTELLIGENCE',
  headline = E'Make a smarter\nproperty decision.',
  description = 'Get clear, data-backed insights about properties, locations and prices — before you decide.',
  accent_text = E'Better information.\nBrighter tomorrow.'
WHERE name = 'default';

UPDATE public.analysis_step_templates SET label = 'Evaluating price and market trends' WHERE step_key = 'price_market';
UPDATE public.analysis_step_templates SET label = 'Analysing amenities and specifications' WHERE step_key = 'amenities';
UPDATE public.analysis_step_templates SET label = 'Checking legal and regulatory details' WHERE step_key = 'legal_regulatory';

-- "Things to Consider" is a tool card in its own right (maps to the report's
-- risk section), not just a report tab.
INSERT INTO public.tools (key, name, description, icon, component_type, sort_order) VALUES
  ('risk_insights', 'Things to Consider', 'Review the factors worth investigating before deciding.', 'alert-triangle', 'risk_insights', 7);
