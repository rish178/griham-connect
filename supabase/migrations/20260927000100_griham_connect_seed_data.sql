-- Seed data for the Griham Connect vertical slice (milestone 1).
--
-- Cities are real. Gurgaon's four sample projects are the exact demo set
-- named in the product brief (cluade_skills/griham-connect-*) — they are
-- marked is_sample = true and rendered in the UI with a "sample data"
-- affordance; do not treat them as verified live listings. Signature Global
-- Sarvam reuses the real project photography already in this repo
-- (apps/landing/public/projects/signature-sarvam) since Griham has an actual
-- landing page for it; the other three sample projects have no real assets
-- yet, so they intentionally have no hero_image_url (the UI falls back to a
-- neutral placeholder rather than fabricated photography).

-- 0. Default hero campaign ------------------------------------------------
-- No real brand photography is wired up yet; desktop/mobile_image_url stay
-- NULL and the hero component falls back to a soft gradient rather than
-- fabricated "lifestyle" stock photography. Swap in real images via this
-- row (admin, later) without touching React.
INSERT INTO public.hero_campaigns (
  name, eyebrow, headline, description, priority, is_active
) VALUES (
  'default',
  'Griham Connect',
  'Understand a property before you decide.',
  'Verify any project''s builder, location, price and legal standing — in minutes, not weeks.',
  0,
  true
);

-- 1. Cities -------------------------------------------------------------
INSERT INTO public.cities (slug, name, display_name, short_description, icon, sort_order) VALUES
  ('gurgaon',    'Gurgaon',    'Gurgaon',    'Cyber City, Golf Course Road, Dwarka Expressway and beyond.', 'building-2', 1),
  ('delhi-ncr',  'Delhi NCR',  'Delhi NCR',  'Delhi, Noida, Ghaziabad and the wider capital region.',       'landmark',   2),
  ('mumbai',     'Mumbai',     'Mumbai',     'From South Mumbai to the Thane-Navi Mumbai corridor.',        'waves',      3),
  ('bengaluru',  'Bengaluru',  'Bengaluru',  'Whitefield, Sarjapur, North Bengaluru and the tech corridors.', 'trees',    4),
  ('hyderabad',  'Hyderabad',  'Hyderabad',  'HITEC City, Gachibowli and the western growth corridor.',      'mountain',   5);

-- 2. Builders (sample/demo) ----------------------------------------------
INSERT INTO public.builders (slug, name, years_in_business, projects_delivered, average_delay_months, rera_case_count, google_rating, financial_stability_note) VALUES
  ('signature-global', 'Signature Global', 12, 24, 4,  3, 4.1, 'Sample data for demo purposes — not a verified rating.'),
  ('godrej-properties', 'Godrej Properties', 27, 60, 2, 1, 4.3, 'Sample data for demo purposes — not a verified rating.'),
  ('dlf', 'DLF', 35, 180, 3, 5, 4.2, 'Sample data for demo purposes — not a verified rating.'),
  ('m3m', 'M3M India', 15, 45, 5, 4, 4.0, 'Sample data for demo purposes — not a verified rating.');

-- 3. Sample properties — Gurgaon -----------------------------------------
INSERT INTO public.properties (
  city_id, builder_id, slug, name, sector, configuration,
  price_from, price_to, hero_image_url, status, is_sample, is_featured, sort_order,
  description
)
SELECT
  c.id, b.id, p.slug, p.name, p.sector, p.configuration,
  p.price_from, p.price_to, p.hero_image_url, 'active', true, p.is_featured, p.sort_order,
  p.description
