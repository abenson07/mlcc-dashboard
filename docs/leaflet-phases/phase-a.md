# Phase A — Schemas + types

**Goal:** TypeScript types in `schemas/` match the database you migrated. RLS is already in SQL — no more DB work in this phase.

**Depends on:** SQL migrations `01`–`05` applied (you: ✅).

---

## YOUR TASKS

| # | Task | When |
|---|------|------|
| A.1 | Run Batch **1.1** verification queries in [00-human-checklist.md](./00-human-checklist.md) | Before asking agent to start |
| A.2 | Run Batch **1.2** — add `LEAFLET_RESPONSE_SIGNING_SECRET` to `.env.local` | Before leaving (optional for A, required before J) |
| A.3 | After agent finishes: run `npm run build` locally; report any errors | ~2 min when back |

**You do not write schema files** — agent does.

---

## AGENT TASKS

1. **Create** `schemas/leaflets.ts` — `LeafletStatus`, row + Insert + Update.
2. **Create** `schemas/event_templates.ts`.
3. **Create** `schemas/tasks.ts` — `TaskTemplates` + `Tasks`, `WorkflowContext`.
4. **Create** `schemas/comm_settings.ts` — `CommTrigger`, row + Insert + Update.
5. **Update** `schemas/deliveries.ts` — all columns from `04_alter_deliveries.sql`; `DeliveryResponse` enum; nullable `person_id` / `date_delivered`.
6. **Update** `schemas/routes.ts` — building contact fields; remove `secondary_deliverer_id`, `is_skipped`.
7. **Update** `schemas/sponsorships.ts` — `id`, `leaflet_id`, `description`, `image_url`, `quantity`.
8. **Update** `schemas/events.ts` — `event_template_id`, `starts_at`, `ends_at`, `slug`, `field_data`, timestamps.
9. **Update** `schemas/index.ts` — export all new types/enums.
10. **Update** `src/types/database.ts` — re-export new types for hooks.

---

## VERIFICATION

| Check | Who |
|-------|-----|
| `npm run build` passes | You (A.3) |
| No `placeholder_*` in code — only in DB `comm_settings` | Agent |
| `useRoutes` still compiles (may warn on dropped columns until Phase B) | Agent |

---

## HANDOFF → Phase B

Schemas are done when build passes. Agent proceeds to hooks + APIs.
