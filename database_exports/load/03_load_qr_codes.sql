-- Load qr_codes (3 rows)
-- Run on NEW database after 01_setup_schema.sql

INSERT INTO public.qr_codes (id, name, url, created_at, updated_at) VALUES ('47d5a483-2b0e-411e-a0c7-c61c4b37cdc6'::uuid, 'Test membership QR', 'https://mapleleafcommunity.org/join', '2026-06-22 17:24:16.256165+00'::timestamptz, '2026-06-22 17:24:16.256165+00'::timestamptz);
INSERT INTO public.qr_codes (id, name, url, created_at, updated_at) VALUES ('599b7fd1-0ce7-40af-931f-8dcb0772f641'::uuid, 'Steering — Jun 22, 2026 event QR', 'https://mapleleafcommunity.org/events/steering-jun-22-2026-mqpyornp', '2026-06-23 01:24:28.304917+00'::timestamptz, '2026-06-23 01:24:28.304917+00'::timestamptz);
INSERT INTO public.qr_codes (id, name, url, created_at, updated_at) VALUES ('bd529323-7e0f-494e-8298-70d562634a68'::uuid, 'Save Summer Events', 'https://www.mapleleafcommunity.org/donate', '2026-05-20 07:01:10.713199+00'::timestamptz, '2026-05-20 07:01:10.713199+00'::timestamptz);
