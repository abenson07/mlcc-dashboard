"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { useBusinesses } from "hooks";
import { supabaseClient } from "@/lib/supabaseClient";
import { FoundationLayout } from "@/components/patterns/foundation/FoundationLayout";
import { CanvasHeader } from "@/components/patterns/foundation/CanvasHeader";
import { LinearSidebar } from "@/components/patterns/foundation/LinearSidebar";
import { ViewTab } from "@/components/patterns/foundation/ViewTab";
import { ViewTabs } from "@/components/patterns/foundation/ViewTabs";
import { Button } from "@/components/patterns/primitives/Button";
import { Text } from "@/components/patterns/primitives/Text";
import { OutlinedPanel } from "@/components/patterns/client-templates/shared";
import { BusinessMembersPage } from "./BusinessMembersPage";
import { SponsorsPage } from "./SponsorsPage";
import { AllBusinessesTable } from "./AllBusinessesTable";
import { BusinessMemberDetailPanel } from "./BusinessMemberDetailPanel";
import { BusinessSponsorDetailPanel } from "./BusinessSponsorDetailPanel";
import { BusinessDetailPanel } from "./BusinessDetailPanel";
import { AddBusinessModal } from "./AddBusinessModal";
import type { BusinessMemberRow, BusinessRow, SponsorRow } from "./types";
import { hookFiltersForView, toBusinessMemberRow, toBusinessRow, toSponsorRow } from "./adapters";

type BusinessesView = "members" | "sponsors" | "all";

function isBusinessesView(value: string | null): value is BusinessesView {
  return value === "members" || value === "sponsors" || value === "all";
}

type Selection =
  | { kind: "businessMember"; row: BusinessMemberRow }
  | { kind: "sponsor"; row: SponsorRow }
  | { kind: "business"; row: BusinessRow };

function BusinessesDemoInner() {
  const searchParams = useSearchParams();
  const initial = searchParams.get("view");
  const [view, setView] = useState<BusinessesView>(
    isBusinessesView(initial) ? initial : "members",
  );

  const filters = useMemo(() => hookFiltersForView(view), [view]);
  const { businesses, loading, error, create, update, refetch } = useBusinesses({ filters });

  const businessMembers: BusinessMemberRow[] = useMemo(
    () => (view === "members" ? businesses.map(toBusinessMemberRow) : []),
    [businesses, view]
  );
  const sponsors: SponsorRow[] = useMemo(
    () => (view === "sponsors" ? businesses.map(toSponsorRow) : []),
    [businesses, view]
  );
  const allBusinesses: BusinessRow[] = useMemo(
    () => (view === "all" ? businesses.map(toBusinessRow) : []),
    [businesses, view]
  );

  const [selection, setSelection] = useState<Selection | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  function selectView(next: BusinessesView) {
    setView(next);
    setSelection(null);
  }

  const isFullBleed = view === "all";

  async function handleAddBusiness(row: Omit<BusinessRow, "id">) {
    await create({ business_name: row.businessName, contact_name: row.contactName, phone: row.phone });
    await refetch();
  }

  async function handleAddMember(row: Omit<BusinessMemberRow, "id">) {
    const business = await create({ business_name: row.businessName });
    if (business && supabaseClient) {
      const { data: membership } = await supabaseClient
        .from("business_memberships")
        .insert({ status: row.status, last_renewal: new Date().toISOString().slice(0, 10) })
        .select()
        .single();
      if (membership) {
        await update(business.id, { membership_id: membership.id, is_member: true });
      }
    }
    await refetch();
  }

  async function handleAddSponsor(row: Omit<SponsorRow, "id">) {
    const business = await create({ business_name: row.businessName });
    if (business && supabaseClient) {
      await supabaseClient.from("sponsorships").insert({
        business_id: business.id,
        amount: row.amount,
        status: "paid",
        paid_date: new Date().toISOString().slice(0, 10),
      });
      await update(business.id, { is_past_sponsor: true });
    }
    await refetch();
  }

  const body =
    view === "all" ? (
      <AllBusinessesTable data={allBusinesses} onSelect={(row) => setSelection({ kind: "business", row })} />
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
            topbar={{
              title: "Businesses",
              endContent: (
                <Button
                  label={view === "all" ? "Add business" : view === "sponsors" ? "Add sponsor" : "Add member"}
                  variant="secondary"
                  icon={<Plus size={14} strokeWidth={1.75} />}
                  onClick={() => setIsAddOpen(true)}
                />
              ),
            }}
            controls={
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
        {error ? (
          <div style={{ padding: 24 }}>
            <Text color="secondary">Couldn&apos;t load businesses: {error}</Text>
          </div>
        ) : loading ? (
          <div style={{ padding: 24 }}>
            <Text color="secondary">Loading…</Text>
          </div>
        ) : (
          body
        )}
      </FoundationLayout>

      <AddBusinessModal
        isOpen={isAddOpen}
        view={view}
        onClose={() => setIsAddOpen(false)}
        onAddMember={handleAddMember}
        onAddSponsor={handleAddSponsor}
        onAddBusiness={handleAddBusiness}
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
