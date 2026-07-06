"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  useCommSettings,
  useDeliveries,
  useLeafletHistory,
  useLeaflets,
  useLeafletSponsorships,
  useTasks,
} from "hooks";
import type { DeliveryWithRelations } from "hooks";
import { getApiBase } from "@/lib/apiBase";
import type { SponsorshipTierSeed } from "@/lib/sponsorship/tierPlaceholders";
import type { Leaflets, LeafletsUpdate, SponsorshipsInsert, SponsorshipsUpdate } from "@/types/database";
import {
  buildBudget,
  buildBudgetLineItems,
  buildCommStages,
  buildDelivererCards,
  buildDeliveryHistory,
  buildDeliveryStats,
  buildOpenRoutePreviews,
  buildPastDeliverers,
  buildSponsorshipTiers,
  buildSubstitutions,
  buildTimeline,
  countChangeMap,
  mapSponsors,
  mapTasksForUi,
  unassignedOpenCount,
} from "./leafletData";
import { resolveSponsorshipTierSeeds } from "@/lib/sponsorship/tierPlaceholders";
import type {
  CommStage,
  DelivererCard,
  Invoice,
  LeafletEdition,
  OpenRoutePreview,
  PastDeliverer,
  Sponsor,
  SponsorshipTier,
  StoryItem,
  Substitution,
  Task,
} from "./types";
import type { DeliveryWithRoutePrimary } from "./leafletData";

type Budget = ReturnType<typeof buildBudget>;
type BudgetLineItem = ReturnType<typeof buildBudgetLineItems>[number];

type LeafletContextValue = {
  leafletId: string | null;
  leaflet: LeafletEdition | null;
  membershipQrCodeId: string | null;
  openRoutesQrCodeId: string | null;
  readOnly: boolean;
  activeLeaflet: LeafletEdition | null;
  leaflets: LeafletEdition[];
  loading: boolean;
  error: string | null;
  setLeafletId: (id: string) => void;
  createLeaflet: (input: { title: string; distribution_date: string }) => Promise<Leaflets>;
  closeLeaflet: () => Promise<void>;
  deliveries: DeliveryWithRelations[];
  updateDelivery: ReturnType<typeof useDeliveries>["update"];
  selectedDeliveryId: string | null;
  setSelectedDeliveryId: (id: string | null) => void;
  tasks: Task[];
  tasksOpenTotal: number;
  openCount: number;
  toggleTask: (taskId: string) => void;
  openRoutePreviews: OpenRoutePreview[];
  stories: StoryItem[];
  delivererCards: DelivererCard[];
  commStages: CommStage[];
  sendComm: (stepKey: string) => Promise<{ sent: number }>;
  resendComm: (personId: string, stepKey?: string) => Promise<{ sent: number }>;
  unconfirmedCount: number;
  substitutions: Substitution[];
  sponsors: Sponsor[];
  invoices: Invoice[];
  sponsorshipTiers: SponsorshipTier[];
  budget: Budget;
  budgetLineItems: BudgetLineItem[];
  timeline: ReturnType<typeof buildTimeline>;
  deliveryStats: ReturnType<typeof buildDeliveryStats>;
  pastDeliverersForRoute: (routeId: string, excludePersonId?: string | null) => PastDeliverer[];
  deliveryHistoryForRoute: (routeId: string) => { label: string; count: number }[];
  countChangeByRouteId: (routeId: string, currentCount: number | null | undefined) => number | null;
  refetchAll: () => Promise<void>;
  createSponsorship: (payload: Omit<SponsorshipsInsert, "event_id" | "leaflet_id">) => Promise<void>;
  updateSponsorship: (id: string, patch: SponsorshipsUpdate) => Promise<void>;
  saveSponsorshipTiers: (tiers: SponsorshipTierSeed[]) => Promise<void>;
  sponsorshipTierSeeds: SponsorshipTierSeed[];
  updateLeaflet: (patch: LeafletsUpdate) => Promise<void>;
};

