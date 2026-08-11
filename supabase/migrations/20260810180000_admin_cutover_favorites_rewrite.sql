-- Rewrite user_favorites.route values after the /admin cutover.
-- Run this entire file in the Supabase SQL editor (not individual lines).
--
-- Two sets of existing rows both need remapping onto the new /admin route
-- tree (formerly admin-migrate):
--   1. Rows written by admin-migrate's LinearSidebar, prefixed /admin-migrate/...
--   2. Rows written by the old shell-preview admin (now at /admin-retire),
--      prefixed bare /admin/... using route shapes that no longer exist
--      1:1 in the new tree (consolidated or renamed pages).
--
-- The unique constraint is (user_id, route), so each step deletes any
-- pre-existing row that would collide at the destination route before
-- updating, rather than risk a unique-violation aborting the whole run.

-- 1. /admin-migrate/... -> /admin/...
delete from public.user_favorites old_row
using public.user_favorites new_row
where old_row.route like '/admin-migrate/%'
  and new_row.user_id = old_row.user_id
  and new_row.route = regexp_replace(old_row.route, '^/admin-migrate/', '/admin/');

update public.user_favorites
set route = regexp_replace(route, '^/admin-migrate/', '/admin/')
where route like '/admin-migrate/%';

-- 2. Old-admin route shapes -> their new /admin equivalents (same mapping as
--    the next.config.ts legacy-redirect table).
-- 2a. Exact-path renames.
create temporary table admin_cutover_exact_map (old_route text primary key, new_route text not null);
insert into admin_cutover_exact_map (old_route, new_route) values
  ('/admin/faqs', '/admin/content?view=faqs'),
  ('/admin/stories', '/admin/content?view=stories'),
  ('/admin/invoice', '/admin/invoices'),
  ('/admin/members', '/admin/people?view=members'),
  ('/admin/neighbors', '/admin/people?view=neighbors'),
  ('/admin/site', '/admin'),
  ('/admin/widgets', '/admin');

delete from public.user_favorites old_row
using admin_cutover_exact_map m, public.user_favorites new_row
where old_row.route = m.old_route
  and new_row.user_id = old_row.user_id
  and new_row.route = m.new_route;

update public.user_favorites f
set route = m.new_route
from admin_cutover_exact_map m
where f.route = m.old_route;

drop table admin_cutover_exact_map;

-- 2b. /admin/leaflet and everything under it -> /admin/leaflets (list).
delete from public.user_favorites old_row
using public.user_favorites new_row
where (old_row.route = '/admin/leaflet' or old_row.route like '/admin/leaflet/%')
  and new_row.user_id = old_row.user_id
  and new_row.route = '/admin/leaflets';

update public.user_favorites
set route = '/admin/leaflets'
where route = '/admin/leaflet' or route like '/admin/leaflet/%';

-- 2c. /admin/events/:id/overview and /details -> /admin/events/:id (+ ?view=details).
delete from public.user_favorites old_row
using public.user_favorites new_row
where old_row.route ~ '^/admin/events/[^/]+/overview$'
  and new_row.user_id = old_row.user_id
  and new_row.route = regexp_replace(old_row.route, '/overview$', '');

update public.user_favorites
set route = regexp_replace(route, '/overview$', '')
where route ~ '^/admin/events/[^/]+/overview$';

delete from public.user_favorites old_row
using public.user_favorites new_row
where old_row.route ~ '^/admin/events/[^/]+/details$'
  and new_row.user_id = old_row.user_id
  and new_row.route = regexp_replace(old_row.route, '/details$', '?view=details');

update public.user_favorites
set route = regexp_replace(route, '/details$', '?view=details')
where route ~ '^/admin/events/[^/]+/details$';
