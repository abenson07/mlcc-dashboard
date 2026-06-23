-- Load business_memberships (1 rows)
-- Run on NEW database after 01_setup_schema.sql

INSERT INTO public.business_memberships (id, status, last_renewal, payment_method, is_subscription) VALUES ('c982e889-a17a-4d4e-a757-b443e367dbfe'::uuid, 'Active', '2025-11-17'::date, NULL, 'false');
