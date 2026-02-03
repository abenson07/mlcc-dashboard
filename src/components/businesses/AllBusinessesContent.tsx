"use client";

import React, { useState } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import AllBusinessesTable from "@/components/tables/AllBusinessesTable";
import AddBusinessModal from "./AddBusinessModal";
import Button from "@/components/ui/button/Button";
import { useBusinesses } from "hooks";

export default function AllBusinessesContent() {
  const [modalOpen, setModalOpen] = useState(false);
  const { refetch } = useBusinesses({ autoFetch: true });

  return (
    <>
      <ComponentCard
        title="All Businesses"
        action={
          <Button size="sm" onClick={() => setModalOpen(true)}>
            Add Business
          </Button>
        }
      >
        <AllBusinessesTable />
      </ComponentCard>
      <AddBusinessModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={() => refetch()}
      />
    </>
  );
}
