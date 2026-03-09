"use client";

import React, { useState } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import AllRoutesTable from "@/components/tables/AllRoutesTable";
import TableWithDetailSidebar from "@/components/detail-sidebar/TableWithDetailSidebar";
import RouteDetailSidebar from "@/components/detail-sidebar/RouteDetailSidebar";
import { useRoutes } from "hooks";
import type { RouteWithDeliverer } from "hooks";

export default function AllRoutesContent() {
  const [selectedRoute, setSelectedRoute] = useState<RouteWithDeliverer | null>(null);
  const { refetch } = useRoutes({ autoFetch: true });

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
      <ComponentCard title="All Routes">
        <AllRoutesTable onRowClick={setSelectedRoute} />
      </ComponentCard>
    </TableWithDetailSidebar>
  );
}
