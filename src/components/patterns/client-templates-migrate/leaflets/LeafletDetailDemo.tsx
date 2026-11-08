"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import { Mail } from "lucide-react";
import {
  useCommSettings,
  useDeliveries,
  useDemoGuard,
  useFavorites,
  useLeafletCommSends,
  useLeaflets,
} from "hooks";
import { normalizeRoute } from "@/lib/favorites/normalizeRoute";
import { FoundationLayout } from "@/components/patterns/foundation/FoundationLayout";
import { CanvasHeader } from "@/components/patterns/foundation/CanvasHeader";
import { LinearSidebar } from "@/components/patterns/foundation/LinearSidebar";
import { useDemoModeOptional } from "@/components/patterns/foundation/DemoModeContext";
import { ViewTab } from "@/components/patterns/foundation/ViewTab";
import { ViewTabs } from "@/components/patterns/foundation/ViewTabs";
import { Badge } from "@/components/patterns/primitives/Badge";
import { Button } from "@/components/patterns/primitives/Button";
import { OutlinedPanel } from "@/components/patterns/client-templates/shared";
import { buildCommStages, commRecipientCount } from "@/components/leaflet/leafletData";
import { LeafletDeliverersPage } from "./LeafletDeliverersPage";
import { LeafletRoutesPage } from "./LeafletRoutesPage";
import { RouteDetailPanel } from "./RouteDetailPanel";
import { DelivererPersonPanel } from "./DelivererPersonPanel";
import { LeafletDetailsPanel } from "./LeafletDetailsPanel";
import { LeafletCommStepsModal } from "./LeafletCommStepsModal";
import { demoDeliveriesForComm, leafletRowForComm } from "./demoLeafletComm";
import { DEMO_STORE_EVENT, listDemoScoped, patchDemoEntity } from "@/lib/demo/demoStore";
import { leafletCommSettingsFromDefs, snapshotCommSchedule } from "@/lib/leaflets/comm/commSchedule";
import { latestSendPerStep, type CommSend } from "@/lib/leaflets/comm/commSends";
import { deliveriesToDelivererRows, deliveriesToRouteRows, sampleAllRouteRows } from "./adapters";
import {
  sampleDeliverers,
  sampleLeafletDetail,
  sampleLeaflets,
  type LeafletDelivererRow,
  type LeafletDetail,
  type LeafletRouteRow,
  type LeafletStatus,
  type LeafletSummary,
} from "@/data/mocks/leaflets";

type LeafletDetailView = "deliverers" | "routes" | "open-routes" | "settings";

function statusLabel(status: LeafletStatus): string {
  if (status === "active") return "Active";
  if (status === "planned") return "Planned";
  return "Closed";
}

