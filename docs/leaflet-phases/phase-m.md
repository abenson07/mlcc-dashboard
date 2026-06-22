# Phase M — Membership QR download on leaflet

**Goal:** Each leaflet has `membership_qr_code_id`; admin can download QR for print/digital from the dashboard.

**Depends on:** Phase B (`createLeaflet` already creates `qr_codes` row).

---

## YOUR TASKS

| # | Task | When |
|---|------|------|
| M.1 | Decide QR destination URL (membership signup page + UTM/source param) | Before or during phase |
| M.2 | Download QR from UI; scan with phone to confirm landing page | After agent done |

**Default URL suggestion:** your public membership join URL with `?source=leaflet-{edition_slug}` — tell agent your preferred URL in M.1.

---

## AGENT TASKS

1. **`useLeafletQr.ts`** or extend `useLeaflets` — fetch linked `qr_codes` row.
2. **Download control** on Overview (Distribution Info widget) or Sponsorships sidebar:
   - PNG/SVG of QR encoding `qr_codes.url`
   - Reuse `useQrCodes` / existing QR storage patterns from Communications.
3. Ensure `createLeaflet` sets sensible default URL if not provided at create time.
4. Optional: edit URL before download (PATCH `qr_codes.url`).

---

## VERIFICATION

| Check | Who |
|-------|-----|
| New leaflet has `membership_qr_code_id` set | Agent |
| Download produces scannable image | You (M.2) |
| Scan opens correct URL | You (M.2) |

---

## DONE

All phases A–M complete. Run Batch **5** (production env + deploy smoke test).

See [README.md](./README.md) to mark progress tracker complete.
