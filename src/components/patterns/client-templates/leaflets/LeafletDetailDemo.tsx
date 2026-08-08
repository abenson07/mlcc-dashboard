"use client";

import { useState, type ReactNode } from "react";
import { List as ListIcon, QrCode as QrCodeIcon } from "lucide-react";
import { FoundationLayout } from "@/components/patterns/foundation/FoundationLayout";
import { CanvasHeader } from "@/components/patterns/foundation/CanvasHeader";
import { LinearSidebar } from "@/components/patterns/foundation/LinearSidebar";
import { ViewTab } from "@/components/patterns/foundation/ViewTab";
import { ViewTabs } from "@/components/patterns/foundation/ViewTabs";
import { Badge } from "@/components/patterns/primitives/Badge";
import { OutlinedPanel } from "@/components/patterns/client-templates/shared";
import { LeafletOverviewPage } from "./LeafletOverviewPage";
import { LeafletDeliverersPage } from "./LeafletDeliverersPage";
import { LeafletRoutesPage } from "./LeafletRoutesPage";
import { LeafletSponsorshipsPage } from "./LeafletSponsorshipsPage";
import { LeafletSchedulePage } from "./LeafletSchedulePage";
import { RouteDetailPanel } from "./RouteDetailPanel";
import { LeafletInvoiceDetailPanel } from "./LeafletInvoiceDetailPanel";
import { StoryDetailPanel } from "./StoryDetailPanel";
import { LeafletQrModal } from "./LeafletQrModal";
import { LeafletListsModal } from "./LeafletListsModal";
import {
  leafletTaskGroupForDueDate,
  formatLeafletTaskDueLabel,
  sampleLeafletDetail,
  sampleLeafletTasks,
  type LeafletRouteRow,
  type LeafletSponsorshipInvoiceRow,
  type LeafletStoryRow,
  type LeafletTaskRow,
} from "@/data/mocks/leaflets";

type LeafletDetailView = "overview" | "deliverers" | "routes" | "sponsorships" | "schedule";

type Selection =
  | { kind: "route"; row: LeafletRouteRow }
  | { kind: "invoice"; row: LeafletSponsorshipInvoiceRow }
  | { kind: "story"; row: LeafletStoryRow }
  | null;

export type LeafletDetailDemoProps = {
  navigation?: ReactNode;
};

export function LeafletDetailDemo({ navigation }: LeafletDetailDemoProps = {}) {
  const [view, setView] = useState<LeafletDetailView>("overview");
  const [selection, setSelection] = useState<Selection>(null);
  const [tasks, setTasks] = useState<LeafletTaskRow[]>(sampleLeafletTasks);
  const [isQrModalOpen, setQrModalOpen] = useState(false);
  const [isListsModalOpen, setListsModalOpen] = useState(false);

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

  const body =
    view === "deliverers" ? (
      <LeafletDeliverersPage />
    ) : view === "routes" ? (
      <LeafletRoutesPage onSelectRoute={selectRoute} />
    ) : view === "sponsorships" ? (
      <LeafletSponsorshipsPage onSelectInvoice={selectInvoice} />
    ) : view === "schedule" ? (
      <LeafletSchedulePage tasks={tasks} onToggleTask={toggleTask} onAddTask={addTask} onRemoveTask={removeTask} />
    ) : (
      <LeafletOverviewPage
        leaflet={sampleLeafletDetail}
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

  const statusLabel =
    sampleLeafletDetail.status === "active"
      ? "Active"
      : sampleLeafletDetail.status === "planned"
        ? "Planned"
        : "Closed";

  return (
    <div style={{ height: "100%" }}>
      <FoundationLayout
        navigation={navigation ?? <LinearSidebar />}
        contentMaxWidth={1200}
        isSideContentVisible={selection != null}
        sideContent={
          selection ? (
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
              title: sampleLeafletDetail.title,
              titleAdornment: <Badge label={statusLabel} />,
              hasFavorite: true,
              endActions: [
                {
                  type: "custom",
                  id: "lists-for-leaflet",
                  label: "Lists for leaflet",
                  icon: <ListIcon size={16} strokeWidth={1.75} />,
                  onClick: () => setListsModalOpen(true),
                },
                {
                  type: "custom",
                  id: "qr-codes",
                  label: "QR codes",
                  icon: <QrCodeIcon size={16} strokeWidth={1.75} />,
                  onClick: () => setQrModalOpen(true),
                },
              ],
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

      <LeafletQrModal isOpen={isQrModalOpen} onClose={() => setQrModalOpen(false)} />
      <LeafletListsModal isOpen={isListsModalOpen} onClose={() => setListsModalOpen(false)} />
    </div>
  );
}
