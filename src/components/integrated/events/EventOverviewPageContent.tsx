"use client";

import Link from "next/link";
import { IconArrowRight, IconCalendar, IconPlus } from "@/components/leaflet/icons";
import { getEventById } from "../mockData";

export default function EventOverviewPageContent({ eventId }: { eventId: string }) {
  const event = getEventById(eventId);

  return (
    <div className="lf-overview-layout">
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
            <span className="lf-meta">2 items to finish</span>
          </div>
          <label className="lf-task-box">
            <input type="checkbox" />
            <span>
              <span>Finalize vendor list</span>
              <span className="lf-task-due">Due May 20</span>
            </span>
          </label>
          <label className="lf-task-box">
            <input type="checkbox" />
            <span>
              <span>Open volunteer applications</span>
              <span className="lf-task-due">Due May 1</span>
            </span>
          </label>
          <Link href={`/events-hub/${eventId}/schedule`} className="lf-see-all">
            See all items in checklist (12)
          </Link>
        </section>

        <div className="lf-overview-mid-row">
          <section className="lf-overview-card">
            <div className="lf-overview-card-header">
              <span className="lf-overview-card-title">Volunteers</span>
              <span className="lf-meta">12 signed up</span>
            </div>
            {[
              { name: "Mitch Chae", role: "Safety lead", status: "green" },
              { name: "Marcus Aurel", role: "Registration", status: "green" },
              { name: "Elena Ruiz", role: "Food & drinks", status: "amber" },
            ].map((v) => (
              <div key={v.name} className="lf-open-route">
                <span className="lf-avatar">{v.name.slice(0, 2).toUpperCase()}</span>
                <div className="lf-open-route-info">
                  <div className="lf-open-route-name">{v.name}</div>
                  <div className="lf-meta">{v.role}</div>
                </div>
                <span className={v.status === "amber" ? "lf-dot lf-dot--amber" : "lf-dot lf-dot--green"} />
              </div>
            ))}
            <Link href={`/events-hub/${eventId}/volunteers`} className="lf-view-all-btn">
              <IconPlus />
              Add volunteer
            </Link>
          </section>

          <section className="lf-overview-card">
            <div className="lf-overview-card-header">
              <span className="lf-overview-card-title">Budget & sponsorships</span>
            </div>
            <div className="lf-metric-row">
              <span className="lf-metric-label">Sponsorship goal progress</span>
              <span className="lf-metric-strong">76%</span>
            </div>
            <div className="lf-progress-track">
              <div className="lf-progress-fill" style={{ width: "76%" }} />
            </div>
            <div className="lf-budget-metrics">
              <div className="lf-budget-metric">
                <div className="lf-budget-metric-label">Goal</div>
                <div className="lf-budget-metric-value">$15,000</div>
              </div>
              <div className="lf-budget-metric">
                <div className="lf-budget-metric-label">Raised</div>
                <div className="lf-budget-metric-value">$11,400</div>
              </div>
              <div className="lf-budget-metric">
                <div className="lf-budget-metric-label">Pledged</div>
                <div className="lf-budget-metric-value">$3,700</div>
              </div>
            </div>
            <p className="lf-line-items-label">Available levels</p>
            <div className="lf-line-item">
              <span>Platinum</span>
              <span className="lf-qty-badge lf-qty-badge--paid">1 left</span>
            </div>
            <div className="lf-line-item">
              <span>Silver</span>
              <span className="lf-qty-badge lf-qty-badge--paid">4 left</span>
            </div>
            <Link href={`/events-hub/${eventId}/sponsorship`} className="lf-see-all">
              See all sponsorship levels and earnings
            </Link>
          </section>
        </div>

        <section className="lf-overview-card">
          <div className="lf-overview-card-header">
            <span className="lf-overview-card-title">Marketing</span>
            <span className="lf-meta">4 scheduled campaigns</span>
          </div>
          <div className="lf-story-list">
            {[
              { date: "Jan 20", status: "Scheduled", title: "Sponsor thank you email" },
              { date: "Feb 1", status: "Draft", title: "Volunteer recruitment post" },
              { date: "Mar 15", status: "Scheduled", title: "Event reminder email" },
            ].map((item) => (
              <div key={item.title} className="lf-story-row">
                <span className="lf-story-date lf-meta">{item.date}</span>
                <span className="lf-story-badge">{item.status}</span>
                <span>{item.title}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <aside className="lf-overview-aside">
        <section className="lf-overview-card">
          <div className="lf-overview-card-header">
            <span className="lf-overview-card-title">Details</span>
          </div>
          <div className="lf-detail-icon-row">
            <span className="lf-detail-label">Date</span>
            <span className="lf-detail-icon-value">
              <IconCalendar />
              {event.distributionLabel}
            </span>
          </div>
          <div className="lf-detail-row">
            <span className="lf-detail-label">Time</span>
            <span>12:00 PM – 4:00 PM</span>
          </div>
          <div className="lf-detail-row">
            <span className="lf-detail-label">Location</span>
            <span>Mooreland Park</span>
          </div>
          <div className="lf-detail-row">
            <span className="lf-detail-label">Capacity</span>
            <span>500 attendees</span>
          </div>
          <div className="lf-detail-row">
            <span className="lf-detail-label">Status</span>
            <span className="lf-status-pill lf-status-pill--blue">Planning</span>
          </div>
        </section>

        <section className="lf-overview-card">
          <div className="lf-overview-card-header">
            <span className="lf-overview-card-title">Event image</span>
          </div>
          <div className="lf-event-image-placeholder" />
          <button type="button" className="lf-link">
            Replace image
          </button>
        </section>

        <section className="lf-overview-card">
          <div className="lf-overview-card-header">
            <span className="lf-overview-card-title">QR code</span>
          </div>
          <div className="lf-qr-block">
            <div className="lf-qr-preview lf-qr-preview--placeholder" />
            <div className="lf-qr-meta">
              <p className="lf-meta">Scan for event info page</p>
              <button type="button" className="lf-btn lf-btn--outline">
                Download QR code
              </button>
            </div>
          </div>
        </section>
      </aside>
    </div>
  );
}
