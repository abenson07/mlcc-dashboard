-- Meeting minutes capture sources, soft-cancel action items, Slack reminder stamps,
-- and storage for meeting audio/document attachments.

alter type public.action_item_status add value if not exists 'canceled';

create type public.minutes_source as enum ('written', 'transcript', 'audio', 'file');

alter table public.action_items
  add column if not exists reminder_sent_at timestamptz;

comment on column public.action_items.reminder_sent_at is
  'When a Slack due-date reminder was sent for this open action item.';

alter table public.committee_meetings
  add column if not exists minutes_source public.minutes_source,
  add column if not exists minutes_attachment_url text,
  add column if not exists audio_url text;

comment on column public.committee_meetings.minutes_source is
  'How minutes were captured: written, transcript, audio, or file upload.';
comment on column public.committee_meetings.minutes_attachment_url is
  'Public URL of an uploaded minutes document (PDF/DOCX/TXT).';
comment on column public.committee_meetings.audio_url is
  'Public URL of the uploaded meeting audio used for transcription.';

insert into storage.buckets (id, name, public)
values ('meeting-files', 'meeting-files', true)
on conflict (id) do nothing;

create policy meeting_files_public_read on storage.objects
  for select to anon, authenticated using (bucket_id = 'meeting-files');

create policy meeting_files_authenticated_write on storage.objects
  for insert to authenticated with check (bucket_id = 'meeting-files');

create policy meeting_files_authenticated_update on storage.objects
  for update to authenticated using (bucket_id = 'meeting-files') with check (bucket_id = 'meeting-files');

create policy meeting_files_authenticated_delete on storage.objects
  for delete to authenticated using (bucket_id = 'meeting-files');
