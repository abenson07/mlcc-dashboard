"use client";

import type { ReactNode } from "react";
import { useCallback, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useEvents, useFavorites, useLeaflets } from "hooks";
import { LeafletProvider, useLeafletContext } from "@/components/leaflet/LeafletContext";
import Canvas from "@/components/shell/Canvas";
import CanvasArea from "@/components/shell/CanvasArea";
import CanvasContainer from "@/components/shell/CanvasContainer";
import CanvasContent from "@/components/shell/CanvasContent";
import CanvasTopbar from "@/components/shell/CanvasTopbar";
import CanvasTooling from "@/components/shell/CanvasTooling";
import ShellPreviewNav from "@/components/shell/ShellPreviewNav";
import {
  isShellPreviewEventDetailRoute,
  isShellPreviewFaqsRoute,
  isShellPreviewLeafletDeliverersRoute,
  isShellPreviewLeafletRoute,
  isShellPreviewLeafletRouteDetailsRoute,
  isShellPreviewLeafletSponsorshipsRoute,
  isShellPreviewLeafletTodoRoute,
  isShellPreviewWidgetsRoute,
  parseShellPreviewEventId,
  shellPreviewBreadcrumbLabel,
} from "@/components/shell/navConfigs";
import AttendanceWidget from "@/components/shell/widgets/AttendanceWidget";
import { normalizeRoute } from "@/lib/favorites/normalizeRoute";
import Shell from "@/components/shell/Shell";
import ListsForLeafletWidget from "@/components/shell/widgets/ListsForLeafletWidget";
import QrCodesWidget from "@/components/shell/widgets/QrCodesWidget";
import DistributionDetailsWidget from "@/components/shell/widgets/DistributionDetailsWidget";
import RouteDetailsWidget from "@/components/shell/widgets/RouteDetailsWidget";
import BuildingContactWidget from "@/components/shell/widgets/BuildingContactWidget";
import CommunicationStagesWidget from "@/components/shell/widgets/CommunicationStagesWidget";
import CoverSheetsWidget from "@/components/shell/widgets/CoverSheetsWidget";
import BudgetSponsorshipsWidget from "@/components/shell/widgets/BudgetSponsorshipsWidget";
import SponsorshipLevelsWidget from "@/components/shell/widgets/SponsorshipLevelsWidget";

type ShellPreviewContentProps = {
  children: ReactNode;
};

function LeafletSponsorshipTooling({
  widgetPanelOpen,
  onToggleWidgetPanel,
}: {
  widgetPanelOpen: boolean;
  onToggleWidgetPanel: () => void;
}) {
  const { setSponsorModalOpen, setInvoiceModalOpen } = useLeafletContext();
  return (
    <CanvasTooling
      widgetPanelOpen={widgetPanelOpen}
      onToggleWidgetPanel={onToggleWidgetPanel}
      links={[
        { label: "+ Add sponsor", onClick: () => setSponsorModalOpen(true) },
        { label: "Issue invoice", onClick: () => setInvoiceModalOpen(true) },
      ]}
    />
  );
}