function formatCountdownLabel(distributionDate: string, status: LeafletStatus): string {
  if (!distributionDate) return "—";
  if (status === "closed") return "Distribution complete";

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${distributionDate}T00:00:00`);
  if (Number.isNaN(target.getTime())) return "—";

  const daysUntil = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (daysUntil === 0) return "Distributing today";
  if (daysUntil === 1) return "Distributing tomorrow";
  if (daysUntil > 1) return `${daysUntil} days until distribution`;
  if (daysUntil === -1) return "Distributed yesterday";
  return `Distributed ${Math.abs(daysUntil)} days ago`;
}

function liveLeafletDetail(
  id: string,
  leaflets: {
    id: string;
    title: string;
    distribution_date: string;
    distribution_date_2?: string | null;
    status: string;
  }[],
): LeafletDetail {
  const row = leaflets.find((l) => l.id === id);
  if (!row) {
    return {
      id,
      title: "Leaflet",
      distributionDate: "",
      distributionDate2: null,
      status: "planned",
      countdownLabel: "—",
    };
  }
  const status =
    row.status === "active" || row.status === "planned" || row.status === "closed"
      ? row.status
      : "planned";
  return {
    id: row.id,
    title: row.title,
    distributionDate: row.distribution_date,
    distributionDate2: row.distribution_date_2 ?? null,
    status,
    countdownLabel: formatCountdownLabel(row.distribution_date, status),
  };
}

export type LeafletDetailDemoProps = {
  navigation?: ReactNode;
};

export function LeafletDetailDemo({ navigation }: LeafletDetailDemoProps = {}) {
  const params = useParams<{ id: string }>();
  const leafletId = typeof params?.id === "string" ? params.id : "";
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { enabled: demoMode } = useDemoModeOptional();
  const { enabled: demoGuard, store } = useDemoGuard();
  const demo = demoMode || demoGuard;
  const { leaflets, refetch: refetchLeaflets } = useLeaflets();
  const { isFavorite, toggleFavorite } = useFavorites();
  const currentRoute = normalizeRoute(
    searchParams.toString() ? `${pathname}?${searchParams.toString()}` : pathname,
  );
  const { deliveries, refetch: refetchDeliveries } = useDeliveries(leafletId, { enabled: !demo && Boolean(leafletId) });
  const [view, setView] = useState<LeafletDetailView>("deliverers");
  const [selectedRoute, setSelectedRoute] = useState<LeafletRouteRow | null>(null);
  const [selectedDelivererId, setSelectedDelivererId] = useState<string | null>(null);
  const [demoRoutes, setDemoRoutes] = useState<LeafletRouteRow[]>([]);
  const [demoDeliverers, setDemoDeliverers] = useState<LeafletDelivererRow[]>([]);
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailPersonId, setEmailPersonId] = useState<string | null>(null);
  // Demo mode keeps its send history in page state only (resets on reload).
  const [demoSends, setDemoSends] = useState<CommSend[]>([]);
  const { sends: liveSends, refetch: refetchSends } = useLeafletCommSends(leafletId, { enabled: !demo });
  const sends = demo ? demoSends : liveSends;

  useEffect(() => {
    if (!demo) {
      setDemoRoutes([]);
      setDemoDeliverers([]);
      return;
    }
    const scopeKey = leafletId || "default";
    const load = () => {
      setDemoRoutes(listDemoScoped<LeafletRouteRow>("leafletRoutes", scopeKey) ?? sampleAllRouteRows());
      setDemoDeliverers(
        listDemoScoped<LeafletDelivererRow>("leafletDeliverers", scopeKey) ?? sampleDeliverers,
      );
    };
    load();
    window.addEventListener(DEMO_STORE_EVENT, load);
    return () => window.removeEventListener(DEMO_STORE_EVENT, load);
  }, [demo, leafletId]);

  const leaflet = useMemo(() => {
    if (!demo) return liveLeafletDetail(leafletId, leaflets);
    const merged = store.merge<LeafletSummary>("leaflets", sampleLeaflets);
    const row = merged.find((item) => item.id === leafletId);
    if (!row) {
      return leafletId === sampleLeafletDetail.id
        ? sampleLeafletDetail
        : {
            id: leafletId,
            title: "Leaflet",
            distributionDate: "",
            distributionDate2: null,
            status: "planned" as const,
            countdownLabel: "—",
          };
    }
    return {
      id: row.id,
      title: row.title,
      distributionDate: row.distributionDate,
      distributionDate2: row.distributionDate2 ?? null,
      status: row.status,
      countdownLabel: formatCountdownLabel(row.distributionDate, row.status),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demo, leafletId, leaflets, store.version]);

  const { settings: liveCommSettings } = useCommSettings("leaflet");
  const fallbackCommSettings = useMemo(() => leafletCommSettingsFromDefs(), []);
  const commSettings = demo
    ? fallbackCommSettings
    : liveCommSettings.length > 0
      ? liveCommSettings
      : fallbackCommSettings;

  const demoLeafletRecord = useMemo(() => {
    if (!demo) return null;
    return store.merge<LeafletSummary>("leaflets", sampleLeaflets).find((item) => item.id === leafletId) ?? null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demo, leafletId, store.version]);

  const leafletRawRow = useMemo(() => leaflets.find((l) => l.id === leafletId), [leaflets, leafletId]);

  const commLeafletRow = useMemo(() => {
    if (demo) {
      const schedule =
        demoLeafletRecord?.comm_schedule ??
        (leaflet.distributionDate ? snapshotCommSchedule(commSettings, leaflet.distributionDate) : undefined);
      return leafletRowForComm({
        id: leaflet.id,
        title: leaflet.title,
        distributionDate: leaflet.distributionDate,
        distributionDate2: leaflet.distributionDate2,
        status: leaflet.status,
        comm_schedule: schedule,
        commSent: demoLeafletRecord?.commSent,
      });
    }
    return leafletRawRow ?? null;
  }, [demo, demoLeafletRecord, commSettings, leaflet, leafletRawRow]);

  const commDeliveries = useMemo(
    () => (demo ? demoDeliveriesForComm(leaflet.id, demoLeafletRecord?.commSent) : deliveries),
    [demo, leaflet.id, demoLeafletRecord?.commSent, deliveries],
  );

  const commStages = useMemo(
    () => buildCommStages(commSettings, commLeafletRow, commDeliveries),
    [commSettings, commLeafletRow, commDeliveries],
  );

  const recipientCountByStep = useMemo(() => {
    const out: Record<string, number> = {};
    for (const stage of commStages) {
      if (!stage.stepKey) continue;
      out[stage.stepKey] = commRecipientCount(stage.stepKey, commDeliveries);
    }
    return out;
  }, [commStages, commDeliveries]);

  function openEmailModal(personId?: string) {
    setEmailPersonId(personId ?? null);
    setEmailOpen(true);
  }

  const routeRows = useMemo(() => deliveriesToRouteRows(deliveries), [deliveries]);
  const liveDeliverers = useMemo(() => deliveriesToDelivererRows(deliveries), [deliveries]);

  const resolvedRoute = selectedRoute
    ? ((demo ? demoRoutes : routeRows).find((row) => row.id === selectedRoute.id) ?? selectedRoute)
    : null;

  const resolvedDeliverer = selectedDelivererId
    ? ((demo ? demoDeliverers : liveDeliverers).find((row) => row.id === selectedDelivererId) ?? null)
    : null;

  function selectRoute(row: LeafletRouteRow) {
    setSelectedDelivererId(null);
    setSelectedRoute(row);
  }

  function selectDeliverer(row: LeafletDelivererRow) {
    setSelectedRoute(null);
    setSelectedDelivererId(row.id);
  }

  function closeSidePanel() {
    setSelectedRoute(null);
    setSelectedDelivererId(null);
  }

  const stepLabels = useMemo(
    () => Object.fromEntries(commStages.filter((s) => s.stepKey).map((s) => [s.stepKey as string, s.name])),
    [commStages],
  );

  const personSendsForModal = useMemo(
    () => (emailPersonId ? latestSendPerStep(sends, emailPersonId) : undefined),
    [sends, emailPersonId],
  );

  async function handleCommSent(stepKey: string) {
    if (demo) {
      const sentAt = new Date().toISOString();
      const recipients = emailPersonId ? [emailPersonId] : demoDeliverers.map((d) => d.id);
      setDemoSends((prev) => [
        ...recipients.map((person_id) => ({ person_id, step_key: stepKey, sent_at: sentAt })),
        ...prev,
      ]);
      if (emailPersonId) return;
      patchDemoEntity("leaflets", leafletId || leaflet.id, {
        commSent: {
          ...(demoLeafletRecord?.commSent ?? {}),
          [stepKey]: new Date().toISOString(),
        },
      });
      return;
    }
    await Promise.all([refetchLeaflets(), refetchDeliveries(), refetchSends()]);
  }

  function changeView(next: LeafletDetailView) {
    setView(next);
    closeSidePanel();
  }

  const body =
    view === "deliverers" ? (
      <LeafletDeliverersPage
        leafletId={leafletId || leaflet.id}
        demo={demo}
        onSelectDeliverer={selectDeliverer}
        onEmailDeliverer={(row) => openEmailModal(row.id)}
        sends={sends}
        stepLabels={stepLabels}
      />
    ) : view === "settings" ? (
      <div style={{ height: "100%", minHeight: 0, overflow: "auto", boxSizing: "border-box" }}>
        <LeafletDetailsPanel
          leafletId={leafletId || leaflet.id}
          title={leaflet.title}
          distributionDate={leaflet.distributionDate}
          distributionDate2={leaflet.distributionDate2 ?? null}
          commSchedule={commLeafletRow?.comm_schedule}
          commSettings={commSettings}
        />
      </div>
    ) : (
      <LeafletRoutesPage
        key={view}
        leafletId={leafletId || leaflet.id}
        demo={demo}
        onSelectRoute={selectRoute}
        lockedStatus={view === "open-routes" ? "unassigned" : undefined}
      />
    );

  return (
    <div style={{ height: "100%" }}>
      <FoundationLayout
        navigation={navigation ?? <LinearSidebar />}
        contentMaxWidth={view === "settings" ? undefined : 1200}
        isSideContentVisible={resolvedRoute != null || resolvedDeliverer != null}
        sideContent={
          resolvedRoute ? (
            <OutlinedPanel onClose={closeSidePanel}>
              <RouteDetailPanel route={resolvedRoute} leafletId={leafletId || leaflet.id} demo={demo} />
            </OutlinedPanel>
          ) : resolvedDeliverer ? (
            <OutlinedPanel onClose={closeSidePanel}>
              <DelivererPersonPanel
                deliverer={resolvedDeliverer}
                leafletId={leafletId || leaflet.id}
                demo={demo}
                onEmail={() => openEmailModal(resolvedDeliverer.id)}
              />
            </OutlinedPanel>
          ) : null
        }
        header={
          <CanvasHeader
            topbar={{
              title: leaflet.title,
              titleAdornment: <Badge label={statusLabel(leaflet.status)} />,
              hasFavorite: true,
              isFavorite: isFavorite(currentRoute),
              onFavoriteClick: () =>
                void toggleFavorite({ name: leaflet.title, route: currentRoute }),
              endContent: (
                <Button
                  label="Email deliverers"
                  variant="secondary"
                  icon={<Mail size={14} strokeWidth={1.75} />}
                  onClick={() => openEmailModal()}
                />
              ),
            }}
            controls={
              <ViewTabs aria-label="Leaflet views">
                <ViewTab
                  label="Deliverers"
                  selected={view === "deliverers"}
                  onClick={() => changeView("deliverers")}
                />
                <ViewTab
                  label="Routes"
                  selected={view === "routes"}
                  onClick={() => changeView("routes")}
                />
                <ViewTab
                  label="Open Routes"
                  selected={view === "open-routes"}
                  onClick={() => changeView("open-routes")}
                />
                <ViewTab
                  label="Settings"
                  selected={view === "settings"}
                  onClick={() => changeView("settings")}
                />
              </ViewTabs>
            }
          />
        }
      >
        {body}
      </FoundationLayout>

      <LeafletCommStepsModal
        isOpen={emailOpen}
        onClose={() => {
          setEmailOpen(false);
          setEmailPersonId(null);
        }}
        leafletId={leafletId || leaflet.id}
        leafletTitle={leaflet.title}
        distributionDate={leaflet.distributionDate}
        stages={commStages}
        deliverers={demo ? demoDeliverers : liveDeliverers}
        recipientCountByStep={recipientCountByStep}
        personId={emailPersonId}
        personSends={personSendsForModal}
        onSent={handleCommSent}
      />
    </div>
  );
}
