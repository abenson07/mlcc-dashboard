-- Load leaflets (1 rows)
-- Run on NEW database after 01_setup_schema.sql

INSERT INTO public.leaflets (id, title, distribution_date, status, activated_at, closed_at, print_cost_cents, membership_qr_code_id, comm_initial_confirmation_sent_at, comm_distribution_day_pickup_sent_at, comm_delivery_complete_prompt_sent_at, created_at, updated_at) VALUES ('c291cb16-72e4-44a7-a5f7-830d575b39c3'::uuid, 'Test', '2026-07-31'::date, 'planned', NULL, NULL, NULL, '47d5a483-2b0e-411e-a0c7-c61c4b37cdc6'::uuid, '2026-06-22 20:51:26.879+00', NULL, NULL, '2026-06-22 17:24:16.425076+00'::timestamptz, '2026-06-22 20:51:26.879+00'::timestamptz);
