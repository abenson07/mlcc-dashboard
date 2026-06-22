# Phase J — Public deliverer respond URLs

**Goal:** Signed links in emails let deliverers confirm, request cover, reject, or report completion — no login.

**Depends on:** Phase B; **Batch 1.2** (`LEAFLET_RESPONSE_SIGNING_SECRET`).

---

## YOUR TASKS

| # | Task | When |
|---|------|------|
| J.1 | Batch **1.2** — signing secret in `.env.local` | Before agent starts |
| J.2 | Batch **4.2** — open `confirm_url` on phone; test confirm + needs cover | After agent done |
| J.3 | Batch **5** — add same secret to Vercel before production | Pre-deploy |

---

## AGENT TASKS

### Lib

1. **`src/lib/leaflets/signRespondUrl.ts`** — HMAC/JWT sign + verify; expiry (e.g. 30 days).
2. **`src/lib/leaflets/handleDelivererResponse.ts`** — map action → `deliveries` update:

| Action | DB update |
|--------|-----------|
| `confirm` | `response = confirmed`, `responded_at` |
| `needs_cover` | `is_skipped = true`, `person_id = null`, `response = needs_cover` |
| `reject` | remove deliverer, `response = rejected` |
| `complete` | `date_delivered`, `leaflets_delivered`, `leaflets_leftover` |

### API

3. **`GET /api/public/leaflet/respond`** — verify sig; render simple mobile-friendly page (route list + actions).
4. **`POST /api/public/leaflet/respond`** — apply action; no auth cookie required.

### Pages (optional)

5. Lightweight public page under `src/app/(full-width-pages)/leaflet/respond/` if cleaner than API-only HTML.

### Security

6. Rate limit / idempotent updates; reject expired or tampered sigs.

---

## VERIFICATION

| Check | Who |
|-------|-----|
| Invalid sig → 403 | Agent |
| Confirm updates row visible in Routes/Deliverers | You (J.2) |
| Needs cover appears in Open Routes + Substitutions | You (J.2) |

---

## HANDOFF → Phase K

Deliverer self-service works. Close-out UX next.
