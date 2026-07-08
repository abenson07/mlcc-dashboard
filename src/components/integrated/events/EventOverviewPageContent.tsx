"use client";

import Link from "next/link";
import { IconCalendar, IconPlus } from "@/components/leaflet/icons";
import { formatEventTimeRange } from "@/lib/events/eventData";
import { useEventContext } from "./EventContext";
import PublishEventButton from "./PublishEventButton";

export default function EventOverviewPageContent() {
  const {
    eventId,
    event,
    loading,
    error,
    tasks,
    tasksOpenTotal,
    toggleTask,
    readOnly,
    volunteerAsks,
    volunteerSignupTotal,
    budget,
    sponsorshipTiers,
  } = useEventContext();

  if (loading && !event) {
    return <p className="lf-meta">Loading event…</p>;
  }

  if (error && !event) {
    return <p className="lf-text-red">{error}</p>;
  }

  if (!event) {
    return (
      <div className="lf-empty-page">
        <h1 className="lf-h2">Event not found</h1>
        <Link href="/old-admin/events" className="lf-link">Back to events</Link>
      </div>
    );
  }

  const openTasks = tasks.filter((t) => !t.is_complete).slice(0, 2);

  const volunteerPreview = volunteerAsks
    .flatMap((ask) =>
      ask.signups.map((signup) => ({
        id: signup.id,
        name: signup.person?.full_name ?? "Volunteer",
        role: ask.title,
      })),
    )
    .slice(0, 3);

  const timeRange = event.starts_at
    ? formatEventTimeRange({
        starts_at: event.starts_at,
        ends_at: event.ends_at,
        name: event.title,
        id: event.id,
        date: null,
        event_template_id: event.event_template_id,
        slug: event.slug,
        field_data: event.fieldData,
        publish_status: event.publishStatus,
        created_at: "",
        updated_at: "",
      })
    : "—";

  return (
    <div className="lf-overview-layout">
      <div className="lf-overview-main">
        <div className="lf-hero">
          <h1 className="lf-h1">{event.title}</h1>
          <div className="lf-hero-meta">
            <span className="lf-meta">{event.daysUntilLabel}</span>
            <span className="lf-hero-date">
              <IconCalendar />
              {event.distributionLabel}
            </span>
          </div>
          <PublishEventButton />
        </div>

        <section className="lf-overview-card">
          <div className="lf-overview-card-header">
            <span className="lf-overview-card-title">To-do checklist</span>
            <span className="lf-meta">
              {tasksOpenTotal} item{tasksOpenTotal === 1 ? "" : "s"} to finish
            </span>
          </div>
          {openTasks.length === 0 && (
            <p className="lf-meta">No open tasks — you&apos;re all caught up.</p>
          )}
          {openTasks.map((task) => (
            <label key={task.id} className="lf-task-box">
              <input
                type="checkbox"
                checked={task.is_complete}
                disabled={readOnly}
                onChange={() => void toggleTask(task.id)}
              />
              <span>
                <span>{task.title}</span>
                <span className={task.isOverdue ? "lf-task-due lf-task-due--overdue" : "lf-task-due"}>
                  {task.dueLabel}
                </span>
              </span>
            </label>
          ))}
          <Link href={`/old-admin/events-hub/${eventId}/schedule`} className="lf-see-all">
            See all items in checklist ({tasks.length})
          </Link>
        </section>

        <div className="lf-overview-mid-row">
          <section className="lf-overview-card">
            <div className="lf-overview-card-header">
              <span className="lf-overview-card-title">Volunteers</span>
              <span className="lf-meta">{volunteerSignupTotal} signed up</span>
            </div>
            {volunteerPreview.length === 0 && (
              <p className="lf-meta">No volunteer signups yet.</p>
            )}
            {volunteerPreview.map((v) => (
              <div key={v.id} className="lf-open-route">
                <span className="lf-avatar">{v.name.slice(0, 2).toUpperCase()}</span>
                <div className="lf-open-route-info">
                  <div className="lf-open-route-name">{v.name}</div>
                  <div className="lf-meta">{v.role}</div>
                </div>
                <span className="lf-status-badge lf-status-badge--green">Confirmed</span>
              </div>
            ))}
            <Link href={`/old-admin/events-hub/${eventId}/volunteers`} className="lf-see-all">
              See all
            </Link>
            <Link href={`/old-admin/events-hub/${eventId}/volunteers`} className="lf-view-all-btn">
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
              <span className="lf-metric-strong">{budget.progressPct}%</span>
            </div>
            <div className="lf-progress-track">
              <div className="lf-progress-fill" style={{ width: `${budget.progressPct}%` }} />
            </div>
            <div className="lf-budget-metrics">
              <div className="lf-budget-metric">
                <div className="lf-budget-metric-label">Goal</div>
                <div className="lf-budget-metric-value">${budget.goal.toLocaleString()}</div>
              </div>
              <div className="lf-budget-metric">
                <div className="lf-budget-metric-label">Raised</div>
                <div className="lf-budget-metric-value">${budget.raised.toLocaleString()}</div>
              </div>
              <div className="lf-budget-metric">
                <div className="lf-budget-metric-label">Pledged</div>
                <div className="lf-budget-metric-value">${budget.pledged.toLocaleString()}</div>
              </div>
            </div>
            {sponsorshipTiers.length > 0 && (
              <>
                <p className="lf-line-items-label">Available levels</p>
                {sponsorshipTiers.slice(0, 2).map((tier) => (
                  <div key={tier.name} className="lf-line-item">
                    <span>{tier.name}</span>
                    <span className="lf-qty-badge lf-qty-badge--paid">{tier.left}</span>
                  </div>
                ))}
              </>
            )}
            <div className="lf-card-footer">
              <Link href={`/old-admin/events-hub/${eventId}/sponsorship`} className="lf-see-all">
                See all
              </Link>
            </div>
          </section>
        </div>
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
            <span>{timeRange}</span>
          </div>
          <div className="lf-detail-row">
            <span className="lf-detail-label">Location</span>
            <span>{event.fieldData.location ?? "—"}</span>
          </div>
          {event.fieldData.capacity != null && (
            <div className="lf-detail-row">
              <span className="lf-detail-label">Capacity</span>
              <span>{event.fieldData.capacity}</span>
            </div>
          )}
        </section>

        <section className="lf-overview-card">
          <div className="lf-overview-card-header">
            <span className="lf-overview-card-title">Event image</span>
          </div>
          {event.fieldData.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={event.fieldData.image_url} alt="" className="lf-event-image-placeholder" />
          ) : (
            <div className="lf-event-image-placeholder" />
          )}
        </section>

        {event.fieldData.qr_code_id && (
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
        )}
      </aside>
    </div>
  );
}
