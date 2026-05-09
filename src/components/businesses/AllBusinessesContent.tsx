"use client";

import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import ComponentCard from "@/components/common/ComponentCard";
import AddBusinessModal from "./AddBusinessModal";
import Button from "@/components/ui/button/Button";
import TableWithDetailSidebar from "@/components/detail-sidebar/TableWithDetailSidebar";
import BusinessDetailSidebar from "@/components/detail-sidebar/BusinessDetailSidebar";
import { MercuryVariantTable } from "@/components/table/mercury-demo/mercuryVariantTable";
import { useMercuryPlaygroundData } from "@/components/table/mercury-demo/useMercuryPlaygroundData";
import type { BusinessWithDetails } from "hooks";

export default function AllBusinessesContent() {
  const queryClient = useQueryClient();
  const mercury = useMercuryPlaygroundData("businesses-all");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessWithDetails | null>(null);

  const selectedKey = selectedBusiness?.id ?? null;
  const onSelectKey = (key: string | null) => {
    if (key == null) {
      setSelectedBusiness(null);
      return;
    }
    const row = mercury.businessesAllList.find((b) => b.id === key);
    if (row) setSelectedBusiness(row);
  };

  return (
    <>
      <TableWithDetailSidebar
        selectedItem={selectedBusiness}
        onClose={() => setSelectedBusiness(null)}
        sidebarTitle="Business details"
        asideWidthClass="w-full max-w-[420px]"
        dashboardTable={{ showSelectColumn: true, showMenuColumn: true }}
        renderSidebar={(item) => (
          <BusinessDetailSidebar
            item={item}
            onClose={() => setSelectedBusiness(null)}
            onSaved={(updated) => {
              setSelectedBusiness(updated);
              void queryClient.invalidateQueries({ queryKey: ["businesses"] });
            }}
            onRemoved={() => {
              setSelectedBusiness(null);
              void queryClient.invalidateQueries({ queryKey: ["businesses"] });
            }}
          />
        )}
      >
        <ComponentCard
          title="All Businesses"
          action={
            <Button size="sm" onClick={() => setModalOpen(true)}>
              Add Business
            </Button>
          }
        >
          <MercuryVariantTable
            variant="businesses-all"
            mercury={mercury}
            selectedKey={selectedKey}
            onSelectKey={onSelectKey}
          />
        </ComponentCard>
      </TableWithDetailSidebar>
      <AddBusinessModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={() => void queryClient.invalidateQueries({ queryKey: ["businesses"] })}
      />
    </>
  );
}
