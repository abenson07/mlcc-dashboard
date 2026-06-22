-- Sync Resend template UUIDs (from Resend API list, 2026-03-22)
UPDATE comm_settings SET resend_template_id = '5001e3e2-f803-497a-a2ea-d35cef88bd70', updated_at = now() WHERE context = 'leaflet' AND step_key = 'initial_confirmation';
UPDATE comm_settings SET resend_template_id = '730c2f7d-61cb-43b4-ac00-1ee15eccf8c1', updated_at = now() WHERE context = 'leaflet' AND step_key = 'pre_distribution_reminder';
UPDATE comm_settings SET resend_template_id = '88b30acc-256c-4f0c-b2be-8b9dd5007fb6', updated_at = now() WHERE context = 'leaflet' AND step_key = 'distribution_day_pickup';
UPDATE comm_settings SET resend_template_id = '8588c557-2b03-4e72-9c27-b853068e9310', updated_at = now() WHERE context = 'leaflet' AND step_key = 'delivery_complete_prompt';
UPDATE comm_settings SET resend_template_id = 'd15e937d-a9b2-417f-bb73-d832212b9d0e', updated_at = now() WHERE context = 'leaflet' AND step_key = 'completion_followup';
