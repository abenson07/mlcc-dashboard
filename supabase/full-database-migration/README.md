# Full database migration — run these in Supabase SQL Editor

Two databases: **SOURCE** (old) and **TARGET** (new).

Schema files (`01`–`03`) are synced to your SOURCE inventory (enums, columns, indexes, RLS).

## Part A — TARGET (new empty project): create schema

Run in order:

| # | File | What it does |
|---|------|----------------|
| 1 | [01_enums.sql](./01_enums.sql) | Extensions + all enum types |
| 2 | [02_create_tables.sql](./02_create_tables.sql) | All tables |
| 3 | [03_indexes_constraints_rls.sql](./03_indexes_constraints_rls.sql) | Indexes, checks, `is_admin()`, RLS |
| 4 | [04_reference_seeds.sql](./04_reference_seeds.sql) | **Skip** if copying data from SOURCE |

## Part B — SOURCE (old project): export data

| # | File | What it does |
|---|------|----------------|
| 1 | [SOURCE_01_install_export_helpers.sql](./SOURCE_01_install_export_helpers.sql) | One-time helper functions |
| 2 | [SOURCE_02_export_data_only.sql](./SOURCE_02_export_data_only.sql) | Tables with rows (run one query at a time if editor truncates) |
| alt | [SOURCE_02_export_all_inserts.sql](./SOURCE_02_export_all_inserts.sql) | All tables (empty tables produce no rows) |
| 3 | [SOURCE_03_export_auth_users.sql](./SOURCE_03_export_auth_users.sql) | Optional: `auth.users` (0 rows in your inventory) |

Paste `INSERT` output into [data/](./data/) files, then run on TARGET per [data/README.md](./data/README.md).

**Note:** Your inventory shows 153 `deliveries` but 0 `people` / `routes`. If export/load fails on FK errors, re-check row counts on SOURCE or export those parent tables anyway.

## Part C — TARGET: load data

Run [data/](./data/) files in numeric order after Part A.

## Inventory queries (already done)

[SOURCE_00a_enums.sql](./SOURCE_00a_enums.sql) through [SOURCE_00f_rls.sql](./SOURCE_00f_rls.sql) — use again if SOURCE schema changes.

## Notes

- **Does not delete anything on SOURCE.**
- **Large tables:** use Dashboard CSV export or `npm run db:export:dump` locally.
- **Storage / Webflow / Stripe** are outside Postgres.