const LeafletContext = createContext<LeafletContextValue | null>(null);

function asEdition(leaflet: Leaflets): LeafletEdition {
  return {
    id: leaflet.id,
    title: leaflet.title,
    distribution_date: leaflet.distribution_date,
    status: leaflet.status,
    comm_initial_confirmation_sent_at: leaflet.comm_initial_confirmation_sent_at,
  };
}

export function LeafletProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string | null>(null);

  const {
    leaflets: leafletRows,
    activeLeaflet: activeRow,
    loading: leafletsLoading,
    error: leafletsError,
    create,
    close,
    update: updateLeafletMutation,
    refetch: refetchLeaflets,
  } = useLeaflets();

  const leaflets = useMemo(() => leafletRows.map(asEdition), [leafletRows]);
  const activeLeaflet = activeRow ? asEdition(activeRow) : null;

  const urlId = searchParams.get("leaflet");
  const selectedRow = useMemo(() => {
    if (urlId) return leafletRows.find((l) => l.id === urlId) ?? null;
    return activeRow;
  }, [urlId, leafletRows, activeRow]);

  const leaflet = selectedRow ? asEdition(selectedRow) : null;
  const leafletId = leaflet?.id ?? null;
  const membershipQrCodeId = selectedRow?.membership_qr_code_id ?? null;
  const openRoutesQrCodeId = selectedRow?.open_routes_qr_code_id ?? null;
  const readOnly = leaflet?.status === "closed";

  const {
    deliveries: deliveryRows,
    loading: deliveriesLoading,
    error: deliveriesError,
    refetch: refetchDeliveries,
    update: updateDelivery,
  } = useDeliveries(leafletId);

  const {
    tasks: taskRows,
    openCount,
    loading: tasksLoading,
    toggleComplete,
    refetch: refetchTasks,
  } = useTasks({
    context: "leaflet",
    contextId: leafletId,
    anchorDate: leaflet?.distribution_date ?? null,
  });

  const { settings: commSettings, refetch: refetchComm } = useCommSettings("leaflet");

  const {
    sponsorships,
    raised,
    pledgedAmount,
    loading: sponsorshipsLoading,
    refetch: refetchSponsorships,
    createSponsorship: createSponsorshipMutation,
    updateSponsorship: updateSponsorshipMutation,
    saveSponsorshipTiers: saveSponsorshipTiersMutation,
  } = useLeafletSponsorships(leafletId);

  const { previousDeliveries, historyDeliveries } = useLeafletHistory(
    selectedRow,
    leafletRows,
    Boolean(leafletId),
  );

  const invoicesQuery = useQuery({
    queryKey: ["leaflet-invoices", leafletId],
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
          leaflet_id: string | null;
        }>;
      };
      if (!res.ok) throw new Error(data.error ?? "Failed to load invoices");
      return data.invoices ?? [];
    },
    enabled: Boolean(leafletId),
  });

  const setLeafletId = useCallback(
    (id: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("leaflet", id);
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    },
    [searchParams, router, pathname],
  );

  const toggleTask = useCallback(
    async (taskId: string) => {
      const row = taskRows.find((t) => t.id === taskId);
      if (!row || readOnly) return;
      await toggleComplete(row);
    },
    [taskRows, readOnly, toggleComplete],
  );

  const sendComm = useCallback(
    async (stepKey: string) => {
      if (!leafletId) throw new Error("No leaflet selected");
      const res = await fetch(
        `${getApiBase()}/api/leaflets/${leafletId}/comm/${stepKey}/send`,
        { method: "POST" },
      );
      const data = (await res.json()) as { error?: string; sent?: number };
      if (!res.ok) throw new Error(data.error ?? "Failed to send");
      await Promise.all([refetchLeaflets(), refetchDeliveries(), refetchComm()]);
      return { sent: data.sent ?? 0 };
    },
    [leafletId, refetchLeaflets, refetchDeliveries, refetchComm],
  );

  const resendComm = useCallback(
    async (personId: string, stepKey?: string) => {
      if (!leafletId) throw new Error("No leaflet selected");
      const res = await fetch(`${getApiBase()}/api/leaflets/${leafletId}/comm/resend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personId, stepKey }),
      });
      const data = (await res.json()) as { error?: string; sent?: number };
      if (!res.ok) throw new Error(data.error ?? "Failed to resend");
      return { sent: data.sent ?? 0 };
    },
    [leafletId],
  );

  const closeLeaflet = useCallback(async () => {
    if (!leafletId) throw new Error("No leaflet selected");
    await close(leafletId);
  }, [leafletId, close]);

  const countChangeFn = useMemo(
    () => countChangeMap(deliveryRows, previousDeliveries),
    [deliveryRows, previousDeliveries],
  );

  const tasks = useMemo(
    () => mapTasksForUi(taskRows, leaflet?.distribution_date ?? null),
    [taskRows, leaflet?.distribution_date],
  );

  const delivererCards = useMemo(
    () => buildDelivererCards(deliveryRows),
    [deliveryRows],
  );

  const commStages = useMemo(
    () => buildCommStages(commSettings, selectedRow, deliveryRows),
    [commSettings, selectedRow, deliveryRows],
  );

  const substitutions = useMemo(
    () => buildSubstitutions(deliveryRows as DeliveryWithRoutePrimary[]),
    [deliveryRows],
  );

  const sponsors = useMemo(() => mapSponsors(sponsorships), [sponsorships]);

  const invoices = useMemo((): Invoice[] => {
    const rows = (invoicesQuery.data ?? []).filter((i) => i.leaflet_id === leafletId);
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
  }, [invoicesQuery.data, leafletId]);

  const budget = useMemo(
    () => buildBudget(selectedRow, sponsorships, raised, pledgedAmount),
    [selectedRow, sponsorships, raised, pledgedAmount],
  );

  const budgetLineItems = useMemo(
    () => buildBudgetLineItems(selectedRow),
    [selectedRow],
  );

  const sponsorshipTiers = useMemo(
    () => buildSponsorshipTiers(sponsorships),
    [sponsorships],
  );

  const sponsorshipTierSeeds = useMemo(
    () => resolveSponsorshipTierSeeds(sponsorships),
    [sponsorships],
  );

  const timeline = useMemo(() => buildTimeline(deliveryRows), [deliveryRows]);
  const deliveryStats = useMemo(() => buildDeliveryStats(deliveryRows), [deliveryRows]);
  const openRoutePreviews = useMemo(
    () => buildOpenRoutePreviews(deliveryRows),
    [deliveryRows],
  );

  const unconfirmedCount = useMemo(() => {
    const people = new Set<string>();
    for (const d of deliveryRows) {
      if (d.person_id && d.response !== "confirmed") people.add(d.person_id);
    }
    return people.size;
  }, [deliveryRows]);

  const pastDeliverersForRoute = useCallback(
    (routeId: string, excludePersonId?: string | null) =>
      buildPastDeliverers(historyDeliveries, routeId, excludePersonId),
    [historyDeliveries],
  );

  const deliveryHistoryForRoute = useCallback(
    (routeId: string) => buildDeliveryHistory(historyDeliveries, routeId),
    [historyDeliveries],
  );

  const refetchAll = useCallback(async () => {
    await Promise.all([
      refetchLeaflets(),
      refetchDeliveries(),
      refetchTasks(),
      refetchComm(),
      refetchSponsorships(),
      invoicesQuery.refetch(),
    ]);
  }, [
    refetchLeaflets,
    refetchDeliveries,
    refetchTasks,
    refetchComm,
    refetchSponsorships,
    invoicesQuery,
  ]);

  const createSponsorship = useCallback(
    async (payload: Omit<SponsorshipsInsert, "event_id" | "leaflet_id">) => {
      if (readOnly) throw new Error("Leaflet is read-only");
      await createSponsorshipMutation(payload);
    },
    [readOnly, createSponsorshipMutation],
  );

  const updateSponsorship = useCallback(
    async (id: string, patch: SponsorshipsUpdate) => {
      if (readOnly) throw new Error("Leaflet is read-only");
      await updateSponsorshipMutation(id, patch);
    },
    [readOnly, updateSponsorshipMutation],
  );

  const saveSponsorshipTiers = useCallback(
    async (tiers: SponsorshipTierSeed[]) => {
      if (readOnly) throw new Error("Leaflet is read-only");
      await saveSponsorshipTiersMutation(tiers);
    },
    [readOnly, saveSponsorshipTiersMutation],
  );

  const updateLeaflet = useCallback(
    async (patch: LeafletsUpdate) => {
      if (readOnly) throw new Error("Leaflet is read-only");
      if (!leafletId) throw new Error("No leaflet selected");
      await updateLeafletMutation(leafletId, patch);
    },
    [readOnly, leafletId, updateLeafletMutation],
  );

  const loading =
    leafletsLoading ||
    deliveriesLoading ||
    tasksLoading ||
    sponsorshipsLoading ||
    invoicesQuery.isLoading;

  const error =
    leafletsError ??
    deliveriesError ??
    (invoicesQuery.error instanceof Error ? invoicesQuery.error.message : null);

  const value = useMemo(
    (): LeafletContextValue => ({
      leafletId,
      leaflet,
      membershipQrCodeId,
      openRoutesQrCodeId,
      readOnly,
      activeLeaflet,
      leaflets,
      loading,
      error,
      setLeafletId,
      createLeaflet: create,
      closeLeaflet,
      deliveries: deliveryRows,
      updateDelivery,
      selectedDeliveryId,
      setSelectedDeliveryId,
      tasks,
      tasksOpenTotal: openCount,
      openCount,
      toggleTask,
      openRoutePreviews,
      stories: [],
      delivererCards,
      commStages,
      sendComm,
      resendComm,
      unconfirmedCount,
      substitutions,
      sponsors,
      invoices,
      sponsorshipTiers,
      budget,
      budgetLineItems,
      timeline,
      deliveryStats,
      pastDeliverersForRoute,
      deliveryHistoryForRoute,
      countChangeByRouteId: countChangeFn,
      refetchAll,
      createSponsorship,
      updateSponsorship,
      saveSponsorshipTiers,
      sponsorshipTierSeeds,
      updateLeaflet,
    }),
    [
      leafletId,
      leaflet,
      membershipQrCodeId,
      openRoutesQrCodeId,
      readOnly,
      activeLeaflet,
      leaflets,
      loading,
      error,
      setLeafletId,
      create,
      closeLeaflet,
      deliveryRows,
      updateDelivery,
      selectedDeliveryId,
      setSelectedDeliveryId,
      tasks,
      openCount,
      toggleTask,
      openRoutePreviews,
      delivererCards,
      commStages,
      sendComm,
      resendComm,
      unconfirmedCount,
      substitutions,
      sponsors,
      invoices,
      sponsorshipTiers,
      budget,
      budgetLineItems,
      timeline,
      deliveryStats,
      pastDeliverersForRoute,
      deliveryHistoryForRoute,
      countChangeFn,
      refetchAll,
      createSponsorship,
      updateSponsorship,
      saveSponsorshipTiers,
      sponsorshipTierSeeds,
      updateLeaflet,
    ],
  );

  return <LeafletContext.Provider value={value}>{children}</LeafletContext.Provider>;
}

export function useLeafletContext() {
  const ctx = useContext(LeafletContext);
  if (!ctx) throw new Error("useLeafletContext must be used within LeafletProvider");
  return ctx;
}

export function leafletHref(path: string, leafletId: string | null): string {
  if (!leafletId) return path;
  const sep = path.includes("?") ? "&" : "?";
  return `${path}${sep}leaflet=${leafletId}`;
}
