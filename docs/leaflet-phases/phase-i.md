# Phase I — Resend comm workflow

**Goal:** Manual “Send now” for leaflet comm steps; stamp `leaflets` / `deliveries` comm timestamps.

**Depends on:** Phase B, F; **blocked until you complete Batch 2.1** (real Resend template IDs in DB).

---

## YOUR TASKS

| # | Task | When | Required |
|---|------|------|----------|
| I.1 | **Batch 2.1** — UPDATE `comm_settings` with real Resend template IDs | Before starting this phase | **Yes** |
| I.2 | **Batch 4.1** — send test confirmation email from Deliverers UI | After agent done | Yes |
| I.3 | Confirm merge variables in Resend templates match plan (see Batch 1.4 table) | Before I.2 | Yes |

If templates are wrong, emails send but links/merge fields will be blank — fix in Resend, not code.

---

## AGENT TASKS

### Lib

1. **`src/lib/leaflets/comm/sendLeafletComm.ts`**:
   - Load `comm_settings` for step
   - Resolve recipients from `deliveries` (+ building contact rules if `building_contact_is_deliverer`)
   - Build signed `confirm_url` per delivery (uses `LEAFLET_RESPONSE_SIGNING_SECRET`)
   - Send via `src/lib/resend.ts`
   - Stamp correct column on `leaflets` or `deliveries` per step_key table in master plan §2.9

### API routes

| Route | Purpose |
|-------|---------|
| `POST /api/leaflets/[id]/comm/[stepKey]/send` | Edition-wide or per-delivery blast |
| `POST /api/leaflets/[id]/comm/resend` | Individual deliverer remind |

### UI wiring

3. Connect **Send confirmation modal** (Phase F) to real API.
4. Connect Communication panel stages to sent timestamps + response stats.
5. Per-deliverer **resend** on DelivererCard.

### Activate hook

6. On `POST /api/leaflets/[id]/activate` — optional auto-send `initial_confirmation` (`trigger = on_activate`) or leave manual per product choice (plan says send on activate — implement that).

---

## VERIFICATION

| Check | Who |
|-------|-----|
| `comm_initial_confirmation_sent_at` set after send | Agent |
| Email received with working `confirm_url` | You (I.2) |
| No `placeholder_*` template IDs in DB | You (I.1) |

---

## HANDOFF → Phase J

Comms send for real. Public respond URLs next (can run parallel with K prep).
