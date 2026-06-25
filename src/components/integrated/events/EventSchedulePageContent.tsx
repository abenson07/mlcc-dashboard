"use client";

import Link from "next/link";
import { useState } from "react";
import AddEventTaskModal from "./AddEventTaskModal";
import { useEventContext } from "./EventContext";

export default function EventSchedulePageContent() {
  const {
    loading,
    event,
    scheduleGroups,
    tasksOpenTotal,
    toggleTask,
    createTask,
    readOnly,
  } = useEventContext();
  const [showCompleted, setShowCompleted] = useState(false);
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [addTaskOffset, setAddTaskOffset] = useState(-14);

  if (loading && !event) {
    return <p className="lf-meta">Loading schedule…</p>;
  }

  if (!event) {
    return (
      <div className="lf-empty-page">
        <h1 className="lf-h2">Event not found</h1>
        <Link href="/admin/events" className="lf-link">Back to events</Link>
      </div>
    );
  }

  return (
    <div className="lf-schedule-layout">
      <header>
        <h1 className="lf-h1">Schedule</h1>
        <p className="lf-page-desc">
          {event.daysUntilLabel} — {tasksOpenTotal} tasks remaining
        </p>
      </header>

      <section className="lf-schedule-section">
        <div className="lf-schedule-section-header">
          <span className="lf-overview-card-title">Active tasks</span>
          <button type="button" className="lf-link" onClick={() => setShowCompleted((v) => !v)}>
            {showCompleted ? "Hide completed" : "Show completed"}
          </button>
        </div>

        {scheduleGroups.active.length === 0 && (
          <p className="lf-meta">No active tasks.</p>
        )}

        {scheduleGroups.active.map((group) => (
          <div key={group.label} className="lf-schedule-group">
            <div
              className={
                group.label === "Past due"
                  ? "lf-schedule-group-label lf-schedule-group-label--overdue"
                  : "lf-schedule-group-label"
              }
            >
              {group.label}
            </div>
            {group.tasks.map((task) => (
              <label
                key={task.id}
                className={task.is_complete ? "lf-task-box lf-task-box--complete" : "lf-task-box"}
              >
                <input
                  type="checkbox"
                  checked={task.is_complete}
                  disabled={readOnly}
                  onChange={() => void toggleTask(task.id)}
                />
                <span>
                  <span className={task.is_complete ? "lf-task-done" : undefined}>{task.title}</span>
                  <span className={task.isOverdue ? "lf-task-due lf-task-due--overdue" : "lf-task-due"}>
                    {task.dueLabel}
                  </span>
                </span>
              </label>
            ))}
            {!readOnly && (
              <button
                type="button"
                className="lf-see-all"
                onClick={() => {
                  const firstTask = group.tasks[0];
                  setAddTaskOffset(firstTask?.offset_days ?? -14);
                  setAddTaskOpen(true);
                }}
              >
                + Add task
              </button>
            )}
          </div>
        ))}

        {!readOnly && scheduleGroups.active.length === 0 && (
          <button
            type="button"
            className="lf-see-all"
            onClick={() => {
              setAddTaskOffset(-14);
              setAddTaskOpen(true);
            }}
          >
            + Add task
          </button>
        )}
      </section>

      {showCompleted && (
        <section className="lf-schedule-section lf-schedule-section--completed">
          <div className="lf-schedule-section-header">
            <span className="lf-overview-card-title">Completed</span>
          </div>
          {scheduleGroups.completed.length === 0 && (
            <p className="lf-meta">No completed tasks yet.</p>
          )}
          {scheduleGroups.completed.map((group) => (
            <div key={group.label} className="lf-schedule-completed-group">
              <div className="lf-schedule-group-label">{group.label}</div>
              {group.tasks.map((task) => (
                <label key={task.id} className="lf-task-box lf-task-box--complete">
                  <input
                    type="checkbox"
                    checked={task.is_complete}
                    disabled={readOnly}
                    onChange={() => void toggleTask(task.id)}
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

      <AddEventTaskModal
        isOpen={addTaskOpen}
        onClose={() => setAddTaskOpen(false)}
        defaultOffsetDays={addTaskOffset}
        onSubmit={createTask}
      />
    </div>
  );
}
