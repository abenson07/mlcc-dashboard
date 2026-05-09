"use client";

import React, { useEffect, useMemo, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import TableViewTabs from "@/components/common/TableViewTabs";
import AllNeighborsTable from "@/components/tables/AllNeighborsTable";
import NeighborsMembersTable from "@/components/tables/NeighborsMembersTable";
import AddNeighborModal from "./AddNeighborModal";
import Button from "@/components/ui/button/Button";
import TableWithDetailSidebar from "@/components/detail-sidebar/TableWithDetailSidebar";
import NeighborDetailSidebar from "@/components/detail-sidebar/NeighborDetailSidebar";
import { usePeople } from "hooks";
import type { PersonWithMembership } from "hooks";
import { useRouter, useSearchParams } from "next/navigation";

export type NeighborTableView = "neighbors" | "members" | "volunteers";

function parseNeighborView(sp: URLSearchParams | null): NeighborTableView {
  const raw = sp?.get("view");
  if (raw === "members" || raw === "volunteers") return raw;
  return "neighbors";
}

function neighborViewTitle(view: NeighborTableView): string {
  switch (view) {
    case "members":
      return "Members";
    case "volunteers":
      return "Volunteers";
    default:
      return "All Neighbors";
  }
}

export default function NeighborsHubContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = useMemo(() => parseNeighborView(searchParams), [searchParams]);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<PersonWithMembership | null>(null);

  const { refetch: refetchAll } = usePeople({ autoFetch: true });
  const { refetch: refetchMembers } = usePeople({
    autoFetch: true,
    filters: { hasMembership: true, membershipStatus: "active" },
  });

  useEffect(() => {
    setSelectedPerson(null);
  }, [view]);

  const setView = (next: NeighborTableView) => {
    const href =
      next === "neighbors" ? "/neighbors" : `/neighbors?view=${next}`;
    router.replace(href);
  };

  const sidebarTitle = view === "members" ? "Member details" : "Neighbor details";

  const refetchForSidebar = () => {
    if (view === "members") refetchMembers();
    else if (view === "neighbors") refetchAll();
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Neighbors" />
      <div className="space-y-6">
        <TableWithDetailSidebar
          selectedItem={selectedPerson}
          onClose={() => setSelectedPerson(null)}
          sidebarTitle={sidebarTitle}
          renderSidebar={(item) => (
            <NeighborDetailSidebar
              item={item}
              onClose={() => setSelectedPerson(null)}
              onSaved={(updated) => {
                setSelectedPerson(updated);
                refetchForSidebar();
              }}
            />
          )}
        >
          <ComponentCard
            title={neighborViewTitle(view)}
            action={
              view === "neighbors" ? (
                <Button size="sm" onClick={() => setModalOpen(true)}>
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
                { value: "volunteers", label: "Volunteers" },
              ]}
            />
            {view === "neighbors" && (
              <AllNeighborsTable onRowClick={setSelectedPerson} />
            )}
            {view === "members" && (
              <NeighborsMembersTable onRowClick={setSelectedPerson} />
            )}
            {view === "volunteers" && (
              <div className="rounded-xl border border-dashed border-mercury-line bg-mercury-bg px-6 py-14 text-center dark:border-white/15 dark:bg-white/[0.03]">
                <p className="text-mercury-body text-mercury-muted dark:text-white/50">
                  No volunteer data yet. This view will list people who help with
                  routes, events, and programs.
                </p>
              </div>
            )}
          </ComponentCard>
        </TableWithDetailSidebar>
        <AddNeighborModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onCreated={() => refetchAll()}
        />
      </div>
    </div>
  );
}
