-- Load committee_meeting_attendees (1 rows)
-- Run on NEW database after 01_setup_schema.sql

INSERT INTO public.committee_meeting_attendees (id, meeting_id, person_id, created_at) VALUES ('7ff239eb-a056-428b-aae9-265604f17331'::uuid, '948112b9-eff6-4af0-84f5-ad18c22fd6bc'::uuid, '7b33a646-ee36-4243-8423-331ea1162eeb'::uuid, '2026-06-23 01:28:55.38155+00'::timestamptz);
