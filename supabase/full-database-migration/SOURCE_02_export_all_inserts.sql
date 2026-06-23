-- SOURCE: Run after SOURCE_01_install_export_helpers.sql
-- Returns INSERT statements. Copy the result column into data/*.sql files on TARGET.
-- Run one SELECT at a time if the SQL Editor truncates large output.

-- Tier 0
select migration_export_inserts('public', 'memberships');
select migration_export_inserts('public', 'business_memberships');
select migration_export_inserts('public', 'qr_codes');
select migration_export_inserts('public', 'event_templates');
select migration_export_inserts('public', 'tshirt_preorders');
select migration_export_inserts('public', 'fundraising_donations');
select migration_export_inserts('public', 'feature_ids');

-- Tier 1
select migration_export_inserts('public', 'people');
select migration_export_inserts('public', 'businesses');
select migration_export_inserts('public', 'leaflets');

-- After auth.users (SOURCE_03) on TARGET, also export:
-- select migration_export_inserts('public', 'user_roles');

-- Tier 2
select migration_export_inserts('public', 'events');
select migration_export_inserts('public', 'routes');
select migration_export_inserts('public', 'task_templates');
select migration_export_inserts('public', 'comm_settings');
select migration_export_inserts('public', 'volunteer_asks');
select migration_export_inserts('public', 'committee_default_attendees');

-- Tier 3
select migration_export_inserts('public', 'tasks');
select migration_export_inserts('public', 'deliveries');
select migration_export_inserts('public', 'sponsorships');
select migration_export_inserts('public', 'event_volunteers');
select migration_export_inserts('public', 'payments');
select migration_export_inserts('public', 'committee_meetings');

-- Tier 4
select migration_export_inserts('public', 'volunteers');
select migration_export_inserts('public', 'committee_meeting_attendees');
select migration_export_inserts('public', 'action_items');