export default function ShellPreviewContent({ children }: ShellPreviewContentProps) {
  const pathname = usePathname() ?? "";
  const searchParams = useSearchParams();
  const [widgetPanelOpen, setWidgetPanelOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("widget-panel-open") !== "false";
    }
    return true;
  });
  const { events } = useEvents();
  const { leaflets } = useLeaflets();
  const { isFavorite, toggleFavorite } = useFavorites();

  const currentRoute = useMemo(() => {
    const search = searchParams.toString();
    return normalizeRoute(search ? `${pathname}?${search}` : pathname);
  }, [pathname, searchParams]);

  const currentEventId = parseShellPreviewEventId(pathname);
  const currentEvent = currentEventId
    ? events.find((item) => item.id === currentEventId)
    : null;

  const breadcrumbs = useMemo(() => {
    const eventId = parseShellPreviewEventId(pathname);
    if (eventId) {
      const event = events.find((item) => item.id === eventId);
      return [{ label: "Events" }, { label: event?.title ?? "Event" }];
    }

    if (isShellPreviewLeafletRoute(pathname)) {
      const leafletId = searchParams.get("leaflet");
      const leaflet =
        (leafletId ? leaflets.find((item) => item.id === leafletId) : null) ??
        leaflets.find((item) => item.status === "active") ??
        leaflets.find((item) => item.status === "planned") ??
        leaflets[0];

      if (leaflet) {
        return [{ label: "Leaflet" }, { label: leaflet.title }];
      }
      return [{ label: "Leaflet" }];
    }

    return [{ label: shellPreviewBreadcrumbLabel(pathname) }];
  }, [events, leaflets, pathname, searchParams]);

  const favoriteName = breadcrumbs[breadcrumbs.length - 1]?.label ?? "Page";

  const handleFavoriteToggle = useCallback(() => {
    void toggleFavorite({ name: favoriteName, route: currentRoute });
  }, [currentRoute, favoriteName, toggleFavorite]);

  return (
    <div className="shell-preview-root">
      <Shell nav={<ShellPreviewNav />}>
        <CanvasArea>
          <Canvas>
            <LeafletProvider>
              <CanvasTopbar
                breadcrumbs={breadcrumbs}
                isFavorite={isFavorite(currentRoute)}
                onFavoriteToggle={handleFavoriteToggle}
                widgetPanelOpen={widgetPanelOpen}
                onToggleWidgetPanel={() =>
                  setWidgetPanelOpen((open) => {
                    const next = !open;
                    localStorage.setItem("widget-panel-open", String(next));
                    return next;
                  })
                }
                tooling={
                  isShellPreviewLeafletSponsorshipsRoute(pathname) ? (
                    <LeafletSponsorshipTooling
                      widgetPanelOpen={widgetPanelOpen}
                      onToggleWidgetPanel={() =>
                        setWidgetPanelOpen((open) => {
                          const next = !open;
                          localStorage.setItem("widget-panel-open", String(next));
                          return next;
                        })
                      }
                    />
                  ) : undefined
                }
              />
              <CanvasContainer
                showWidgetPanel={
                  widgetPanelOpen &&
                  !isShellPreviewWidgetsRoute(pathname) &&
                  !isShellPreviewFaqsRoute(pathname)
                }
                content={<CanvasContent>{children}</CanvasContent>}
                widgetPanel={
                  isShellPreviewWidgetsRoute(pathname) || isShellPreviewFaqsRoute(pathname) ? null : isShellPreviewEventDetailRoute(pathname) && currentEvent?.kind === "committee_meeting" ? (
                    <AttendanceWidget eventId={currentEvent.id} />
                  ) : isShellPreviewLeafletRouteDetailsRoute(pathname) ? (
                    <>
                      <RouteDetailsWidget />
                      <BuildingContactWidget />
                    </>
                  ) : isShellPreviewLeafletDeliverersRoute(pathname) ? (
                    <>
                      <CommunicationStagesWidget />
                      <CoverSheetsWidget />
                    </>
                  ) : isShellPreviewLeafletSponsorshipsRoute(pathname) ? (
                    <>
                      <SponsorshipLevelsWidget />
                      <BudgetSponsorshipsWidget />
                    </>
                  ) : isShellPreviewLeafletTodoRoute(pathname) ? (
                    <>
                      <DistributionDetailsWidget />
                      <ListsForLeafletWidget />
                      <QrCodesWidget />
                    </>
                  ) : (
                    <>
                      <DistributionDetailsWidget />
                      <CommunicationStagesWidget />
                      <ListsForLeafletWidget />
                      <QrCodesWidget />
                    </>
                  )
                }
              />
            </LeafletProvider>
          </Canvas>
        </CanvasArea>
      </Shell>
    </div>
  );
}
