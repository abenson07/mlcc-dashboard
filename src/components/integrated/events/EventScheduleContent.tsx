"use client";

import { useState } from "react";
import { MOCK_COMPLETED_SCHEDULE, MOCK_EVENT_SCHEDULE } from "../mockData";

export default function EventScheduleContent() {
  const [tasks, setTasks] = useState(MOCK_EVENT_SCHEDULE);

  function toggleTask(groupLabel: string, taskId: string) {
    setTasks((groups) =>
      groups.map((g) =>
        g.label === groupLabel
          ? {
              ...g,
              tasks: g.tasks.map((t) =>
                t.id === taskId ? { ...t, isComplete: !t.isComplete } : t,
              ),
            }
          : g,
      ),
    );
  }

  return (
    <div className="lf-schedule-layout">
      <header>
        <h1 className="lf-h1">Schedule</h1>
        <p className="lf-page-desc">Track your tasks and upcoming events.</p>
      </header>

      <section className="lf-schedule-section">
        <div className="lf-schedule-section-header">
          <span className="lf-overview-card-title">Active tasks</span>
          <button type="button" className="lf-link">View all tasks</button>
        </div>

        {tasks.map((group) => (
          <div key={group.label} className="lf-schedule-group">
            <div className={group.overdue ? "lf-schedule-group-label lf-schedule-group-label--overdue" : "lf-schedule-group-label"}>
              {group.label}
            </div>
            {group.tasks.map((task) => (
              <label key={task.id} className="lf-task-box">
                <input
                  type="checkbox"
                  checked={task.isComplete}
                  onChange={() => toggleTask(group.label, task.id)}
                />
                <span>
                  <span className={task.isComplete ? "lf-task-done" : undefined}>{task.title}</span>
                  <span className={task.isOverdue ? "lf-task-due lf-task-due--overdue" : "lf-task-due"}>{task.dueLabel}</span>
                </span>
              </label>
            ))}
            <button type="button" className="lf-see-all">+ Add task</button>
          </div>
        ))}
      </section>

      <section className="lf-schedule-section lf-schedule-section--completed">
        <div className="lf-schedule-section-header">
          <span className="lf-overview-card-title">Completed</span>
          <button type="button" className="lf-link">Clear completed tasks</button>
        </div>
        {MOCK_COMPLETED_SCHEDULE.map((group) => (
          <div key={group.label} className="lf-schedule-completed-group">
            <div className="lf-schedule-group-label">{group.label}</div>
            {group.tasks.map((task) => (
              <label key={task.id} className="lf-task-box lf-task-box--complete">
                <input type="checkbox" checked readOnly />
                <span>
                  <span className="lf-task-done">{task.title}</span>
                  <span className="lf-task-due">{task.dueLabel}</span>
                </span>
              </label>
            ))}
          </div>
        ))}
      </section>
    </div>
  );
}
