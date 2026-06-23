-- Run on NEW database in SQL Editor (before 20_load_user_roles.sql — skip that file if you use this).
-- Creates auth users + email identities so OTP login works, then admin roles.

-- auth.users (15 accounts from old project)
INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, email_change,
  email_change_token_new, recovery_token, is_sso_user, is_anonymous
) VALUES
  ('209e8a62-3093-4a9d-a66c-fafa61939907'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'alexbensonux@gmail.com', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now(), '', '', '', '', false, false),
  ('49859b57-9728-4b6c-a05e-44edb9d2bec9'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'aliberti.anthony@gmail.com', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now(), '', '', '', '', false, false),
  ('77b30f2b-ab0e-4c1a-82f4-5cd3f441cc77'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'avdern@gmail.com', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now(), '', '', '', '', false, false),
  ('22836008-f364-40b7-9882-50ac49eb5cf5'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'billythompson508@gmail.com', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now(), '', '', '', '', false, false),
  ('0c785142-ecbc-4f45-adff-4df2c88fc54f'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'ethan@delavans.com', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now(), '', '', '', '', false, false),
  ('13189261-f50b-459a-97b4-5e8d8ea0dc01'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'info@mathnificent.com', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now(), '', '', '', '', false, false),
  ('43f8d0b6-5c51-42b9-936d-e79923a6942f'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'jameslundie42@pm.me', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now(), '', '', '', '', false, false),
  ('bb6e36a9-6d98-426e-9d48-35d8bfd014e6'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'jeremy206@gmail.com', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now(), '', '', '', '', false, false),
  ('10efcd95-b269-44ed-a47b-2156299051c9'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'kionewong@gmail.com', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now(), '', '', '', '', false, false),
  ('355fcac8-9817-4471-af1e-ecf0d9bba3c4'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'kschickler@gmail.com', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now(), '', '', '', '', false, false),
  ('1fb78dc4-6dc4-45a8-90ea-3ee526b091e5'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'laurie@vettedesign.net', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now(), '', '', '', '', false, false),
  ('3e620bdc-b0e9-4a4f-bfe8-d3bba9ff4368'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'rsletwin@yahoo.com', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now(), '', '', '', '', false, false),
  ('e83d26f3-8fe5-44aa-8c78-14a853218cd0'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'scott.b.andrews@outlook.com', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now(), '', '', '', '', false, false),
  ('c8ae3b91-cb7e-45e6-a434-ecf17337ded4'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'stefanh@windermere.com', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now(), '', '', '', '', false, false),
  ('7be32058-66d2-47f5-9bc0-7d2e1c3682c2'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'tink822@gmail.com', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now(), '', '', '', '', false, false)
ON CONFLICT (id) DO NOTHING;

