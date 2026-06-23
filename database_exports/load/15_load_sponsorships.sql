-- Load sponsorships (1 rows)
-- Run on NEW database after 01_setup_schema.sql

INSERT INTO public.sponsorships (business_id, event_id, amount, status, memo, paid_date, id, leaflet_id, description, image_url, quantity) VALUES (NULL, NULL, 110.00, NULL, NULL, NULL, 'eb35ebaa-f884-4d0d-861b-fdd6fe8e08f4'::uuid, NULL, NULL, NULL, '1');