FROM (VALUES
  ('signature-global-sarvam', 'Signature Global Sarvam', 'Sector 63A', '2, 3 BHK',
    9500000, 14500000, '/properties/signature-global-sarvam/hero.png', true, 1,
    'Sample project for demo purposes.', 'signature-global'),
  ('godrej-aristocrat', 'Godrej Aristocrat', 'Sector 49', '3, 4 BHK',
    18000000, 27000000, NULL, false, 2,
    'Sample project for demo purposes.', 'godrej-properties'),
  ('dlf-privana', 'DLF Privana', 'Sector 76-77', '3, 4 BHK',
    24000000, 38000000, NULL, false, 3,
    'Sample project for demo purposes.', 'dlf'),
  ('m3m-crown', 'M3M Crown', 'Sector 111', '2, 3 BHK',
    11000000, 16500000, NULL, false, 4,
    'Sample project for demo purposes.', 'm3m')
) AS p(slug, name, sector, configuration, price_from, price_to, hero_image_url, is_featured, sort_order, description, builder_slug)
JOIN public.cities c ON c.slug = 'gurgaon'
JOIN public.builders b ON b.slug = p.builder_slug;

INSERT INTO public.property_assets (property_id, asset_type, url, sort_order)
SELECT pr.id, a.asset_type, a.url, a.sort_order
FROM public.properties pr
JOIN (VALUES
  ('signature-global-sarvam', 'hero',    '/properties/signature-global-sarvam/hero.png', 1),
  ('signature-global-sarvam', 'gallery', '/properties/signature-global-sarvam/hero2.png', 2),
  ('signature-global-sarvam', 'gallery', '/properties/signature-global-sarvam/hero3.png', 3)
) AS a(slug, asset_type, url, sort_order) ON a.slug = pr.slug;

-- 4. GC Score inputs for the one property the vertical slice actually
-- analyses end-to-end (Signature Global Sarvam). Deliberately plausible,
-- clearly sample data — fed through the real, published scoring
-- methodology in @grihamconnect/scoring, not a hardcoded final score.
INSERT INTO public.project_scores (
  property_id, builder_score, location_score, investment_score, rental_score,
  connectivity_score, construction_score, livability_score, legal_score,
  price_fairness_score, score_version
)
SELECT id, 74, 81, 76, 68, 79, 77, 80, 88, 72, '2.3'
FROM public.properties WHERE slug = 'signature-global-sarvam';

-- 5. Tools (allowlisted component_type must match the frontend registry) --
INSERT INTO public.tools (key, name, description, icon, component_type, sort_order) VALUES
  ('property_health',       'Property Health Report',  'Understand a property before you decide.',           'shield-check',  'property_health',       1),
  ('location_intelligence', 'Location Intelligence',   'Understand what''s around this property.',            'map-pin',       'location_intelligence', 2),
  ('price_analysis',        'Price Analysis',          'Understand how the asking price compares.',           'indian-rupee',  'price_analysis',        3),
  ('builder_intelligence',  'Builder Intelligence',    'Understand the developer and its track record.',      'building-2',    'builder_intelligence',  4),
  ('property_comparison',   'Property Comparison',     'See how this stacks up against similar projects.',    'git-compare',   'property_comparison',   5),
  ('property_report',       'Property Report',         'The full structured Property Health report.',         'file-text',     'property_report',       6);

-- 6. Default analysis pipeline (editable without touching the pipeline UI) --
INSERT INTO public.analysis_step_templates (step_key, label, description, sort_order) VALUES
  ('project_information',   'Fetching project information',           'Pulling together the basic facts about this project.',            1),
  ('builder_background',    'Analysing builder background',           'Track record, delivery history, and financial stability.',        2),
  ('location_connectivity', 'Analysing location & connectivity',      'Micro-market quality, transit and everyday convenience.',         3),
  ('price_market',          'Evaluating price & market trends',       'Price per sq. ft. against comparable projects nearby.',           4),
  ('amenities',             'Analysing amenities & specifications',   'What''s actually on offer versus what''s promised.',               5),
  ('legal_regulatory',      'Checking legal & regulatory details',    'RERA registration, litigation history, approvals.',               6),
  ('comparables',           'Comparing similar properties',           'Benchmarking against nearby alternatives.',                       7),
  ('report_generation',     'Generating property health report',      'Putting it all together into one clear report.',                  8);
