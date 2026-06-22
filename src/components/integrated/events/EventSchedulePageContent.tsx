"use client";

import { useState } from "react";
import { MOCK_COMPLETED_SCHEDULE, MOCK_EVENT_SCHEDULE } from "../mockData";

export default function EventSchedulePageContent() {
  const [tasks, setTasks] = useState(() =>
    MOCK_EVENT_SCHEDULE.flatMap((g) => g.tasks).concat(MOCK_COMPLETED_SCHEDULE.flatMap((g) => g.tasks)),
  );
  const [showCompleted, setShowCompleted] = useState(false);

  function toggleTask(id: string) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, isComplete: !t.isComplete } : t)));
  }

  const activeGroups = MOCK_EVENT_SCHEDULE.map((group) => ({
    ...group,
    tasks: group.tasks.map((t) => tasks.find((x) => x.id === t.id) ?? t),
  }));

  const completedGroups = MOCK_COMPLETED_SCHEDULE.map((group) => ({
    ...group,
    tasks: group.tasks.map((t) => tasks.find((x) => x.id === t.id) ?? t),
  }));

  const openCount = tasks.filter((t) => !t.isComplete).length;

  return (
    <div className="lf-schedule-layout">
      <header>
        <h1 className="lf-h1">Schedule</h1>
        <p className="lf-page-desc">Tasks for your event — {openCount} tasks remaining</p>
      </header>

      <section className="lf-schedule-section">
        <div className="lf-schedule-section-header">
          <span className="lf-overview-card-title">Active tasks</span>
          <button type="button" className="lf-link" onClick={() => setShowCompleted((v) => !v)}>
            {showCompleted ? "Hide completed" : "Show completed"}
          </button>
        </div>

        {activeGroups.map((group) => (
          <div key={group.label} className="lf-schedule-group">
            <div
              className={
                group.overdue
                  ? "lf-schedule-group-label lf-schedule-group-label--overdue"
                  : "lf-schedule-group-label"
              }
            >
              {group.label}
            </div>
            {group.tasks.map((task) => (
              <label
                key={task.id}
                className={task.isComplete ? "lf-task-box lf-task-box--complete" : "lf-task-box"}
              >
                <input
                  type="checkbox"
                  checked={task.isComplete}
                  onChange={() => toggleTask(task.id)}
                />
                <span>
                  <span className={task.isComplete ? "lf-task-done" : undefined}>{task.title}</span>
                  <span className={task.isOverdue ? "lf-task-due lf-task-due--overdue" : "lf-task-due"}>
                    {task.dueLabel}
                  </span>
                </span>
              </label>
            ))}
            <button type="button" className="lf-link">
              + Add task
            </button>
          </div>
        ))}
      </section>

      {showCompleted && (
        <section className="lf-schedule-section lf-schedule-section--completed">
          <div className="lf-schedule-section-header">
            <span className="lf-overview-card-title">Completed</span>
          </div>
          {completedGroups.map((group) => (
            <div key={group.label} className="lf-schedule-completed-group">
              <div className="lf-schedule-group-label">{group.label}</div>
              {group.tasks.map((task) => (
                <label key={task.id} className="lf-task-box lf-task-box--complete">
                  <input
                    type="checkbox"
                    checked={task.isComplete}
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
