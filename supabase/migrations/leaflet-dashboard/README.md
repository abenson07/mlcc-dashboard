# Leaflet dashboard — SQL migrations

Run these **in order** against your Supabase Postgres database (SQL editor or `psql`).

## Run order

| # | File | What it does |
|---|------|----------------|
| 1 | `01_new_tables.sql` | Enums + all new tables, indexes, RLS, seed rows |
| 2 | `02_alter_events.sql` | Expand `events` for dashboard-native events |
| 3 | `03_alter_routes.sql` | Building contacts; drop `secondary_deliverer_id` + `is_skipped` |
| 4 | `04_alter_deliveries.sql` | Leaflet edition rows + per-route comm timestamps |
| 5 | `05_alter_sponsorships.sql` | Primary key + leaflet sponsorship fields |

## Decisions baked in

- **`print_cost_cents`** on `leaflets` — editable in dashboard.
- **Comm send timestamps**
  - **Leaflet row** (edition-wide blast): `comm_initial_confirmation_sent_at`, `comm_distribution_day_pickup_sent_at`, `comm_delivery_complete_prompt_sent_at`
  - **Deliveries row** (nullable, per route/deliverer): `comm_pre_distribution_reminder_sent_at`, `comm_completion_followup_sent_at`
- **Sponsorship copy** (app logic): new leaflet copies prior slots; **`status` resets to `pledged`** (open slot).
- **`secondary_deliverer_id`**: dropped from `routes`; secondary promoted to primary where primary was null.
- **Automated comm scheduling**: not in SQL — v1 sends are manual (“Send now”) or a cron job you add later.
- **Close-out metrics** (app): confirmed count, delivered total, count delta vs last edition, skips/reroutes.

## After migrations

Replace `comm_settings.resend_template_id` seed values (`placeholder_*`) with real Resend template IDs in the dashboard or via `UPDATE`.
