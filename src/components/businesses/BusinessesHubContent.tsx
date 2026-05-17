"use client";

import React, { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import ComponentCard from "@/components/common/ComponentCard";
import TableViewTabs from "@/components/common/TableViewTabs";
import AddBusinessModal from "./AddBusinessModal";
import EditBusinessModal from "./EditBusinessModal";
import Button from "@/components/ui/button/Button";
import { useBusinesses } from "hooks";
import TableWithDetailSidebar from "@/components/detail-sidebar/TableWithDetailSidebar";
import BusinessDetailSidebar from "@/components/detail-sidebar/BusinessDetailSidebar";
import {
  MercuryVariantTable,
  type BusinessRowActions,
} from "@/components/table/mercury-demo/mercuryVariantTable";
import { useMercuryPlaygroundData } from "@/components/table/mercury-demo/useMercuryPlaygroundData";
import type { MercuryVariantId } from "@/components/table/mercury-demo/types";
import type { BusinessWithDetails } from "hooks";
import { useRouter, useSearchParams } from "next/navigation";
import type { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { MercuryPlaygroundData } from "@/components/table/mercury-demo/useMercuryPlaygroundData";

export type BusinessTableView = "all" | "members" | "sponsors";

function parseBusinessView(sp: URLSearchParams | null): BusinessTableView {
  const raw = sp?.get("view");
  if (raw === "members" || raw === "sponsors") return raw;
  return "all";
}

function BusinessesMercuryPane({
  view,
  setView,
  queryClient,
  onOpenAddModal,
  businessRowActions,
  onBusinessUpdated,
}: {
  view: BusinessTableView;
  setView: (next: BusinessTableView) => void;
  queryClient: QueryClient;
  onOpenAddModal: () => void;
  businessRowActions: BusinessRowActions;
  onBusinessUpdated: () => void;
}) {
  const tableVariant: MercuryVariantId =
    view === "members" ? "businesses-members" : "businesses-all";

  const mercuryBase = useMercuryPlaygroundData(tableVariant);
  const mercury: MercuryPlaygroundData = useMemo(() => {
    if (view !== "sponsors") return mercuryBase;
    return {
      ...mercuryBase,
      businessesAllList: mercuryBase.businessesAllList.filter((b) => b.is_past_sponsor),
    };
  }, [mercuryBase, view]);

  const [selectedBusiness, setSelectedBusiness] = useState<BusinessWithDetails | null>(null);

  const listForView =
    view === "members"
      ? mercury.businessesMembersList
      : view === "sponsors"
        ? mercury.businessesAllList
        : mercury.businessesAllList;

  const selectedKey = selectedBusiness?.id ?? null;
  const onSelectKey = (key: string | null) => {
    if (key == null) {
      setSelectedBusiness(null);
      return;
    }
    const row = listForView.find((b) => b.id === key);
    if (row) setSelectedBusiness(row);
  };

  const tableVariantForRender: MercuryVariantId =
    view === "members" ? "businesses-members" : "businesses-all";

  return (
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
          showRemove={view === "all"}
          onSaved={(updated) => {
            setSelectedBusiness(updated);
            onBusinessUpdated();
            void queryClient.invalidateQueries({ queryKey: ["businesses"] });
          }}
          onRemoved={
            view === "all"
              ? () => {
                  setSelectedBusiness(null);
                  void queryClient.invalidateQueries({ queryKey: ["businesses"] });
                }
              : undefined
          }
        />
      )}
    >
      <ComponentCard hideHeader>
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-mercury-line dark:border-white/10">
          <TableViewTabs<BusinessTableView>
            aria-label="Business data views"
            value={view}
            onChange={setView}
            className="min-w-0 flex-1 border-b-0"
            tabs={[
              { value: "all", label: "All Businesses" },
              { value: "members", label: "Members" },
              { value: "sponsors", label: "Past Sponsors" },
            ]}
          />
          {view === "all" ? (
            <Button
              size="sm"
              onClick={onOpenAddModal}
              className="mb-2 shrink-0 !min-h-8 !px-3 !py-1.5 !text-xs sm:!min-h-8"
            >
              Add Business
            </Button>
          ) : null}
        </div>
        <MercuryVariantTable
          key={tableVariantForRender + view}
          variant={tableVariantForRender}
          mercury={mercury}
          selectedKey={selectedKey}
          onSelectKey={onSelectKey}
          businessRowActions={businessRowActions}
        />
      </ComponentCard>
    </TableWithDetailSidebar>
  );
}

export default function BusinessesHubContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { update } = useBusinesses({ autoFetch: false });
  const view = useMemo(() => parseBusinessView(searchParams), [searchParams]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<BusinessWithDetails | null>(null);

  const setView = (next: BusinessTableView) => {
    const href = next === "all" ? "/businesses" : `/businesses?view=${next}`;
    router.replace(href);
  };

  const refreshBusinesses = () =>
    void queryClient.invalidateQueries({ queryKey: ["businesses"] });

  const businessRowActions: BusinessRowActions = {
    onEdit: (row) => setEditingBusiness(row),
    onToggleMember: async (row) => {
      const next = !row.is_member;
      const updated = await update(row.id, { is_member: next });
      if (updated) {
        toast.success(next ? "Marked as member." : "Removed member flag.");
      } else {
        toast.error("Could not update member flag.");
      }
    },
    onTogglePastSponsor: async (row) => {
      const next = !row.is_past_sponsor;
      const updated = await update(row.id, { is_past_sponsor: next });
      if (updated) {
        toast.success(next ? "Marked as past sponsor." : "Removed past sponsor flag.");
      } else {
        toast.error("Could not update past sponsor flag.");
      }
    },
  };

  return (
    <div className="space-y-6">
      <BusinessesMercuryPane
        key={view}
        view={view}
        setView={setView}
        queryClient={queryClient}
        onOpenAddModal={() => setModalOpen(true)}
        businessRowActions={businessRowActions}
        onBusinessUpdated={refreshBusinesses}
      />
      <AddBusinessModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={refreshBusinesses}
      />
      <EditBusinessModal
        business={editingBusiness}
        onClose={() => setEditingBusiness(null)}
        onSaved={refreshBusinesses}
      />
    </div>
  );
}


