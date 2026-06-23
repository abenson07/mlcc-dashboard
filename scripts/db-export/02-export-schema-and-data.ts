#!/usr/bin/env npx tsx
/**
 * Exports CREATE-style schema + row data (JSON) for each table, as markdown files.
 *
 * Usage:
 *   npm run db:export:dump -- --out docs/db-export
 *   npm run db:export:dump -- --out docs/db-export --tables public.people,public.memberships
 *   npm run db:export:dump -- --out docs/db-export --include-auth-users
 */

import fs from "node:fs";
import path from "node:path";
import { connectClient, loadEnvFiles } from "./lib/connect";

type ColumnRow = {
  column_name: string;
  data_type: string;
  udt_name: string;
  is_nullable: string;
  column_default: string | null;
  character_maximum_length: number | null;
  numeric_precision: number | null;
  numeric_scale: number | null;
};

type IndexRow = {
  indexdef: string;
};

type PolicyRow = {
  policyname: string;
  permissive: string;
  roles: string[];
  cmd: string;
  qual: string | null;
  with_check: string | null;
};

type TableRef = { schema: string; name: string };

function parseArgs(): {
  outDir: string;
  tables: TableRef[] | null;
  includeAuthUsers: boolean;
} {
  const outIdx = process.argv.indexOf("--out");
  const outDir = outIdx >= 0 ? process.argv[outIdx + 1] : null;
  if (!outDir) {
    throw new Error("Required: --out <directory>  (e.g. docs/db-export)");
  }

  const tablesIdx = process.argv.indexOf("--tables");
  let tables: TableRef[] | null = null;
  if (tablesIdx >= 0) {
    const raw = process.argv[tablesIdx + 1] ?? "";
    tables = raw.split(",").map((part) => {
      const [schema, name] = part.trim().split(".");
      if (!schema || !name) throw new Error(`Invalid --tables entry: ${part}`);
      return { schema, name };
    });
  }

  const includeAuthUsers = process.argv.includes("--include-auth-users");
  return { outDir, tables, includeAuthUsers };
}

function pgType(col: ColumnRow): string {
  if (col.data_type === "USER-DEFINED") return col.udt_name;
  if (col.data_type === "ARRAY") return `${col.udt_name.replace(/^_/, "")}[]`;
  if (col.data_type === "character varying") {
    return col.character_maximum_length
      ? `varchar(${col.character_maximum_length})`
      : "varchar";
  }
  if (col.data_type === "numeric" && col.numeric_precision) {
    return col.numeric_scale
      ? `numeric(${col.numeric_precision},${col.numeric_scale})`
      : `numeric(${col.numeric_precision})`;
  }
  return col.data_type;
}

async function fetchTables(client: import("pg").Client, filter: TableRef[] | null): Promise<TableRef[]> {
  if (filter) return filter;

  const result = await client.query<{ schema: string; name: string }>(`
    select schemaname as schema, tablename as name
    from pg_tables
    where schemaname = 'public'
    order by tablename
  `);
  return result.rows.map((r) => ({ schema: r.schema, name: r.name }));
}

