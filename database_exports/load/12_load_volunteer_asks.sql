-- Load volunteer_asks (3 rows)
-- Run on NEW database after 01_setup_schema.sql

INSERT INTO public.volunteer_asks (id, title, description, commitment_type, commitment_unit, commitment_quantity, quantity, event_id, created_at, updated_at) VALUES ('5bc1c589-aa11-408d-8e56-63f6e8ade5ba'::uuid, 'Test', 'Test', 'one_off', 'hours', 1.00, '1', NULL, '2026-05-17 23:03:19.728122+00'::timestamptz, '2026-05-17 23:03:19.728122+00'::timestamptz);
INSERT INTO public.volunteer_asks (id, title, description, commitment_type, commitment_unit, commitment_quantity, quantity, event_id, created_at, updated_at) VALUES ('c4c30263-1e65-4b69-8814-07467dd22c72'::uuid, 'test', 'test', 'one_off', 'hours', 1.00, '1', '4112bd34-09fc-4452-92b2-06e33fcd05bf'::uuid, '2026-05-17 23:15:34.732337+00'::timestamptz, '2026-05-17 23:15:34.732337+00'::timestamptz);
INSERT INTO public.volunteer_asks (id, title, description, commitment_type, commitment_unit, commitment_quantity, quantity, event_id, created_at, updated_at) VALUES ('cb4f140d-5bcf-4fe0-8363-187bbe585341'::uuid, 'Test', 'Test', 'ongoing', 'hours', 12.00, '1', NULL, '2026-05-17 23:01:12.786907+00'::timestamptz, '2026-05-17 23:01:12.786907+00'::timestamptz);
