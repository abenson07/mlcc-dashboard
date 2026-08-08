"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { FoundationLayout } from "@/components/patterns/foundation/FoundationLayout";
import { CanvasHeader } from "@/components/patterns/foundation/CanvasHeader";
import { LinearSidebar } from "@/components/patterns/foundation/LinearSidebar";
import { ViewTab } from "@/components/patterns/foundation/ViewTab";
import { ViewTabs } from "@/components/patterns/foundation/ViewTabs";
import { Button } from "@/components/patterns/primitives/Button";
import { OutlinedPanel } from "@/components/patterns/client-templates/shared";
import { BusinessMembersPage } from "./BusinessMembersPage";
import { SponsorsPage } from "./SponsorsPage";
import { AllBusinessesTable } from "./AllBusinessesTable";
import { BusinessMemberDetailPanel } from "./BusinessMemberDetailPanel";
import { BusinessSponsorDetailPanel } from "./BusinessSponsorDetailPanel";
import { BusinessDetailPanel } from "./BusinessDetailPanel";
import { AddBusinessModal } from "./AddBusinessModal";
import {
  sampleAllBusinesses,
  sampleBusinessMembers,
  sampleSponsors,
  type BusinessMemberRow,
  type BusinessRow,
  type SponsorRow,
} from "@/data/mocks/businesses";

type BusinessesView = "members" | "sponsors" | "all";

function isBusinessesView(value: string | null): value is BusinessesView {
  return value === "members" || value === "sponsors" || value === "all";
}

type Selection =
  | { kind: "businessMember"; row: BusinessMemberRow }
  | { kind: "sponsor"; row: SponsorRow }
  | { kind: "business"; row: BusinessRow };

let nextId = 1000;

function BusinessesDemoInner() {
  const searchParams = useSearchParams();
  const initial = searchParams.get("view");
  const [view, setView] = useState<BusinessesView>(
    isBusinessesView(initial) ? initial : "members",
  );

  const [businessMembers, setBusinessMembers] = useState<BusinessMemberRow[]>(sampleBusinessMembers);
  const [sponsors, setSponsors] = useState<SponsorRow[]>(sampleSponsors);
  const [businesses, setBusinesses] = useState<BusinessRow[]>(sampleAllBusinesses);

  const [selection, setSelection] = useState<Selection | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  function selectView(next: BusinessesView) {
    setView(next);
    setSelection(null);
  }

  const isFullBleed = view === "all";

  const body =
    view === "all" ? (
      <AllBusinessesTable data={businesses} onSelect={(row) => setSelection({ kind: "business", row })} />
    ) : view === "sponsors" ? (
      <SponsorsPage data={sponsors} onSelect={(row) => setSelection({ kind: "sponsor", row })} />
    ) : (
      <BusinessMembersPage
        data={businessMembers}
        onSelect={(row) => setSelection({ kind: "businessMember", row })}
      />
    );

  return (
    <div style={{ height: "100%" }}>
      <FoundationLayout
        navigation={<LinearSidebar />}
        contentMaxWidth={isFullBleed ? undefined : 1200}
        header={
          <CanvasHeader
            topbar={{ title: "Businesses" }}
            controls={
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                <ViewTabs aria-label="Businesses views">
                  <ViewTab
                    label="Members"
                    selected={view === "members"}
                    onClick={() => selectView("members")}
                  />
                  <ViewTab
                    label="Sponsors"
                    selected={view === "sponsors"}
                    onClick={() => selectView("sponsors")}
                  />
                  <ViewTab
                    label="All Businesses"
                    selected={view === "all"}
                    onClick={() => selectView("all")}
                  />
                </ViewTabs>
                <Button
                  label={view === "all" ? "Add business" : view === "sponsors" ? "Add sponsor" : "Add member"}
                  variant="secondary"
                  icon={<Plus size={14} strokeWidth={1.75} />}
                  onClick={() => setIsAddOpen(true)}
                />
              </div>
            }
          />
        }
        sideContent={
          selection ? (
            <OutlinedPanel onClose={() => setSelection(null)}>
              {selection.kind === "businessMember" ? (
                <BusinessMemberDetailPanel businessMember={selection.row} />
              ) : null}
              {selection.kind === "sponsor" ? <BusinessSponsorDetailPanel sponsor={selection.row} /> : null}
              {selection.kind === "business" ? <BusinessDetailPanel business={selection.row} /> : null}
            </OutlinedPanel>
          ) : null
        }
      >
        {body}
      </FoundationLayout>

      <AddBusinessModal
        isOpen={isAddOpen}
        view={view}
        onClose={() => setIsAddOpen(false)}
        onAddMember={(row) => setBusinessMembers((prev) => [...prev, { ...row, id: `bmem-${nextId++}` }])}
        onAddSponsor={(row) => setSponsors((prev) => [...prev, { ...row, id: `spo-${nextId++}` }])}
        onAddBusiness={(row) => setBusinesses((prev) => [...prev, { ...row, id: `biz-${nextId++}` }])}
      />
    </div>
  );
}

export function BusinessesDemo() {
  return (
    <Suspense fallback={null}>
      <BusinessesDemoInner />
    </Suspense>
  );
}
