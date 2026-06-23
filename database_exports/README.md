# Database migration — simple steps

You already exported the data as CSVs. The SQL files are ready.

## On the NEW Supabase project

### Step 1 — Create tables (run once)

Open SQL Editor → paste and run the entire file:

**`01_setup_schema.sql`**

### Step 2 — Load data (run in order)

Open SQL Editor → paste and run each file in **`load/`** folder, one at a time:

| Run | File | Rows |
|-----|------|-----:|
| 1 | `01_load_memberships.sql` | 204 |
| 2 | `02_load_business_memberships.sql` | 1 |
| 3 | `03_load_qr_codes.sql` | 3 |
| 4 | `04_load_feature_ids.sql` | 3 |
| 5 | `05_load_people.sql` | 333 |
| 6 | `06_load_businesses.sql` | 176 |
| 7 | `07_load_leaflets.sql` | 1 |
| 8 | `08_load_events.sql` | 2 |
| 9 | `09_load_routes.sql` | 153 |
| 10 | `10_load_task_templates.sql` | 3 |
| 11 | `11_load_comm_settings.sql` | 5 |
| 12 | `12_load_volunteer_asks.sql` | 3 |
| 13 | `13_load_tasks.sql` | 3 |
| 14 | `14_load_deliveries.sql` | 153 |
| 15 | `15_load_sponsorships.sql` | 1 |
| 16 | `16_load_payments.sql` | 1 |
| 17 | `17_load_committee_meetings.sql` | 1 |
| 18 | `18_load_committee_meeting_attendees.sql` | 1 |
| 19 | `19_load_action_items.sql` | 1 |
| 20 | `20_load_user_roles.sql` | 14 |

**Then:** run **`02_setup_rls.sql`**, then **`03_setup_rls_remaining.sql`** (RLS — run once, last step)

**Before step 20:** use **`00_load_auth_users_and_roles.sql`** instead of step 20.

### Tables with no data (nothing to load)

event_templates, event_volunteers, committee_default_attendees, fundraising_donations, tshirt_preorders, volunteers

---

## Regenerate load files (only if CSVs change)

```bash
python3 database_exports/generate_load_sql.py
```
