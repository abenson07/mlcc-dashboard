"use client";

import React, { useState } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import ClaimedRoutesTable, {
  ClaimedRoutesHeaderAction,
} from "@/components/tables/ClaimedRoutesTable";
import { TableWithDetailSidebar } from "@/components/detail-sidebar/TableWithDetailSidebar";
import RouteDetailSidebar from "@/components/detail-sidebar/RouteDetailSidebar";
import type { RouteWithDeliverer } from "hooks";

export default function ClaimedRoutesContent() {
  const [selectedRoute, setSelectedRoute] = useState<RouteWithDeliverer | null>(null);

  return (
    <TableWithDetailSidebar<RouteWithDeliverer>
      selectedItem={selectedRoute}
      onClose={() => setSelectedRoute(null)}
      sidebarTitle="Route details"
      renderSidebar={(route) => <RouteDetailSidebar route={route} />}
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
