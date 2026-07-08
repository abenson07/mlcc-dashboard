create type public.event_publish_status as enum ('draft', 'published');

alter table public.events
  add column publish_status public.event_publish_status not null default 'draft';

create policy events_select_published_anon
  on public.events
  for select
  to anon
  using (publish_status = 'published');
