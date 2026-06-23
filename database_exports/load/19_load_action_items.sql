-- Load action_items (1 rows)
-- Run on NEW database after 01_setup_schema.sql

INSERT INTO public.action_items (id, title, description, assignee_person_id, committee_meeting_id, status, due_at, source, sort_order, completed_at, completed_by, created_at, updated_at) VALUES ('f374faf1-0407-4151-baa9-70b035c7f301'::uuid, 'Check the database', 'Alexander Benson to check the database as part of evaluating whether the system works.', '7b33a646-ee36-4243-8423-331ea1162eeb'::uuid, '948112b9-eff6-4af0-84f5-ad18c22fd6bc'::uuid, 'done', NULL, 'ai', '0', '2026-06-23 01:58:37.946+00'::timestamptz, '209e8a62-3093-4a9d-a66c-fafa61939907'::uuid, '2026-06-23 01:30:29.775471+00'::timestamptz, '2026-06-23 01:58:37.946+00'::timestamptz);
