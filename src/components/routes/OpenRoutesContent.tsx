"use client";

import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import TableWithDetailSidebar from "@/components/detail-sidebar/TableWithDetailSidebar";
import RouteDetailSidebar from "@/components/detail-sidebar/RouteDetailSidebar";
import { MercuryVariantTable } from "@/components/table/mercury-demo/mercuryVariantTable";
import { useMercuryPlaygroundData } from "@/components/table/mercury-demo/useMercuryPlaygroundData";
import type { RouteWithDeliverer } from "hooks";

export default function OpenRoutesPane() {
  const queryClient = useQueryClient();
  const mercury = useMercuryPlaygroundData("routes-open");
  const [selectedRoute, setSelectedRoute] = useState<RouteWithDeliverer | null>(null);

  const selectedKey = selectedRoute?.id ?? null;
  const onSelectKey = (key: string | null) => {
    if (key == null) {
      setSelectedRoute(null);
      return;
    }
    const route = mercury.routesOpenList.find((r) => r.id === key);
    if (route) setSelectedRoute(route);
  };

  return (
    <TableWithDetailSidebar
      selectedItem={selectedRoute}
      onClose={() => setSelectedRoute(null)}
      sidebarTitle="Route details"
      asideWidthClass="w-full max-w-[420px]"
      dashboardTable={{ showSelectColumn: true, showMenuColumn: true }}
      renderSidebar={(item) => (
        <RouteDetailSidebar
          item={item}
          onClose={() => setSelectedRoute(null)}
          onSaved={(updated) => {
            setSelectedRoute(updated);
            void queryClient.invalidateQueries({ queryKey: ["routes"] });
          }}
        />
      )}
    >
      <MercuryVariantTable
        variant="routes-open"
        mercury={mercury}
        selectedKey={selectedKey}
        onSelectKey={onSelectKey}
      />
    </TableWithDetailSidebar>
  );
}
