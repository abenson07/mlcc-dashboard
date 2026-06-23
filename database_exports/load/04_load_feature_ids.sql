-- Load feature_ids (3 rows)
-- Run on NEW database after 01_setup_schema.sql

INSERT INTO public.feature_ids (id, created_at, feature_id, vote_count, surface) VALUES (5, '2026-03-11 03:07:32.051908+00'::timestamptz, '3fbb906d-25a0-4973-bd2f-e1154d8b45da', 1, 'dashboard');
INSERT INTO public.feature_ids (id, created_at, feature_id, vote_count, surface) VALUES (6, '2026-03-11 03:07:39.219583+00'::timestamptz, 'a1af92d8-3f1d-4123-86a4-d0e64b457069', 1, 'dashboard');
INSERT INTO public.feature_ids (id, created_at, feature_id, vote_count, surface) VALUES (7, '2026-03-11 03:07:43.351527+00'::timestamptz, '3195bea5-a126-46b8-b8ba-14975d105fe0', 1, 'dashboard');
