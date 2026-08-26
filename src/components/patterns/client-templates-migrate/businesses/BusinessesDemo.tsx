"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useBusinesses, useBusinessMemberships, useDemoGuard, type BusinessWithDetails } from "hooks";
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
import { newDemoId } from "@/lib/demo/demoStore";
import { BusinessMembersPage } from "./BusinessMembersPage";
import { SponsorsPage } from "./SponsorsPage";
import { AllBusinessesTable } from "./AllBusinessesTable";
import { BusinessMemberDetailPanel } from "./BusinessMemberDetailPanel";
import { BusinessSponsorDetailPanel } from "./BusinessSponsorDetailPanel";
import { BusinessDetailPanel } from "./BusinessDetailPanel";
import { AddBusinessModal } from "./AddBusinessModal";
import { EditBusinessModal } from "./EditBusinessModal";
import type { BusinessMemberRow, BusinessRow, SponsorRow } from "./types";
import {
  BUSINESS_MEMBERSHIP_ANNUAL_DUES,
  BUSINESS_MEMBERSHIP_TIER,
  hookFiltersForView,
  localIsoDate,
  toBusinessMemberRow,
  toBusinessRow,
  toSponsorRow,
} from "./adapters";
import type { BusinessesUpdate, BusinessMemberships, BusinessMembershipsUpdate } from "@/types/database";

function matchesBusinessesView(business: BusinessWithDetails, view: BusinessesView): boolean {
  if (view === "members") return Boolean(business.is_member || business.membership);
  if (view === "sponsors") {
    return Boolean(business.is_past_sponsor || (business.sponsorships && business.sponsorships.length > 0));
  }
  return true;
}

type BusinessesView = "members" | "sponsors" | "all";

function isBusinessesView(value: string | null): value is BusinessesView {
  return value === "members" || value === "sponsors" || value === "all";
}