-- auth.identities (required for email OTP login)
INSERT INTO auth.identities (
  id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at
) VALUES
  ('209e8a62-3093-4a9d-a66c-fafa61939907'::uuid, '209e8a62-3093-4a9d-a66c-fafa61939907'::uuid, '209e8a62-3093-4a9d-a66c-fafa61939907'::uuid, 'email', '{"sub":"209e8a62-3093-4a9d-a66c-fafa61939907","email":"alexbensonux@gmail.com","email_verified":true}'::jsonb, now(), now(), now()),
  ('49859b57-9728-4b6c-a05e-44edb9d2bec9'::uuid, '49859b57-9728-4b6c-a05e-44edb9d2bec9'::uuid, '49859b57-9728-4b6c-a05e-44edb9d2bec9'::uuid, 'email', '{"sub":"49859b57-9728-4b6c-a05e-44edb9d2bec9","email":"aliberti.anthony@gmail.com","email_verified":true}'::jsonb, now(), now(), now()),
  ('77b30f2b-ab0e-4c1a-82f4-5cd3f441cc77'::uuid, '77b30f2b-ab0e-4c1a-82f4-5cd3f441cc77'::uuid, '77b30f2b-ab0e-4c1a-82f4-5cd3f441cc77'::uuid, 'email', '{"sub":"77b30f2b-ab0e-4c1a-82f4-5cd3f441cc77","email":"avdern@gmail.com","email_verified":true}'::jsonb, now(), now(), now()),
  ('22836008-f364-40b7-9882-50ac49eb5cf5'::uuid, '22836008-f364-40b7-9882-50ac49eb5cf5'::uuid, '22836008-f364-40b7-9882-50ac49eb5cf5'::uuid, 'email', '{"sub":"22836008-f364-40b7-9882-50ac49eb5cf5","email":"billythompson508@gmail.com","email_verified":true}'::jsonb, now(), now(), now()),
  ('0c785142-ecbc-4f45-adff-4df2c88fc54f'::uuid, '0c785142-ecbc-4f45-adff-4df2c88fc54f'::uuid, '0c785142-ecbc-4f45-adff-4df2c88fc54f'::uuid, 'email', '{"sub":"0c785142-ecbc-4f45-adff-4df2c88fc54f","email":"ethan@delavans.com","email_verified":true}'::jsonb, now(), now(), now()),
  ('13189261-f50b-459a-97b4-5e8d8ea0dc01'::uuid, '13189261-f50b-459a-97b4-5e8d8ea0dc01'::uuid, '13189261-f50b-459a-97b4-5e8d8ea0dc01'::uuid, 'email', '{"sub":"13189261-f50b-459a-97b4-5e8d8ea0dc01","email":"info@mathnificent.com","email_verified":true}'::jsonb, now(), now(), now()),
  ('43f8d0b6-5c51-42b9-936d-e79923a6942f'::uuid, '43f8d0b6-5c51-42b9-936d-e79923a6942f'::uuid, '43f8d0b6-5c51-42b9-936d-e79923a6942f'::uuid, 'email', '{"sub":"43f8d0b6-5c51-42b9-936d-e79923a6942f","email":"jameslundie42@pm.me","email_verified":true}'::jsonb, now(), now(), now()),
  ('bb6e36a9-6d98-426e-9d48-35d8bfd014e6'::uuid, 'bb6e36a9-6d98-426e-9d48-35d8bfd014e6'::uuid, 'bb6e36a9-6d98-426e-9d48-35d8bfd014e6'::uuid, 'email', '{"sub":"bb6e36a9-6d98-426e-9d48-35d8bfd014e6","email":"jeremy206@gmail.com","email_verified":true}'::jsonb, now(), now(), now()),
  ('10efcd95-b269-44ed-a47b-2156299051c9'::uuid, '10efcd95-b269-44ed-a47b-2156299051c9'::uuid, '10efcd95-b269-44ed-a47b-2156299051c9'::uuid, 'email', '{"sub":"10efcd95-b269-44ed-a47b-2156299051c9","email":"kionewong@gmail.com","email_verified":true}'::jsonb, now(), now(), now()),
  ('355fcac8-9817-4471-af1e-ecf0d9bba3c4'::uuid, '355fcac8-9817-4471-af1e-ecf0d9bba3c4'::uuid, '355fcac8-9817-4471-af1e-ecf0d9bba3c4'::uuid, 'email', '{"sub":"355fcac8-9817-4471-af1e-ecf0d9bba3c4","email":"kschickler@gmail.com","email_verified":true}'::jsonb, now(), now(), now()),
  ('1fb78dc4-6dc4-45a8-90ea-3ee526b091e5'::uuid, '1fb78dc4-6dc4-45a8-90ea-3ee526b091e5'::uuid, '1fb78dc4-6dc4-45a8-90ea-3ee526b091e5'::uuid, 'email', '{"sub":"1fb78dc4-6dc4-45a8-90ea-3ee526b091e5","email":"laurie@vettedesign.net","email_verified":true}'::jsonb, now(), now(), now()),
  ('3e620bdc-b0e9-4a4f-bfe8-d3bba9ff4368'::uuid, '3e620bdc-b0e9-4a4f-bfe8-d3bba9ff4368'::uuid, '3e620bdc-b0e9-4a4f-bfe8-d3bba9ff4368'::uuid, 'email', '{"sub":"3e620bdc-b0e9-4a4f-bfe8-d3bba9ff4368","email":"rsletwin@yahoo.com","email_verified":true}'::jsonb, now(), now(), now()),
  ('e83d26f3-8fe5-44aa-8c78-14a853218cd0'::uuid, 'e83d26f3-8fe5-44aa-8c78-14a853218cd0'::uuid, 'e83d26f3-8fe5-44aa-8c78-14a853218cd0'::uuid, 'email', '{"sub":"e83d26f3-8fe5-44aa-8c78-14a853218cd0","email":"scott.b.andrews@outlook.com","email_verified":true}'::jsonb, now(), now(), now()),
  ('c8ae3b91-cb7e-45e6-a434-ecf17337ded4'::uuid, 'c8ae3b91-cb7e-45e6-a434-ecf17337ded4'::uuid, 'c8ae3b91-cb7e-45e6-a434-ecf17337ded4'::uuid, 'email', '{"sub":"c8ae3b91-cb7e-45e6-a434-ecf17337ded4","email":"stefanh@windermere.com","email_verified":true}'::jsonb, now(), now(), now()),
  ('7be32058-66d2-47f5-9bc0-7d2e1c3682c2'::uuid, '7be32058-66d2-47f5-9bc0-7d2e1c3682c2'::uuid, '7be32058-66d2-47f5-9bc0-7d2e1c3682c2'::uuid, 'email', '{"sub":"7be32058-66d2-47f5-9bc0-7d2e1c3682c2","email":"tink822@gmail.com","email_verified":true}'::jsonb, now(), now(), now())
