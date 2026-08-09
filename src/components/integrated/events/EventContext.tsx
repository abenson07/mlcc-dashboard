"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useQuery } from "@tanstack/react-query";
import {
  useEvent,
  useEvents,
  useEventSponsorships,
  useEventVolunteerAsks,
  useTasks,
  type VolunteerAskWithSignups,
} from "hooks";
import { getApiBase } from "@/lib/apiBase";
import {
  buildEventBudget,
  buildSponsorshipTiers,
  eventIdsForInvoiceFilter,
  isEventReadOnly,
  type EventEdition,
  type EventListItem,
} from "@/lib/events/eventData";
import {
  groupScheduleTasks,
  mapSponsors,
  mapTasksForUi,
} from "@/components/leaflet/leafletData";
import type { Invoice, Sponsor, SponsorshipTier, Task } from "@/components/leaflet/types";
import type { EventsUpdate, SponsorshipsInsert, SponsorshipsUpdate } from "@/types/database";

type EventBudget = ReturnType<typeof buildEventBudget>;

type ScheduleGroups = {
  active: ReturnType<typeof groupScheduleTasks>;
  completed: ReturnType<typeof groupScheduleTasks>;
};

type EventContextValue = {
  eventId: string;
  event: EventEdition | null;
  events: EventListItem[];
  readOnly: boolean;
  loading: boolean;
  error: string | null;
  tasks: Task[];
  tasksOpenTotal: number;
  toggleTask: (id: string) => void;
  createTask: (payload: {
    title: string;
    offset_days: number;
    description?: string | null;
  }) => Promise<void>;
  scheduleGroups: ScheduleGroups;
  volunteerAsks: VolunteerAskWithSignups[];
  volunteerSignupTotal: number;
  budget: EventBudget;
  sponsors: Sponsor[];
  sponsorshipTiers: SponsorshipTier[];
  invoices: Invoice[];
  createSponsorship: (
    payload: Omit<SponsorshipsInsert, "event_id" | "leaflet_id">,
  ) => Promise<void>;
  updateSponsorship: (id: string, patch: SponsorshipsUpdate) => Promise<void>;
  refetchAll: () => Promise<void>;
  updateEvent: (patch: EventsUpdate) => Promise<void>;
  publishEvent: () => Promise<void>;
  unpublishEvent: () => Promise<void>;
  uploadCoverImage: (file: File) => Promise<string>;
};

const EventContext = createContext<EventContextValue | null>(null);

