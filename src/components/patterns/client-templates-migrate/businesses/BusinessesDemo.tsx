"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useBusinesses, useDemoGuard } from "hooks";
import { supabaseClient } from "@/lib/supabaseClient";
import { FoundationLayout } from "@/components/patterns/foundation/FoundationLayout";
import { CanvasHeader } from "@/components/patterns/foundation/CanvasHeader";
import { LinearSidebar } from "@/components/patterns/foundation/LinearSidebar";
import { ViewTab } from "@/components/patterns/foundation/ViewTab";
import { ViewTabs } from "@/components/patterns/foundation/ViewTabs";
import { ListToolbar } from "@/components/patterns/foundation/ListToolbar";
import { Button } from "@/components/patterns/primitives/Button";
import { Text } from "@/components/patterns/primitives/Text";
import { OutlinedPanel } from "@/components/patterns/client-templates/shared";
import { useAdminBasePath } from "@/components/patterns/client-templates/shared/useAdminBasePath";
import { useIsMobileAdmin } from "@/components/patterns/client-templates-migrate/mobile";
import { BusinessMembersPage } from "./BusinessMembersPage";
import { SponsorsPage } from "./SponsorsPage";
import { AllBusinessesTable } from "./AllBusinessesTable";
import { BusinessMemberDetailPanel } from "./BusinessMemberDetailPanel";
import { BusinessSponsorDetailPanel } from "./BusinessSponsorDetailPanel";
import { BusinessDetailPanel } from "./BusinessDetailPanel";
import { AddBusinessModal } from "./AddBusinessModal";
import { EditBusinessModal } from "./EditBusinessModal";
import type { BusinessMemberRow, BusinessRow, SponsorRow } from "./types";
import { hookFiltersForView, toBusinessMemberRow, toBusinessRow, toSponsorRow } from "./adapters";
import type { BusinessesUpdate, BusinessMembershipsUpdate } from "@/types/database";

type BusinessesView = "members" | "sponsors" | "all";

function isBusinessesView(value: string | null): value is BusinessesView {
  return value === "members" || value === "sponsors" || value === "all";
}

type Selection =
  | { kind: "businessMember"; row: BusinessMemberRow }
  | { kind: "sponsor"; row: SponsorRow }
  | { kind: "business"; row: BusinessRow };

function BusinessesDemoInner() {
  const router = useRouter();
  const base = useAdminBasePath();
  const isMobile = useIsMobileAdmin();

  useEffect(() => {
    if (!isMobile) return;
    router.replace(`${base}/database?tab=businesses`);
  }, [isMobile, router, base]);

  const searchParams = useSearchParams();
  const initial = searchParams.get("view");
  const [view, setView] = useState<BusinessesView>(
    isBusinessesView(initial) ? initial : "members",
  );

  const [search, setSearch] = useState("");
  const filters = useMemo(
    () => ({ ...hookFiltersForView(view), search: search || undefined }),
    [view, search]
  );
  const { businesses: businessesRaw, loading, error, create, update, refetch } = useBusinesses({ filters });
  const { enabled: demo, overlay } = useDemoGuard();

  const businesses = useMemo(
    () => (demo ? businessesRaw.map((b) => overlay.apply("businesses", b)) : businessesRaw),
    [demo, businessesRaw, overlay],
  );

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
  const [isEditOpen, setIsEditOpen] = useState(false);

  const selectedBusiness = selection ? businesses.find((b) => b.id === selection.row.id) ?? null : null;

  async function handleSaveEdit(
    businessId: string,
    businessData: BusinessesUpdate,
    membershipId: string | null,
    membershipData: BusinessMembershipsUpdate
  ) {
    if (demo) {
      overlay.patch("businesses", businessId, { ...businessData, ...membershipData });
      toast.success("Business updated — demo mode, saved locally only");
      return;
    }
    await update(businessId, businessData);
    if (membershipId && supabaseClient) {
      await supabaseClient.from("business_memberships").update(membershipData).eq("id", membershipId);
    }
    await refetch();
  }

  function selectView(next: BusinessesView) {
    setView(next);
    setSelection(null);
  }

  const isFullBleed = view === "all";

  async function handleAddBusiness(row: Omit<BusinessRow, "id">) {
    if (demo) {
      toast.success("Business added — demo mode, not saved");
      return;
    }
    await create({ business_name: row.businessName, contact_name: row.contactName, phone: row.phone });
    await refetch();
  }

  async function handleAddMember(row: Omit<BusinessMemberRow, "id">) {
    if (demo) {
      toast.success("Member added — demo mode, not saved");
      return;
    }
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
    if (demo) {
      toast.success("Sponsor added — demo mode, not saved");
      return;
    }
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

  if (isMobile) return null;

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
              <ViewTabs
                aria-label="Businesses views"
                endContent={
                  <ListToolbar
                    searchValue={search}
                    onSearchChange={setSearch}
                    searchPlaceholder="Search businesses…"
                  />
                }
              >
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
          selection && selectedBusiness ? (
            <OutlinedPanel onClose={() => setSelection(null)} onEdit={() => setIsEditOpen(true)}>
              {selection.kind === "businessMember" ? (
                <BusinessMemberDetailPanel businessMember={selection.row} business={selectedBusiness} />
              ) : null}
              {selection.kind === "sponsor" ? (
                <BusinessSponsorDetailPanel sponsor={selection.row} business={selectedBusiness} />
              ) : null}
              {selection.kind === "business" ? (
                <BusinessDetailPanel business={selection.row} rawBusiness={selectedBusiness} />
              ) : null}
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

      <EditBusinessModal
        isOpen={isEditOpen}
        business={selectedBusiness}
        onClose={() => setIsEditOpen(false)}
        onSave={handleSaveEdit}
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
