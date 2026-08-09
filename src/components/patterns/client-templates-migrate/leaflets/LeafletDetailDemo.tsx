"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useParams } from "next/navigation";
import { Download, Mail } from "lucide-react";
import { toast } from "sonner";
import { useDeliveries, useDemoGuard, useLeaflets } from "hooks";
import { FoundationLayout } from "@/components/patterns/foundation/FoundationLayout";
import { CanvasHeader } from "@/components/patterns/foundation/CanvasHeader";
import { LinearSidebar } from "@/components/patterns/foundation/LinearSidebar";
import { useDemoModeOptional } from "@/components/patterns/foundation/DemoModeContext";
import { ViewTab } from "@/components/patterns/foundation/ViewTab";
import { ViewTabs } from "@/components/patterns/foundation/ViewTabs";
import { Badge } from "@/components/patterns/primitives/Badge";
import { Button } from "@/components/patterns/primitives/Button";
import { EmptyStateCard, OutlinedPanel } from "@/components/patterns/client-templates/shared";
import { getApiBase } from "@/lib/apiBase";
import { LeafletOverviewPage } from "./LeafletOverviewPage";
import { LeafletDeliverersPage } from "./LeafletDeliverersPage";
import { LeafletRoutesPage } from "./LeafletRoutesPage";
import { LeafletSponsorshipsPage } from "./LeafletSponsorshipsPage";
import { LeafletSchedulePage } from "./LeafletSchedulePage";
import { RouteDetailPanel } from "./RouteDetailPanel";
import { LeafletInvoiceDetailPanel } from "./LeafletInvoiceDetailPanel";
import { StoryDetailPanel } from "./StoryDetailPanel";
import { DelivererPersonPanel } from "./DelivererPersonPanel";
import { EmailDeliverersModal } from "./EmailDeliverersModal";
import {
  leafletTaskGroupForDueDate,
  formatLeafletTaskDueLabel,
  sampleLeafletDetail,
  sampleLeafletTasks,
  type LeafletDelivererRow,
  type LeafletDetail,
  type LeafletRouteRow,
  type LeafletSponsorshipInvoiceRow,
  type LeafletStatus,
  type LeafletStoryRow,
  type LeafletTaskRow,
} from "@/data/mocks/leaflets";

type LeafletDetailView = "overview" | "deliverers" | "routes" | "sponsorships" | "schedule";

type Selection =
  | { kind: "route"; row: LeafletRouteRow }
  | { kind: "invoice"; row: LeafletSponsorshipInvoiceRow }
  | { kind: "story"; row: LeafletStoryRow }
  | { kind: "person"; row: LeafletDelivererRow }
  | null;

function statusLabel(status: LeafletStatus): string {
  if (status === "active") return "Active";
  if (status === "planned") return "Planned";
  return "Closed";
}

