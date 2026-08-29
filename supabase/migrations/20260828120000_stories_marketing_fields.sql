-- Fields needed so dashboard `stories` rows can round-trip with the public
-- Leaflet catalog (slug URLs, byline, type, featured flag).

alter table public.stories
  add column if not exists slug text,
  add column if not exists author_slug text,
  add column if not exists story_type text,
  add column if not exists featured boolean not null default false;

comment on column public.stories.slug is
  'Public Leaflet URL slug (`/leaflet/template/{slug}`). Unique when set.';
comment on column public.stories.author_slug is
  'Kebab-case byline used on the marketing site when author_id is unset.';
comment on column public.stories.story_type is
  'Leaflet story type, e.g. "From the Council" or "Neighborhood Update".';
comment on column public.stories.featured is
  'Whether the story is featured on Leaflet listing pages.';

create unique index if not exists stories_slug_key
  on public.stories (slug)
  where slug is not null;
