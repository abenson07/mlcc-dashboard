# Leaflet dashboard — phased build plans

Step-by-step plans for phases **A → M** from [`docs/leaflet-dashboard-plan.md`](../leaflet-dashboard-plan.md).

| Phase | Plan | One-line goal |
|-------|------|----------------|
| **A** | [phase-a.md](./phase-a.md) | TypeScript schemas match DB |
| **B** | [phase-b.md](./phase-b.md) | Leaflet APIs + hooks |
| **C** | [phase-c.md](./phase-c.md) | `/admin/leaflet` shell UI |
| **D** | [phase-d.md](./phase-d.md) | Overview + empty state |
| **E** | [phase-e.md](./phase-e.md) | Routes + Open Routes |
| **F** | [phase-f.md](./phase-f.md) | Deliverers + send modal |
| **G** | [phase-g.md](./phase-g.md) | Substitutions |
| **H** | [phase-h.md](./phase-h.md) | Sponsorships + Stripe |
| **I** | [phase-i.md](./phase-i.md) | Resend comm workflow |
| **J** | [phase-j.md](./phase-j.md) | Public deliverer URLs |
| **K** | [phase-k.md](./phase-k.md) | Close-out banner + modals |
| **L** | [phase-l.md](./phase-l.md) | Open-route email blast |
| **M** | [phase-m.md](./phase-m.md) | Membership QR download |

**Run in order.** Do not skip ahead — later phases depend on earlier ones.

---

## Human tasks (read this first)

All **your** tasks are collected in **[00-human-checklist.md](./00-human-checklist.md)**.

Tasks are grouped so you can:

1. **Do a short batch now** (~15–20 min) before leaving — verify DB, set env secrets, start Resend templates.
2. **Let the agent run A → H** (and much of I–M) without you.
3. **Do a longer batch when you're back** — paste Resend template IDs, click-test pages, send a test email.

---

## How to use these plans

1. Open **[00-human-checklist.md](./00-human-checklist.md)** and complete **Batch 1** (if not already done).
2. Tell the agent: *"Implement phase A"* (then B, C, … in order).
3. When a plan says **⏸ Pause for you**, complete that checklist item before the next phase.
4. Mark phases done in the table below as you go.

### Progress tracker

| Phase | Status | Notes |
|-------|--------|-------|
| A | ✅ | Schemas |
| B | ✅ | APIs + hooks |
| C | ✅ | Shell at `/leaflet` |
| D | ✅ | Overview |
| E | ✅ | Routes + Open Routes |
| F | ✅ | Deliverers + modal (send = 501 until I) |
| G | ✅ | Substitutions |
| H | ✅ | Sponsorships + Stripe metadata |
| I | ✅ | Resend sends (templates synced ✅) |
| J | ✅ | Public deliverer URLs |
| K | ✅ | Close-out banner + modals |
| L | ✅ | Open-route email blast |
| M | ✅ | Membership QR download |

---

## Design reference

Screens live in **`integrated-dashboard.pen`** (repo root). Node IDs are listed in each UI phase plan and in the master plan §10.
