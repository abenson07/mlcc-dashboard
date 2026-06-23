-- SOURCE: Export only tables that have rows (per inventory).
-- Run after SOURCE_01. Copy each result into data/*.sql on TARGET.

select migration_export_inserts('public', 'qr_codes');
select migration_export_inserts('public', 'comm_settings');
select migration_export_inserts('public', 'task_templates');
select migration_export_inserts('public', 'leaflets');
select migration_export_inserts('public', 'tasks');
select migration_export_inserts('public', 'events');
select migration_export_inserts('public', 'committee_meetings');
select migration_export_inserts('public', 'committee_meeting_attendees');
select migration_export_inserts('public', 'action_items');
select migration_export_inserts('public', 'routes');
select migration_export_inserts('public', 'people');
select migration_export_inserts('public', 'deliveries');
