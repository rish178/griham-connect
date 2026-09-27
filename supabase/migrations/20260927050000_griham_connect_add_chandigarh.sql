-- Adds Chandigarh as a 6th supported city, per explicit request (the
-- original brief scoped the MVP to 5 cities; this is a deliberate expansion,
-- not scope creep). No sample properties seeded for it yet — the Property
-- Health card will show an empty sample list and resolve searches against
-- an empty set until some are added, which the existing "not found in
-- <city>" handling already covers gracefully.
INSERT INTO public.cities (slug, name, display_name, short_description, image_url, icon, sort_order) VALUES
  ('chandigarh', 'Chandigarh', 'Chandigarh', 'Sector grid city, Le Corbusier''s planned capital.', '/cities/chandigarh.jpg', 'landmark', 6);
