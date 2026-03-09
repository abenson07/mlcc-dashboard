"use client";

import React, { useState } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import AllBusinessesTable from "@/components/tables/AllBusinessesTable";
import AddBusinessModal from "./AddBusinessModal";
import Button from "@/components/ui/button/Button";
import { useBusinesses } from "hooks";
import type { BusinessWithDetails } from "hooks";
import { TableWithDetailSidebar } from "@/components/detail-sidebar/TableWithDetailSidebar";
import BusinessDetailSidebar from "@/components/detail-sidebar/BusinessDetailSidebar";

export default function AllBusinessesContent() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessWithDetails | null>(null);
  const { refetch } = useBusinesses({ autoFetch: true });

  return (
    <>
      <TableWithDetailSidebar<BusinessWithDetails>
        selectedItem={selectedBusiness}
        onClose={() => setSelectedBusiness(null)}
        sidebarTitle="Business details"
        renderSidebar={(business) => <BusinessDetailSidebar business={business} />}
      >
        <ComponentCard
          title="All Businesses"
          action={
            <Button size="sm" onClick={() => setModalOpen(true)}>
              Add Business
            </Button>
          }
        >
          <AllBusinessesTable onRowClick={setSelectedBusiness} />
        </ComponentCard>
      </TableWithDetailSidebar>
      <AddBusinessModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={() => refetch()}
      />
    </>
  );
}
