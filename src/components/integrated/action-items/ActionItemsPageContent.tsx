"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
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
  highlighted,
  onToggle,
}: {
  item: ActionItemListRow;
  highlighted?: boolean;
  onToggle: (id: string, done: boolean) => void;
}) {
  const done = item.status === "done";
  const overdue = actionItemIsOverdue(item.due_at, item.status);

  return (
    <label
      id={`action-item-${item.id}`}
      className={
        done
          ? highlighted
            ? "lf-task-box lf-task-box--complete lf-task-box--highlight"
            : "lf-task-box lf-task-box--complete"
          : highlighted
            ? "lf-task-box lf-task-box--highlight"
            : "lf-task-box"
      }
    >
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
  const searchParams = useSearchParams();
  const highlightedItemId = searchParams.get("item");
  const { groups, openCount, loading, error, toggleDone } = useAllActionItems();
  const [showCompleted, setShowCompleted] = useState(false);
  const [flashItemId, setFlashItemId] = useState<string | null>(null);
  const scrolledRef = useRef<string | null>(null);

  const activeGroups = useMemo(
    () => groups.filter((group) => group.openItems.length > 0),
    [groups],
  );
  const completedGroups = useMemo(
    () => groups.filter((group) => group.doneItems.length > 0),
    [groups],
  );

  useEffect(() => {
    if (!highlightedItemId || loading) return;
    if (scrolledRef.current === highlightedItemId) return;

    const node = document.getElementById(`action-item-${highlightedItemId}`);
    if (!node) return;

    scrolledRef.current = highlightedItemId;
    node.scrollIntoView({ behavior: "smooth", block: "center" });
    setFlashItemId(highlightedItemId);
    const timer = window.setTimeout(() => setFlashItemId(null), 2000);
    return () => window.clearTimeout(timer);
  }, [highlightedItemId, loading, groups]);

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
                        <Link href={`/admin/events-hub/${group.eventId}/overview`} className="lf-link">
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
                        highlighted={flashItemId === item.id || highlightedItemId === item.id}
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
                          <Link href={`/admin/events-hub/${group.eventId}/overview`} className="lf-link">
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
                          highlighted={flashItemId === item.id || highlightedItemId === item.id}
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
