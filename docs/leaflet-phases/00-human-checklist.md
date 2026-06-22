# Human checklist — all phases

Everything **you** must do, batched so the agent can run most of the build while you're away.

**Legend:** ✅ = you already did this · ⬜ = still to do

---

## Batch 1 — Do now (~15 min, before agent work)

Complete this once. Safe to do before leaving the house.

### 1.1 Confirm migrations ran ✅ (you said done)

Run in **Supabase → SQL Editor** to double-check:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'leaflets', 'event_templates', 'task_templates', 'tasks', 'comm_settings'
  )
ORDER BY 1;
-- Expect 5 rows.

SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'deliveries'
  AND column_name IN ('leaflet_id', 'is_skipped', 'response');
-- Expect 3 rows.
```

If any query returns fewer rows than expected, re-run the missing file from `supabase/migrations/leaflet-dashboard/` in order (`01` → `05`).

### 1.2 Add signing secret to `.env.local` ⬜

Public deliverer links (Phase J) need a server secret. **You** generate and add it (never commit):

```bash
openssl rand -hex 32
```

Add to `.env.local`:

```env
LEAFLET_RESPONSE_SIGNING_SECRET=<paste output here>
```

Also add to `.env.local` when you generate it (see **§11 Vercel deployment** before production).

### 1.3 Confirm Resend basics ⬜

Check `.env.local` already has (used by Phase I):

```env
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=MLCC <hello@yourdomain.com>
```

If missing, create a Resend API key and verify your sending domain in the [Resend dashboard](https://resend.com/domains).

### 1.4 Start Resend templates ✅

Templates created. Template IDs were synced to `comm_settings` automatically via:

```bash
node scripts/leaflet-sync-resend-templates.mjs --apply
```

Or run `06_update_comm_settings_resend_ids.sql` in Supabase SQL Editor.

To list templates from Resend API anytime:

```bash
node scripts/leaflet-sync-resend-templates.mjs --list
```

### 1.5 Optional: real task checklist copy ⬜

Default seeds are "Example task one/two/three". If you want real checklist items before Overview ships, run in Supabase SQL Editor:

```sql
UPDATE task_templates
SET title = 'Your real task', description = '...', offset_days = -42
WHERE context = 'leaflet' AND title = 'Example task one';
-- Repeat for two and three, or INSERT new rows.
```

Skip if placeholders are fine for now.

---

## Batch 2 — When agent finishes Phase H (~10 min)

Do this before asking for **Phase I** (Resend sends).

### 2.1 Paste Resend template IDs into Supabase ✅ (done via script)

Already applied if you ran `node scripts/leaflet-sync-resend-templates.mjs --apply` after creating templates.

Verify:

```sql
SELECT step_key, resend_template_id FROM comm_settings WHERE context = 'leaflet';
-- No row should still say placeholder_*
```

### 2.2 Create your first real leaflet ✅

After Phase B ships, either use the dashboard **Schedule new leaflet** button (Phase D) or ask the agent to run a one-off create. Minimum fields:

- **Title:** e.g. `Summer 2026`
- **Distribution date:** a future date

Confirm in Supabase:

```sql
SELECT id, title, status, distribution_date FROM leaflets ORDER BY created_at DESC LIMIT 1;

SELECT count(*) FROM deliveries WHERE leaflet_id = '<that id>';
-- Should equal count of rows in routes.
```

### 2.3 Activate the leaflet (when ready to test comms) ✅

Only one active leaflet at a time. Use dashboard **Activate** (Phase B/D) or:

```sql
-- Manual only if UI not ready; prefer dashboard.
UPDATE leaflets SET status = 'active', activated_at = now()
WHERE id = '<leaflet id>' AND status = 'planned';
```

---

## Batch 3 — After UI phases (~20 min click-test)

When agent reports Phase D–H done, log in locally (`npm run dev`) and walk through:

| URL | What to check |
|-----|----------------|
| `/admin/leaflet` | Overview or empty state loads |
| `/admin/leaflet/deliverers` | Deliverer cards appear |
| `/admin/leaflet/routes` | Table + detail panel |
| `/admin/leaflet/open-routes` | Open/skipped routes only |
| `/admin/leaflet/substitutions` | Skipped rows if any |
| `/admin/leaflet/sponsorships` | Budget + tables |

Note anything broken in a GitHub issue or back to the agent.

---

## Batch 4 — After Phase I & J (~10 min)

### 4.1 Send a test confirmation email ⬜

1. Go to **Deliverers** → Communication panel → **Send confirmation request**.
2. Type `confirm` in the modal.
3. Check your own inbox (or a test deliverer's email in `people`).

### 4.2 Test a public respond link ⬜

Open the `confirm_url` from the email on your phone:

- Confirm one route → status updates in **Routes** / **Deliverers**.
- Try **needs cover** → route should appear under **Open Routes** / **Substitutions**.

---

## Batch 5 — Before production deploy ⬜

See also **§11 Vercel deployment** in [`leaflet-dashboard-plan.md`](../leaflet-dashboard-plan.md).

- [ ] `LEAFLET_RESPONSE_SIGNING_SECRET` on Vercel (Production + Preview)
- [ ] `RESEND_API_KEY` + `RESEND_FROM_EMAIL` on Vercel
- [ ] Stripe keys already on Vercel (for sponsorship invoices, Phase H)
- [ ] Smoke-test `/admin/leaflet` on preview URL after deploy

---

## What you never need to do

- Write migration SQL again (unless Batch 1 verification fails)
- Manually create `deliveries` rows (app copies from `routes` on leaflet create)
- Create a substitutions table
- Wire topbar Site/People/Events/Stories tabs (deferred by design)
