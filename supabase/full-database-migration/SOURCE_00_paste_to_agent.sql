-- =============================================================================
-- OLD DATABASE ONLY — run in Supabase SQL Editor, copy ALL results, paste to agent
-- =============================================================================
-- Run each section separately. Copy the full result grid (or "Download CSV").
-- Save as docs/db-export/00-inventory.md or paste directly in chat.

-- -----------------------------------------------------------------------------
-- SECTION 1: Custom enums (run this first)
-- -----------------------------------------------------------------------------
select
  n.nspname as schema,
  t.typname as enum_name,
  string_agg(e.enumlabel, ', ' order by e.enumsortorder) as enum_values
from pg_type t
join pg_enum e on e.enumtypid = t.oid
join pg_namespace n on n.oid = t.typnamespace
where n.nspname in ('public')
group by n.nspname, t.typname
order by t.typname;


-- -----------------------------------------------------------------------------
-- SECTION 2: All tables + row counts
-- -----------------------------------------------------------------------------
select
  schemaname as schema,
  tablename as table_name
from pg_tables
where schemaname in ('public')
   or (schemaname = 'auth' and tablename = 'users')
order by schemaname, tablename;

-- Row counts (run after you have the table list):
select
  schemaname || '.' || relname as table_name,
  n_live_tup as approx_row_count
from pg_stat_user_tables
where schemaname in ('public')
   or (schemaname = 'auth' and relname = 'users')
order by schemaname, relname;


-- -----------------------------------------------------------------------------
-- SECTION 3: Every column (THE MOST IMPORTANT ONE — paste this whole result)
-- -----------------------------------------------------------------------------
select
  c.table_schema,
  c.table_name,
  c.column_name,
  c.ordinal_position,
  c.data_type,
  c.udt_name,
  c.is_nullable,
  c.column_default,
  c.character_maximum_length,
  c.numeric_precision,
  c.numeric_scale
from information_schema.columns c
where c.table_schema in ('public')
   or (c.table_schema = 'auth' and c.table_name = 'users')
order by c.table_schema, c.table_name, c.ordinal_position;


-- -----------------------------------------------------------------------------
-- SECTION 4: Primary keys & foreign keys
-- -----------------------------------------------------------------------------
select
  tc.table_schema,
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_schema as foreign_table_schema,
  ccu.table_name as foreign_table_name,
  ccu.column_name as foreign_column_name
from information_schema.table_constraints tc
left join information_schema.key_column_usage kcu
  on tc.constraint_name = kcu.constraint_name
  and tc.table_schema = kcu.table_schema
left join information_schema.constraint_column_usage ccu
  on tc.constraint_name = ccu.constraint_name
  and tc.table_schema = ccu.table_schema
where tc.table_schema in ('public')
   or (tc.table_schema = 'auth' and tc.table_name = 'users')
order by tc.table_schema, tc.table_name, tc.constraint_type, tc.constraint_name;


-- -----------------------------------------------------------------------------
-- SECTION 5: Indexes (non-PK)
-- -----------------------------------------------------------------------------
select schemaname, tablename, indexname, indexdef
from pg_indexes
where schemaname in ('public')
   or (schemaname = 'auth' and tablename = 'users')
order by schemaname, tablename, indexname;


-- -----------------------------------------------------------------------------
-- SECTION 6: RLS policies
-- -----------------------------------------------------------------------------
select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
order by tablename, policyname;


-- -----------------------------------------------------------------------------
-- SECTION 7: Tables in OLD db that are NOT in our migration plan (sanity check)
-- -----------------------------------------------------------------------------
-- Compare result to expected list in README after paste.