export function EventProvider({
  eventId,
  children,
}: {
  eventId: string;
  children: ReactNode;
}) {
  const { events, loading: listLoading, error: listError } = useEvents();
  const {
    event,
    eventRow,
    loading: eventLoading,
    error: eventError,
    refetch: refetchEvent,
    update,
    publish,
    unpublish,
    uploadCoverImage,
  } = useEvent(eventId);

  const readOnly = eventRow ? isEventReadOnly(eventRow, event?.fieldData ?? {}) : false;

  const {
    tasks: taskRows,
    openCount,
    loading: tasksLoading,
    toggleComplete,
    createTask: createTaskMutation,
    refetch: refetchTasks,
  } = useTasks({
    context: "event",
    contextId: eventId,
    anchorDate: event?.anchorDate ?? null,
  });

  const {
    asks: volunteerAsks,
    volunteerSignupTotal,
    loading: volunteersLoading,
    error: volunteersError,
    refetch: refetchVolunteers,
  } = useEventVolunteerAsks(eventId);

  const {
    sponsorships,
    raised,
    pledgedAmount,
    loading: sponsorshipsLoading,
    error: sponsorshipsError,
    refetch: refetchSponsorships,
    createSponsorship: createSponsorshipMutation,
    updateSponsorship: updateSponsorshipMutation,
  } = useEventSponsorships(eventId);

  const invoiceFilterIds = useMemo(
    () => eventIdsForInvoiceFilter(eventId, event?.fieldData ?? {}),
    [eventId, event?.fieldData],
  );

  const invoicesQuery = useQuery({
    queryKey: ["event-invoices", eventId],
    queryFn: async () => {
      const res = await fetch(`${getApiBase()}/api/stripe/invoices`);
      const data = (await res.json()) as {
        error?: string;
        invoices?: Array<{
          id: string;
          number: string | null;
          status: string | null;
          customer_email: string | null;
          amount_due: number;
          due_date: number | null;
          event_id: string | null;
        }>;
      };
      if (!res.ok) throw new Error(data.error ?? "Failed to load invoices");
      return data.invoices ?? [];
    },
    enabled: Boolean(eventId),
  });

  const tasks = useMemo(
    () => mapTasksForUi(taskRows, event?.anchorDate ?? null),
    [taskRows, event?.anchorDate],
  );

  const scheduleGroups = useMemo(
    (): ScheduleGroups => ({
      active: groupScheduleTasks(tasks, "active"),
      completed: groupScheduleTasks(tasks, "complete"),
    }),
    [tasks],
  );

  const sponsorRows = useMemo(
    () => sponsorships.filter((s) => s.business_id != null),
    [sponsorships],
  );

  const sponsors = useMemo(() => mapSponsors(sponsorRows), [sponsorRows]);

  const invoices = useMemo((): Invoice[] => {
    const rows = (invoicesQuery.data ?? []).filter(
      (i) => i.event_id && invoiceFilterIds.includes(i.event_id),
    );
    return rows.map((inv) => ({
      id: inv.id,
      invoice: inv.number ?? inv.id.slice(-8),
      sponsor: inv.customer_email ?? "—",
      amount: inv.amount_due / 100,
      dueDate: inv.due_date
        ? new Date(inv.due_date * 1000).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "—",
      status:
        inv.status === "paid"
          ? "Paid"
          : inv.status === "open"
            ? "Sent"
            : inv.status === "draft"
              ? "Draft"
              : inv.status === "uncollectible"
                ? "Overdue"
                : (inv.status ?? "Draft"),
    }));
  }, [invoicesQuery.data, invoiceFilterIds]);

  const budget = useMemo(
    () =>
      buildEventBudget(
        sponsorships,
        raised,
        pledgedAmount,
        event?.fieldData.sponsorship_goal_cents,
      ),
    [sponsorships, raised, pledgedAmount, event?.fieldData.sponsorship_goal_cents],
  );

  const sponsorshipTiers = useMemo(
    () => buildSponsorshipTiers(sponsorships),
    [sponsorships],
  );

  const toggleTask = useCallback(
    async (taskId: string) => {
      const row = taskRows.find((t) => t.id === taskId);
      if (!row || readOnly) return;
      await toggleComplete(row);
    },
    [taskRows, readOnly, toggleComplete],
  );

  const createTask = useCallback(
    async (payload: {
      title: string;
      offset_days: number;
      description?: string | null;
    }) => {
      if (readOnly) throw new Error("Event is read-only");
      await createTaskMutation(payload);
    },
    [readOnly, createTaskMutation],
  );

  const refetchAll = useCallback(async () => {
    await Promise.all([
      refetchEvent(),
      refetchTasks(),
      refetchVolunteers(),
      refetchSponsorships(),
      invoicesQuery.refetch(),
    ]);
  }, [refetchEvent, refetchTasks, refetchVolunteers, refetchSponsorships, invoicesQuery]);

  const createSponsorship = useCallback(
    async (payload: Omit<SponsorshipsInsert, "event_id" | "leaflet_id">) => {
      if (readOnly) throw new Error("Event is read-only");
      await createSponsorshipMutation(payload);
    },
    [readOnly, createSponsorshipMutation],
  );

  const updateSponsorship = useCallback(
    async (id: string, patch: SponsorshipsUpdate) => {
      if (readOnly) throw new Error("Event is read-only");
      await updateSponsorshipMutation(id, patch);
    },
    [readOnly, updateSponsorshipMutation],
  );

  const updateEvent = useCallback(
    async (patch: EventsUpdate) => {
      if (readOnly) throw new Error("Event is read-only");
      await update(patch);
    },
    [readOnly, update],
  );

  const publishEvent = useCallback(async () => {
    await publish();
  }, [publish]);

  const unpublishEvent = useCallback(async () => {
    await unpublish();
  }, [unpublish]);

  const loading =
    listLoading ||
    eventLoading ||
    tasksLoading ||
    volunteersLoading ||
    sponsorshipsLoading ||
    invoicesQuery.isLoading;

  const error =
    listError ??
    eventError ??
    volunteersError ??
    sponsorshipsError ??
    (invoicesQuery.error instanceof Error ? invoicesQuery.error.message : null);

  const value = useMemo(
    (): EventContextValue => ({
      eventId,
      event,
      events,
      readOnly,
      loading,
      error,
      tasks,
      tasksOpenTotal: openCount,
      toggleTask,
      createTask,
      scheduleGroups,
      volunteerAsks,
      volunteerSignupTotal,
      budget,
      sponsors,
      sponsorshipTiers,
      invoices,
      createSponsorship,
      updateSponsorship,
      refetchAll,
      updateEvent,
      publishEvent,
      unpublishEvent,
      uploadCoverImage,
    }),
    [
      eventId,
      event,
      events,
      readOnly,
      loading,
      error,
      tasks,
      openCount,
      toggleTask,
      createTask,
      scheduleGroups,
      volunteerAsks,
      volunteerSignupTotal,
      budget,
      sponsors,
      sponsorshipTiers,
      invoices,
      createSponsorship,
      updateSponsorship,
      refetchAll,
      updateEvent,
      publishEvent,
      unpublishEvent,
      uploadCoverImage,
    ],
  );

  return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
}

export function useEventContext(): EventContextValue {
  const ctx = useContext(EventContext);
  if (!ctx) {
    throw new Error("useEventContext must be used within EventProvider");
  }
  return ctx;
}