function liveLeafletDetail(
  id: string,
  leaflets: { id: string; title: string; distribution_date: string; status: string }[],
): LeafletDetail {
  const row = leaflets.find((l) => l.id === id);
  if (!row) {
    return {
      id,
      title: "Leaflet",
      distributionDate: "",
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
    status,
    countdownLabel: "—",
  };
}

export type LeafletDetailDemoProps = {
  navigation?: ReactNode;
};

export function LeafletDetailDemo({ navigation }: LeafletDetailDemoProps = {}) {
  const params = useParams<{ id: string }>();
  const leafletId = typeof params?.id === "string" ? params.id : "";
  const { enabled: demoMode } = useDemoModeOptional();
  const { enabled: demoGuard } = useDemoGuard();
  const demo = demoMode || demoGuard;
  const { leaflets } = useLeaflets();
  const { deliveries } = useDeliveries(leafletId, { enabled: !demo && Boolean(leafletId) });
  const [view, setView] = useState<LeafletDetailView>("overview");
  const [selection, setSelection] = useState<Selection>(null);
  const [tasks, setTasks] = useState<LeafletTaskRow[]>([]);
  const [emailOpen, setEmailOpen] = useState(false);

  useEffect(() => {
    setTasks(demo ? sampleLeafletTasks : []);
  }, [demo]);

  const leaflet = useMemo(
    () => (demo ? sampleLeafletDetail : liveLeafletDetail(leafletId, leaflets)),
    [demo, leafletId, leaflets],
  );

  const unresolvedRecipientCount = useMemo(() => {
    if (demo) return 8;
    return deliveries.filter((d) => d.person_id && d.response !== "confirmed").length;
  }, [demo, deliveries]);

  function changeView(next: LeafletDetailView) {
    setView(next);
    setSelection(null);
  }

  function selectRoute(row: LeafletRouteRow) {
    setSelection({ kind: "route", row });
  }

  function selectInvoice(row: LeafletSponsorshipInvoiceRow) {
    setSelection({ kind: "invoice", row });
  }

  function selectStory(row: LeafletStoryRow) {
    setSelection({ kind: "story", row });
  }

  function selectDeliverer(row: LeafletDelivererRow) {
    setSelection({ kind: "person", row });
  }

  function toggleTask(id: string) {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, isComplete: !task.isComplete } : task)),
    );
  }

  function addTask({ title, dueDate }: { title: string; dueDate: string }) {
    const group = leafletTaskGroupForDueDate(dueDate);
    const isOverdue = group === "Past due";
    setTasks((prev) => [
      ...prev,
      {
        id: `lf-task-${Date.now()}`,
        title,
        group,
        dueLabel: formatLeafletTaskDueLabel(dueDate, isOverdue),
        isComplete: false,
        isOverdue,
      },
    ]);
  }

  function removeTask(id: string) {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }

  function downloadTopSheets() {
    const id = leaflet.id || leafletId;
    if (!id || id.startsWith("lf-")) {
      if (demo) {
        toast.success("Top sheets download — demo mode (no real file)");
        return;
      }
      toast.error("Leaflet id required to download top sheets");
      return;
    }
    window.open(
      `${getApiBase()}/api/leaflets/${encodeURIComponent(id)}/deliveries/cover-sheets`,
      "_blank",
    );
  }

  const liveEmpty = (
    <div style={{ padding: "32px 24px" }}>
      <EmptyStateCard
        variant="plain"
        label={
          view === "overview"
            ? "Leaflet detail sections not wired yet — turn on demo mode to preview"
            : `${view[0]!.toUpperCase()}${view.slice(1)} not wired yet — turn on demo mode to preview`
        }
      />
    </div>
  );

  const body =
    view === "deliverers" ? (
      <LeafletDeliverersPage
        leafletId={leafletId || leaflet.id}
        demo={demo}
        onSelectDeliverer={selectDeliverer}
      />
    ) : view === "routes" ? (
      <LeafletRoutesPage
        leafletId={leafletId || leaflet.id}
        demo={demo}
        onSelectRoute={selectRoute}
      />
    ) : !demo ? (
      liveEmpty
    ) : view === "sponsorships" ? (
      <LeafletSponsorshipsPage onSelectInvoice={selectInvoice} />
    ) : view === "schedule" ? (
      <LeafletSchedulePage
        tasks={tasks}
        onToggleTask={toggleTask}
        onAddTask={addTask}
        onRemoveTask={removeTask}
      />
    ) : (
      <LeafletOverviewPage
        leaflet={leaflet}
        tasks={tasks}
        onToggleTask={toggleTask}
        onSeeAllTasks={() => changeView("schedule")}
        onSeeAllOpenRoutes={() => changeView("routes")}
        onViewSponsorships={() => changeView("sponsorships")}
        onSelectOpenRoute={selectRoute}
        onSelectSkippedRoute={selectRoute}
        onSelectSponsor={() => changeView("sponsorships")}
        onSelectStory={selectStory}
      />
    );

  const sideContentVisible = selection != null && (demo || selection.kind === "person" || view === "routes" || view === "deliverers");

  return (
    <div style={{ height: "100%" }}>
      <FoundationLayout
        navigation={navigation ?? <LinearSidebar />}
        contentMaxWidth={1200}
        isSideContentVisible={sideContentVisible}
        sideContent={
          selection ? (
            <OutlinedPanel onClose={() => setSelection(null)}>
              {selection.kind === "route" ? (
                <RouteDetailPanel route={selection.row} />
              ) : selection.kind === "invoice" ? (
                <LeafletInvoiceDetailPanel invoice={selection.row} />
              ) : selection.kind === "person" ? (
                <DelivererPersonPanel deliverer={selection.row} />
              ) : (
                <StoryDetailPanel story={selection.row} />
              )}
            </OutlinedPanel>
          ) : null
        }
        header={
          <CanvasHeader
            topbar={{
              title: leaflet.title,
              titleAdornment: <Badge label={statusLabel(leaflet.status)} />,
              hasFavorite: true,
              endContent:
                view === "deliverers" ? (
                  <>
                    <Button
                      label="Download Top Sheets"
                      variant="secondary"
                      icon={<Download size={14} strokeWidth={1.75} />}
                      onClick={downloadTopSheets}
                    />
                    <Button
                      label="Email deliverers"
                      variant="secondary"
                      icon={<Mail size={14} strokeWidth={1.75} />}
                      onClick={() => setEmailOpen(true)}
                    />
                  </>
                ) : undefined,
            }}
            controls={
              <ViewTabs aria-label="Leaflet views">
                <ViewTab
                  label="Overview"
                  selected={view === "overview"}
                  onClick={() => changeView("overview")}
                />
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
                  label="Sponsorships"
                  selected={view === "sponsorships"}
                  onClick={() => changeView("sponsorships")}
                />
                <ViewTab
                  label="Tasks"
                  selected={view === "schedule"}
                  onClick={() => changeView("schedule")}
                />
              </ViewTabs>
            }
          />
        }
      >
        {body}
      </FoundationLayout>

      <EmailDeliverersModal
        isOpen={emailOpen}
        onClose={() => setEmailOpen(false)}
        leafletId={leafletId || leaflet.id}
        leafletTitle={leaflet.title}
        distributionDate={leaflet.distributionDate}
        recipientCount={unresolvedRecipientCount}
      />
    </div>
  );
}
