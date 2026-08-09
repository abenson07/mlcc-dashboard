"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
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
import { Button } from "@/components/patterns/primitives/Button";
import { EmptyStateCard, OutlinedPanel } from "@/components/patterns/client-templates/shared";
import { useEventContext } from "@/components/integrated/events/EventContext";
import EventDetailsPanel from "@/components/integrated/events/EventDetailsPanel";
import EditSponsorshipTiersModal from "@/components/sponsorship/EditSponsorshipTiersModal";
import {
  MobileAdminShell,
  MobileEventDetail,
  useIsMobileAdmin,
} from "@/components/patterns/client-templates-migrate/mobile";
import type { EventEdition } from "@/lib/events/eventData";
import { COMMITTEE_LABELS } from "schemas/committee_meetings";
import { supabaseClient } from "@/lib/supabaseClient";
import { useDemoGuard } from "hooks";
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
  AddEventTaskModal,
  AssignVolunteerModal,
  AddSponsorModal,
  EventCreateInvoiceModal,
  EditBudgetAmountModal,
} from "./EventOverviewModals";
import {
  eventMocksFor,
  eventTaskGroupForDueDate,
  formatEventTaskDueLabel,
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

type ModalKind =
  | "task"
  | "volunteer"
  | "sponsor"
  | "invoice"
  | "budget"
  | "levels"
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
      committee: "events",
      date: "—",
      time: "—",
      location: "—",
      description: "",
      organizer: "—",
    };
  }
  const { date, time } = formatEventWhen(event.starts_at);
  const ends = event.ends_at ? formatEventWhen(event.ends_at).time : null;
  const committee = event.committee ?? "events";
  return {
    id: event.id,
    title: event.title,
    committee,
    date,
    time: ends ? `${time} – ${ends}` : time,
    location: event.fieldData.location ?? event.fieldData.address ?? "—",
    description: event.fieldData.description ?? event.fieldData.marketing?.shortDescription ?? "",
    organizer: event.committee
      ? `${COMMITTEE_LABELS[event.committee]} Committee`
      : "MLCC",
  };
}

function daysOffsetFromAnchor(dueDate: string, anchorIso: string | null): number {
  if (!anchorIso) return 0;
  const due = new Date(`${dueDate}T12:00:00`);
  const anchor = new Date(`${anchorIso.slice(0, 10)}T12:00:00`);
  return Math.round((due.getTime() - anchor.getTime()) / (1000 * 60 * 60 * 24));
}

export type EventDetailDemoProps = {
  navigation?: ReactNode;
};

