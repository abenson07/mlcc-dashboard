-- Load payments (1 rows)
-- Run on NEW database after 01_setup_schema.sql

INSERT INTO public.payments (id, person_id, membership_id, amount, date, memo, type, method, stripe_transaction_id) VALUES ('49e93252-13d7-4ed7-b88c-12e40edce370'::uuid, NULL, NULL, 1.00, '2025-11-12'::date, NULL, 'donation', 'check', NULL);
