-- Story drafts (blog posts) authored in the dashboard, optionally tied to a leaflet run.
-- Run this entire file in the Supabase SQL editor (not individual lines).

create type public.story_status as enum ('draft', 'published');

create table public.stories (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  author_id uuid references public.people (id) on delete set null,
  cover_image_url text,
  body text not null default '',
  status public.story_status not null default 'draft',
  publish_date date,
  leaflet_id uuid references public.leaflets (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.stories is
  'Story drafts (blog posts) authored in the dashboard. body is Tiptap-authored HTML. leaflet_id is optional — a story can stand alone or belong to a leaflet run.';

create index stories_leaflet_id_idx on public.stories (leaflet_id);
create index stories_author_id_idx on public.stories (author_id);

alter table public.stories enable row level security;

-- Open select (future public blog needs anon read of published stories);
-- writes restricted to authenticated dashboard users.
create policy stories_select_all on public.stories
  for select to anon, authenticated using (true);

create policy stories_write_authenticated on public.stories
  for all to authenticated using (true) with check (true);

-- Cover/body image uploads for stories.
insert into storage.buckets (id, name, public)
values ('story-images', 'story-images', true)
on conflict (id) do nothing;

create policy story_images_public_read on storage.objects
  for select to anon, authenticated using (bucket_id = 'story-images');

create policy story_images_authenticated_write on storage.objects
  for insert to authenticated with check (bucket_id = 'story-images');

create policy story_images_authenticated_update on storage.objects
  for update to authenticated using (bucket_id = 'story-images') with check (bucket_id = 'story-images');

create policy story_images_authenticated_delete on storage.objects
  for delete to authenticated using (bucket_id = 'story-images');
