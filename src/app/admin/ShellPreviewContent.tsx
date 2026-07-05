"use client";

import type { ReactNode } from "react";
import { useCallback, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useEvents, useFavorites, useLeaflets } from "hooks";
import { LeafletProvider } from "@/components/leaflet/LeafletContext";
import Canvas from "@/components/shell/Canvas";
import CanvasArea from "@/components/shell/CanvasArea";
import CanvasContainer from "@/components/shell/CanvasContainer";
import CanvasContent from "@/components/shell/CanvasContent";
import CanvasTopbar from "@/components/shell/CanvasTopbar";
import ShellPreviewNav from "@/components/shell/ShellPreviewNav";
import {
  isShellPreviewLeafletRoute,
  isShellPreviewWidgetsRoute,
  parseShellPreviewEventId,
  shellPreviewBreadcrumbLabel,
} from "@/components/shell/navConfigs";
import { normalizeRoute } from "@/lib/favorites/normalizeRoute";
import Shell from "@/components/shell/Shell";
import ListsForLeafletWidget from "@/components/shell/widgets/ListsForLeafletWidget";
import LeafletWidgetPanel from "@/components/shell/widgets/LeafletWidgetPanel";

type ShellPreviewContentProps = {
  children: ReactNode;
};

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
            />
            <LeafletProvider>
              <CanvasContainer
                showWidgetPanel={widgetPanelOpen && !isShellPreviewWidgetsRoute(pathname)}
                content={<CanvasContent>{children}</CanvasContent>}
                widgetPanel={
                  isShellPreviewWidgetsRoute(pathname) ? null : (
                    <>
                      <ListsForLeafletWidget />
                      {isShellPreviewLeafletRoute(pathname) && <LeafletWidgetPanel />}
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
