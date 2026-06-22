"use client";

import { useMemo } from "react";
import { daysUntilDistribution, groupScheduleTasks } from "../leafletData";
import { useLeafletContext } from "../LeafletContext";

export default function SchedulePageContent() {
  const { leaflet, tasks, tasksOpenTotal, toggleTask, readOnly } = useLeafletContext();

  const activeGroups = useMemo(
    () => groupScheduleTasks(tasks, false),
    [tasks],
  );
  const completedGroups = useMemo(
    () => groupScheduleTasks(tasks, true),
    [tasks],
  );
  const completedTotal = tasks.length - tasksOpenTotal;

  if (!leaflet) {
    return <p className="lf-meta">Select a leaflet edition.</p>;
  }

  return (
    <div className="lf-schedule-layout">
      <header>
        <h1 className="lf-h1">Schedule</h1>
        <p className="lf-page-desc">
          To-do checklist · {daysUntilDistribution(leaflet.distribution_date)}
        </p>
      </header>

      <section className="lf-schedule-section">
        <div className="lf-schedule-section-header">
          <span className="lf-overview-card-title">Active tasks</span>
          <span className="lf-meta">{tasksOpenTotal} open tasks</span>
        </div>

        {activeGroups.length === 0 ? (
          <p className="lf-meta" style={{ padding: "8px 0" }}>
            No open tasks for this leaflet.
          </p>
        ) : (
          activeGroups.map(({ label, tasks: groupTasks }) => (
            <div key={label} className="lf-schedule-group">
              <div
                className={
                  label === "Past due"
                    ? "lf-schedule-group-label lf-schedule-group-label--overdue"
                    : "lf-schedule-group-label"
                }
              >
                {label}
              </div>
              {groupTasks.map((task) => (
                <label
                  key={task.id}
                  className="lf-task-box"
                >
                  <input
                    type="checkbox"
                    checked={task.is_complete}
                    disabled={readOnly}
                    onChange={() => toggleTask(task.id)}
                  />
                  <span>
                    <span>{task.title}</span>
                    <span
                      className={
                        task.isOverdue
                          ? "lf-task-due lf-task-due--overdue"
                          : "lf-task-due"
                      }
                    >
                      {task.dueLabel}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          ))
        )}
      </section>

      {completedTotal > 0 && (
        <section className="lf-schedule-section lf-schedule-section--completed">
          <div className="lf-schedule-section-header">
            <span className="lf-overview-card-title">Completed</span>
            <span className="lf-meta">
              {completedTotal} completed task{completedTotal === 1 ? "" : "s"}
            </span>
          </div>

          {completedGroups.map(({ label, tasks: groupTasks }) => (
            <div key={label} className="lf-schedule-completed-group">
              <div className="lf-schedule-group-label">{label}</div>
              {groupTasks.map((task) => (
                <label
                  key={task.id}
                  className="lf-task-box lf-task-box--complete"
                >
                  <input
                    type="checkbox"
                    checked={task.is_complete}
                    disabled={readOnly}
                    onChange={() => toggleTask(task.id)}
                  />
                  <span>
                    <span className="lf-task-done">{task.title}</span>
                    <span className="lf-task-due">{task.dueLabel}</span>
                  </span>
                </label>
              ))}
            </div>
          ))}
        </section>
      )}
    </div>
  );

}
