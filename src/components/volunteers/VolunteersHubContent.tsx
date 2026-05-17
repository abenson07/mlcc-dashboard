"use client";

import React, { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import TableViewTabs from "@/components/common/TableViewTabs";
import Button from "@/components/ui/button/Button";
import VolunteerAsksTable from "./VolunteerAsksTable";
import VolunteerEventRoster from "./VolunteerEventRoster";
import AddVolunteerAskModal from "./AddVolunteerAskModal";
import { useVolunteerAsks, VOLUNTEER_ASKS_QUERY_KEY } from "hooks";

import { useRouter, useSearchParams } from "next/navigation";

export type VolunteerTabView = "asks" | "roster";

function parseVolunteerTab(sp: URLSearchParams | null): VolunteerTabView {
  const raw = sp?.get("tab");
  if (raw === "roster") return "roster";
  return "asks";
}

export default function VolunteersHubContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const tab = useMemo(() => parseVolunteerTab(searchParams), [searchParams]);
  const { asks, loading, error } = useVolunteerAsks({ autoFetch: true });
  const [modalOpen, setModalOpen] = useState(false);

  const setTab = (next: VolunteerTabView) => {
    router.replace(next === "roster" ? "/volunteers?tab=roster" : "/volunteers");
  };

  const tabTitle = tab === "roster" ? "By event" : "Volunteer asks";

  return (
    <div>
      <PageBreadcrumb pageTitle="Volunteers" />
      <div className="space-y-6">
        <ComponentCard title={tabTitle}>
          <TableViewTabs<VolunteerTabView>
            aria-label="Volunteer views"
            value={tab}
            onChange={setTab}
            tabs={[
              { value: "asks", label: "Volunteer asks" },
              { value: "roster", label: "By event" },
            ]}
            endSlot={
              <Button size="sm" onClick={() => setModalOpen(true)}>
                Add volunteer ask
              </Button>
            }
          />
          <div className="mt-6">
            {loading ? (
              <p className="text-gray-500 dark:text-gray-400">Loading volunteers…</p>
            ) : error ? (
              <p className="text-red-600 dark:text-red-400">{error}</p>
            ) : tab === "asks" ? (
              <VolunteerAsksTable asks={asks} />
            ) : (
              <VolunteerEventRoster asks={asks} />
            )}
          </div>
        </ComponentCard>
        <AddVolunteerAskModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onCreated={() =>
            void queryClient.invalidateQueries({ queryKey: VOLUNTEER_ASKS_QUERY_KEY })
          }
        />
      </div>
    </div>
  );
}
