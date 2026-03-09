"use client";

import React, { useState } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import OpenRoutesTable from "@/components/tables/OpenRoutesTable";
import TableWithDetailSidebar from "@/components/detail-sidebar/TableWithDetailSidebar";
import RouteDetailSidebar from "@/components/detail-sidebar/RouteDetailSidebar";
import { useRoutes } from "hooks";
import type { RouteWithDeliverer } from "hooks";

export default function OpenRoutesContent() {
  const [selectedRoute, setSelectedRoute] = useState<RouteWithDeliverer | null>(null);
  const { refetch } = useRoutes({ autoFetch: true, filters: { openOnly: true } });

  return (
    <TableWithDetailSidebar
      selectedItem={selectedRoute}
      onClose={() => setSelectedRoute(null)}
      sidebarTitle="Route details"
      renderSidebar={(item) => (
        <RouteDetailSidebar
          item={item}
          onClose={() => setSelectedRoute(null)}
          onSaved={(updated) => {
            setSelectedRoute(updated);
            refetch();
          }}
        />
      )}
    >
      <ComponentCard title="Open Routes">
        <OpenRoutesTable onRowClick={setSelectedRoute} />
      </ComponentCard>
    </TableWithDetailSidebar>
  );
}
