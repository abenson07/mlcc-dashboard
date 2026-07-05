"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconArrowRight, IconCalendar, IconPlus } from "../icons";
import { daysUntilDistribution, formatDistributionDate } from "../leafletData";
import { leafletHref, useLeafletContext } from "../LeafletContext";

export default function OverviewContent() {
  const pathname = usePathname();
  const leafletBase = pathname?.startsWith("/old-admin") ? "/old-admin" : "/admin";
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
    deliveryStats,
  } = useLeafletContext();

  if (!leaflet) {
    return <p className="lf-meta">Select a leaflet edition.</p>;
  }

  return (
    <div className="lf-overview-layout lf-overview-layout--single">
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
          <Link href={leafletHref(`${leafletBase}/leaflet/todo`, leafletId)} className="lf-see-all">
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
            <Link href={leafletHref(`${leafletBase}/leaflet/open-routes`, leafletId)} className="lf-view-all-btn">
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
            <Link href={leafletHref(`${leafletBase}/leaflet/sponsorships`, leafletId)} className="lf-view-all-btn lf-view-all-btn--dark">
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
    </div>
  );
}
