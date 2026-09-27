-- Milestone 2: expand the Property Health sample set beyond Gurgaon so the
-- full journey (city -> project -> analysis -> report) works end-to-end in
-- every seeded city, not just the one built in the vertical slice. All rows
-- here are is_sample = true, same convention as the Gurgaon seed.

-- New sample builders, one per new city (kept minimal — reuse the original
-- four where it's plausible rather than inventing a builder per property).
INSERT INTO public.builders (slug, name, years_in_business, projects_delivered, average_delay_months, rera_case_count, google_rating, financial_stability_note) VALUES
  ('ats-group',      'ATS Group',      20, 30, 6, 2, 4.2, 'Sample data for demo purposes — not a verified rating.'),
  ('lodha-group',    'Lodha Group',    25, 90, 3, 6, 4.1, 'Sample data for demo purposes — not a verified rating.'),
  ('prestige-group', 'Prestige Group', 30, 120, 2, 2, 4.4, 'Sample data for demo purposes — not a verified rating.'),
  ('my-home-group',  'My Home Group',  22, 40, 4, 1, 4.3, 'Sample data for demo purposes — not a verified rating.');

-- Sample properties per city.
INSERT INTO public.properties (
  city_id, builder_id, slug, name, sector, configuration,
  price_from, price_to, status, is_sample, is_featured, sort_order, description
)
SELECT c.id, b.id, p.slug, p.name, p.sector, p.configuration, p.price_from, p.price_to,
       'active', true, p.is_featured, p.sort_order, 'Sample project for demo purposes.'
FROM (VALUES
  -- Delhi NCR
  ('delhi-ncr', 'ats-group',          'ats-kingston-heath',  'ATS Kingston Heath',  'Sector 150, Noida',       '3, 4 BHK', 16000000, 24000000, true,  1),
  ('delhi-ncr', 'godrej-properties',  'godrej-woods',        'Godrej Woods',        'Sector 43, Noida',        '2, 3 BHK', 15000000, 21000000, false, 2),
  ('delhi-ncr', 'dlf',                'dlf-capital-greens',  'DLF Capital Greens',  'Shivaji Marg, New Delhi', '2, 3 BHK', 18000000, 28000000, false, 3),
  -- Mumbai
  ('mumbai',    'lodha-group',        'lodha-amara',         'Lodha Amara',         'Kolshet Road, Thane',     '1, 2 BHK',  9000000, 16000000, true,  1),
  ('mumbai',    'lodha-group',        'lodha-splendora',     'Lodha Splendora',     'Ghodbunder Road, Thane',  '2, 3 BHK', 11000000, 19000000, false, 2),
  ('mumbai',    'godrej-properties',  'godrej-horizon',      'Godrej Horizon',      'Wadala, Mumbai',          '1, 2 BHK', 14000000, 21000000, false, 3),
  -- Bengaluru
  ('bengaluru', 'prestige-group',     'prestige-lakeside-habitat', 'Prestige Lakeside Habitat', 'Varthur Road, Bengaluru', '2, 3 BHK', 13000000, 25000000, true,  1),
  ('bengaluru', 'prestige-group',     'prestige-falcon-city', 'Prestige Falcon City', 'Konanakunte, Bengaluru', '2, 3 BHK',  9000000, 16000000, false, 2),
  ('bengaluru', 'godrej-properties',  'godrej-air',          'Godrej Air',          'Devanahalli, Bengaluru',  '1, 2 BHK',  8000000, 14000000, false, 3),
  -- Hyderabad
  ('hyderabad', 'my-home-group',      'my-home-bhooja',      'My Home Bhooja',      'Kokapet, Hyderabad',      '2, 3 BHK', 12000000, 20000000, true,  1),
  ('hyderabad', 'my-home-group',      'my-home-avatar',      'My Home Avatar',      'Narsingi, Hyderabad',     '2, 3 BHK',  9000000, 15000000, false, 2),
  ('hyderabad', 'godrej-properties',  'godrej-madison-avenue','Godrej Madison Avenue','Kokapet, Hyderabad',    '3, 4 BHK', 15000000, 23000000, false, 3)
) AS p(city_slug, builder_slug, slug, name, sector, configuration, price_from, price_to, is_featured, sort_order)
JOIN public.cities c ON c.slug = p.city_slug
JOIN public.builders b ON b.slug = p.builder_slug;

-- Scores for every new sample property, so any of them can be fully
-- analysed end-to-end (not just Signature Global Sarvam from the vertical
-- slice). Deliberately varied so the demo shows all three risk bands.
INSERT INTO public.project_scores (
  property_id, builder_score, location_score, investment_score, rental_score,
  connectivity_score, construction_score, livability_score, legal_score,
  price_fairness_score, score_version
)
SELECT pr.id, s.builder_score, s.location_score, s.investment_score, s.rental_score,
       s.connectivity_score, s.construction_score, s.livability_score, s.legal_score,
       s.price_fairness_score, '2.3'
FROM public.properties pr
JOIN (VALUES
  ('ats-kingston-heath',          62, 74, 65, 60, 70, 68, 71, 58, 66),
  ('godrej-woods',                85, 78, 80, 66, 74, 82, 79, 90, 70),
  ('dlf-capital-greens',          88, 92, 84, 55, 88, 85, 86, 91, 60),
  ('lodha-amara',                 80, 70, 75, 72, 68, 78, 76, 84, 74),
  ('lodha-splendora',             80, 73, 77, 69, 71, 79, 77, 84, 71),
  ('godrej-horizon',              85, 85, 82, 58, 82, 83, 81, 90, 62),
  ('prestige-lakeside-habitat',   88, 84, 86, 63, 78, 86, 85, 92, 68),
  ('prestige-falcon-city',        88, 71, 78, 70, 66, 84, 78, 92, 75),
  ('godrej-air',                  85, 60, 70, 74, 55, 80, 72, 90, 78),
  ('my-home-bhooja',              82, 88, 85, 65, 80, 84, 84, 87, 69),
  ('my-home-avatar',              82, 76, 76, 71, 72, 80, 78, 87, 73),
  ('godrej-madison-avenue',       85, 90, 83, 60, 83, 84, 83, 90, 64)
) AS s(slug, builder_score, location_score, investment_score, rental_score,
       connectivity_score, construction_score, livability_score, legal_score, price_fairness_score)
  ON s.slug = pr.slug;