export function EventDetailDemo({ navigation }: EventDetailDemoProps = {}) {
  const router = useRouter();
  const isMobile = useIsMobileAdmin();
  const { enabled: demo } = useDemoModeOptional();
  const { guard } = useDemoGuard();
  const {
    eventId,
    event,
    budget,
    volunteerAsks,
    createTask,
    createSponsorship,
    updateEvent,
    saveSponsorshipTiers,
    sponsorshipTierSeeds,
    sponsorshipTiers,
    refetchAll,
  } = useEventContext();
  const [view, setView] = useState<EventDetailView>("overview");
  const [selection, setSelection] = useState<Selection>(null);
  const [tasks, setTasks] = useState<EventTaskRow[]>([]);
  const [promotionItems, setPromotionItems] = useState<EventPromotionItem[]>([]);
  const [modal, setModal] = useState<ModalKind>(null);

  const mocks = useMemo(() => (demo ? eventMocksFor(eventId) : null), [demo, eventId]);

  useEffect(() => {
    setTasks(mocks ? mocks.tasks : []);
    setPromotionItems(mocks ? mocks.promotionItems : []);
  }, [mocks]);

  const overviewEvent = useMemo(
    () => (mocks ? mocks.detail : liveEventDetail(event)),
    [mocks, event],
  );

  const budgetSummary: EventBudgetSummary = useMemo(() => {
    if (mocks) return mocks.budgetSummary;
    return {
      totalBudget: budget.goal,
      received: budget.raised,
      pending: budget.pledged,
    };
  }, [mocks, budget.goal, budget.raised, budget.pledged]);

  const asksForModal = mocks?.volunteerAsks ?? volunteerAsks;
  const levelsForModal = mocks
    ? mocks.sponsorshipLevels.map((l) => ({
        id: l.id,
        name: l.name,
        price: l.price,
      }))
    : sponsorshipTiers.map((t, i) => ({
        id: `tier-${i}`,
        name: t.name,
        price: `$${t.amount.toLocaleString()}`,
      }));

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

  function addTaskLocal({ title, dueDate }: { title: string; dueDate: string }) {
    const group = eventTaskGroupForDueDate(dueDate, mocks?.dateIso ?? dueDate);
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

  const isFullBleed = view === "details";
  const eventTitle = event?.title ?? (mocks ? mocks.detail.title : "Event");
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
      <VolunteersPage
        onSelectVolunteer={selectVolunteer}
        demoAsks={mocks?.volunteerAsks}
        onAddVolunteer={() => setModal("volunteer")}
      />
    ) : view === "budget" ? (
      <BudgetPage
        onSelectBudgetItem={selectSponsorshipInvoice}
        onAddSponsor={() => setModal("sponsor")}
        onEditLevels={() => setModal("levels")}
      />
    ) : view === "tasks" ? (
      tasks.length === 0 ? (
        <div style={{ padding: "32px 24px" }}>
          <EmptyStateCard
            variant="pill"
            label="Add new task"
            onClick={() => setModal("task")}
          />
        </div>
      ) : (
        <EventTasksPage
          tasks={tasks}
          onToggleTask={toggleTask}
          onAddTask={addTaskLocal}
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
        {promotionItems.length === 0 ? (
          <EmptyStateCard
            variant="pill"
            label="Add new promotion"
            onClick={() =>
              insertPromotionItem(0, {
                type: "email",
                channel: "Newsletter",
                title: "New promotion",
                description: "",
                sendDate: "TBD",
                status: "Draft",
              })
            }
          />
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
        onSeeAllSponsors={() => changeView("budget")}
        onSeeAllInvoices={() => changeView("budget")}
        onSeeAllLevels={() => changeView("budget")}
        onEditDetails={() => changeView("details")}
        onAddTask={() => setModal("task")}
        onAddVolunteer={() => setModal("volunteer")}
        onAddSponsor={() => setModal("sponsor")}
        onAddInvoice={() => setModal("invoice")}
        onEditBudget={() => setModal("budget")}
        onEditLevels={() => setModal("levels")}
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
                  <Badge
                    label={
                      statusLabel ??
                      (mocks ? COMMITTEE_LABELS[mocks.detail.committee] : "Event")
                    }
                  />
                ) : undefined,
              hasFavorite: true,
              endContent:
                view === "volunteers" ? (
                  <Button
                    label="Add Volunteer"
                    variant="secondary"
                    icon={<Plus size={14} strokeWidth={1.75} />}
                    onClick={() => setModal("volunteer")}
                  />
                ) : undefined,
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

      <AddEventTaskModal
        isOpen={modal === "task"}
        eventTitle={eventTitle}
        onClose={() => setModal(null)}
        onSubmit={async (payload) => {
          addTaskLocal({ title: payload.title, dueDate: payload.dueDate });
          await guard(
            async () => {
              const offset = daysOffsetFromAnchor(payload.dueDate, event?.anchorDate ?? null);
              await createTask({
                title: payload.title,
                offset_days: offset,
                description: payload.description || null,
              });
              if (payload.addToFuturePlans) {
                toast.message("Saved to this event — future-plans templates are unchanged for now");
              }
            },
            { action: "Task added" },
          );
        }}
      />

      <AssignVolunteerModal
        isOpen={modal === "volunteer"}
        asks={asksForModal}
        onClose={() => setModal(null)}
        onSubmit={async (payload) => {
          await guard(
            async () => {
              if (!supabaseClient) throw new Error("Not connected");
              let personId = payload.personId;
              if (payload.createPerson || !personId) {
                const { data, error } = await supabaseClient
                  .from("people")
                  .insert({
                    full_name: payload.name,
                    email: payload.email || null,
                  })
                  .select("id")
                  .single();
                if (error) throw error;
                personId = data.id;
              }
              const askIds = payload.askIds.length
                ? payload.askIds
                : asksForModal[0]
                  ? [asksForModal[0].id]
                  : [];
              for (const askId of askIds) {
                const { error } = await supabaseClient.from("volunteers").insert({
                  volunteer_ask_id: askId,
                  person_id: personId,
                  status: "accepted",
                });
                if (error) throw error;
              }
              await refetchAll();
            },
            { action: "Volunteer added" },
          );
        }}
      />

      <AddSponsorModal
        isOpen={modal === "sponsor"}
        levels={levelsForModal}
        onClose={() => setModal(null)}
        onSubmit={async (payload) => {
          await guard(
            async () => {
              if (payload.inKind) {
                const cents = Math.round(parseFloat(payload.donationAmount || "0") * 100);
                await createSponsorship({
                  business_id: payload.businessId,
                  description: "In-kind donation",
                  amount: Number.isFinite(cents) ? cents / 100 : 0,
                  quantity: 1,
                  status: "paid",
                  memo: `In-kind — ${payload.businessName}`,
                });
              } else {
                const level =
                  levelsForModal.find((l) => l.id === payload.levelId) ?? levelsForModal[0];
                const amountFromPrice = level?.price
                  ? Number(String(level.price).replace(/[^0-9.]/g, ""))
                  : sponsorshipTiers.find((t) => t.name === level?.name)?.amount ?? 0;
                await createSponsorship({
                  business_id: payload.businessId,
                  description: level?.name ?? "Sponsorship",
                  amount: amountFromPrice,
                  quantity: 1,
                  status: payload.alreadyPaid ? "paid" : "pledged",
                  memo: payload.alreadyPaid ? "Paid by cash or check" : null,
                });
                if (!payload.alreadyPaid && payload.businessId) {
                  toast.message("Sponsorship added — send invoice from Invoices if needed");
                }
              }
              await refetchAll();
            },
            { action: payload.inKind ? "Donation added" : "Sponsor added" },
          );
        }}
      />

      <EventCreateInvoiceModal
        isOpen={modal === "invoice"}
        eventId={eventId}
        onClose={() => setModal(null)}
        onCreated={async () => {
          await refetchAll();
        }}
      />

      <EditBudgetAmountModal
        isOpen={modal === "budget"}
        currentCents={budget.goal * 100}
        onClose={() => setModal(null)}
        onSubmit={async (goalCents) => {
          await guard(
            async () => {
              await updateEvent({
                field_data: {
                  ...(event?.fieldData ?? {}),
                  sponsorship_goal_cents: goalCents,
                },
              });
              await refetchAll();
            },
            { action: "Budget updated" },
          );
        }}
      />

      <EditSponsorshipTiersModal
        isOpen={modal === "levels"}
        onClose={() => setModal(null)}
        initialTiers={
          mocks
            ? mocks.sponsorshipLevels.map((l) => ({
                name: l.name,
                amount: Number(String(l.price).replace(/[^0-9.]/g, "")) || 0,
                quantity: l.quantityAvailable,
              }))
            : sponsorshipTierSeeds
        }
        onSave={async (tiers) => {
          await saveSponsorshipTiers(tiers);
          await refetchAll();
        }}
      />
    </div>
  );
}