ON CONFLICT DO NOTHING;

-- public.user_roles (14 admins — jameslundie42@pm.me had no role on old db)
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

INSERT INTO public.user_roles (user_id, role, created_at) VALUES
  ('0c785142-ecbc-4f45-adff-4df2c88fc54f'::uuid, 'admin', '2026-03-10 01:59:59.951819+00'::timestamptz),
  ('10efcd95-b269-44ed-a47b-2156299051c9'::uuid, 'admin', '2026-03-10 01:59:59.951819+00'::timestamptz),
  ('13189261-f50b-459a-97b4-5e8d8ea0dc01'::uuid, 'admin', '2026-03-10 01:59:59.951819+00'::timestamptz),
  ('1fb78dc4-6dc4-45a8-90ea-3ee526b091e5'::uuid, 'admin', '2026-03-10 01:59:59.951819+00'::timestamptz),
  ('209e8a62-3093-4a9d-a66c-fafa61939907'::uuid, 'admin', '2026-03-10 01:59:59.951819+00'::timestamptz),
  ('22836008-f364-40b7-9882-50ac49eb5cf5'::uuid, 'admin', '2026-03-10 01:59:59.951819+00'::timestamptz),
  ('355fcac8-9817-4471-af1e-ecf0d9bba3c4'::uuid, 'admin', '2026-03-10 01:59:59.951819+00'::timestamptz),
  ('3e620bdc-b0e9-4a4f-bfe8-d3bba9ff4368'::uuid, 'admin', '2026-03-10 01:59:59.951819+00'::timestamptz),
  ('49859b57-9728-4b6c-a05e-44edb9d2bec9'::uuid, 'admin', '2026-03-10 01:59:59.951819+00'::timestamptz),
  ('77b30f2b-ab0e-4c1a-82f4-5cd3f441cc77'::uuid, 'admin', '2026-03-10 01:59:59.951819+00'::timestamptz),
  ('7be32058-66d2-47f5-9bc0-7d2e1c3682c2'::uuid, 'admin', '2026-03-10 01:59:59.951819+00'::timestamptz),
  ('bb6e36a9-6d98-426e-9d48-35d8bfd014e6'::uuid, 'admin', '2026-03-10 01:59:59.951819+00'::timestamptz),
  ('c8ae3b91-cb7e-45e6-a434-ecf17337ded4'::uuid, 'admin', '2026-03-10 01:59:59.951819+00'::timestamptz),
  ('e83d26f3-8fe5-44aa-8c78-14a853218cd0'::uuid, 'admin', '2026-03-10 01:59:59.951819+00'::timestamptz)
ON CONFLICT (user_id) DO NOTHING;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
