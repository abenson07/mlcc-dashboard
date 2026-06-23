"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAllActionItems } from "hooks";
import {
  actionItemDueLabel,
  actionItemIsOverdue,
  type ActionItemListRow,
} from "@/lib/committee-meetings/actionItemsPage";
import IntegratedTopbar from "../IntegratedTopbar";
import EventsListSidebar from "../events/EventsListSidebar";

function ActionItemRow({
  item,
  onToggle,
}: {
  item: ActionItemListRow;
  onToggle: (id: string, done: boolean) => void;
}) {
  const done = item.status === "done";
  const overdue = actionItemIsOverdue(item.due_at, item.status);

  return (
    <label className={done ? "lf-task-box lf-task-box--complete" : "lf-task-box"}>
      <input
        type="checkbox"
        checked={done}
        onChange={(e) => void onToggle(item.id, e.target.checked)}
      />
      <span>
        <span className={done ? "lf-task-done" : undefined}>{item.title}</span>
        {item.assignee ? (
          <span className="lf-meta"> · {item.assignee.full_name}</span>
        ) : null}
        <span className={overdue ? "lf-task-due lf-task-due--overdue" : "lf-task-due"}>
          {actionItemDueLabel(item.due_at)}
        </span>
      </span>
    </label>
  );
}

export default function ActionItemsPageContent() {
  const { groups, openCount, loading, error, toggleDone } = useAllActionItems();
  const [showCompleted, setShowCompleted] = useState(false);

  const activeGroups = useMemo(
    () => groups.filter((group) => group.openItems.length > 0),
    [groups],
  );
  const completedGroups = useMemo(
    () => groups.filter((group) => group.doneItems.length > 0),
    [groups],
  );

  return (
    <>
      <IntegratedTopbar />
      <div className="lf-main">
        <div className="lf-sidebar-col">
          <EventsListSidebar />
        </div>
        <div className="lf-content-col">
          <main className="lf-canvas lf-canvas--white">
            <div className="lf-schedule-layout">
              <header>
                <h1 className="lf-h1">Action items</h1>
                <p className="lf-page-desc">
                  {loading ? "Loading…" : `${openCount} open action items across committee meetings`}
                </p>
              </header>

              {error && <p className="lf-text-red">{error}</p>}

              <section className="lf-schedule-section">
                <div className="lf-schedule-section-header">
                  <span className="lf-overview-card-title">Open items</span>
                  <button
                    type="button"
                    className="lf-link"
                    onClick={() => setShowCompleted((value) => !value)}
                  >
                    {showCompleted ? "Hide completed" : "Show completed"}
                  </button>
                </div>

                {!loading && activeGroups.length === 0 && (
                  <p className="lf-meta">No open action items.</p>
                )}

                {activeGroups.map((group) => (
                  <div key={group.key} className="lf-schedule-group">
                    <div className="lf-schedule-group-label">
                      {group.eventId ? (
                        <Link href={`/events-hub/${group.eventId}/overview`} className="lf-link">
                          {group.label}
                        </Link>
                      ) : (
                        group.label
                      )}
                    </div>
                    {group.openItems.map((item) => (
                      <ActionItemRow
                        key={item.id}
                        item={item}
                        onToggle={(id, done) => void toggleDone(id, done)}
                      />
                    ))}
                  </div>
                ))}
              </section>

              {showCompleted && (
                <section className="lf-schedule-section lf-schedule-section--completed">
                  <div className="lf-schedule-section-header">
                    <span className="lf-overview-card-title">Completed</span>
                  </div>

                  {completedGroups.length === 0 && (
                    <p className="lf-meta">No completed action items yet.</p>
                  )}

                  {completedGroups.map((group) => (
                    <div key={group.key} className="lf-schedule-completed-group">
                      <div className="lf-schedule-group-label">
                        {group.eventId ? (
                          <Link href={`/events-hub/${group.eventId}/overview`} className="lf-link">
                            {group.label}
                          </Link>
                        ) : (
                          group.label
                        )}
                      </div>
                      {group.doneItems.map((item) => (
                        <ActionItemRow
                          key={item.id}
                          item={item}
                          onToggle={(id, done) => void toggleDone(id, done)}
                        />
                      ))}
                    </div>
                  ))}
                </section>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
