"use client";

import { useState, type ReactNode } from "react";
import { FoundationLayout } from "@/components/patterns/foundation/FoundationLayout";
import { CanvasHeader } from "@/components/patterns/foundation/CanvasHeader";
import { LinearSidebar } from "@/components/patterns/foundation/LinearSidebar";
import { ViewTab } from "@/components/patterns/foundation/ViewTab";
import { ViewTabs } from "@/components/patterns/foundation/ViewTabs";
import { Badge } from "@/components/patterns/primitives/Badge";
import { OutlinedPanel } from "@/components/patterns/client-templates/shared";
import { EventOverviewPage } from "./EventOverviewPage";
import { VolunteersPage } from "./VolunteersPage";
import { BudgetPage } from "./BudgetPage";
import { EventTasksPage } from "./EventTasksPage";
import { EventPromotionPage } from "./EventPromotionPage";
import { VolunteerDetailPanel } from "./VolunteerDetailPanel";
import { BudgetDetailPanel } from "./BudgetDetailPanel";
import { SponsorshipInvoiceDetailPanel } from "./SponsorshipInvoiceDetailPanel";
import { SponsorDetailPanel } from "./SponsorDetailPanel";
import {
  eventTaskGroupForDueDate,
  formatEventTaskDueLabel,
  sampleEventBudgetSummary,
  sampleEventDetail,
  sampleEventPromotionItems,
  sampleEventTasks,
  type EventBudgetRow,
  type EventPromotionItem,
  type EventSponsorRow,
  type EventSponsorshipInvoiceRow,
  type EventTaskRow,
  type EventVolunteerRow,
} from "@/data/mocks/events";

type EventDetailView = "overview" | "volunteers" | "tasks" | "budget" | "promotion";

type Selection =
  | { kind: "volunteer"; row: EventVolunteerRow }
  | { kind: "budget"; row: EventBudgetRow }
  | { kind: "sponsorship-invoice"; row: EventSponsorshipInvoiceRow }
  | { kind: "sponsor"; row: EventSponsorRow }
  | null;

export type EventDetailDemoProps = {
  navigation?: ReactNode;
};

export function EventDetailDemo({ navigation }: EventDetailDemoProps = {}) {
  const [view, setView] = useState<EventDetailView>("overview");
  const [selection, setSelection] = useState<Selection>(null);
  const [tasks, setTasks] = useState<EventTaskRow[]>(sampleEventTasks);
  const [promotionItems, setPromotionItems] = useState<EventPromotionItem[]>(sampleEventPromotionItems);

  function changeView(next: EventDetailView) {
    setView(next);
    setSelection(null);
  }

  function selectVolunteer(row: EventVolunteerRow) {
    setSelection({ kind: "volunteer", row });
  }

  function selectBudgetItem(row: EventBudgetRow) {
    setSelection({ kind: "budget", row });
  }

  function selectSponsorshipInvoice(row: EventSponsorshipInvoiceRow) {
    setSelection({ kind: "sponsorship-invoice", row });
  }

  function selectSponsor(row: EventSponsorRow) {
    setSelection({ kind: "sponsor", row });
  }

  function toggleTask(id: string) {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, isComplete: !task.isComplete } : task)),
    );
  }

  function addTask({ title, dueDate }: { title: string; dueDate: string }) {
    const group = eventTaskGroupForDueDate(dueDate);
    const isOverdue = group === "Past due";
    setTasks((prev) => [
      ...prev,
      {
        id: `task-${Date.now()}`,
        title,
        group,
        dueLabel: formatEventTaskDueLabel(dueDate, isOverdue),
        isComplete: false,
        isOverdue,
      },
    ]);
  }

  function removeTask(id: string) {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }

  function insertPromotionItem(index: number, item: Omit<EventPromotionItem, "id">) {
    setPromotionItems((prev) => {
      const next = [...prev];
      next.splice(index, 0, { ...item, id: `promo-${Date.now()}` });
      return next;
    });
  }

  const isFullBleed = view === "volunteers";

  const body =
    view === "volunteers" ? (
      <VolunteersPage onSelectVolunteer={selectVolunteer} />
    ) : view === "budget" ? (
      <BudgetPage onSelectBudgetItem={selectSponsorshipInvoice} />
    ) : view === "tasks" ? (
      <EventTasksPage
        tasks={tasks}
        onToggleTask={toggleTask}
        onAddTask={addTask}
        onRemoveTask={removeTask}
      />
    ) : view === "promotion" ? (
      <div
        style={{
          height: "100%",
          minHeight: 0,
          overflow: "auto",
          boxSizing: "border-box",
          padding: "32px 24px 64px",
        }}
      >
        <EventPromotionPage items={promotionItems} onInsertAt={insertPromotionItem} />
      </div>
    ) : (
      <EventOverviewPage
        event={sampleEventDetail}
        budgetSummary={sampleEventBudgetSummary}
        tasks={tasks}
        onToggleTask={toggleTask}
        onSeeAllTasks={() => changeView("tasks")}
        onViewBudget={() => changeView("budget")}
        onSelectVolunteer={selectVolunteer}
        onSeeAllVolunteers={() => changeView("volunteers")}
        onSelectSponsor={selectSponsor}
        onSelectInvoice={selectBudgetItem}
      />
    );

  return (
    <div style={{ height: "100%" }}>
      <FoundationLayout
        navigation={navigation ?? <LinearSidebar />}
        contentMaxWidth={isFullBleed ? undefined : 1200}
        isSideContentVisible={selection != null}
        sideContent={
          selection ? (
            <OutlinedPanel onClose={() => setSelection(null)}>
              {selection.kind === "volunteer" ? (
                <VolunteerDetailPanel volunteer={selection.row} />
              ) : selection.kind === "sponsor" ? (
                <SponsorDetailPanel sponsor={selection.row} />
              ) : selection.kind === "sponsorship-invoice" ? (
                <SponsorshipInvoiceDetailPanel invoice={selection.row} />
              ) : (
                <BudgetDetailPanel item={selection.row} />
              )}
            </OutlinedPanel>
          ) : null
        }
        header={
          <CanvasHeader
            topbar={{
              title: sampleEventDetail.title,
              titleAdornment: <Badge label={sampleEventDetail.category} />,
              hasFavorite: true,
            }}
            controls={
              <ViewTabs aria-label="Event views">
                <ViewTab
                  label="Overview"
                  selected={view === "overview"}
                  onClick={() => changeView("overview")}
                />
                <ViewTab
                  label="Volunteers"
                  selected={view === "volunteers"}
                  onClick={() => changeView("volunteers")}
                />
                <ViewTab
                  label="Tasks"
                  selected={view === "tasks"}
                  onClick={() => changeView("tasks")}
                />
                <ViewTab
                  label="Sponsorships"
                  selected={view === "budget"}
                  onClick={() => changeView("budget")}
                />
                <ViewTab
                  label="Promotion"
                  selected={view === "promotion"}
                  onClick={() => changeView("promotion")}
                />
              </ViewTabs>
            }
          />
        }
      >
        {body}
      </FoundationLayout>
    </div>
  );
}
