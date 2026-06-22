"use client";

import Link from "next/link";
import { IconArrowRight, IconCalendar, IconPlus } from "@/components/leaflet/icons";
import {
  EVENT_BUDGET,
  EVENT_SPONSORSHIP_TIERS,
  getEventById,
  MOCK_EVENT_TASKS_PREVIEW,
  MOCK_EVENT_VOLUNTEERS_PREVIEW,
  MOCK_MARKETING_ITEMS,
} from "../mockData";

type EventOverviewContentProps = {
  eventId: string;
};

export default function EventOverviewContent({ eventId }: EventOverviewContentProps) {
  const event = getEventById(eventId);

  return (
    <div className="lf-event-overview-layout">
      <div className="lf-overview-main">
        <div className="lf-hero">
          <h1 className="lf-h1">{event.title}</h1>
          <div className="lf-hero-meta">
            <span className="lf-meta">{event.daysUntil} days until event</span>
            <span className="lf-hero-date">
              <IconCalendar />
              {event.distributionLabel}
            </span>
          </div>
        </div>

        <section className="lf-overview-card">
          <div className="lf-overview-card-header">
            <span className="lf-overview-card-title">To-do checklist</span>
            <span className="lf-meta">3 items to finish</span>
          </div>
          {MOCK_EVENT_TASKS_PREVIEW.map((task) => (
            <label key={task.id} className="lf-task-box">
              <input type="checkbox" checked={task.complete} readOnly />
              <span>
                <span className={task.complete ? "lf-task-done" : undefined}>{task.title}</span>
                <span className="lf-task-due">{task.due}</span>
              </span>
            </label>
          ))}
          <Link href={`/events/${eventId}/schedule`} className="lf-see-all">
            See full list of tasks
          </Link>
        </section>

        <section className="lf-overview-card">
          <div className="lf-overview-card-header">
            <span className="lf-overview-card-title">Volunteers</span>
            <span className="lf-meta">4 signed up</span>
          </div>
          {MOCK_EVENT_VOLUNTEERS_PREVIEW.map((v) => (
            <div key={v.id} className="lf-open-route">
              <span className="lf-avatar">{v.name.split(" ").map((n) => n[0]).join("")}</span>
              <div className="lf-open-route-info">
                <div className="lf-open-route-name">{v.name}</div>
                <div className="lf-meta">{v.role}</div>
              </div>
              <span className={`lf-dot lf-dot--${v.status === "green" ? "green" : "amber"}`} />
            </div>
          ))}
          <Link href={`/events/${eventId}/volunteers`} className="lf-view-all-btn">
            <IconPlus />
            Add a volunteer
          </Link>
        </section>

        <div className="lf-overview-mid-row">
          <section className="lf-overview-card">
            <div className="lf-overview-card-header">
              <span className="lf-overview-card-title">Budget & sponsorship</span>
            </div>
            <div className="lf-metric-row">
              <span className="lf-meta">Sponsorship goal reached</span>
              <span>{EVENT_BUDGET.progressPct}%</span>
            </div>
            <div className="lf-progress-track" style={{ marginBottom: 12 }}>
              <div className="lf-progress-fill" style={{ width: `${EVENT_BUDGET.progressPct}%` }} />
            </div>
            <div className="lf-budget-metrics">
              <div className="lf-budget-metric">
                <div className="lf-budget-metric-label">Goal</div>
                <div className="lf-budget-metric-value">${EVENT_BUDGET.goal.toLocaleString()}</div>
              </div>
              <div className="lf-budget-metric">
                <div className="lf-budget-metric-label">Raised</div>
                <div className="lf-budget-metric-value">${EVENT_BUDGET.raised.toLocaleString()}</div>
              </div>
              <div className="lf-budget-metric">
                <div className="lf-budget-metric-label">Remaining</div>
                <div className="lf-budget-metric-value">${(EVENT_BUDGET.goal - EVENT_BUDGET.raised).toLocaleString()}</div>
              </div>
            </div>
            <Link href={`/events/${eventId}/sponsorship`} className="lf-see-all">
              See all sponsor and budget details
            </Link>
          </section>

          <section className="lf-overview-card">
            <div className="lf-overview-card-header">
              <span className="lf-overview-card-title">Marketing</span>
              <span className="lf-meta">4 scheduled items</span>
            </div>
            <div className="lf-story-list">
              {MOCK_MARKETING_ITEMS.map((item) => (
                <div key={item.title} className="lf-story-row">
                  <span className="lf-story-date lf-meta">{item.date}</span>
                  <span className="lf-story-badge" style={{ background: item.color }}>{item.channel}</span>
                  <span>{item.title}</span>
                </div>
              ))}
            </div>
            <Link href={`/events/${eventId}/marketing`} className="lf-see-all">
              View marketing schedule
            </Link>
          </section>
        </div>
      </div>

      <aside className="lf-overview-aside">
        <section className="lf-card">
          <div className="lf-card-header"><span className="lf-card-title">Details</span></div>
          <div className="lf-card-body">
            <div className="lf-detail-icon-row"><span className="lf-detail-label">Date</span><span>{event.distributionLabel}</span></div>
            <div className="lf-detail-icon-row"><span className="lf-detail-label">Time</span><span>12:00 pm – 4:00 pm</span></div>
            <div className="lf-detail-icon-row"><span className="lf-detail-label">Location</span><span>Mooreland Park</span></div>
            <div className="lf-detail-icon-row"><span className="lf-detail-label">Capacity</span><span>500 attendees</span></div>
            <div className="lf-detail-icon-row"><span className="lf-detail-label">Status</span><span>{event.status}</span></div>
          </div>
        </section>

        <section className="lf-card">
          <div className="lf-card-header"><span className="lf-card-title">Event image</span></div>
          <div className="lf-card-body">
            <div className="lf-event-image-thumb" style={{ width: "100%", height: 120 }} />
            <button type="button" className="lf-see-all">Replace image</button>
          </div>
        </section>

        <section className="lf-card">
          <div className="lf-card-header"><span className="lf-card-title">QR code</span></div>
          <div className="lf-card-body" style={{ textAlign: "center" }}>
            <div className="lf-qr-block-sm" />
            <p className="lf-meta">Scan for more event info</p>
            <button type="button" className="lf-small-btn">Download QR code</button>
          </div>
        </section>

        <section className="lf-card">
          <div className="lf-card-header"><span className="lf-card-title">Activity</span></div>
          <div className="lf-card-body">
            <p className="lf-meta">Erica checked the box · Jun 28</p>
            <Link href={`/events/${eventId}/details`} className="lf-link">
              Edit event details <IconArrowRight />
            </Link>
          </div>
        </section>
      </aside>
    </div>
  );
}
