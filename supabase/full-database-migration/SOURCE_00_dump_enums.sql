-- Run on SOURCE (old database) only.
-- Copy the result rows into 01_enums.sql on TARGET if legacy enum labels differ.

select format(
  'CREATE TYPE %I.%I AS ENUM (%s);',
  n.nspname,
  t.typname,
  string_agg(quote_literal(e.enumlabel), ', ' order by e.enumsortorder)
) as ddl
from pg_type t
join pg_enum e on e.enumtypid = t.oid
join pg_namespace n on n.oid = t.typnamespace
where n.nspname = 'public'
  and t.typname in (
    'membership_tier_enum',
    'membership_status_enum',
    'payment_type_enum',
    'payment_method_enum'
  )
   or t.typname = 'Route Types'
group by n.nspname, t.typname
order by t.typname;
