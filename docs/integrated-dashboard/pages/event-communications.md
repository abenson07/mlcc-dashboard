# Event Communications — Data Wiring Plan

> **Route:** `/events-hub/[eventId]/communications`  
> **Component:** placeholder in `src/app/(admin)/events-hub/[eventId]/communications/page.tsx`  
> **Design:** Referenced in `EventSidebar`; detailed UI in pen under event detail flows  
> **Status:** “Coming soon” placeholder — **no UI component yet**

---

## 1. Purpose

Manage timed email/outreach steps for an event — same conceptual model as leaflet **Deliverers → Communication panel** but scoped to `comm_settings.context = 'event'`.

Examples: save-the-date, volunteer recruitment blast, sponsor thank-you, day-of reminder.

---

## 2. Reference implementation

**Copy from:**

- `src/components/leaflet/deliverers/CommunicationPanel.tsx`
- `src/components/leaflet/deliverers/SendConfirmationModal.tsx`
- `hooks/useCommSettings.ts`
- `src/lib/leaflets/comm/sendLeafletComm.ts`

---

## 3. Database: `comm_settings`

| Column | Event usage |
|--------|-------------|
| `context` | `'event'` |
| `event_template_id` | Template-specific steps (nullable for global event steps) |
| `step_key` | Machine key (`save_the_date`, `volunteer_recruitment`, …) |
| `name` | Display label in UI |
| `resend_template_id` | Resend hosted template |
| `trigger` | `anchor_offset` or `on_activate` |
| `offset_days` | Relative to `events.starts_at` |
| `offset_time` | Time of day to send |
| `requires_response` | Show response stats if true |
| `is_enabled` | Gray out disabled steps |

### Seed example

```sql
insert into comm_settings (context, event_template_id, name, step_key, resend_template_id, trigger, offset_days)
values
  ('event', :templateId, 'Save the date', 'save_the_date', 're_xxx', 'anchor_offset', -60),
  ('event', :templateId, 'Volunteer recruitment', 'volunteer_recruitment', 're_yyy', 'anchor_offset', -30);
```

---

## 4. Send tracking

**No `comm_send_log` table** (per product decision). Track sends via:

| Scope | Stamp column |
|-------|--------------|
| Edition-wide blast | Add `events.comm_*_sent_at` columns **or** JSON `field_data.comm_sent` |
| Per-recipient | Defer — events may not need per-person tracking v1 |

**Recommend:** Add nullable timestamptz columns on `events` mirroring leaflets:

```sql
alter table events add column if not exists comm_save_the_date_sent_at timestamptz;
-- one column per step_key OR jsonb comm_sent_steps
```

Alternatively store in `field_data.comm_sent: { save_the_date: "2026-01-15T..." }`.

---

## 5. Recipients

Unlike leaflets (deliverers from `deliveries`), event comm recipients depend on step type:

| Step type | Recipient query |
|-----------|-----------------|
| All members | `people` where `membership_id` active |
| Volunteers | `volunteers` join `people` for `event_id` |
| Sponsors | `sponsorships` join `businesses` for `event_id` |
| Custom list | Manual selection (defer) |

Define `recipient_strategy` in `comm_settings` **or** hardcode per `step_key` in send function.

---

## 6. API routes (new)

Mirror leaflet comm routes:

| Route | Purpose |
|-------|---------|
| `POST /api/events/[id]/comm/[stepKey]/send` | Blast step to resolved recipients |
| `POST /api/events/[id]/comm/resend` | Resend to one email/person |

Implementation:

1. Load `comm_settings` for step.
2. Load `events` row for merge fields + anchor date.
3. Resolve recipients per strategy.
4. Call Resend (`src/lib/resend.ts`).
5. Stamp send timestamp.

---

## 7. UI components to build

| Component | Behavior |
|-----------|----------|
| `EventCommunicationsPageContent.tsx` | Stage list (completed / active / upcoming) |
| `EventCommStageCard.tsx` | Copy from leaflet comm stage |
| `SendEventCommModal.tsx` | Confirm + type-to-send pattern |

Load stages via:

```ts
buildCommStages(commSettings, eventRow, recipientStats)
```

Generalize `buildCommStages` in `leafletData.ts` to accept event anchor + stats.

---

## 8. Merge fields (Resend templates)

| Variable | Source |
|----------|--------|
| `{{event_name}}` | `events.name` |
| `{{event_date}}` | formatted `starts_at` |
| `{{event_location}}` | `field_data.location` |
| `{{volunteer_url}}` | Public signup link |
| `{{recipient_name}}` | `people.full_name` |

---

## 9. Dependencies

- Resend templates created + IDs in `comm_settings` (human task — same as leaflet phase I).
- [event-overview.md](./event-overview.md) — optional comm summary widget.
- [events-list.md](./events-list.md) — event row exists.

---

## 10. Out of scope (v1)

- Automated cron sends (manual “Send now” only).
- Per-recipient response tracking (unless `requires_response` + public URLs added later).
- SMS / volunteer ask integration (separate from email comm).

---

## 11. Verification checklist

- [ ] Stages render from `comm_settings` for event’s template.
- [ ] Active step shows Send button; upcoming disabled until prior sent.
- [ ] Send posts to Resend and stamps timestamp.
- [ ] Completed stage shows sent date.
- [ ] Resend to individual works.
- [ ] Leaflet comm unaffected (regression).

---

## 12. Files to touch

| File | Change |
|------|--------|
| `EventCommunicationsPageContent.tsx` | New |
| `src/lib/events/comm/sendEventComm.ts` | New (copy leaflet) |
| `api/events/[id]/comm/[stepKey]/send/route.ts` | New |
| `api/events/[id]/comm/resend/route.ts` | New |
| Migration | `events.comm_*_sent_at` or JSON field |
| `hooks/useCommSettings.ts` | Support `context='event'` + template filter |
