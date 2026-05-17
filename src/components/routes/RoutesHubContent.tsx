"use client";

import React, { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import TableViewTabs from "@/components/common/TableViewTabs";
import { ClaimedRoutesHeaderAction } from "@/components/routes/ClaimedRoutesHeaderAction";
import ClaimedRoutesPane from "@/components/routes/ClaimedRoutesContent";
import OpenRoutesPane from "@/components/routes/OpenRoutesContent";
import DeliverersPane from "@/components/routes/DeliverersContent";

export type RoutesTableView = "claimed" | "deliverers" | "open";

function parseRoutesView(sp: URLSearchParams | null): RoutesTableView {
  const raw = sp?.get("view");
  if (raw === "deliverers" || raw === "open") return raw;
  return "claimed";
}

function routesHref(view: RoutesTableView): string {
  if (view === "claimed") return "/routes";
  return `/routes?view=${view}`;
}

function routesViewTitle(view: RoutesTableView): string {
  if (view === "deliverers") return "Deliverers";
  if (view === "open") return "Open routes";
  return "Claimed routes";
}

const ROUTES_TABS: { value: RoutesTableView; label: string }[] = [
  { value: "claimed", label: "Claimed routes" },
  { value: "deliverers", label: "Deliverers" },
  { value: "open", label: "Open routes" },
];

export default function RoutesHubContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = useMemo(() => parseRoutesView(searchParams), [searchParams]);

  const setView = (next: RoutesTableView) => {
    router.replace(routesHref(next));
  };

  const tabs = (
    <TableViewTabs<RoutesTableView>
      aria-label="Routes data views"
      value={view}
      onChange={setView}
      endSlot={view === "claimed" ? <ClaimedRoutesHeaderAction /> : undefined}
      tabs={ROUTES_TABS}
    />
  );

  return (
    <div>
      <PageBreadcrumb pageTitle="Routes" />
      <div className="space-y-6">
        {view === "deliverers" ? (
          <>
            <ComponentCard title={routesViewTitle(view)}>{tabs}</ComponentCard>
            <DeliverersPane />
          </>
        ) : (
          <ComponentCard title={routesViewTitle(view)}>
            {tabs}
            <div className="mt-6">
              {view === "claimed" ? <ClaimedRoutesPane /> : <OpenRoutesPane />}
            </div>
          </ComponentCard>
        )}
      </div>
    </div>
  );
}
