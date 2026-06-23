-- SOURCE: Run once on OLD database. Installs helpers for data export.
-- Safe to re-run (functions are replaced).

create or replace function public.migration_sql_literal(val anyelement)
returns text
language plpgsql
immutable
as $$
declare
  col_type text;
begin
  if val is null then
    return 'NULL';
  end if;

  col_type := pg_typeof(val)::text;

  if col_type = 'uuid' then
    return quote_literal(val::text) || '::uuid';
  elsif col_type in ('integer', 'bigint', 'smallint') then
    return val::text;
  elsif col_type in ('numeric', 'double precision', 'real') then
    return val::text;
  elsif col_type = 'boolean' then
    return case when val then 'true' else 'false' end;
  elsif col_type = 'jsonb' then
    return quote_literal(val::text) || '::jsonb';
  elsif col_type = 'json' then
    return quote_literal(val::text) || '::json';
  elsif col_type = 'date' then
    return quote_literal(val::text) || '::date';
  elsif col_type like 'timestamp%' then
    return quote_literal(val::text) || '::timestamptz';
  elsif col_type = 'time without time zone' then
    return quote_literal(val::text) || '::time';
  elsif col_type like '%[]' then
    return quote_literal(val::text) || '::' || col_type;
  elsif col_type like '%enum' or col_type like 'public.%' then
    return quote_literal(val::text);
  else
    return quote_literal(val::text);
  end if;
end;
$$;

create or replace function public.migration_export_inserts(
  p_schema text,
  p_table text
)
returns setof text
language plpgsql
as $$
declare
  cols text;
  r record;
  vals text;
  line text;
begin
  select string_agg(format('%I', column_name), ', ' order by ordinal_position)
  into cols
  from information_schema.columns
  where table_schema = p_schema and table_name = p_table;

  if cols is null then
    return next format('-- Table %I.%I not found', p_schema, p_table);
    return;
  end if;

  return next format('-- %I.%I', p_schema, p_table);

  for r in execute format('select * from %I.%I', p_schema, p_table) loop
    select string_agg(public.migration_sql_literal((to_jsonb(r) ->> c.column_name)::text), ', ' order by c.ordinal_position)
    into vals
    from information_schema.columns c
    where c.table_schema = p_schema and c.table_name = p_table;

    -- Re-walk columns with proper typing per column
    select string_agg(
      case
        when (to_jsonb(r) -> c.column_name) is null then 'NULL'
        when c.udt_name = 'uuid' then quote_literal(to_jsonb(r) ->> c.column_name) || '::uuid'
        when c.data_type = 'ARRAY' then quote_literal((to_jsonb(r) -> c.column_name)::text) || '::' || c.udt_name
        when c.data_type = 'jsonb' then quote_literal((to_jsonb(r) -> c.column_name)::text) || '::jsonb'
        when c.data_type = 'json' then quote_literal((to_jsonb(r) ->> c.column_name)) || '::json'
        when c.data_type = 'boolean' then (to_jsonb(r) ->> c.column_name)
        when c.data_type in ('integer', 'bigint', 'smallint', 'numeric', 'double precision', 'real') then (to_jsonb(r) ->> c.column_name)
        when c.data_type = 'date' then quote_literal(to_jsonb(r) ->> c.column_name) || '::date'
        when c.data_type like 'timestamp%' then quote_literal(to_jsonb(r) ->> c.column_name) || '::timestamptz'
        when c.data_type = 'time without time zone' then quote_literal(to_jsonb(r) ->> c.column_name) || '::time'
        when c.data_type = 'USER-DEFINED' then quote_literal(to_jsonb(r) ->> c.column_name)
        else quote_literal(to_jsonb(r) ->> c.column_name)
      end,
      ', ' order by c.ordinal_position
    )
    into vals
    from information_schema.columns c
    where c.table_schema = p_schema and c.table_name = p_table;

    line := format('INSERT INTO %I.%I (%s) VALUES (%s);', p_schema, p_table, cols, vals);
    return next line;
  end loop;

  return next '';
end;
$$;
