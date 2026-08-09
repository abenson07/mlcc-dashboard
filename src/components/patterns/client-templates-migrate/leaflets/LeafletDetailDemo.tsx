"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useParams } from "next/navigation";
import { useLeaflets } from "hooks";
import { FoundationLayout } from "@/components/patterns/foundation/FoundationLayout";
import { CanvasHeader } from "@/components/patterns/foundation/CanvasHeader";
import { LinearSidebar } from "@/components/patterns/foundation/LinearSidebar";
import { useDemoModeOptional } from "@/components/patterns/foundation/DemoModeContext";
import { ViewTab } from "@/components/patterns/foundation/ViewTab";
import { ViewTabs } from "@/components/patterns/foundation/ViewTabs";
import { Badge } from "@/components/patterns/primitives/Badge";
import { EmptyStateCard, OutlinedPanel } from "@/components/patterns/client-templates/shared";
import { LeafletOverviewPage } from "./LeafletOverviewPage";
import { LeafletDeliverersPage } from "./LeafletDeliverersPage";
import { LeafletRoutesPage } from "./LeafletRoutesPage";
import { LeafletSponsorshipsPage } from "./LeafletSponsorshipsPage";
import { LeafletSchedulePage } from "./LeafletSchedulePage";
import { RouteDetailPanel } from "./RouteDetailPanel";
import { LeafletInvoiceDetailPanel } from "./LeafletInvoiceDetailPanel";
import { StoryDetailPanel } from "./StoryDetailPanel";
import { LeafletQrMenu } from "./LeafletQrMenu";
import { LeafletListsMenu } from "./LeafletListsMenu";
import {
  leafletTaskGroupForDueDate,
  formatLeafletTaskDueLabel,
  sampleLeafletDetail,
  sampleLeafletTasks,
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
  const { enabled: demo } = useDemoModeOptional();
  const { leaflets } = useLeaflets();
  const [view, setView] = useState<LeafletDetailView>("overview");
  const isFullBleed = view === "routes";
  const [selection, setSelection] = useState<Selection>(null);
  const [tasks, setTasks] = useState<LeafletTaskRow[]>([]);

  useEffect(() => {
    setTasks(demo ? sampleLeafletTasks : []);
  }, [demo]);

  const leaflet = useMemo(
    () => (demo ? sampleLeafletDetail : liveLeafletDetail(leafletId, leaflets)),
    [demo, leafletId, leaflets],
  );

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

  function toggleTask(id: string) {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, isComplete: !task.isComplete } : task)));
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

  const body = !demo
    ? liveEmpty
    : view === "deliverers"
      ? (
          <LeafletDeliverersPage />
        )
      : view === "routes"
        ? (
            <LeafletRoutesPage onSelectRoute={selectRoute} />
          )
        : view === "sponsorships"
          ? (
              <LeafletSponsorshipsPage onSelectInvoice={selectInvoice} />
            )
          : view === "schedule"
            ? (
                <LeafletSchedulePage
                  tasks={tasks}
                  onToggleTask={toggleTask}
                  onAddTask={addTask}
                  onRemoveTask={removeTask}
                />
              )
            : (
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

  return (
    <div style={{ height: "100%" }}>
      <FoundationLayout
        navigation={navigation ?? <LinearSidebar />}
        contentMaxWidth={isFullBleed && demo ? undefined : 1200}
        isSideContentVisible={demo && selection != null}
        sideContent={
          demo && selection ? (
            <OutlinedPanel onClose={() => setSelection(null)}>
              {selection.kind === "route" ? (
                <RouteDetailPanel route={selection.row} />
              ) : selection.kind === "invoice" ? (
                <LeafletInvoiceDetailPanel invoice={selection.row} />
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
              endContent: demo ? (
                <>
                  <LeafletListsMenu />
                  <LeafletQrMenu />
                </>
              ) : undefined,
            }}
            controls={
              <ViewTabs aria-label="Leaflet views">
                <ViewTab label="Overview" selected={view === "overview"} onClick={() => changeView("overview")} />
                <ViewTab label="Deliverers" selected={view === "deliverers"} onClick={() => changeView("deliverers")} />
                <ViewTab label="Routes" selected={view === "routes"} onClick={() => changeView("routes")} />
                <ViewTab
                  label="Sponsorships"
                  selected={view === "sponsorships"}
                  onClick={() => changeView("sponsorships")}
                />
                <ViewTab label="Schedule" selected={view === "schedule"} onClick={() => changeView("schedule")} />
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
