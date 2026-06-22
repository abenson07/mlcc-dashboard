# Event Marketing — Data Wiring Plan

> **Route:** `/events-hub/[eventId]/marketing`  
> **Component:** placeholder page  
> **Design:** Marketing card on event overview (`O7GJT`); full page TBD in pen  
> **Status:** Placeholder — **no UI component yet**

---

## 1. Purpose

Schedule and track **marketing campaigns** for an event: email broadcasts (Resend) and social posts (Buffer). Overview card shows preview list; this page is the full management view.

---

## 2. Existing integrations (no event filter yet)

| Channel | API | Data returned |
|---------|-----|---------------|
| Email broadcasts | `GET /api/marketing/email/broadcasts` | Resend broadcasts: subject, status, scheduled_at |
| Social posts | `GET /api/buffer/posts` | Buffer scheduled/published posts |
| Email compose | `POST /api/marketing/email/send`, `/draft` | Create new broadcast |
| Social create | `POST /api/buffer/posts` | Schedule social post |
| AI compose | `POST /api/marketing/events/compose` | Draft from event brief |

**Gap:** None of these APIs attach `event_id` metadata today.

---

## 3. Linking campaigns to events

### Option A — Metadata on create (recommended)

When scheduling from event marketing page, pass `event_id`:

**Resend broadcast metadata:**

```json
{ "event_id": "<uuid>", "event_name": "Summer Block Party" }
```

**Buffer post** — store in caption prefix or custom field if API supports; else maintain mapping table:

```sql
create table public.event_marketing_links (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  channel text not null check (channel in ('resend_broadcast', 'buffer_post')),
  external_id text not null,
  created_at timestamptz not null default now(),
  unique (channel, external_id)
);
```

### Option B — Mapping table only

Insert row after every successful Buffer/Resend create from dashboard.

---

## 4. UI to build: `EventMarketingPageContent.tsx`

| Section | Content |
|---------|---------|
| Header | “Marketing” + “N scheduled campaigns” |
| Actions | Edit, Share (design icons), + Schedule campaign |
| Campaign list | Rows: date, status badge, campaign name |
| Filters | Scheduled / Draft / Sent |

### Row mapping

| UI column | Email source | Social source |
|-----------|--------------|---------------|
| Date | `scheduled_at` | Buffer `scheduled_at` |
| Status | Resend `status` | Buffer post status |
| Name | `subject` | First line of caption |

Merge and sort by date descending (overview card uses same aggregator).

---

## 5. Schedule campaign flow

### Email

1. Modal: subject, body (rich text), schedule date.
2. `POST /api/marketing/email/draft` or `/send`.
3. Insert `event_marketing_links` row.

Reuse UI patterns from `/(others-pages)/marketing/email`.

### Social

1. Modal: channel picker (Instagram/Facebook), caption, image, schedule time.
2. `POST /api/buffer/posts`.
3. Link row insert.

---

## 6. Event overview card

Wire marketing preview in [event-overview.md](./event-overview.md):

```ts
const campaigns = useEventMarketing(eventId);
// show first 3 rows + link to /marketing
```

---

## 7. `field_data` alternative (lightweight)

Store planned campaigns in JSON before external send:

```json
{
  "marketing_planned": [
    { "date": "2026-01-20", "status": "scheduled", "title": "Sponsor thank you email", "channel": "email" }
  ]
}
```

**Not recommended** as sole source — drifts from Resend/Buffer truth.

---

## 8. Dependencies

- Buffer + Resend credentials configured.
- [events-list.md](./events-list.md).
- Optional migration for `event_marketing_links`.

---

## 9. Out of scope (v1)

- Stories / website publish (see [stories.md](./stories.md)).
- Ad campaign spend tracking.
- Analytics impressions/clicks.

---

## 10. Verification checklist

- [ ] List shows campaigns linked to `event_id` only.
- [ ] Schedule email creates Resend broadcast + link row.
- [ ] Schedule social creates Buffer post + link row.
- [ ] Overview marketing card matches full page data.
- [ ] Unlinked org-wide campaigns do not appear on event page.

---

## 11. Files to touch

| File | Change |
|------|--------|
| `EventMarketingPageContent.tsx` | New |
| `hooks/useEventMarketing.ts` | New — merge Buffer + Resend |
| `api/marketing/email/*` | Accept `event_id` metadata |
| `api/buffer/posts/route.ts` | Accept `event_id` on create |
| Migration | `event_marketing_links` (optional) |
