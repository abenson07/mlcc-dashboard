"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import ConfirmDialog from "@/components/ui/modal/ConfirmDialog";
import DatePickerField from "@/components/form/DatePicker";
import { TableRowActionsMenu } from "@/components/ui/table/TableRowActionsMenu";
import { daysUntilDistribution, groupScheduleTasks } from "../leafletData";
import { useLeafletContext } from "../LeafletContext";
import type { ScheduleGroupLabel, Task } from "../types";

export default function SchedulePageContent() {
  const { leaflet, tasks, tasksOpenTotal, toggleTask, readOnly, createTask, skipTask, removeTaskPermanently } =
    useLeafletContext();

  const [addingToGroup, setAddingToGroup] = useState<ScheduleGroupLabel | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [creating, setCreating] = useState(false);
  const [skipTarget, setSkipTarget] = useState<Task | null>(null);
  const [removeTarget, setRemoveTarget] = useState<Task | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const activeGroups = useMemo(() => groupScheduleTasks(tasks, "active"), [tasks]);
  const completedGroups = useMemo(() => groupScheduleTasks(tasks, "complete"), [tasks]);
  const skippedGroups = useMemo(() => groupScheduleTasks(tasks, "skipped"), [tasks]);
  const completedTotal = tasks.filter((t) => t.is_complete && !t.is_skipped).length;
  const skippedTotal = tasks.filter((t) => t.is_skipped).length;

  if (!leaflet) {
    return <p className="lf-meta">Select a leaflet edition.</p>;
  }

  function startAdding(label: ScheduleGroupLabel) {
    setAddingToGroup(label);
    setNewTitle("");
    setNewDueDate("");
  }

  function cancelAdding() {
    setAddingToGroup(null);
    setNewTitle("");
    setNewDueDate("");
  }

  async function handleAddTask() {
    if (!newTitle.trim() || !newDueDate || !leaflet) return;
    setCreating(true);
    try {
      await createTask({ title: newTitle.trim(), dueDate: newDueDate });
      cancelAdding();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add task");
    } finally {
      setCreating(false);
    }
  }

  async function handleConfirmSkip() {
    if (!skipTarget) return;
    setSubmitting(true);
    try {
      await skipTask(skipTarget.id);
      setSkipTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to skip task");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConfirmRemove() {
    if (!removeTarget) return;
    setSubmitting(true);
    try {
      await removeTaskPermanently(removeTarget);
      setRemoveTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove task");
    } finally {
      setSubmitting(false);
    }
  }

  function renderTaskRow(task: Task, complete: boolean) {
    return (
      <div
        key={task.id}
        className={complete ? "lf-task-box lf-task-box--complete lf-task-hover-row" : "lf-task-box lf-task-hover-row"}
      >
        <label style={{ display: "flex", flex: 1, alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={task.is_complete}
            disabled={readOnly}
            onChange={() => toggleTask(task.id)}
          />
          <span>
            <span className={complete ? "lf-task-done" : undefined}>{task.title}</span>
            <span className={task.isOverdue ? "lf-task-due lf-task-due--overdue" : "lf-task-due"}>
              {task.dueLabel}
            </span>
          </span>
        </label>
        {!readOnly && (
          <div className="lf-task-row-menu">
            <TableRowActionsMenu
              items={[
                { label: "Skip task this time", onClick: () => setSkipTarget(task) },
                { label: "Remove task permanently", variant: "danger", onClick: () => setRemoveTarget(task) },
              ]}
            />
          </div>
        )}
      </div>
    );
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
              {groupTasks.map((task) => renderTaskRow(task, false))}

              {!readOnly && (
                addingToGroup === label ? (
                  <div className="lf-task-box" style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input
                      type="text"
                      style={{ flex: 1, border: "1px solid var(--lf-canvas-border)", borderRadius: 6, padding: "4px 8px" }}
                      placeholder="Task title"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      disabled={creating}
                      autoFocus
                    />
                    <div style={{ width: 170 }}>
                      <DatePickerField
                        id="schedule-new-task-due-date"
                        value={newDueDate}
                        onChange={setNewDueDate}
                        disabled={creating}
                      />
                    </div>
                    <button
                      type="button"
                      className="lf-btn lf-btn--primary"
                      disabled={creating || !newTitle.trim() || !newDueDate}
                      onClick={() => void handleAddTask()}
                    >
                      {creating ? "Adding…" : "Save"}
                    </button>
                    <button type="button" className="lf-link" onClick={cancelAdding} disabled={creating}>
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="lf-add-route-link"
                    onClick={() => startAdding(label)}
                  >
                    + Add task
                  </button>
                )
              )}
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
              {groupTasks.map((task) => renderTaskRow(task, true))}
            </div>
          ))}
        </section>
      )}

      {skippedTotal > 0 && (
        <section className="lf-schedule-section lf-schedule-section--completed">
          <div className="lf-schedule-section-header">
            <span className="lf-overview-card-title">Skipped</span>
            <span className="lf-meta">
              {skippedTotal} skipped task{skippedTotal === 1 ? "" : "s"}
            </span>
          </div>

          {skippedGroups.map(({ label, tasks: groupTasks }) => (
            <div key={label} className="lf-schedule-completed-group">
              <div className="lf-schedule-group-label">{label}</div>
              {groupTasks.map((task) => renderTaskRow(task, false))}
            </div>
          ))}
        </section>
      )}

      <ConfirmDialog
        isOpen={skipTarget != null}
        title="Skip this task?"
        description={skipTarget ? <>Skip <strong>{skipTarget.title}</strong> for this leaflet only.</> : undefined}
        confirmLabel="Skip"
        tone="primary"
        submitting={submitting}
        onConfirm={handleConfirmSkip}
        onCancel={() => setSkipTarget(null)}
      />
      <ConfirmDialog
        isOpen={removeTarget != null}
        title="Remove task permanently?"
        description={
          removeTarget ? (
            <>
              Remove <strong>{removeTarget.title}</strong> from this leaflet and stop it from being
              created on future leaflets.
            </>
          ) : undefined
        }
        confirmLabel="Remove"
        tone="destructive"
        submitting={submitting}
        onConfirm={handleConfirmRemove}
        onCancel={() => setRemoveTarget(null)}
      />
    </div>
  );
}