async function exportTable(
  client: import("pg").Client,
  table: TableRef,
  outDir: string
): Promise<void> {
  const qualified = `"${table.schema}"."${table.name}"`;
  const fileBase = `${table.schema}.${table.name}`.replace(/[^a-zA-Z0-9._-]/g, "_");

  const columnsResult = await client.query<ColumnRow>(
    `
    select
      column_name,
      data_type,
      udt_name,
      is_nullable,
      column_default,
      character_maximum_length,
      numeric_precision,
      numeric_scale
    from information_schema.columns
    where table_schema = $1 and table_name = $2
    order by ordinal_position
    `,
    [table.schema, table.name]
  );

  const pkResult = await client.query<{ column_name: string }>(
    `
    select a.attname as column_name
    from pg_index i
    join pg_class c on c.oid = i.indrelid
    join pg_namespace n on n.oid = c.relnamespace
    join pg_attribute a on a.attrelid = c.oid and a.attnum = any(i.indkey)
    where n.nspname = $1 and c.relname = $2 and i.indisprimary
    order by array_position(i.indkey, a.attnum)
    `,
    [table.schema, table.name]
  );

  const fkResult = await client.query<{
    constraint_name: string;
    column_name: string;
    foreign_schema: string;
    foreign_table: string;
    foreign_column: string;
    delete_rule: string;
  }>(
    `
    select
      con.conname as constraint_name,
      att.attname as column_name,
      nsf.nspname as foreign_schema,
      clf.relname as foreign_table,
      attf.attname as foreign_column,
      case con.confdeltype
        when 'a' then 'NO ACTION'
        when 'r' then 'RESTRICT'
        when 'c' then 'CASCADE'
        when 'n' then 'SET NULL'
        when 'd' then 'SET DEFAULT'
      end as delete_rule
    from pg_constraint con
    join pg_class cl on cl.oid = con.conrelid
    join pg_namespace n on n.oid = cl.relnamespace
    join pg_class clf on clf.oid = con.confrelid
    join pg_namespace nsf on nsf.oid = clf.relnamespace
    join unnest(con.conkey) with ordinality as src(attnum, ord) on true
    join pg_attribute att on att.attrelid = cl.oid and att.attnum = src.attnum
    join unnest(con.confkey) with ordinality as dst(attnum, ord) on dst.ord = src.ord
    join pg_attribute attf on attf.attrelid = clf.oid and attf.attnum = dst.attnum
    where con.contype = 'f' and n.nspname = $1 and cl.relname = $2
    order by con.conname, src.ord
    `,
    [table.schema, table.name]
  );

  const indexesResult = await client.query<IndexRow>(
    `
    select indexdef
    from pg_indexes
    where schemaname = $1 and tablename = $2
    order by indexname
    `,
    [table.schema, table.name]
  );

  const policiesResult = await client.query<PolicyRow>(
    `
    select policyname, permissive, roles, cmd, qual, with_check
    from pg_policies
    where schemaname = $1 and tablename = $2
    order by policyname
    `,
    [table.schema, table.name]
  );

  const countResult = await client.query<{ count: string }>(
    `select count(*)::text as count from ${qualified}`
  );
  const rowCount = Number(countResult.rows[0]?.count ?? 0);

  const dataResult = await client.query(`select * from ${qualified}`);

  const pkCols = new Set(pkResult.rows.map((r) => r.column_name));
  const colDefs = columnsResult.rows.map((col) => {
    const parts = [`  "${col.column_name}" ${pgType(col)}`];
    if (col.is_nullable === "NO") parts.push("NOT NULL");
    if (col.column_default != null) parts.push(`DEFAULT ${col.column_default}`);
    return parts.join(" ");
  });

  const fkLines = fkResult.rows.map(
    (fk) =>
      `  CONSTRAINT "${fk.constraint_name}" FOREIGN KEY ("${fk.column_name}") REFERENCES "${fk.foreign_schema}"."${fk.foreign_table}" ("${fk.foreign_column}") ON DELETE ${fk.delete_rule}`
  );

  const pkLine =
    pkCols.size > 0
      ? [`  PRIMARY KEY (${[...pkCols].map((c) => `"${c}"`).join(", ")})`]
      : [];

  const createLines = [
    `CREATE TABLE ${qualified} (`,
    [...colDefs, ...pkLine, ...fkLines].join(",\n"),
    ");",
  ];

  const indexLines = indexesResult.rows.map((i) => `${i.indexdef};`);

  const policyLines = policiesResult.rows.map((p) => {
    const roles = p.roles?.length ? p.roles.join(", ") : "public";
    const using = p.qual ? ` USING (${p.qual})` : "";
    const check = p.with_check ? ` WITH CHECK (${p.with_check})` : "";
    return `-- Policy: ${p.policyname} (${p.cmd}, ${p.permissive}, roles: ${roles})${using}${check}`;
  });

  const md: string[] = [
    `# ${table.schema}.${table.name}`,
    "",
    `Rows: **${rowCount}**`,
    "",
    "## Schema (DDL)",
    "",
    "```sql",
    createLines.join("\n"),
    "```",
    "",
  ];

  if (indexLines.length > 0) {
    md.push("## Indexes", "", "```sql", ...indexLines, "```", "");
  }

  if (policiesResult.rows.length > 0) {
    md.push(
      "## Row level security policies",
      "",
      "_Recreate policies on the new database after enabling RLS on this table._",
      "",
      "```sql",
      `ALTER TABLE ${qualified} ENABLE ROW LEVEL SECURITY;`,
      ...policyLines,
      "```",
      ""
    );
  }

  md.push(
    "## Data",
    "",
    `${rowCount} row(s). JSON below — paste as-is for migration SQL generation.`,
    "",
    "```json",
    JSON.stringify(dataResult.rows, null, 2),
    "```",
    ""
  );

  const outPath = path.join(outDir, `${fileBase}.md`);
  fs.writeFileSync(outPath, md.join("\n"), "utf8");
  console.log(`Wrote ${outPath} (${rowCount} rows)`);
}

async function main(): Promise<void> {
  loadEnvFiles();
  const { outDir, tables: tableFilter, includeAuthUsers } = parseArgs();
  fs.mkdirSync(outDir, { recursive: true });

  const client = await connectClient();
  let tables = await fetchTables(client, tableFilter);

  if (includeAuthUsers && !tables.some((t) => t.schema === "auth" && t.name === "users")) {
    tables = [...tables, { schema: "auth", name: "users" }];
  }

  tables.sort((a, b) => {
    if (a.schema !== b.schema) return a.schema.localeCompare(b.schema);
    return a.name.localeCompare(b.name);
  });

  for (const table of tables) {
    await exportTable(client, table, outDir);
  }

  await client.end();
  console.log(`\nDone. ${tables.length} table(s) exported to ${outDir}`);
  console.log("Commit or paste these .md files, then ask the agent to generate migration SQL.");
}

main().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
