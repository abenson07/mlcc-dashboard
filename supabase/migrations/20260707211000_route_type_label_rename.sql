-- Renames route_type values to match the updated Route Details widget's dropdown labels
-- ("Apartments/Condos" -> "Condo/apartment", "Businesses" -> "Business"). Without this,
-- existing routes keep their old label: they won't show a checkmark against the new
-- option list, and (since BuildingContactWidget now checks for "Condo/apartment")
-- previously-flagged condo/apartment routes would stop showing their building contact card.
--
-- Run this AFTER 20260707210000_route_type_enum_labels.sql has been run and committed as
-- its own, separate query — the new enum values it adds aren't usable until then.
-- Run this entire file in the Supabase SQL editor (not individual lines).

update public.routes
set route_type = 'Condo/apartment'
where route_type = 'Apartments/Condos';

update public.routes
set route_type = 'Business'
where route_type = 'Businesses';
