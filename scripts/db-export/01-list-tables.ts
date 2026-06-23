#!/usr/bin/env npx tsx
/**
 * Lists every table (and enum) to migrate, with row counts and suggested data-load order.
 *
 * Usage:
 *   npm run db:export:list
 *   npm run db:export:list -- --out docs/db-export/00-table-inventory.md
 */

import fs from "node:fs";
import path from "node:path";
import { connectClient, loadEnvFiles } from "./lib/connect";

type TableRow = {
  schema: string;
  name: string;
  row_count: number;
};

type FkRow = {
  child_schema: string;
  child_table: string;
  parent_schema: string;
  parent_table: string;
};

type EnumRow = {
  schema: string;
  name: string;
  labels: string[];
};

function parseArgs(): { outPath: string | null } {
  const outIdx = process.argv.indexOf("--out");
  const outPath = outIdx >= 0 ? process.argv[outIdx + 1] ?? null : null;
  return { outPath };
}

function topoSortTables(tables: TableRow[], fks: FkRow[]): TableRow[] {
  const key = (t: TableRow) => `${t.schema}.${t.name}`;
  const tableSet = new Set(tables.map(key));
  const deps = new Map<string, Set<string>>();

  for (const t of tables) deps.set(key(t), new Set());

  for (const fk of fks) {
    const child = `${fk.child_schema}.${fk.child_table}`;
    const parent = `${fk.parent_schema}.${fk.parent_table}`;
    if (!tableSet.has(child) || !tableSet.has(parent) || child === parent) continue;
    deps.get(child)?.add(parent);
  }

  const sorted: TableRow[] = [];
  const visited = new Set<string>();
  const visiting = new Set<string>();

  function visit(k: string): void {
    if (visited.has(k)) return;
    if (visiting.has(k)) return;
    visiting.add(k);
    for (const dep of deps.get(k) ?? []) visit(dep);
    visiting.delete(k);
    visited.add(k);
    const t = tables.find((x) => key(x) === k);
    if (t) sorted.push(t);
  }

  for (const t of tables) visit(key(t));
  return sorted;
}

async function main(): Promise<void> {
  loadEnvFiles();
  const { outPath } = parseArgs();
  const client = await connectClient();

  const enumsResult = await client.query<{
    schema: string;
    name: string;
    labels: string[];
  }>(`
    select
      n.nspname as schema,
      t.typname as name,
      array_agg(e.enumlabel order by e.enumsortorder) as labels
    from pg_type t
    join pg_enum e on e.enumtypid = t.oid
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname in ('public')
    group by n.nspname, t.typname
    order by n.nspname, t.typname
  `);

  const tablesResult = await client.query<{ schema: string; name: string }>(`
    select schemaname as schema, tablename as name
    from pg_tables
    where schemaname in ('public')
       or (schemaname = 'auth' and tablename = 'users')
    order by schemaname, tablename
  `);

  const tables: TableRow[] = [];
  for (const row of tablesResult.rows) {
    const quoted = `"${row.schema}"."${row.name}"`;
    const countResult = await client.query<{ count: string }>(
      `select count(*)::text as count from ${quoted}`
    );
    tables.push({
      schema: row.schema,
      name: row.name,
      row_count: Number(countResult.rows[0]?.count ?? 0),
    });
  }

  const fksResult = await client.query<FkRow>(`
    select
      ns_child.nspname as child_schema,
      c.relname as child_table,
      ns_parent.nspname as parent_schema,
      p.relname as parent_table
    from pg_constraint con
    join pg_class c on c.oid = con.conrelid
    join pg_namespace ns_child on ns_child.oid = c.relnamespace
    join pg_class p on p.oid = con.confrelid
    join pg_namespace ns_parent on ns_parent.oid = p.relnamespace
    where con.contype = 'f'
      and (
        ns_child.nspname = 'public'
        or (ns_child.nspname = 'auth' and c.relname = 'users')
      )
    order by child_schema, child_table
  `);

  const loadOrder = topoSortTables(tables, fksResult.rows);
  const enums: EnumRow[] = enumsResult.rows;

  const lines: string[] = [
    "# Database export inventory",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Connection",
    "",
    "This file was produced locally by `npm run db:export:list`. Paste the dump files next to this inventory when handing off for migration SQL generation.",
    "",
    "## Custom enums (`public` schema)",
    "",
  ];

  if (enums.length === 0) {
    lines.push("_None found._", "");
  } else {
    for (const e of enums) {
      lines.push(`- **${e.schema}.${e.name}**: ${e.labels.map((l) => `'${l}'`).join(", ")}`);
    }
    lines.push("");
  }

  lines.push("## Tables", "", "| Schema | Table | Rows |", "| --- | --- | ---: |");
  for (const t of tables) {
    lines.push(`| ${t.schema} | ${t.name} | ${t.row_count} |`);
  }

  lines.push("", "## Suggested data load order", "");
  lines.push("Load parent tables before children (foreign keys):", "");
  loadOrder.forEach((t, i) => {
    lines.push(`${i + 1}. \`${t.schema}.${t.name}\` (${t.row_count} rows)`);
  });

  lines.push("", "## Foreign keys", "");
  if (fksResult.rows.length === 0) {
    lines.push("_None found._", "");
  } else {
    lines.push("| Child | Parent |", "| --- | --- |");
    for (const fk of fksResult.rows) {
      lines.push(
        `| ${fk.child_schema}.${fk.child_table} | ${fk.parent_schema}.${fk.parent_table} |`
      );
    }
    lines.push("");
  }

  lines.push(
    "## Next step",
    "",
    "Run `npm run db:export:dump -- --out docs/db-export` to write schema + row data for each table.",
    ""
  );

  const markdown = lines.join("\n");
  if (outPath) {
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, markdown, "utf8");
    console.log("Wrote", outPath);
  } else {
    process.stdout.write(markdown);
  }

  await client.end();
}

main().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
