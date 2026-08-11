-- Seed a couple of starter event types for the "Event type" dropdown in
-- CreateEventModal. Idempotent: skips insert when slug already exists.

insert into public.event_templates (name, slug, description, default_field_data, is_active)
select
  'Summer Social',
  'summer-social',
  'Warm-weather community gathering.',
  jsonb_build_object('kind', 'council'),
  true
where not exists (
  select 1 from public.event_templates where slug = 'summer-social'
);

insert into public.event_templates (name, slug, description, default_field_data, is_active)
select
  'Movie Night',
  'movie-night',
  'Outdoor or indoor community movie screening.',
  jsonb_build_object('kind', 'council'),
  true
where not exists (
  select 1 from public.event_templates where slug = 'movie-night'
);
