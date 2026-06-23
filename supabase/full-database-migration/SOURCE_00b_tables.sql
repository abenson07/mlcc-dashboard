-- OLD DB — Section 2: tables + row counts. Copy ALL rows, paste to agent.

select schemaname as schema, tablename as table_name
from pg_tables
where schemaname = 'public'
   or (schemaname = 'auth' and tablename = 'users')
order by schemaname, tablename;

select
  schemaname || '.' || relname as table_name,
  n_live_tup as approx_row_count
from pg_stat_user_tables
where schemaname = 'public'
   or (schemaname = 'auth' and relname = 'users')
order by schemaname, relname;
