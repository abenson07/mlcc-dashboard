"use client";

import React, { useState } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import ClaimedRoutesTable, {
  ClaimedRoutesHeaderAction,
} from "@/components/tables/ClaimedRoutesTable";
import TableWithDetailSidebar from "@/components/detail-sidebar/TableWithDetailSidebar";
import RouteDetailSidebar from "@/components/detail-sidebar/RouteDetailSidebar";
import { useRoutes } from "hooks";
import type { RouteWithDeliverer } from "hooks";

export default function ClaimedRoutesContent() {
  const [selectedRoute, setSelectedRoute] = useState<RouteWithDeliverer | null>(null);
  const { refetch } = useRoutes({ autoFetch: true, filters: { claimedOnly: true } });

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
      <ComponentCard
        title="Claimed Routes"
        action={<ClaimedRoutesHeaderAction />}
      >
        <ClaimedRoutesTable onRowClick={setSelectedRoute} />
      </ComponentCard>
    </TableWithDetailSidebar>
  );
}
