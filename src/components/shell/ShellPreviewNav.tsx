"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { useEvents, useFavorites, useLeaflets } from "hooks";
import NavPanel from "./NavPanel";
import {
  buildShellPreviewEventL2Config,
  buildShellPreviewLeafletL2Config,
  buildShellPreviewL1Config,
  isShellPreviewEventDetailRoute,
  isShellPreviewLeafletRoute,
  parseShellPreviewEventId,
} from "./navConfigs";
import type { DropdownItem } from "./NavPanelTypes";

export default function ShellPreviewNav() {
  const pathname = usePathname() ?? "";
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const { events } = useEvents();
  const { leaflets } = useLeaflets();
  const { favorites } = useFavorites();

  const eventId = parseShellPreviewEventId(pathname);
  const showLeafletL2 = isShellPreviewLeafletRoute(pathname);
  const showEventL2 = isShellPreviewEventDetailRoute(pathname);

  const l1Config = useMemo(
    () => buildShellPreviewL1Config(favorites),
    [favorites],
  );

  const l2Config = useMemo(() => {
    if (showLeafletL2) {
      const activeLeaflet =
        leaflets.find((l) => l.status === "active") ??
        leaflets.find((l) => l.status === "planned") ??
        leaflets[0];

      const dropdownItems: DropdownItem[] = [
        ...leaflets.slice(0, 6).map((leaflet) => ({
          type: "item" as const,
          id: leaflet.id,
          label: leaflet.title,
          href: `/admin/leaflet?leaflet=${leaflet.id}`,
        })),
        { type: "divider" },
        {
          type: "item",
          id: "all",
          label: "See all leaflets",
          href: "/admin/leaflets",
        },
      ];

      return buildShellPreviewLeafletL2Config({
        contextLabel: activeLeaflet?.title ?? "Leaflet",
        dropdownItems,
        activeDropdownItemId:
          pathname === "/admin/leaflets" ? "all" : (activeLeaflet?.id ?? "current"),
      });
    }

    if (showEventL2 && eventId) {
      const currentEvent = events.find((event) => event.id === eventId);
      const dropdownItems: DropdownItem[] = [
        ...events
          .filter((event) => event.kind === "council" || event.kind === "committee_meeting")
          .slice(0, 6)
          .map((event) => ({
            type: "item" as const,
            id: event.id,
            label: event.title,
            href: `/admin/events/${event.id}/overview`,
          })),
        { type: "divider" },
        {
          type: "item",
          id: "all",
          label: "See all events",
          href: "/admin/events",
        },
      ];

      return buildShellPreviewEventL2Config(eventId, {
        contextLabel: currentEvent?.title ?? "Event",
        dropdownItems,
        activeDropdownItemId: eventId,
      });
    }

    return null;
  }, [eventId, events, leaflets, pathname, showEventL2, showLeafletL2]);

  const panelConfig = l2Config ?? l1Config;

  return (
    <NavPanel
      config={panelConfig}
      openDropdownId={openDropdownId}
      resolveActiveFromPathname
      onDropdownToggle={setOpenDropdownId}
    />
  );
}
