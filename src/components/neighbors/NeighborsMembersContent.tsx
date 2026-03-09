"use client";

import React, { useState } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import NeighborsMembersTable from "@/components/tables/NeighborsMembersTable";
import TableWithDetailSidebar from "@/components/detail-sidebar/TableWithDetailSidebar";
import NeighborDetailSidebar from "@/components/detail-sidebar/NeighborDetailSidebar";
import { usePeople } from "hooks";
import type { PersonWithMembership } from "hooks";

export default function NeighborsMembersContent() {
  const [selectedPerson, setSelectedPerson] = useState<PersonWithMembership | null>(null);
  const { refetch } = usePeople({
    autoFetch: true,
    filters: { hasMembership: true, membershipStatus: "active" },
  });

  return (
    <TableWithDetailSidebar
      selectedItem={selectedPerson}
      onClose={() => setSelectedPerson(null)}
      sidebarTitle="Member details"
      renderSidebar={(item) => (
        <NeighborDetailSidebar
          item={item}
          onClose={() => setSelectedPerson(null)}
          onSaved={(updated) => {
            setSelectedPerson(updated);
            refetch();
          }}
        />
      )}
    >
      <ComponentCard title="Neighbors - Members">
        <NeighborsMembersTable onRowClick={setSelectedPerson} />
      </ComponentCard>
    </TableWithDetailSidebar>
  );
}
