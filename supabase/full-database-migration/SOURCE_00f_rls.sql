-- OLD DB — Section 6: RLS policies. Already captured — 03_indexes_constraints_rls.sql is updated.

select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
order by tablename, policyname;
