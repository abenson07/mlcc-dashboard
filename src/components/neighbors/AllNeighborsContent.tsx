"use client";

import React, { useState } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import AllNeighborsTable from "@/components/tables/AllNeighborsTable";
import AddNeighborModal from "./AddNeighborModal";
import Button from "@/components/ui/button/Button";
import { usePeople } from "hooks";

export default function AllNeighborsContent() {
  const [modalOpen, setModalOpen] = useState(false);
  const { refetch } = usePeople({ autoFetch: true });

  return (
    <>
      <ComponentCard
        title="All Neighbors"
        action={
          <Button size="sm" onClick={() => setModalOpen(true)}>
            Add Neighbor
          </Button>
        }
      >
        <AllNeighborsTable />
      </ComponentCard>
      <AddNeighborModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={() => refetch()}
      />
    </>
  );
}
