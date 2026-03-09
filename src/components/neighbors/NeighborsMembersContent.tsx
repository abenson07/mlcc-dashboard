"use client";

import React, { useState } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import NeighborsMembersTable from "@/components/tables/NeighborsMembersTable";
import { TableWithDetailSidebar } from "@/components/detail-sidebar/TableWithDetailSidebar";
import NeighborDetailSidebar from "@/components/detail-sidebar/NeighborDetailSidebar";
import type { PersonWithMembership } from "hooks";
import { usePeople } from "hooks";

export default function NeighborsMembersContent() {
  const [selectedPerson, setSelectedPerson] = useState<PersonWithMembership | null>(null);
  const { refetch } = usePeople({ autoFetch: true });

  return (
    <TableWithDetailSidebar<PersonWithMembership>
      selectedItem={selectedPerson}
      onClose={() => setSelectedPerson(null)}
      sidebarTitle="Member details"
      renderSidebar={(person) => (
        <NeighborDetailSidebar
          person={person}
          onSaved={() => refetch()}
          onClose={() => setSelectedPerson(null)}
        />
      )}
    >
      <ComponentCard title="Neighbors - Members">
        <NeighborsMembersTable onRowClick={setSelectedPerson} />
      </ComponentCard>
    </TableWithDetailSidebar>
  );
}
