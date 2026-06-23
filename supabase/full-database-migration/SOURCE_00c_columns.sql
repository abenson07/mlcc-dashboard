-- OLD DB — Section 3: ALL columns (most important). Copy ALL rows, paste to agent.

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
where c.table_schema = 'public'
   or (c.table_schema = 'auth' and c.table_name = 'users')
order by c.table_schema, c.table_name, c.ordinal_position;