function nestedMembershipPatch(
  business: BusinessWithDetails,
  data: BusinessMembershipsUpdate,
): Record<string, unknown> {
  const membershipId = business.membership?.id ?? newDemoId("biz-mem");
  const membership: BusinessMemberships = {
    status: "Active",
    last_renewal: localIsoDate(),
    payment_method: null,
    is_subscription: false,
    annual_dues: BUSINESS_MEMBERSHIP_ANNUAL_DUES,
    ...business.membership,
    ...data,
    id: membershipId,
    tier: BUSINESS_MEMBERSHIP_TIER,
  };
  return {
    is_member: true,
    membership_id: membershipId,
    membership,
  };
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
  const { create: createMembership, update: updateMembership } = useBusinessMemberships();
  const { enabled: demo, overlay, store } = useDemoGuard();

  const businesses = useMemo(() => {
    if (!demo) return businessesRaw;
    return store
      .merge<BusinessWithDetails>("businesses", businessesRaw)
      .filter((b) => matchesBusinessesView(b, view));
  }, [demo, businessesRaw, store, view, store.version]);

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
    const current = businesses.find((b) => b.id === businessId);
    if (demo) {
      overlay.patch("businesses", businessId, {
        ...businessData,
        ...(current ? nestedMembershipPatch(current, membershipData) : membershipData),
      });
      toast.success("Business updated — demo mode, saved locally only");
      return;
    }
    try {
      await update(businessId, businessData);
      if (membershipId) {
        await updateMembership(membershipId, membershipData);
      }
      await refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save changes");
      throw e;
    }
  }

  /** Inline field commit from the Business detail panel — same demo-guard shape as `handleSaveEdit`. */
  async function commitBusinessField(businessId: string, data: BusinessesUpdate) {
    if (demo) {
      overlay.patch("businesses", businessId, data as Record<string, unknown>);
      toast.success("Business updated — demo mode, saved locally only");
      return;
    }
    try {
      await update(businessId, data);
      await refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save changes");
    }
  }

  async function commitMembership(
    business: BusinessWithDetails,
    data: BusinessMembershipsUpdate
  ) {
    if (demo) {
      overlay.patch("businesses", business.id, nestedMembershipPatch(business, data));
      toast.success("Business updated — demo mode, saved locally only");
      return;
    }
    try {
      if (business.membership) {
        await updateMembership(business.membership.id, { ...data, tier: BUSINESS_MEMBERSHIP_TIER });
      } else {
        const created = await createMembership({
          status: data.status ?? "Active",
          last_renewal: data.last_renewal || localIsoDate(),
          tier: BUSINESS_MEMBERSHIP_TIER,
          annual_dues: data.annual_dues ?? BUSINESS_MEMBERSHIP_ANNUAL_DUES,
        });
        const linked = await update(business.id, { membership_id: created.id, is_member: true });
        if (!linked) throw new Error("Membership was created but could not be linked to the business.");
        toast.success("Membership started");
      }
      await refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save membership changes");
    }
  }

  function selectView(next: BusinessesView) {
    setView(next);
    setSelection(null);
  }

  const isFullBleed = view === "all";

  async function handleAddBusiness(row: Omit<BusinessRow, "id">) {
    if (demo) {
      overlay.upsert("businesses", {
        id: newDemoId("biz"),
        business_name: row.businessName,
        contact_name: row.contactName,
        phone: row.phone,
        category: row.category || null,
        is_member: false,
        is_past_sponsor: false,
        sponsorships: [],
        membership: null,
      });
      toast.success("Business added — demo mode, saved locally only");
      return;
    }
    await create({
      business_name: row.businessName,
      contact_name: row.contactName,
      phone: row.phone,
      category: row.category || null,
    });
    await refetch();
  }

  async function handleAddMember(row: Omit<BusinessMemberRow, "id">) {
    const renewal = /^\d{4}-\d{2}-\d{2}$/.test(row.renewalDate) ? row.renewalDate : localIsoDate();
    const annualDues = row.annualDues || BUSINESS_MEMBERSHIP_ANNUAL_DUES;

    if (demo) {
      const id = newDemoId("biz");
      const membershipId = newDemoId("biz-mem");
      overlay.upsert("businesses", {
        id,
        business_name: row.businessName,
        is_member: true,
        is_past_sponsor: false,
        membership_id: membershipId,
        sponsorships: [],
        membership: {
          id: membershipId,
          status: "Active",
          last_renewal: renewal,
          payment_method: null,
          is_subscription: false,
          tier: BUSINESS_MEMBERSHIP_TIER,
          annual_dues: annualDues,
        },
      });
      toast.success("Member added — demo mode, saved locally only");
      return;
    }
    try {
      const business = await create({ business_name: row.businessName });
      if (!business) throw new Error("Could not create business.");
      const membership = await createMembership({
        status: "Active",
        last_renewal: renewal,
        tier: BUSINESS_MEMBERSHIP_TIER,
        annual_dues: annualDues,
      });
      const linked = await update(business.id, { membership_id: membership.id, is_member: true });
      if (!linked) throw new Error("Membership was created but could not be linked to the business.");
      await refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to add member");
    }
  }

  async function handleAddSponsor(row: Omit<SponsorRow, "id">) {
    if (demo) {
      const id = newDemoId("biz");
      const paid = new Date().toISOString().slice(0, 10);
      overlay.upsert("businesses", {
        id,
        business_name: row.businessName,
        is_member: false,
        is_past_sponsor: true,
        sponsorships: [
          {
            id: newDemoId("spon"),
            business_id: id,
            amount: row.amount,
            status: "paid",
            paid_date: paid,
          },
        ],
        membership: null,
      });
      toast.success("Sponsor added — demo mode, saved locally only");
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
            <OutlinedPanel
              onClose={() => setSelection(null)}
              onEdit={selection.kind === "business" ? undefined : () => setIsEditOpen(true)}
            >
              {selection.kind === "businessMember" ? (
                <BusinessMemberDetailPanel
                  businessMember={selection.row}
                  business={selectedBusiness}
                  onUpdateBusiness={(data) => commitBusinessField(selectedBusiness.id, data)}
                  onUpdateMembership={(data) => commitMembership(selectedBusiness, data)}
                  onStartMembership={() => commitMembership(selectedBusiness, { status: "Active" })}
                />
              ) : null}
              {selection.kind === "sponsor" ? (
                <BusinessSponsorDetailPanel
                  sponsor={selection.row}
                  business={selectedBusiness}
                  onUpdateBusiness={(data) => commitBusinessField(selectedBusiness.id, data)}
                  onUpdateMembership={(data) => commitMembership(selectedBusiness, data)}
                  onStartMembership={() => commitMembership(selectedBusiness, { status: "Active" })}
                />
              ) : null}
              {selection.kind === "business" ? (
                <BusinessDetailPanel
                  business={selection.row}
                  rawBusiness={selectedBusiness}
                  onUpdateBusiness={(data) => commitBusinessField(selectedBusiness.id, data)}
                  onUpdateMembership={(data) => commitMembership(selectedBusiness, data)}
                  onStartMembership={() => commitMembership(selectedBusiness, { status: "Active" })}
                />
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
