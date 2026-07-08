-- Adds the route type labels used by the redesigned Route Details widget dropdown to the
-- "Route Types" enum. Postgres won't let a new enum value be used in the same transaction
-- it was added in, so this MUST be run and committed on its own, separately from
-- 20260707211000_route_type_label_rename.sql.
-- Run this entire file in the Supabase SQL editor (not individual lines), then run the
-- next migration file as a separate query.

alter type "Route Types" add value if not exists 'Condo/apartment';
alter type "Route Types" add value if not exists 'Business';
alter type "Route Types" add value if not exists 'Retirement home/care facility';
