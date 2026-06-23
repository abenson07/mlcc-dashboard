# Database export scripts (local only)

Run these on **your machine** against your **source** Supabase database. Nothing is sent to an agent — you control credentials via `.env.local`.

## Setup

1. In Supabase Dashboard → **Project Settings** → **Database** → **Connection string**
2. Choose **Session pooler** → **URI** → Copy
3. Put it in `.env.local`:

```env
DATABASE_URL=postgresql://postgres.PROJECT_REF:ENCODED_PASSWORD@....pooler.supabase.com:5432/postgres
```

**Or** use a raw password (no URL encoding headaches):

```env
SUPABASE_DB_PASSWORD=your_password_here
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
```

## Script 1 — List tables

```bash
npm run db:export:list
```

Writes a markdown inventory to stdout. Save it:

```bash
npm run db:export:list -- --out docs/db-export/00-table-inventory.md
```

Includes:

- All `public` tables + row counts
- Custom enums
- Foreign keys
- Suggested data load order

## Script 2 — Schema + data per table

```bash
npm run db:export:dump -- --out docs/db-export
```

Creates one markdown file per table, e.g. `docs/db-export/public.people.md`, each with:

- `CREATE TABLE`–style DDL (columns, PK, FKs)
- Indexes
- RLS policy notes (if any)
- Full row data as JSON

### Include `auth.users` (for admin login migration)

```bash
npm run db:export:dump -- --out docs/db-export --include-auth-users
```

### Export specific tables only

```bash
npm run db:export:dump -- --out docs/db-export --tables public.people,public.memberships
```

## Hand off to the agent

1. Run both scripts
2. Commit the `docs/db-export/` folder **or** paste the files into chat
3. Ask the agent to generate ordered SQL migration files from the exports

**Do not commit `.env.local`.** The export files contain real data — treat them like secrets if the repo is shared.

## Troubleshooting

| Error | Fix |
| --- | --- |
| `getaddrinfo ENOTFOUND db.*.supabase.co` | Use **Session pooler** URI, not Direct |
| `password authentication failed` | Reset DB password in Dashboard; copy new URI |
| Password has `@` in URL | URL-encode it, or use `SUPABASE_DB_PASSWORD` instead |
