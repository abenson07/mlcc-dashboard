# Maple Leaf Community Club

This repository is the **Maple Leaf Community Club (MLCC)** platform: a public neighborhood website and a private admin dashboard used by the board and approved volunteers.

The live public site is [mapleleafcommunity.org](https://www.mapleleafcommunity.org). The admin lives at `/admin` on the same app after you sign in with an emailed one-time code — there are **no passwords**.

The project started from a TailAdmin Next.js template. Treat this as an MLCC product, not that template.

This README is written for **board members, volunteers, and contractors** who need to understand the system, and for **AI agents** working in the repo. Product language comes first; setup, file map, and “do not break this” rules are labeled so you can skip to them.

---

## Contents

1. [What this product does](#what-this-product-does)
2. [What’s in this repo](#whats-in-this-repo)
3. [Current vs leftover admin UIs](#current-vs-leftover-admin-uis)
4. [Run it locally](#run-it-locally)
5. [Sign in](#sign-in)
6. [Environment variables (by capability)](#environment-variables-by-capability)
7. [If you are an agent](#if-you-are-an-agent)
8. [Integrations](#integrations)
9. [Useful npm scripts](#useful-npm-scripts)
10. [Deploy notes](#deploy-notes)
11. [Further reading](#further-reading)

A longer, non-engineer walkthrough of the product and rollout is in [docs/architecture-and-tech-stack.md](docs/architecture-and-tech-stack.md).

---

## What this product does

MLCC hosts its own site and tools instead of relying on generic form-and-folder products. That means we control what we collect, who can see it, and we can publish things (events, leaflet routes, meeting minutes) without copy-paste between tools.

### Public website

Anyone can visit. Typical pages include About, Board, Committees, Contact, Donate, Events, Join the Board, Leaflet, Meeting Minutes, Membership, One Seattle Plan, Shop, Submit an Event, Submit a Story, Subscribe, and Volunteer.

Some pages are mostly editorial. Others pull live data (events, stories, volunteer opportunities, open leaflet routes). Open routes are published **without** exposing private neighbor records.

### Admin dashboard (`/admin`)

After login, board members can manage:

| Area | What it is |
|------|------------|
| **Events** | Create and edit events; they can appear on the public Events pages. |
| **Leaflets** | Coordinate print runs, routes, deliverers, skipped routes, and related comms. |
| **Invoicing** | Memberships, sponsorships, and related billing (reconciled with Stripe). |
| **People** | Neighbors we have a relationship with — often just a name and email. Members are the subset with an active paid subscription. |
| **Businesses** | Local businesses (seeded from Google once; not a live Places sync). |
| **Content** | Community stories / leaflet-style posts for the public site. |
| **Shirt preorders / QR codes** | Commerce ops and printable codes. |
| **Comms, promotions, settings** | Outreach tooling and admin preferences. |

Some screens are still in development (Committees, Inbox, Action Items). They are hidden unless you turn on **Preview features in development** in Settings.

**Access today:** anyone who can complete email sign-in is treated as a full admin. Narrower volunteer roles are planned, not built.

**Demo mode:** the sidebar can switch the dashboard to sample/mock data so you can click around without touching production. Live mode uses the real database and APIs. The **layout must look the same** in both modes; only the data may differ.

Favorites let a logged-in person pin admin pages for faster return visits.

---

## What’s in this repo

One Next.js app serves both the marketing site and admin.

```
visitor  -->  public pages in src/app/(marketing)
board    -->  /login  -->  /admin
                |              |
                +--> Supabase Auth (magic link / OTP)
                               |
               +---------------+----------------+
               v               v                v
          Supabase DB      Stripe          Webflow CMS
          (people,         (payments,      (some public
           leaflets,        memberships)    listings)
           events, …)
```

| Folder | What it is |
|--------|------------|
| `src/app/(marketing)/` | Public site routes (home, events, membership, leaflet, …). |
| `src/app/admin/` | **Current** admin app. |
| `src/components/patterns/` | Admin UI (migrate templates, foundation chrome, shared pieces). |
| `hooks/`, `schemas/` | Data hooks and TypeScript table types. |
| `supabase/migrations/` | Database migrations. |
| `src/app/api/` | Server routes (Stripe, Webflow, Resend, webhooks, …). |
| `docs/` | Architecture, design tokens, page wiring notes. |
| [`mlcc-website/`](mlcc-website/) | Earlier standalone marketing site / content source. **Not** the app you run with root `npm run dev`. |
| [`maple-leaf-landings/`](maple-leaf-landings/) | Separate static landings for give/shop subdomains. |

---

## Current vs leftover admin UIs

Agents and new contributors: **edit `/admin` unless someone asked for a legacy shell.**

| URL | Role |
|-----|------|
| `/` and other marketing paths | Live public site. |
| `/admin` | Current admin. Some files still say “admin-migrate”; that means this shell. |
| `/admin-preview` | Design/preview sandbox. Includes non-MLCC sample screens. Do not treat as production. Avoid wiring real Supabase writes here. |
| `/admin-retire`, `/old-admin` | Older admin shells. Not the product default. |

WIP routes (gated until Settings → preview features is on):

- `/admin/committees`
- `/admin/inbox`
- `/admin/action-items`

See `src/middleware.ts`.

---

## Run it locally

**You need:** Node.js **20 or later**, npm, and access to the team’s Supabase project (or your own for experiments).

1. Clone this repository and `cd` into it.

2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy environment variables:

   ```bash
   cp .env.example .env.local
   ```

   Fill in at least the Supabase values (see [Sign in](#sign-in)). Never commit `.env.local` or real API keys.

4. Start the app:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) for the public site and [http://localhost:3000/login](http://localhost:3000/login) for admin.

The marketing site will render with missing keys for many integrations; login and live admin data need Supabase. Payments, CMS sync, email, Slack, and similar features need the matching keys from `.env.example`.

**Checks:**

```bash
npm run lint
npm test
```

`npm test` runs Vitest once. `npm run build` is the production compile.

---

## Sign in

Admin login is **invite-only email OTP / magic link** via Supabase Auth. Configure in the Supabase Dashboard (Authentication → SMTP, email templates with `{{ .Token }}`, invited users). App env:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (or a publishable key)
- `SUPABASE_SERVICE_ROLE_KEY` — **server and scripts only**; never expose it to the browser

If you can open the public site but cannot log in, the usual causes are missing env vars, SMTP not set in Supabase, or your email not invited.

---

## Environment variables (by capability)

The full list and comments live in [`.env.example`](.env.example). Grouped by what they unlock:

| Capability | Typical variables |
|------------|-------------------|
| Auth and database | `NEXT_PUBLIC_SUPABASE_*`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL` / `SUPABASE_DB_PASSWORD` |
| Webflow CMS (banners, events, volunteer asks) | `WEBFLOW_SITE_API_TOKEN`, `WEBFLOW_SITE_ID`, collection IDs |
| Stripe (memberships, donations, merch, invoices) | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, product/price IDs |
| Email | `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, segment/audience IDs |
| Leaflet respond links | `LEAFLET_RESPONSE_SIGNING_SECRET` |
| Feedback / issues | `LINEAR_API_KEY` |
| Social scheduling | `BUFFER_API_TOKEN` |
| Slack notifications | `SLACK_BOT_TOKEN`, per-committee channel IDs |
| SMS | `TWILIO_*` |
| Event location search | `GOOGLE_PLACES_API_KEY` |
| AI copy (events, marketing email) | `ANTHROPIC_API_KEY` |
| Landings CORS / fundraiser goal | `MLCC_LANDING_ORIGINS`, `FUNDRAISER_GOAL_CENTS` |

You do not need every key to work on a single page. Add keys for the feature you are touching.

---

## If you are an agent

Read this section before changing code.

### Source of truth

- **Admin UI:** `src/app/admin/**`, `src/components/patterns/client-templates-migrate/**`, shared chrome in `src/components/patterns/foundation/**`.
- **Demo / live layout parity:** Demo and live may use different data. Layout, spacing, chrome, and interaction patterns must stay aligned. See [AGENTS.md](AGENTS.md) and `.cursor/rules/admin-migrate-demo-live-parity.mdc`.
- **Public site:** `src/app/(marketing)/**`. Use Sparkles / marketing section conventions — not the admin Mercury/Wise tokens ([docs/DESIGN.md](docs/DESIGN.md) is for the **dashboard**).
- **Data:** `schemas/`, `hooks/`, `supabase/migrations/`, `src/app/api/`.
- **Admin-preview:** preview only; do not “fix production” there.

### External APIs and writes

Scripts and commands that **create, update, publish, or migrate live data** (Webflow, Stripe, production Supabase, etc.) need an explicit human OK. Say what will change before running. If something is **destructive** (delete CMS items, drop tables, wipe data), say that plainly first. See `.cursor/rules/external-side-effects.mdc`.

Do not treat “smoke test” as permission to mutate production.

### Linear

- Public-site issues often live on the **MLCC Website** project (team key **MWO**, e.g. `MWO-123`). IDs: [`mlcc-website/linear.config.json`](mlcc-website/linear.config.json).
- The admin “report issue” flow uses `LINEAR_API_KEY` (optional team/project overrides in `.env.example`).

### Secrets

Never commit `.env.local`, service-role keys, Stripe secrets, or Webflow tokens.

### Nested apps

Root `package.json` is this dashboard + marketing Next app. Do not assume `mlcc-website/` or `maple-leaf-landings/` share that install or those routes.

---

## Integrations

| System | Role |
|--------|------|
| **Supabase** | Postgres, Auth (OTP), RLS-backed app data. |
| **Stripe** | Memberships, donations, merch, invoices. Card data stays at Stripe. |
| **Webflow CMS** | Some public listings (banners, events collection, volunteer asks) still sync here. |
| **Resend** | Transactional and marketing email. |
| **Linear** | Issue tracking / in-app feedback. |
| **Slack** | Committee signup and form notifications. |
| **Twilio** | Inbound SMS → Slack (signature-validated). |
| **Buffer** | Social scheduling. |
| **Anthropic** | Draft/revise event and marketing copy. |
| **Google Places** | Event location search (`/api/places/*`). |

Page-by-table mapping: [docs/database-pages-reference.md](docs/database-pages-reference.md). Schema types: [schemas/README.md](schemas/README.md).

---

## Useful npm scripts

From the **repo root**:

| Script | Purpose |
|--------|---------|
| `npm run dev` | Local Next.js server. |
| `npm run build` / `npm start` | Production build and serve. |
| `npm run lint` | ESLint. |
| `npm test` | Vitest. |
| `npm run webflow:setup-banners` / `webflow:verify-banners` | Banners CMS collection. |
| `npm run webflow:setup-volunteer-asks` / `webflow:verify-volunteer-asks` | Volunteer asks CMS. |
| `npm run webflow:create-events-collection` / `webflow:verify-events` | Events CMS. |
| `npm run seed:businesses` | Seed businesses from Places data. |
| `npm run migrate:businesses` / `migrate:qr-codes` / `migrate:stories-marketing` | Targeted DB migrations via scripts. |
| `npm run import:marketing-stories` | Import stories from the marketing site. |
| `npm run stripe:setup-commerce` | Create commerce products in Stripe. |
| `npm run db:export:list` / `db:export:dump` | Database export helpers. |
| `npm run deploy` | Webflow Cloud deploy (`webflow cloud deploy`). |

Script headers and `.env.example` comments are the detailed manuals. Prefer `--dry-run` / `--verify` when those flags exist.

Give/shop landings: [maple-leaf-landings/README.md](maple-leaf-landings/README.md).

---

## Deploy notes

- **Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4.
- **Typical production:** marketing at `/`, admin at `/admin`. Leave `BASE_PATH` / `NEXT_PUBLIC_BASE_PATH` **unset** unless you are on a legacy Webflow Cloud mount (then see [docs/API-ROUTES-PRODUCTION.md](docs/API-ROUTES-PRODUCTION.md)).
- **Also present:** OpenNext/Cloudflare (`wrangler.json`, `npm run preview`) and `npm run deploy` for Webflow Cloud.
- **Cron (Vercel):** daily `GET /api/cron/action-item-reminders` — see `vercel.json`.
- Legacy mapleleafcommunity.org URL aliases are 301s in `next.config.ts`; inventory in [docs/legacy-site-redirects.md](docs/legacy-site-redirects.md).

---

## Further reading

| Doc | When to open it |
|-----|-----------------|
| [docs/architecture-and-tech-stack.md](docs/architecture-and-tech-stack.md) | Product explanation for the whole team. |
| [docs/database-pages-reference.md](docs/database-pages-reference.md) | Which admin area uses which tables. |
| [docs/DESIGN.md](docs/DESIGN.md) | Admin color tokens (Mercury + Wise green). |
| [docs/integrated-dashboard/README.md](docs/integrated-dashboard/README.md) | Wiring plan for integrated admin screens. |
| [docs/leaflet-phases/README.md](docs/leaflet-phases/README.md) | Leaflet feature phases. |
| [docs/legacy-site-redirects.md](docs/legacy-site-redirects.md) | Old Webflow paths → new routes. |
| [docs/API-ROUTES-PRODUCTION.md](docs/API-ROUTES-PRODUCTION.md) | `/api` 404s when the app is mounted under a base path. |
| [docs/DEBUG-LOGIN-PRODUCTION.md](docs/DEBUG-LOGIN-PRODUCTION.md) | Production login / host-header debugging. |
| [AGENTS.md](AGENTS.md) | Admin demo/live layout rule. |
| [schemas/README.md](schemas/README.md) | Table TypeScript types. |
| [maple-leaf-landings/README.md](maple-leaf-landings/README.md) | Fundraiser and shop subdomains. |
| [scripts/db-export/README.md](scripts/db-export/README.md) | Exporting schema and data. |
