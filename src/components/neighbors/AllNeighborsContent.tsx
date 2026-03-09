"use client";

import React, { useState } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import AllNeighborsTable from "@/components/tables/AllNeighborsTable";
import AddNeighborModal from "./AddNeighborModal";
import Button from "@/components/ui/button/Button";
import { usePeople } from "hooks";
import type { PersonWithMembership } from "hooks";
import { TableWithDetailSidebar } from "@/components/detail-sidebar/TableWithDetailSidebar";
import NeighborDetailSidebar from "@/components/detail-sidebar/NeighborDetailSidebar";

export default function AllNeighborsContent() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<PersonWithMembership | null>(null);
  const { refetch } = usePeople({ autoFetch: true });

  return (
    <>
      <TableWithDetailSidebar<PersonWithMembership>
        selectedItem={selectedPerson}
        onClose={() => setSelectedPerson(null)}
        sidebarTitle="Neighbor details"
        renderSidebar={(person) => (
          <NeighborDetailSidebar
            person={person}
            onSaved={() => refetch()}
            onClose={() => setSelectedPerson(null)}
          />
        )}
      >
        <ComponentCard
          title="All Neighbors"
          action={
            <Button size="sm" onClick={() => setModalOpen(true)}>
              Add Neighbor
            </Button>
          }
        >
          <AllNeighborsTable onRowClick={setSelectedPerson} />
        </ComponentCard>
      </TableWithDetailSidebar>
      <AddNeighborModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={() => refetch()}
      />
    </>
  );
}
