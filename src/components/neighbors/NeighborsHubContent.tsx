"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import TableViewTabs from "@/components/common/TableViewTabs";
import AddNeighborModal from "./AddNeighborModal";
import Button from "@/components/ui/button/Button";
import TableWithDetailSidebar from "@/components/detail-sidebar/TableWithDetailSidebar";
import NeighborDetailSidebar from "@/components/detail-sidebar/NeighborDetailSidebar";
import { MercuryVariantTable } from "@/components/table/mercury-demo/mercuryVariantTable";
import { useMercuryPlaygroundData } from "@/components/table/mercury-demo/useMercuryPlaygroundData";
import type { MercuryVariantId } from "@/components/table/mercury-demo/types";
import type { PersonWithMembership } from "hooks";
import { useRouter, useSearchParams } from "next/navigation";
import type { QueryClient } from "@tanstack/react-query";

export type NeighborTableView = "neighbors" | "members";

function parseNeighborView(sp: URLSearchParams | null): NeighborTableView {
  const raw = sp?.get("view");
  if (raw === "members") return "members";
  return "neighbors";
}

function neighborViewTitle(view: NeighborTableView): string {
  return view === "members" ? "Members" : "All Neighbors";
}

function NeighborsMercuryPane({
  view,
  setView,
  queryClient,
  onOpenAddModal,
}: {
  view: NeighborTableView;
  setView: (next: NeighborTableView) => void;
  queryClient: QueryClient;
  onOpenAddModal: () => void;
}) {
  const tableVariant: MercuryVariantId =
    view === "members" ? "neighbors-members" : "neighbors-all";

  const mercury = useMercuryPlaygroundData(tableVariant);

  const [selectedPerson, setSelectedPerson] = useState<PersonWithMembership | null>(null);

  const sidebarTitle = view === "members" ? "Member details" : "Neighbor details";

  const selectedKey = selectedPerson?.id ?? null;
  const onSelectKey = (key: string | null) => {
    if (key == null) {
      setSelectedPerson(null);
      return;
    }
    const list =
      view === "members" ? mercury.neighborsMembersPeople : mercury.neighborsAllPeople;
    const person = list.find((p) => p.id === key);
    if (person) setSelectedPerson(person);
  };

  return (
    <TableWithDetailSidebar
      selectedItem={selectedPerson}
      onClose={() => setSelectedPerson(null)}
      sidebarTitle={sidebarTitle}
      asideWidthClass="w-full max-w-[420px]"
      dashboardTable={{ showSelectColumn: true, showMenuColumn: true }}
      renderSidebar={(item) => (
        <NeighborDetailSidebar
          item={item}
          onClose={() => setSelectedPerson(null)}
          onSaved={(updated) => {
            setSelectedPerson(updated);
            void queryClient.invalidateQueries({ queryKey: ["people"] });
          }}
        />
      )}
    >
      <ComponentCard
        title={neighborViewTitle(view)}
        action={
          view === "neighbors" ? (
            <Button size="sm" onClick={onOpenAddModal}>
              Add Neighbor
            </Button>
          ) : undefined
        }
      >
        <TableViewTabs<NeighborTableView>
          aria-label="Neighbor data views"
          value={view}
          onChange={setView}
          tabs={[
            { value: "neighbors", label: "Neighbors" },
            { value: "members", label: "Members" },
          ]}
        />
        {view === "neighbors" && (
          <MercuryVariantTable
            key="neighbors-all"
            variant="neighbors-all"
            mercury={mercury}
            selectedKey={selectedKey}
            onSelectKey={onSelectKey}
          />
        )}
        {view === "members" && (
          <MercuryVariantTable
            key="neighbors-members"
            variant="neighbors-members"
            mercury={mercury}
            selectedKey={selectedKey}
            onSelectKey={onSelectKey}
          />
        )}
      </ComponentCard>
    </TableWithDetailSidebar>
  );
}

export default function NeighborsHubContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const view = useMemo(() => parseNeighborView(searchParams), [searchParams]);

  useEffect(() => {
    if (searchParams?.get("view") !== "volunteers") return;
    const tab = searchParams.get("volunteerTab");
    router.replace(tab === "roster" ? "/admin/volunteers?tab=roster" : "/admin/volunteers");
  }, [searchParams, router]);

  const [modalOpen, setModalOpen] = useState(false);

  const setView = (next: NeighborTableView) => {
    const href = next === "neighbors" ? "/admin/neighbors" : "/admin/neighbors?view=members";
    router.replace(href);
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Neighbors" />
      <div className="space-y-6">
        <NeighborsMercuryPane
          key={view}
          view={view}
          setView={setView}
          queryClient={queryClient}
          onOpenAddModal={() => setModalOpen(true)}
        />
        <AddNeighborModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onCreated={() => void queryClient.invalidateQueries({ queryKey: ["people"] })}
        />
      </div>
    </div>
  );
}
