# Phase L — Open-route email blast

**Goal:** From Open Routes detail panel, email past deliverers asking if they can cover a route.

**Depends on:** Phases E, J (signed links optional in email body).

---

## YOUR TASKS

| # | Task | When |
|---|------|------|
| L.1 | Resend templates + Batch 2.1 must be done | Same as Phase I |
| L.2 | Pick an open route with past deliverers in history; click email on one past deliverer | After agent done |
| L.3 | Confirm email received | You |

Optional: create a dedicated Resend template `open_route_volunteer_ask` — if you want one, add row to `comm_settings` or tell agent to use inline HTML for v1.

---

## AGENT TASKS

1. **`POST /api/leaflets/[id]/open-routes/email`**:
   - Body: `deliveryId`, `personId` (past deliverer), optional message
   - Load route + leaflet context
   - Send via Resend to past deliverer's email
   - Log sent_at on delivery or lightweight audit (no new table — optional note on delivery)

2. Wire **Past deliverers** rows in Open Routes detail panel (Phase E):
   - Email icon / button per person
   - Optional: “Are you interested in delivering this route?” copy from design

3. Email content: route name, leaflet title, link to volunteer (assign flow or public signup).

---

## VERIFICATION

| Check | Who |
|-------|-----|
| Email only sends to selected past deliverer | Agent |
| You receive test email | You (L.2) |

---

## HANDOFF → Phase M

Open-route outreach works. QR download last.
