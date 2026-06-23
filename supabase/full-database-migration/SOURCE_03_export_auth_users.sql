-- SOURCE: Export auth.users for admin login on TARGET.
-- Run on OLD database. Paste results into data/20_auth_users.sql on TARGET.
-- Requires service_role or sufficient privileges on auth schema.

select format(
  'INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) ON CONFLICT (id) DO NOTHING;',
  quote_literal(id::text) || '::uuid',
  quote_literal(coalesce(instance_id::text, '00000000-0000-0000-0000-000000000000')) || '::uuid',
  quote_literal(aud),
  quote_literal(role),
  quote_literal(email),
  quote_literal(encrypted_password),
  case when email_confirmed_at is null then 'NULL' else quote_literal(email_confirmed_at::text) || '::timestamptz' end,
  case when invited_at is null then 'NULL' else quote_literal(invited_at::text) || '::timestamptz' end,
  quote_literal(coalesce(confirmation_token, '')),
  case when confirmation_sent_at is null then 'NULL' else quote_literal(confirmation_sent_at::text) || '::timestamptz' end,
  quote_literal(coalesce(recovery_token, '')),
  case when recovery_sent_at is null then 'NULL' else quote_literal(recovery_sent_at::text) || '::timestamptz' end,
  quote_literal(coalesce(email_change_token_new, '')),
  quote_literal(coalesce(email_change, '')),
  case when email_change_sent_at is null then 'NULL' else quote_literal(email_change_sent_at::text) || '::timestamptz' end,
  case when last_sign_in_at is null then 'NULL' else quote_literal(last_sign_in_at::text) || '::timestamptz' end,
  quote_literal(coalesce(raw_app_meta_data, '{}'::jsonb)::text) || '::jsonb',
  quote_literal(coalesce(raw_user_meta_data, '{}'::jsonb)::text) || '::jsonb',
  coalesce(is_super_admin::text, 'false'),
  quote_literal(created_at::text) || '::timestamptz',
  quote_literal(updated_at::text) || '::timestamptz',
  quote_literal(coalesce(phone, '')),
  case when phone_confirmed_at is null then 'NULL' else quote_literal(phone_confirmed_at::text) || '::timestamptz' end,
  quote_literal(coalesce(phone_change, '')),
  quote_literal(coalesce(phone_change_token, '')),
  case when phone_change_sent_at is null then 'NULL' else quote_literal(phone_change_sent_at::text) || '::timestamptz' end,
  quote_literal(coalesce(email_change_token_current, '')),
  coalesce(email_change_confirm_status::text, '0'),
  case when banned_until is null then 'NULL' else quote_literal(banned_until::text) || '::timestamptz' end,
  quote_literal(coalesce(reauthentication_token, '')),
  case when reauthentication_sent_at is null then 'NULL' else quote_literal(reauthentication_sent_at::text) || '::timestamptz' end,
  coalesce(is_sso_user::text, 'false'),
  case when deleted_at is null then 'NULL' else quote_literal(deleted_at::text) || '::timestamptz' end,
  coalesce(is_anonymous::text, 'false')
) as insert_sql
from auth.users
where deleted_at is null
order by created_at;
