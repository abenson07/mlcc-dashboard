"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { FoundationLayout } from "@/components/patterns/foundation/FoundationLayout";
import {
  CanvasHeader,
  type CanvasTopbarBreadcrumb,
} from "@/components/patterns/foundation/CanvasHeader";
import { LinearSidebar } from "@/components/patterns/foundation/LinearSidebar";
import { useDemoModeOptional } from "@/components/patterns/foundation/DemoModeContext";
import { ViewTab } from "@/components/patterns/foundation/ViewTab";
import { ViewTabs } from "@/components/patterns/foundation/ViewTabs";
import { Badge } from "@/components/patterns/primitives/Badge";
import { EmptyStateCard, OutlinedPanel } from "@/components/patterns/client-templates/shared";
import { useEventContext } from "@/components/integrated/events/EventContext";
import EventDetailsPanel from "@/components/integrated/events/EventDetailsPanel";
import {
  MobileAdminShell,
  MobileEventDetail,
  useIsMobileAdmin,
} from "@/components/patterns/client-templates-migrate/mobile";
import type { EventEdition } from "@/lib/events/eventData";
import { EventDraftBanner } from "./EventDraftBanner";
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
  type EventBudgetSummary,
  type EventDetail,
  type EventPromotionItem,
  type EventSponsorRow,
  type EventSponsorshipInvoiceRow,
  type EventTaskRow,
} from "@/data/mocks/events";
import type { EventVolunteerRow } from "./VolunteersPage";

type EventDetailView = "overview" | "details" | "volunteers" | "tasks" | "budget" | "promotion";

const EVENT_VIEW_LABELS: Record<Exclude<EventDetailView, "overview">, string> = {
  details: "Settings",
  volunteers: "Volunteers",
  tasks: "Tasks",
  budget: "Sponsorships",
  promotion: "Promotion",
};

type Selection =
  | { kind: "volunteer"; row: EventVolunteerRow }
  | { kind: "budget"; row: EventBudgetRow }
  | { kind: "sponsorship-invoice"; row: EventSponsorshipInvoiceRow }
  | { kind: "sponsor"; row: EventSponsorRow }
  | null;

function formatEventWhen(iso: string | null): { date: string; time: string } {
  if (!iso) return { date: "—", time: "—" };
  try {
    const d = new Date(iso);
    return {
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      time: d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    };
  } catch {
    return { date: "—", time: "—" };
  }
}

function liveEventDetail(event: EventEdition | null): EventDetail {
  if (!event) {
    return {
      id: "",
      title: "Event",
      category: "Community",
      date: "—",
      time: "—",
      location: "—",
      description: "",
      organizer: "—",
    };
  }
  const { date, time } = formatEventWhen(event.starts_at);
  const ends = event.ends_at ? formatEventWhen(event.ends_at).time : null;
  return {
    id: event.id,
    title: event.title,
    category: "Community",
    date,
    time: ends ? `${time} – ${ends}` : time,
    location: event.fieldData.location ?? event.fieldData.address ?? "—",
    description: event.fieldData.description ?? event.fieldData.marketing?.shortDescription ?? "",
    organizer: event.fieldData.committee
      ? `${event.fieldData.committee} Committee`
      : "MLCC",
  };
}

export type EventDetailDemoProps = {
  navigation?: ReactNode;
};

export function EventDetailDemo({ navigation }: EventDetailDemoProps = {}) {
  const router = useRouter();
  const isMobile = useIsMobileAdmin();
  const { enabled: demo } = useDemoModeOptional();
  const { event, budget } = useEventContext();
  const [view, setView] = useState<EventDetailView>("overview");
  const [selection, setSelection] = useState<Selection>(null);
  const [tasks, setTasks] = useState<EventTaskRow[]>([]);
  const [promotionItems, setPromotionItems] = useState<EventPromotionItem[]>([]);

  useEffect(() => {
    setTasks(demo ? sampleEventTasks : []);
    setPromotionItems(demo ? sampleEventPromotionItems : []);
  }, [demo]);

  const overviewEvent = useMemo(
    () => (demo ? sampleEventDetail : liveEventDetail(event)),
    [demo, event],
  );

  const budgetSummary: EventBudgetSummary = useMemo(() => {
    if (demo) return sampleEventBudgetSummary;
    return {
      totalBudget: budget.goal,
      received: budget.raised,
      pending: budget.pledged,
    };
  }, [demo, budget.goal, budget.raised, budget.pledged]);

  if (isMobile) {
    return (
      <MobileAdminShell active="events">
        <MobileEventDetail />
      </MobileAdminShell>
    );
  }

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
  const eventTitle = event?.title ?? (demo ? sampleEventDetail.title : "Event");
  const statusLabel =
    event?.publishStatus === "draft"
      ? "Draft"
      : event?.publishStatus === "published"
        ? "Published"
        : null;

  const eventsCrumb: CanvasTopbarBreadcrumb = {
    label: "Events",
    onClick: () => router.push("/admin-migrate/events"),
  };
  const eventCrumb: CanvasTopbarBreadcrumb = {
    label: eventTitle,
    onClick: () => changeView("overview"),
  };
  const topbarTitle = view === "overview" ? eventTitle : EVENT_VIEW_LABELS[view];
  const topbarBreadcrumbs: CanvasTopbarBreadcrumb[] =
    view === "overview" ? [eventsCrumb] : [eventsCrumb, eventCrumb];

  const body =
    view === "details" ? (
      <div
        style={{
          height: "100%",
          minHeight: 0,
          overflow: "auto",
          boxSizing: "border-box",
        }}
      >
        <EventDetailsPanel topBanner={<EventDraftBanner />} />
      </div>
    ) : view === "volunteers" ? (
      <VolunteersPage onSelectVolunteer={selectVolunteer} />
    ) : view === "budget" ? (
      <BudgetPage onSelectBudgetItem={selectSponsorshipInvoice} />
    ) : view === "tasks" ? (
      !demo && tasks.length === 0 ? (
        <div style={{ padding: "32px 24px" }}>
          <EmptyStateCard variant="plain" label="No tasks yet" />
        </div>
      ) : (
        <EventTasksPage
          tasks={tasks}
          onToggleTask={toggleTask}
          onAddTask={addTask}
          onRemoveTask={removeTask}
        />
      )
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
        {!demo && promotionItems.length === 0 ? (
          <EmptyStateCard variant="plain" label="No promotions yet" />
        ) : (
          <EventPromotionPage items={promotionItems} onInsertAt={insertPromotionItem} />
        )}
      </div>
    ) : (
      <EventOverviewPage
        event={overviewEvent}
        budgetSummary={budgetSummary}
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
              title: topbarTitle,
              breadcrumbs: topbarBreadcrumbs,
              titleAdornment:
                view === "overview" ? (
                  <Badge label={statusLabel ?? (demo ? sampleEventDetail.category : "Event")} />
                ) : undefined,
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
                  label="Settings"
                  selected={view === "details"}
                  onClick={() => changeView("details")}
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
