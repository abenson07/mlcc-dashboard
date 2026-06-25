"use client";

import Link from "next/link";
import { IconArrowRight, IconCalendar, IconPlus } from "../icons";
import { daysUntilDistribution, formatDistributionDate } from "../leafletData";
import { leafletHref, useLeafletContext } from "../LeafletContext";
import MembershipQrDownload from "./MembershipQrDownload";

export default function OverviewContent() {
  const {
    leaflet,
    leafletId,
    tasks,
    tasksOpenTotal,
    toggleTask,
    readOnly,
    openRoutePreviews,
    stories,
    budget,
    budgetLineItems,
    timeline,
    deliveryStats,
    deliveries,
  } = useLeafletContext();

  if (!leaflet) {
    return <p className="lf-meta">Select a leaflet edition.</p>;
  }

  return (
    <div className="lf-overview-layout">
      <div className="lf-overview-main">
        <div className="lf-hero">
          <h1 className="lf-h1">{leaflet.title}</h1>
          <div className="lf-hero-meta">
            <span className="lf-meta">{daysUntilDistribution(leaflet.distribution_date)}</span>
            <span className="lf-hero-date">
              <IconCalendar />
              Distribution: {formatDistributionDate(leaflet.distribution_date)}
            </span>
          </div>
        </div>

        <section className="lf-overview-card">
          <div className="lf-overview-card-header">
            <span className="lf-overview-card-title">Tasks</span>
            <span className="lf-meta">{tasksOpenTotal} open tasks</span>
          </div>
          <p className="lf-task-group-label">Before distribution</p>
          {tasks.map((task) => (
            <label key={task.id} className="lf-task-box">
              <input
                type="checkbox"
                checked={task.is_complete}
                disabled={readOnly}
                onChange={() => toggleTask(task.id)}
              />
              <span>
                <span className={task.is_complete ? "lf-task-done" : undefined}>{task.title}</span>
                <span className="lf-task-due">{task.dueLabel}</span>
              </span>
            </label>
          ))}
          <Link href={leafletHref("/admin/leaflet/todo", leafletId)} className="lf-see-all">
            See all tasks
          </Link>
        </section>

        <div className="lf-overview-mid-row">
          <section className="lf-overview-card">
            <div className="lf-overview-card-header">
              <span className="lf-overview-card-title">Open routes</span>
              <span className="lf-meta">{deliveryStats.openRoutes} unassigned</span>
            </div>
            {openRoutePreviews.map((route) => (
              <div key={route.id} className="lf-open-route">
                <span className="lf-avatar">{route.initials}</span>
                <div className="lf-open-route-info">
                  <div className="lf-open-route-name">{route.name}</div>
                  <div className="lf-meta">{route.detail}</div>
                </div>
                <span className={route.dot === "amber" ? "lf-dot lf-dot--amber" : "lf-dot lf-dot--green"} />
              </div>
            ))}
            <Link href={leafletHref("/admin/leaflet/open-routes", leafletId)} className="lf-view-all-btn">
              <IconArrowRight />
              View all open routes
            </Link>
          </section>

          <section className="lf-overview-card">
            <div className="lf-overview-card-header">
              <span className="lf-overview-card-title">Budget & finances</span>
            </div>
            <div className="lf-metric-row">
              <span className="lf-metric-label">Print budget used</span>
              <span className="lf-metric-strong">{budget.progressPct}%</span>
            </div>
            <div className="lf-progress-track">
              <div className="lf-progress-fill" style={{ width: `${budget.progressPct}%` }} />
            </div>
            <div className="lf-budget-metrics">
              <div className="lf-budget-metric">
                <span className="lf-budget-metric-label">Print budget</span>
                <span className="lf-budget-metric-value">${budget.printBudget.toLocaleString()}</span>
              </div>
              <div className="lf-budget-metric">
                <span className="lf-budget-metric-label">Spent</span>
                <span className="lf-budget-metric-value">${budget.spent.toLocaleString()}</span>
              </div>
              <div className="lf-budget-metric">
                <span className="lf-budget-metric-label">Remaining</span>
                <span className="lf-budget-metric-value">${budget.remaining.toLocaleString()}</span>
              </div>
            </div>
            <p className="lf-line-items-label">Line items</p>
            {budgetLineItems.map((item) => (
              <div key={item.name} className="lf-line-item">
                <div>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>{item.name}</div>
                  <div className="lf-meta">{item.amount}</div>
                </div>
                <span className={item.statusTone === "paid" ? "lf-qty-badge lf-qty-badge--paid" : "lf-qty-badge lf-qty-badge--pending"}>
                  {item.status}
                </span>
              </div>
            ))}
            <Link href={leafletHref("/admin/leaflet/sponsorships", leafletId)} className="lf-view-all-btn lf-view-all-btn--dark">
              View full budget
            </Link>
          </section>
        </div>

        <section className="lf-overview-card">
          <div className="lf-overview-card-header">
            <div>
              <div className="lf-overview-card-title">Stories</div>
              <div className="lf-meta">Draft blog posts scheduled for release</div>
            </div>
            <button type="button" className="lf-small-btn">
              <IconPlus />
              Add story
            </button>
          </div>
          <div className="lf-story-list">
            {stories.map((story) => (
              <div key={story.id} className="lf-story-row">
                <div className="lf-story-date">
                  <div style={{ fontWeight: 600, fontSize: 12 }}>{story.date}</div>
                  <div className="lf-meta" style={{ fontSize: 11 }}>{story.time}</div>
                </div>
                <span className="lf-story-badge" style={{ color: story.badgeColor, background: story.badgeBg }}>
                  {story.type}
                </span>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>{story.title}</div>
                  <div className="lf-meta" style={{ fontSize: 11 }}>{story.status}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <aside className="lf-overview-aside">
        <section className="lf-card">
          <div className="lf-card-header"><span className="lf-card-title">Distribution</span></div>
          <div className="lf-card-body">
            <div className="lf-detail-row"><span className="lf-detail-label">Delivery date</span><span>{formatDistributionDate(leaflet.distribution_date)}</span></div>
            <div className="lf-detail-row"><span className="lf-detail-label">Leaflets to produce</span><span>{deliveries.reduce((sum, d) => sum + (d.leaflet_count ?? 0), 0).toLocaleString()} copies</span></div>
          </div>
        </section>

        <section className="lf-card">
          <div className="lf-card-header"><span className="lf-card-title">Distribution progress</span></div>
          <div className="lf-card-body">
            <div className="lf-timeline">
              {timeline.map((item, i) => (
                <div key={item.stage} className="lf-timeline-item">
                  <div className="lf-timeline-track">
                    <div className={item.active ? "lf-timeline-dot" : "lf-timeline-dot lf-timeline-dot--muted"} />
                    {i < timeline.length - 1 && <div className="lf-timeline-line" />}
                  </div>
                  <div className="lf-timeline-content">
                    <div className="lf-timeline-top">
                      <span className="lf-timeline-stage">{item.stage}</span>
                      <span className="lf-timeline-counter">{item.counter}</span>
                    </div>
                    <span className={item.active ? "lf-status-pill lf-status-pill--blue" : "lf-status-pill lf-status-pill--gray"}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <MembershipQrDownload />

        <section className="lf-card">
          <div className="lf-card-header"><span className="lf-card-title">Delivery stats</span></div>
          <div className="lf-card-body">
            <div className="lf-stats-grid">
              <div className="lf-stats-row">
                <div className="lf-stat-box">
                  <div className="lf-stat-label">Open routes</div>
                  <div className="lf-stat-value">{deliveryStats.openRoutes}</div>
                  <div className="lf-stat-sub">need assignment</div>
                </div>
                <div className="lf-stat-box">
                  <div className="lf-stat-label">Phone drops</div>
                  <div className="lf-stat-value">{deliveryStats.phoneDrops}</div>
                  <div className="lf-stat-sub">this cycle</div>
                </div>
              </div>
              <div className="lf-stats-row">
                <div className="lf-stat-box">
                  <div className="lf-stat-label">Skips</div>
                  <div className="lf-stat-value">{deliveryStats.skips}</div>
                  <div className="lf-stat-sub">deliverer reported</div>
                </div>
                <div className="lf-stat-box">
                  <div className="lf-stat-label">Ejections</div>
                  <div className="lf-stat-value">{deliveryStats.ejections}</div>
                  <div className="lf-stat-sub">removed from route</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </aside>
    </div>
  );
}
