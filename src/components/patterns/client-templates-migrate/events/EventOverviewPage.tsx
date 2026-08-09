"use client";

import { ClassContentPage } from "@/components/patterns/client-templates/shared";
import { EventInfoBox } from "./EventInfoBox";
import { BudgetChart } from "./BudgetChart";
import { EventTasksSection } from "./EventTasksSection";
import { VolunteersListSection } from "./VolunteersListSection";
import { SponsorsListSection } from "./SponsorsListSection";
import { InvoicesListSection } from "./InvoicesListSection";
import type {
  EventBudgetRow,
  EventBudgetSummary,
  EventDetail,
  EventSponsorRow,
  EventTaskRow,
} from "@/data/mocks/events";
import type { EventVolunteerRow } from "./VolunteersPage";

export type EventOverviewPageProps = {
  event: EventDetail;
  budgetSummary: EventBudgetSummary;
  tasks: EventTaskRow[];
  onToggleTask: (id: string) => void;
  onSeeAllTasks?: () => void;
  onViewBudget?: () => void;
  onSelectVolunteer?: (row: EventVolunteerRow) => void;
  onSeeAllVolunteers?: () => void;
  onSelectSponsor?: (row: EventSponsorRow) => void;
  onSelectInvoice?: (row: EventBudgetRow) => void;
};

/**
 * Event Detail Overview: info box, budget stacked-bar summary, a
 * two-column Tasks / Volunteers row, then a two-column Sponsors / Invoices
 * row (all boxes share the same shape). Mirrors `ClassDetailPage`.
 */
export function EventOverviewPage({
  event,
  budgetSummary,
  tasks,
  onToggleTask,
  onSeeAllTasks,
  onViewBudget,
  onSelectVolunteer,
  onSeeAllVolunteers,
  onSelectSponsor,
  onSelectInvoice,
}: EventOverviewPageProps) {
  return (
    <ClassContentPage>
      <EventInfoBox event={event} />
      <BudgetChart summary={budgetSummary} onViewBudget={onViewBudget} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          alignItems: "start",
        }}
      >
        <EventTasksSection tasks={tasks} onToggleTask={onToggleTask} onSeeAllTasks={onSeeAllTasks} />
        <VolunteersListSection onSelectVolunteer={onSelectVolunteer} onSeeAllVolunteers={onSeeAllVolunteers} />
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          alignItems: "start",
        }}
      >
        <SponsorsListSection onSelectSponsor={onSelectSponsor} />
        <InvoicesListSection onSelectInvoice={onSelectInvoice} />
      </div>
    </ClassContentPage>
  );
}
