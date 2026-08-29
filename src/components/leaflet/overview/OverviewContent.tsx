"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useStories } from "hooks";
import { IconArrowRight, IconCalendar, IconPlus } from "../icons";
import { daysUntilDistribution, formatDistributionDate } from "../leafletData";
import { leafletHref, useLeafletContext } from "../LeafletContext";

export default function OverviewContent() {
  const pathname = usePathname();
  const router = useRouter();
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
    deliveryStats,
  } = useLeafletContext();
  const { create: createStory } = useStories({ autoFetch: false });
  const [addingStory, setAddingStory] = useState(false);

  async function handleAddStory() {
    setAddingStory(true);
    try {
      const story = await createStory({
        title: "",
        author: "",
        leaflet_id: leafletId,
        publish_date: new Date().toISOString().slice(0, 10),
      });
      if (story) router.push(`/admin/stories?selected=${story.id}`);
    } finally {
      setAddingStory(false);
    }
  }

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

        <section className="lf-overview-card" data-lf-card="tasks">
          <div className="lf-overview-card-header">
            <span className="lf-overview-card-title">Tasks</span>
            <span className="lf-meta">{tasksOpenTotal} open tasks</span>
          </div>
          <p className="lf-task-group-label">Before distribution</p>
          {tasks.map((task) => (
            <label key={task.id} className="lf-task-box" data-lf-card={`task-${task.id}`}>
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

        <section className="lf-overview-card" data-lf-card="open-routes">
          <div className="lf-overview-card-header">
            <span className="lf-overview-card-title">Open routes</span>
            <span className="lf-meta">{deliveryStats.openRoutes} unassigned</span>
          </div>
          {openRoutePreviews.map((route) => (
            <div key={route.id} className="lf-open-route" data-lf-card={`open-route-${route.id}`}>
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

        <section className="lf-overview-card" data-lf-card="stories">
          <div className="lf-overview-card-header">
            <div>
              <div className="lf-overview-card-title">Stories</div>
              <div className="lf-meta">Draft blog posts scheduled for release</div>
            </div>
            <button
              type="button"
              className="lf-small-btn"
              disabled={addingStory}
              onClick={() => void handleAddStory()}
            >
              <IconPlus />
              {addingStory ? "Adding…" : "Add story"}
            </button>
          </div>
          <div className="lf-story-list">
            {stories.length === 0 ? (
              <div className="lf-empty-state">
                <p className="lf-meta">No stories yet.</p>
                <button
                  type="button"
                  className="lf-small-btn"
                  disabled={addingStory}
                  onClick={() => void handleAddStory()}
                >
                  <IconPlus />
                  {addingStory ? "Adding…" : "Create your first story"}
                </button>
              </div>
            ) : (
              stories.map((story) => (
                <Link
                  key={story.id}
                  href={`/admin/stories?selected=${story.id}`}
                  className="lf-story-row"
                  data-lf-card={`story-${story.id}`}
                >
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
                </Link>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
