-- OLD DB — Section 1: enums. Copy ALL rows, paste to agent.

select
  n.nspname as schema,
  t.typname as enum_name,
  string_agg(e.enumlabel, ', ' order by e.enumsortorder) as enum_values
from pg_type t
join pg_enum e on e.enumtypid = t.oid
join pg_namespace n on n.oid = t.typnamespace
where n.nspname = 'public'
group by n.nspname, t.typname
order by t.typname;
