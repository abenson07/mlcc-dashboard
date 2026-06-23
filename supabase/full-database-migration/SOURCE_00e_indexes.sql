-- OLD DB — Section 5: indexes. Copy ALL rows, paste to agent.

select schemaname, tablename, indexname, indexdef
from pg_indexes
where schemaname = 'public'
   or (schemaname = 'auth' and tablename = 'users')
order by schemaname, tablename, indexname;
