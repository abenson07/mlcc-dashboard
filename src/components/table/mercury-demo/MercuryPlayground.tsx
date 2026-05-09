"use client";

import React, { useMemo, useState } from "react";
import Select from "@/components/form/Select";
import TableWithDetailSidebar from "@/components/detail-sidebar/TableWithDetailSidebar";
import {
  Table,
  TableHeader,
  TableBody,
  DashboardTableDataCell,
  StackedCellContent,
  StatusCellContent,
  NormalCellContent,
  CurrencyCellContent,
  DashboardTableRow,
  DashboardTableSelectHeader,
  DashboardTableMenuHeader,
  ActionLink,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import DataTable from "@/components/table/DataTable";
import { invoices } from "@/components/table/data";
import type { DuplicateMember } from "@/app/api/stripe/duplicate-members/route";
import type { StripeInvoiceTableRow } from "@/components/billing/InvoicesListTable";
import { formatDueDate } from "@/components/billing/invoiceUtils";
import {
  formatRelativeFutureLabel,
  formatShortDate,
  formatStackedRelativePast,
} from "@/lib/formatRelativeTime";
import type { Sponsorships } from "@/types/database";
import type { MercuryVariantId } from "./types";
import type { BusinessWithDetails, PersonWithMembership, RouteWithDeliverer } from "hooks";
import { useMercuryPlaygroundData } from "./useMercuryPlaygroundData";
import {
  mercuryHeaderCell,
  SidebarDivider,
  SidebarSectionTitle,
  SidebarField,
  SidebarMutedLine,
  CopyableMuted,
  NameEmailHoverCell,
  ContactEmailPhoneHover,
  BusinessContactHoverCell,
  DelivererHoverCell,
  CoverageDeliverersHover,
  CountBreakdownHover,
  TruncatedTagPills,
  membershipBadgeColor,
  invoiceStatusColor,
  splitCurrency,
  InvoiceNumberCreatedHover,
  MembershipStatusRenewalHover,
} from "./shared";

const VARIANT_OPTIONS: { value: MercuryVariantId; label: string }[] = [
  { value: "neighbors-all", label: "Neighbors — All (/neighbors)" },
  { value: "neighbors-members", label: "Neighbors — Members (?view=members)" },
  { value: "neighbors-duplicate-memberships", label: "Neighbors — Duplicate memberships (/neighbors/duplicate-memberships)" },
  { value: "routes-all", label: "Routes — All (/routes/all)" },
  { value: "routes-claimed", label: "Routes — Claimed (/routes/claimed)" },
  { value: "routes-open", label: "Routes — Open (/routes/open)" },
  { value: "businesses-all", label: "Businesses — All (/businesses/all)" },
  { value: "businesses-members", label: "Businesses — Members (/businesses/members)" },
  { value: "billing-invoices", label: "Billing — Invoices (/billing/invoices)" },
  { value: "original-invoice-demo", label: "Original invoice demo (Mercury prototype)" },
];

function routeCoverage(route: RouteWithDeliverer): { label: string; deliverers: string[] } {
  const names: string[] = [];
  if (route.primary_deliverer) names.push(route.primary_deliverer.full_name);
  if (route.secondary_deliverer) names.push(route.secondary_deliverer.full_name);
  if (route.is_skipped) return { label: "Skipped", deliverers: names };
  if (route.primary_deliverer || route.secondary_deliverer) return { label: "Covered", deliverers: names };
  return { label: "Open", deliverers: [] };
}

function coverageBadgeColor(label: string): "success" | "warning" | "light" {
  if (label === "Covered") return "success";
  if (label === "Skipped") return "warning";
  return "light";
}

function dupActiveCount(subs: DuplicateMember["subscriptions"]): number {
  return subs.filter((s) => s.status.toLowerCase() === "active").length;
}

function dupPlans(subs: DuplicateMember["subscriptions"]): string {
  return [...new Set(subs.map((s) => s.productName))].join(", ");
}

function dupNextRenewalUnix(subs: DuplicateMember["subscriptions"]): string {
  const ends = subs
    .map((s) => s.currentPeriodEnd)
    .filter((t): t is number => typeof t === "number" && !Number.isNaN(t) && t > 0);
  if (!ends.length) return "—";
  const max = Math.max(...ends);
  return formatShortDate(new Date(max * 1000).toISOString());
}

function paymentSubtitle(method?: string | null, sub?: boolean): string {
  const m = method?.trim() || "—";
  const cadence = sub ? "Monthly" : "One-time";
  return `${m} · ${cadence}`;
}

function sponsorshipLines(sp: Sponsorships[]): string[] {
  return sp.map((s) => {
    const amt = splitCurrency(Number(s.amount ?? 0));
    const base = `${amt.dollars}.${amt.cents} · ${s.status ?? "—"}`;
    return s.event_id ? `${base} · event ${s.event_id.slice(0, 8)}…` : base;
  });
}

function sponsorshipSummary(sp: Sponsorships[]): string {
  const total = sp.reduce((acc, s) => acc + Number(s.amount ?? 0), 0);
  const { dollars, cents } = splitCurrency(total);
  return `${sp.length} · ${dollars}.${cents}`;
}

export default function MercuryPlayground() {
  const [variant, setVariant] = useState<MercuryVariantId>("neighbors-all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [allChecked, setAllChecked] = useState(false);

  const mercury = useMercuryPlaygroundData(variant);

  const handleVariantChange = (v: string) => {
    setVariant(v as MercuryVariantId);
    setSelectedId(null);
    setChecked({});
    setAllChecked(false);
  };

  const rowIds = useMemo(() => {
    switch (variant) {
      case "neighbors-all":
        return mercury.neighborsAllPeople.map((p) => p.id);
      case "neighbors-members":
        return mercury.neighborsMembersPeople.map((p) => p.id);
      case "neighbors-duplicate-memberships":
        return mercury.duplicateMembers.map((m) => m.customerId);
      case "routes-all":
        return mercury.routesAllList.map((r) => r.id);
      case "routes-claimed":
        return mercury.routesClaimedList.map((r) => r.id);
      case "routes-open":
        return mercury.routesOpenList.map((r) => r.id);
      case "businesses-all":
        return mercury.businessesAllList.map((b) => b.id);
      case "businesses-members":
        return mercury.businessesMembersList.map((b) => b.id);
      case "billing-invoices":
        return mercury.stripeInvoices.map((i) => i.id);
      default:
        return [];
    }
  }, [variant, mercury]);

  const toggleRow = (id: string) => setSelectedId((prev) => (prev === id ? null : id));
  const toggleCheck = (id: string) => setChecked((prev) => ({ ...prev, [id]: !prev[id] }));

  const checkedCount = useMemo(() => {
    if (allChecked) return rowIds.length;
    return rowIds.filter((id) => checked[id]).length;
  }, [allChecked, checked, rowIds]);

  const allSelected = checkedCount === rowIds.length && rowIds.length > 0;
  const indeterminate = !allSelected && checkedCount > 0;

  const handleSelectAll = () => {
    if (allSelected || allChecked) {
      setAllChecked(false);
      setChecked({});
    } else {
      setAllChecked(true);
      setChecked({});
    }
  };

  const selectedNeighborAll =
    variant === "neighbors-all"
      ? mercury.neighborsAllPeople.find((r) => r.id === selectedId) ?? null
      : null;
  const selectedNeighborMember =
    variant === "neighbors-members"
      ? mercury.neighborsMembersPeople.find((r) => r.id === selectedId) ?? null
      : null;
  const selectedDup =
    variant === "neighbors-duplicate-memberships"
      ? mercury.duplicateMembers.find((r) => r.customerId === selectedId) ?? null
      : null;
  const selectedRoute =
    variant === "routes-all"
      ? mercury.routesAllList.find((r) => r.id === selectedId) ?? null
      : variant === "routes-claimed"
        ? mercury.routesClaimedList.find((r) => r.id === selectedId) ?? null
        : variant === "routes-open"
          ? mercury.routesOpenList.find((r) => r.id === selectedId) ?? null
          : null;
  const selectedBusiness =
    variant === "businesses-all"
      ? mercury.businessesAllList.find((r) => r.id === selectedId) ?? null
      : variant === "businesses-members"
        ? mercury.businessesMembersList.find((r) => r.id === selectedId) ?? null
        : null;
  const selectedInvoice =
    variant === "billing-invoices"
      ? mercury.stripeInvoices.find((r) => r.id === selectedId) ?? null
      : null;

  const sidebarTitle = useMemo(() => {
    if (selectedNeighborAll) return selectedNeighborAll.full_name;
    if (selectedNeighborMember) return selectedNeighborMember.full_name;
    if (selectedDup) return selectedDup.name;
    if (selectedRoute) return selectedRoute.route_name;
    if (selectedBusiness) return selectedBusiness.business_name ?? "Business";
    if (selectedInvoice) return selectedInvoice.customer_email ?? selectedInvoice.number ?? "Invoice";
    return "Details";
  }, [selectedNeighborAll, selectedNeighborMember, selectedDup, selectedRoute, selectedBusiness, selectedInvoice]);

  const selectedUnion =
    selectedNeighborAll ??
    selectedNeighborMember ??
    selectedDup ??
    selectedRoute ??
    selectedBusiness ??
    selectedInvoice;

  function renderSidebar(item: typeof selectedUnion) {
    if (!item) return null;
    switch (variant) {
      case "neighbors-all":
        return <NeighborAllSidebar row={item as PersonWithMembership} />;
      case "neighbors-members":
        return <NeighborMemberSidebar row={item as PersonWithMembership} />;
      case "neighbors-duplicate-memberships":
        return <DupMemberSidebar row={item as DuplicateMember} />;
      case "routes-all":
      case "routes-claimed":
      case "routes-open":
        return <RouteSidebar row={item as RouteWithDeliverer} variant={variant} />;
      case "businesses-all":
        return <BusinessAllSidebar row={item as BusinessWithDetails} />;
      case "businesses-members":
        return <BusinessMemberSidebar row={item as BusinessWithDetails} />;
      case "billing-invoices":
        return <InvoiceSidebar inv={item as StripeInvoiceTableRow} />;
      default:
        return null;
    }
  }

  const routesForVariant =
    variant === "routes-all"
      ? mercury.routesAllList
      : variant === "routes-claimed"
        ? mercury.routesClaimedList
        : variant === "routes-open"
          ? mercury.routesOpenList
          : [];

  const businessesForVariant =
    variant === "businesses-all"
      ? mercury.businessesAllList
      : variant === "businesses-members"
        ? mercury.businessesMembersList
        : [];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <label className="mb-1 block text-theme-xs font-medium text-gray-500 dark:text-gray-400">
            Table preview
          </label>
          <Select
            options={VARIANT_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            placeholder="Choose a table…"
            defaultValue="neighbors-all"
            className="max-w-xl min-w-[280px]"
            onChange={handleVariantChange}
          />
        </div>
        <p className="text-theme-xs text-gray-500 dark:text-gray-400">
          {variant === "original-invoice-demo"
            ? "Classic Mercury invoice list · Same sample data as the earlier standalone demo"
            : "Live data from Supabase and Stripe (matches each route’s sources) · Original invoice option stays static"}
        </p>
      </div>

      {variant === "original-invoice-demo" ? (
        <div className="-mx-2 min-w-0 overflow-x-auto sm:mx-0">
          <DataTable invoices={invoices} />
        </div>
      ) : (
        <TableWithDetailSidebar
          selectedItem={selectedUnion}
          onClose={() => setSelectedId(null)}
          sidebarTitle={sidebarTitle}
          asideWidthClass="w-full max-w-[420px]"
          dashboardTable={{ showSelectColumn: true, showMenuColumn: true }}
          renderSidebar={(row) => renderSidebar(row)}
        >
          <div className="overflow-hidden bg-white dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <Table className="w-full border-collapse">
                <TableHeader>
                  <tr className="border-b border-gray-200 dark:border-white/[0.05]">
                    <DashboardTableSelectHeader
                      checked={allSelected || allChecked}
                      indeterminate={indeterminate}
                      onChange={handleSelectAll}
                    />
                    {variant === "neighbors-all" && <NeighborsAllHeaders />}
                    {variant === "neighbors-members" && <NeighborsMembersHeaders />}
                    {variant === "neighbors-duplicate-memberships" && (
                      <DupMembersHeaders condensed={!!selectedUnion} />
                    )}
                    {variant === "routes-all" && <RoutesAllHeaders />}
                    {variant === "routes-claimed" && <RoutesClaimedHeaders />}
                    {variant === "routes-open" && <RoutesOpenHeaders />}
                    {variant === "businesses-all" && <BusinessAllHeaders />}
                    {variant === "businesses-members" && <BusinessMembersHeaders />}
                    {variant === "billing-invoices" && <InvoiceHeaders />}
                    <DashboardTableMenuHeader />
                  </tr>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {mercury.activeLoading ? (
                    <tr>
                      <td
                        colSpan={12}
                        className="px-4 py-12 text-center text-theme-sm text-gray-500 dark:text-gray-400"
                      >
                        Loading…
                      </td>
                    </tr>
                  ) : mercury.activeError ? (
                    <tr>
                      <td
                        colSpan={12}
                        className="px-4 py-12 text-center text-theme-sm text-red-600 dark:text-red-400"
                      >
                        {mercury.activeError}
                      </td>
                    </tr>
                  ) : (
                    <>
                      {variant === "neighbors-all" &&
                        mercury.neighborsAllPeople.map((row) => (
                          <NeighborsAllRow
                            key={row.id}
                            row={row}
                            selected={selectedId === row.id}
                            checked={!!checked[row.id] || allChecked}
                            onToggle={() => toggleRow(row.id)}
                            onCheck={() => toggleCheck(row.id)}
                            condensed={!!selectedUnion}
                          />
                        ))}
                      {variant === "neighbors-members" &&
                        mercury.neighborsMembersPeople.map((row) => (
                          <NeighborsMembersRow
                            key={row.id}
                            row={row}
                            selected={selectedId === row.id}
                            checked={!!checked[row.id] || allChecked}
                            onToggle={() => toggleRow(row.id)}
                            onCheck={() => toggleCheck(row.id)}
                            condensed={!!selectedUnion}
                          />
                        ))}
                      {variant === "neighbors-duplicate-memberships" &&
                        mercury.duplicateMembers.map((row) => (
                          <DupMemberRow
                            key={row.customerId}
                            row={row}
                            selected={selectedId === row.customerId}
                            checked={!!checked[row.customerId] || allChecked}
                            onToggle={() => toggleRow(row.customerId)}
                            onCheck={() => toggleCheck(row.customerId)}
                            condensed={!!selectedUnion}
                          />
                        ))}
                      {(variant === "routes-all" || variant === "routes-claimed" || variant === "routes-open") &&
                        routesForVariant.map((row) => (
                          <RouteRowView
                            key={row.id}
                            variant={variant}
                            row={row}
                            selected={selectedId === row.id}
                            checked={!!checked[row.id] || allChecked}
                            onToggle={() => toggleRow(row.id)}
                            onCheck={() => toggleCheck(row.id)}
                            condensed={!!selectedUnion}
                          />
                        ))}
                      {(variant === "businesses-all" || variant === "businesses-members") &&
                        businessesForVariant.map((row) => (
                          <BusinessRowView
                            key={row.id}
                            variant={variant}
                            row={row}
                            selected={selectedId === row.id}
                            checked={!!checked[row.id] || allChecked}
                            onToggle={() => toggleRow(row.id)}
                            onCheck={() => toggleCheck(row.id)}
                            condensed={!!selectedUnion}
                          />
                        ))}
                      {variant === "billing-invoices" &&
                        mercury.stripeInvoices.map((row) => (
                          <InvoiceRowView
                            key={row.id}
                            row={row}
                            selected={selectedId === row.id}
                            checked={!!checked[row.id] || allChecked}
                            onToggle={() => toggleRow(row.id)}
                            onCheck={() => toggleCheck(row.id)}
                          />
                        ))}
                    </>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TableWithDetailSidebar>
      )}
    </div>
  );
}

function NeighborsAllHeaders() {
  return (
    <>
      <DashboardTableDataCell isHeader align="start" className={mercuryHeaderCell}>
        Name
      </DashboardTableDataCell>
      <DashboardTableDataCell isHeader align="start" collapsible className={mercuryHeaderCell}>
        Email
      </DashboardTableDataCell>
      <DashboardTableDataCell isHeader align="start" className={mercuryHeaderCell}>
        Address
      </DashboardTableDataCell>
      <DashboardTableDataCell isHeader align="start" className={mercuryHeaderCell}>
        Member
      </DashboardTableDataCell>
      <DashboardTableDataCell isHeader align="start" collapsible className={mercuryHeaderCell}>
        Added
      </DashboardTableDataCell>
    </>
  );
}

function NeighborsAllRow({
  row,
  selected,
  checked,
  onToggle,
  onCheck,
  condensed,
}: {
  row: PersonWithMembership;
  selected: boolean;
  checked: boolean;
  onToggle: () => void;
  onCheck: () => void;
  condensed: boolean;
}) {
  const mStatus = row.membership?.status ?? null;
  const memberColor = membershipBadgeColor(mStatus);
  const email = row.email ?? "";
  const created = row.created_at ?? "";
  const addedStack = created ? formatStackedRelativePast(created) : null;
  return (
    <DashboardTableRow
      selected={selected}
      checked={checked}
      onCheckChange={onCheck}
      onClick={onToggle}
      menuItems={[{ label: "View", onClick: onToggle }]}
    >
      <DashboardTableDataCell align="start" className="group/name py-3.5">
        {condensed ? (
          <StackedCellContent
            primary={row.full_name}
            secondary={(row.phone ?? "").trim() || "—"}
          />
        ) : (
          <NormalCellContent className="font-medium">{row.full_name}</NormalCellContent>
        )}
      </DashboardTableDataCell>
      <DashboardTableDataCell align="start" collapsible className="py-3.5">
        <NormalCellContent>{email || "—"}</NormalCellContent>
      </DashboardTableDataCell>
      <DashboardTableDataCell align="start" className="py-3.5">
        <NormalCellContent>{row.address ?? "—"}</NormalCellContent>
      </DashboardTableDataCell>
      <DashboardTableDataCell align="start" className="py-3.5">
        {mStatus ? (
          <StatusCellContent label={mStatus} color={memberColor} />
        ) : (
          <StatusCellContent label="Non-member" color="light" />
        )}
      </DashboardTableDataCell>
      <DashboardTableDataCell align="start" collapsible className="py-3.5">
        {addedStack ? (
          <StackedCellContent primary={addedStack.primary} secondary={addedStack.secondary} />
        ) : (
          <NormalCellContent>—</NormalCellContent>
        )}
      </DashboardTableDataCell>
    </DashboardTableRow>
  );
}

function NeighborAllSidebar({ row }: { row: PersonWithMembership }) {
  const m = row.membership;
  return (
    <div className="flex flex-col">
      <SidebarField label="Identity">
        <span className="text-lg font-semibold tracking-tight">{row.full_name}</span>
      </SidebarField>
      <SidebarMutedLine>{row.email ?? "—"}</SidebarMutedLine>
      <SidebarMutedLine>{row.phone ?? "—"}</SidebarMutedLine>
      <SidebarDivider />
      <SidebarField label="Address">{row.address ?? "—"}</SidebarField>
      <SidebarDivider />
      <SidebarSectionTitle>Roles · tags</SidebarSectionTitle>
      <SidebarField label="Roles">{row.roles?.join(", ") ?? "—"}</SidebarField>
      <SidebarField label="Tags">
        <TruncatedTagPills tags={row.tags ?? []} max={12} />
      </SidebarField>
      <SidebarDivider />
      <SidebarField label="Source">{row.source ?? "—"}</SidebarField>
      <SidebarField label="Created">{row.created_at ? formatShortDate(row.created_at) : "—"}</SidebarField>
      <SidebarDivider />
      <SidebarSectionTitle>Membership</SidebarSectionTitle>
      <SidebarField label="Status">{m?.status ?? "—"}</SidebarField>
      <SidebarField label="Tier">{m?.tier ?? "—"}</SidebarField>
      <SidebarField label="Start">{m?.start_date ? formatShortDate(m.start_date) : row.created_at ? formatShortDate(row.created_at) : "—"}</SidebarField>
      <SidebarField label="Payment">{paymentSubtitle(m?.payment_method, !!m?.is_subscription)}</SidebarField>
      <SidebarField label="Last renewal">{m?.last_renewal ? formatShortDate(m.last_renewal) : "—"}</SidebarField>
    </div>
  );
}

function NeighborsMembersHeaders() {
  return (
    <>
      <DashboardTableDataCell isHeader align="start" className={mercuryHeaderCell}>
        Name
      </DashboardTableDataCell>
      <DashboardTableDataCell isHeader align="start" collapsible className={mercuryHeaderCell}>
        Tier
      </DashboardTableDataCell>
      <DashboardTableDataCell isHeader align="start" className={mercuryHeaderCell}>
        Status
      </DashboardTableDataCell>
      <DashboardTableDataCell isHeader align="start" className={mercuryHeaderCell}>
        Payment
      </DashboardTableDataCell>
      <DashboardTableDataCell isHeader align="start" collapsible className={mercuryHeaderCell}>
        Since
      </DashboardTableDataCell>
    </>
  );
}

function NeighborsMembersRow({
  row,
  selected,
  checked,
  onToggle,
  onCheck,
  condensed,
}: {
  row: PersonWithMembership;
  selected: boolean;
  checked: boolean;
  onToggle: () => void;
  onCheck: () => void;
  condensed: boolean;
}) {
  const m = row.membership;
  const statusLabel = m?.status ?? "—";
  const renewal = m?.last_renewal ? formatShortDate(m.last_renewal) : "—";
  const tierLabel = m?.tier ?? "—";
  const email = row.email ?? "";
  const sinceSource = m?.start_date ?? row.created_at ?? null;
  const sinceStack = sinceSource ? formatStackedRelativePast(sinceSource) : null;
  return (
    <DashboardTableRow
      selected={selected}
      checked={checked}
      onCheckChange={onCheck}
      onClick={onToggle}
      menuItems={[{ label: "View", onClick: onToggle }]}
    >
      <DashboardTableDataCell align="start" className="group/name py-3.5">
        {condensed ? (
          <StackedCellContent primary={row.full_name} secondary={email || "—"} />
        ) : (
          <NameEmailHoverCell name={row.full_name} email={email || "—"} />
        )}
      </DashboardTableDataCell>
      <DashboardTableDataCell align="start" collapsible className="py-3.5">
        <Badge variant="light" color="info" size="sm">
          {tierLabel}
        </Badge>
      </DashboardTableDataCell>
      <DashboardTableDataCell align="start" className="group/memstat py-3.5">
        {condensed ? (
          <StatusCellContent label={statusLabel} color={membershipBadgeColor(m?.status ?? null)} />
        ) : (
          <MembershipStatusRenewalHover
            statusLabel={statusLabel}
            renewalShort={renewal}
            color={membershipBadgeColor(m?.status ?? null)}
          />
        )}
      </DashboardTableDataCell>
      <DashboardTableDataCell align="start" className="py-3.5">
        {condensed ? (
          <NormalCellContent>{m?.payment_method ?? "—"}</NormalCellContent>
        ) : (
          <StackedCellContent
            primary={paymentSubtitle(m?.payment_method, !!m?.is_subscription)}
            secondary={m?.is_subscription ? "Subscription" : "Manual renewal"}
          />
        )}
      </DashboardTableDataCell>
      <DashboardTableDataCell align="start" collapsible className="py-3.5">
        {sinceStack ? (
          <StackedCellContent primary={sinceStack.primary} secondary={sinceStack.secondary} />
        ) : (
          <NormalCellContent>—</NormalCellContent>
        )}
      </DashboardTableDataCell>
    </DashboardTableRow>
  );
}

function NeighborMemberSidebar({ row }: { row: PersonWithMembership }) {
  const m = row.membership;
  const showStripe = !!(m?.stripe_customer_id || m?.stripe_subscription_id);
  return (
    <div className="flex flex-col">
      <SidebarField label="Identity">
        <span className="text-lg font-semibold tracking-tight">{row.full_name}</span>
      </SidebarField>
      <SidebarMutedLine>{row.email ?? "—"}</SidebarMutedLine>
      <SidebarMutedLine>{row.phone ?? "—"}</SidebarMutedLine>
      <SidebarField label="Address">{row.address ?? "—"}</SidebarField>
      <SidebarDivider />
      <SidebarSectionTitle>Membership</SidebarSectionTitle>
      <SidebarField label="Status">{m?.status ?? "—"}</SidebarField>
      <SidebarField label="Tier">{m?.tier ?? "—"}</SidebarField>
      <SidebarField label="Start">{m?.start_date ? formatShortDate(m.start_date) : row.created_at ? formatShortDate(row.created_at) : "—"}</SidebarField>
      <SidebarField label="Last renewal">{m?.last_renewal ? formatShortDate(m.last_renewal) : "—"}</SidebarField>
      <SidebarField label="Payment">{paymentSubtitle(m?.payment_method, !!m?.is_subscription)}</SidebarField>
      {showStripe && (
        <>
          <SidebarDivider />
          <SidebarSectionTitle>Stripe</SidebarSectionTitle>
          {m?.stripe_customer_id && (
            <SidebarField label="stripe_customer_id">
              <CopyableMuted value={m.stripe_customer_id} />
            </SidebarField>
          )}
          {m?.stripe_subscription_id && (
            <SidebarField label="stripe_subscription_id">
              <CopyableMuted value={m.stripe_subscription_id} />
            </SidebarField>
          )}
        </>
      )}
    </div>
  );
}

function formatUnixDate(ts: number | null): string {
  if (ts == null || ts <= 0 || Number.isNaN(ts)) return "—";
  return formatShortDate(new Date(ts * 1000).toISOString());
}

function DupMembersHeaders({ condensed }: { condensed: boolean }) {
  return (
    <>
      <DashboardTableDataCell isHeader align="start" className={mercuryHeaderCell}>
        Name
      </DashboardTableDataCell>
      {!condensed && (
        <DashboardTableDataCell isHeader align="start" className={mercuryHeaderCell}>
          Email
        </DashboardTableDataCell>
      )}
      <DashboardTableDataCell isHeader align="start" className={mercuryHeaderCell}>
        Subscriptions
      </DashboardTableDataCell>
      <DashboardTableDataCell isHeader align="start" className={mercuryHeaderCell}>
        Plans
      </DashboardTableDataCell>
      <DashboardTableDataCell isHeader align="start" collapsible className={mercuryHeaderCell}>
        Next renewal
      </DashboardTableDataCell>
    </>
  );
}

function DupMemberRow({
  row,
  selected,
  checked,
  onToggle,
  onCheck,
  condensed,
}: {
  row: DuplicateMember;
  selected: boolean;
  checked: boolean;
  onToggle: () => void;
  onCheck: () => void;
  condensed: boolean;
}) {
  const active = dupActiveCount(row.subscriptions);
  const total = row.subscriptions.length;
  const summary = `${active} active${total !== active ? ` · ${total} total` : ""}`;
  return (
    <DashboardTableRow
      selected={selected}
      checked={checked}
      onCheckChange={onCheck}
      onClick={onToggle}
      menuItems={[{ label: "View", onClick: onToggle }]}
    >
      <DashboardTableDataCell align="start" className="py-3.5">
        <StackedCellContent primary={row.name} secondary={row.email} />
      </DashboardTableDataCell>
      {!condensed && (
        <DashboardTableDataCell align="start" className="py-3.5">
          <NormalCellContent>{row.email}</NormalCellContent>
        </DashboardTableDataCell>
      )}
      <DashboardTableDataCell align="start" className="py-3.5">
        <Badge variant="light" color={active > 0 ? "success" : "warning"} size="sm">
          {summary}
        </Badge>
      </DashboardTableDataCell>
      <DashboardTableDataCell align="start" className="py-3.5">
        <NormalCellContent className="truncate">{dupPlans(row.subscriptions)}</NormalCellContent>
      </DashboardTableDataCell>
      <DashboardTableDataCell align="start" collapsible className="py-3.5">
        <NormalCellContent>{dupNextRenewalUnix(row.subscriptions)}</NormalCellContent>
      </DashboardTableDataCell>
    </DashboardTableRow>
  );
}

function DupMemberSidebar({ row }: { row: DuplicateMember }) {
  return (
    <div className="flex flex-col">
      <SidebarField label="Identity">
        <span className="text-lg font-semibold tracking-tight">{row.name}</span>
      </SidebarField>
      <SidebarMutedLine>{row.email}</SidebarMutedLine>
      <SidebarField label="customerId">
        <CopyableMuted value={row.customerId} label="Customer ID" />
      </SidebarField>
      <SidebarDivider />
      <SidebarSectionTitle>Subscriptions</SidebarSectionTitle>
      {row.subscriptions.map((s, i) => (
        <div key={`${s.priceId}-${i}`} className="rounded-lg border border-gray-100 p-3 dark:border-white/[0.06]">
          <SidebarField label="Product">{s.productName}</SidebarField>
          <SidebarField label="Status">{s.status}</SidebarField>
          <SidebarField label="priceId">{s.priceId}</SidebarField>
          <SidebarMutedLine>
            {formatUnixDate(s.currentPeriodStart)} → {formatUnixDate(s.currentPeriodEnd)}
          </SidebarMutedLine>
        </div>
      ))}
    </div>
  );
}

function RoutesAllHeaders() {
  return (
    <>
      <DashboardTableDataCell isHeader align="start" className={mercuryHeaderCell}>
        Route
      </DashboardTableDataCell>
      <DashboardTableDataCell isHeader align="start" className={mercuryHeaderCell}>
        Type
      </DashboardTableDataCell>
      <DashboardTableDataCell isHeader align="start" collapsible className={mercuryHeaderCell}>
        Leaflets
      </DashboardTableDataCell>
      <DashboardTableDataCell isHeader align="start" className={mercuryHeaderCell}>
        Coverage
      </DashboardTableDataCell>
    </>
  );
}

function RoutesClaimedHeaders() {
  return (
    <>
      <DashboardTableDataCell isHeader align="start" className={mercuryHeaderCell}>
        Route
      </DashboardTableDataCell>
      <DashboardTableDataCell isHeader align="start" className={mercuryHeaderCell}>
        Type
      </DashboardTableDataCell>
      <DashboardTableDataCell isHeader align="start" collapsible className={mercuryHeaderCell}>
        Leaflets
      </DashboardTableDataCell>
      <DashboardTableDataCell isHeader align="start" className={mercuryHeaderCell}>
        Primary
      </DashboardTableDataCell>
      <DashboardTableDataCell isHeader align="start" collapsible className={mercuryHeaderCell}>
        Secondary
      </DashboardTableDataCell>
    </>
  );
}

function RoutesOpenHeaders() {
  return (
    <>
      <DashboardTableDataCell isHeader align="start" className={mercuryHeaderCell}>
        Route
      </DashboardTableDataCell>
      <DashboardTableDataCell isHeader align="start" collapsible className={mercuryHeaderCell}>
        Type
      </DashboardTableDataCell>
      <DashboardTableDataCell isHeader align="start" collapsible className={mercuryHeaderCell}>
        Leaflets
      </DashboardTableDataCell>
      <DashboardTableDataCell isHeader align="start" className={mercuryHeaderCell}>
        Status
      </DashboardTableDataCell>
      <DashboardTableDataCell isHeader align="start" className={mercuryHeaderCell}>
        Last deliverer
      </DashboardTableDataCell>
    </>
  );
}

function RouteRowView({
  variant,
  row,
  selected,
  checked,
  onToggle,
  onCheck,
  condensed,
}: {
  variant: MercuryVariantId;
  row: RouteWithDeliverer;
  selected: boolean;
  checked: boolean;
  onToggle: () => void;
  onCheck: () => void;
  condensed: boolean;
}) {
  const cov = routeCoverage(row);
  if (variant === "routes-all") {
    return (
      <DashboardTableRow
        selected={selected}
        checked={checked}
        onCheckChange={onCheck}
        onClick={onToggle}
        menuItems={[{ label: "View", onClick: onToggle }]}
      >
        <DashboardTableDataCell align="start" className="py-3.5">
          <NormalCellContent>{row.route_name}</NormalCellContent>
        </DashboardTableDataCell>
        <DashboardTableDataCell align="start" className="py-3.5">
          <Badge variant="light" color="info" size="sm">
            {row.route_type ?? "—"}
          </Badge>
        </DashboardTableDataCell>
        <DashboardTableDataCell align="start" collapsible className="py-3.5">
          <NormalCellContent>{row.leaflet_count}</NormalCellContent>
        </DashboardTableDataCell>
        <DashboardTableDataCell
          align="start"
          className={`py-3.5 ${condensed ? "" : "group/coverage"}`}
        >
          {condensed ? (
            <StatusCellContent label={cov.label} color={coverageBadgeColor(cov.label)} />
          ) : (
            <CoverageDeliverersHover label={cov.label} deliverers={cov.deliverers} />
          )}
        </DashboardTableDataCell>
      </DashboardTableRow>
    );
  }

  if (variant === "routes-claimed") {
    const p = row.primary_deliverer;
    const s = row.secondary_deliverer;
    return (
      <DashboardTableRow
        selected={selected}
        checked={checked}
        onCheckChange={onCheck}
        onClick={onToggle}
        menuItems={[{ label: "View", onClick: onToggle }]}
      >
        <DashboardTableDataCell align="start" className="py-3.5">
          <NormalCellContent>{row.route_name}</NormalCellContent>
        </DashboardTableDataCell>
        <DashboardTableDataCell align="start" className="py-3.5">
          <Badge variant="light" color="info" size="sm">
            {row.route_type ?? "—"}
          </Badge>
        </DashboardTableDataCell>
        <DashboardTableDataCell align="start" collapsible className="py-3.5">
          <NormalCellContent>{row.leaflet_count}</NormalCellContent>
        </DashboardTableDataCell>
        <DashboardTableDataCell align="start" className={`py-3.5 group/deliverer`}>
          {p ? (
            condensed ? (
              <NormalCellContent>{p.full_name}</NormalCellContent>
            ) : (
              <DelivererHoverCell name={p.full_name} email={p.email} />
            )
          ) : (
            <NormalCellContent>—</NormalCellContent>
          )}
        </DashboardTableDataCell>
        <DashboardTableDataCell align="start" collapsible className="group/deliverer py-3.5">
          {s ? (
            condensed ? (
              <NormalCellContent>{s.full_name}</NormalCellContent>
            ) : (
              <DelivererHoverCell name={s.full_name} email={s.email} />
            )
          ) : (
            <NormalCellContent>—</NormalCellContent>
          )}
        </DashboardTableDataCell>
      </DashboardTableRow>
    );
  }

  const statusLabel = row.is_skipped ? "Skipped" : "Unassigned";
  const lastDel =
    row.is_skipped && row.primary_deliverer ? row.primary_deliverer.full_name : "—";
  return (
    <DashboardTableRow
      selected={selected}
      checked={checked}
      onCheckChange={onCheck}
      onClick={onToggle}
      menuItems={[{ label: "View", onClick: onToggle }]}
    >
      <DashboardTableDataCell align="start" className="py-3.5">
        <NormalCellContent>{row.route_name}</NormalCellContent>
      </DashboardTableDataCell>
      <DashboardTableDataCell align="start" collapsible className="py-3.5">
        <Badge variant="light" color="info" size="sm">
          {row.route_type ?? "—"}
        </Badge>
      </DashboardTableDataCell>
      <DashboardTableDataCell align="start" collapsible className="py-3.5">
        <NormalCellContent>{row.leaflet_count}</NormalCellContent>
      </DashboardTableDataCell>
      <DashboardTableDataCell align="start" className="py-3.5">
        <StatusCellContent label={statusLabel} color={row.is_skipped ? "warning" : "light"} />
      </DashboardTableDataCell>
      <DashboardTableDataCell align="start" className="py-3.5">
        <NormalCellContent>{lastDel}</NormalCellContent>
      </DashboardTableDataCell>
    </DashboardTableRow>
  );
}

function RouteSidebar({ row, variant }: { row: RouteWithDeliverer; variant: MercuryVariantId }) {
  const p = row.primary_deliverer;
  const s = row.secondary_deliverer;
  const primaryLine = p ? `${p.full_name} · ${p.email ?? "—"}` : "Unassigned";
  const secondaryLine = s ? `${s.full_name} · ${s.email ?? "—"}` : "None";

  if (variant === "routes-open") {
    const statusLabel = row.is_skipped ? "Skipped" : "Unassigned";
    const expl = row.is_skipped
      ? "Marked skipped for this cycle; last deliverer context may still apply."
      : "No primary or secondary deliverer is assigned.";
    return (
      <div className="flex flex-col">
        <SidebarField label="Route">
          <span className="text-lg font-semibold tracking-tight">{row.route_name}</span>
        </SidebarField>
        <SidebarMutedLine>
          {row.route_type ?? "—"} · {row.leaflet_count ?? 0} leaflets
        </SidebarMutedLine>
        <SidebarDivider />
        <SidebarSectionTitle>Status</SidebarSectionTitle>
        <SidebarField label="State">{statusLabel}</SidebarField>
        <SidebarMutedLine>{expl}</SidebarMutedLine>
        {row.is_skipped && p && (
          <SidebarField label="Primary deliverer">{p.full_name} · {p.email ?? "—"}</SidebarField>
        )}
        {s && (
          <SidebarField label="Secondary deliverer">{s.full_name} · {s.email ?? "—"}</SidebarField>
        )}
        <SidebarField label="Created">{row.created_at ? formatShortDate(row.created_at) : "—"}</SidebarField>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <SidebarField label="Route">
        <span className="text-lg font-semibold tracking-tight">{row.route_name}</span>
      </SidebarField>
      <SidebarMutedLine>
          {row.route_type ?? "—"} · {row.leaflet_count ?? 0} leaflets
      </SidebarMutedLine>
      <SidebarDivider />
      <SidebarSectionTitle>Coverage</SidebarSectionTitle>
      <SidebarField label="Primary">{primaryLine.trim()}</SidebarField>
      <SidebarField label="Secondary">{secondaryLine.trim()}</SidebarField>
      {row.is_skipped && <SidebarField label="Skipped">Yes</SidebarField>}
      <SidebarField label="Created">{row.created_at ? formatShortDate(row.created_at) : "—"}</SidebarField>
    </div>
  );
}

function BusinessAllHeaders() {
  return (
    <>
      <DashboardTableDataCell isHeader align="start" className={mercuryHeaderCell}>
        Business
      </DashboardTableDataCell>
      <DashboardTableDataCell isHeader align="start" className={mercuryHeaderCell}>
        Contact
      </DashboardTableDataCell>
      <DashboardTableDataCell isHeader align="start" className={mercuryHeaderCell}>
        Member
      </DashboardTableDataCell>
      <DashboardTableDataCell isHeader align="start" collapsible className={mercuryHeaderCell}>
        Sponsorships
      </DashboardTableDataCell>
      <DashboardTableDataCell isHeader align="start" collapsible className={mercuryHeaderCell}>
        Address
      </DashboardTableDataCell>
    </>
  );
}

function BusinessMembersHeaders() {
  return (
    <>
      <DashboardTableDataCell isHeader align="start" className={mercuryHeaderCell}>
        Business
      </DashboardTableDataCell>
      <DashboardTableDataCell isHeader align="start" className={mercuryHeaderCell}>
        Status
      </DashboardTableDataCell>
      <DashboardTableDataCell isHeader align="start" className={mercuryHeaderCell}>
        Payment
      </DashboardTableDataCell>
      <DashboardTableDataCell isHeader align="start" collapsible className={mercuryHeaderCell}>
        Last renewal
      </DashboardTableDataCell>
      <DashboardTableDataCell isHeader align="start" collapsible className={mercuryHeaderCell}>
        Sponsorships
      </DashboardTableDataCell>
    </>
  );
}

function BusinessRowView({
  variant,
  row,
  selected,
  checked,
  onToggle,
  onCheck,
  condensed,
}: {
  variant: MercuryVariantId;
  row: BusinessWithDetails;
  selected: boolean;
  checked: boolean;
  onToggle: () => void;
  onCheck: () => void;
  condensed: boolean;
}) {
  const bm = row.membership;
  const memStatus = bm?.status ?? null;
  const memLabel = memStatus ?? "—";
  const memColor = membershipBadgeColor(memStatus);
  const sponsorships = row.sponsorships ?? [];
  const spLines = sponsorshipLines(sponsorships);
  const spSummary = sponsorships.length ? sponsorshipSummary(sponsorships) : "—";

  const bizName = row.business_name ?? "—";
  const contact = row.contact_name ?? "";
  const email = row.email ?? "";
  const phone = row.phone ?? "";

  if (variant === "businesses-all") {
    return (
      <DashboardTableRow
        selected={selected}
        checked={checked}
        onCheckChange={onCheck}
        onClick={onToggle}
        menuItems={[{ label: "View", onClick: onToggle }]}
      >
        <DashboardTableDataCell align="start" className={`py-3.5 ${condensed ? "" : "group/business"}`}>
          {condensed ? (
            <StackedCellContent primary={bizName} secondary={contact || "—"} />
          ) : (
            <BusinessContactHoverCell business_name={bizName} contact_name={contact || "—"} />
          )}
        </DashboardTableDataCell>
        <DashboardTableDataCell align="start" className={`py-3.5 ${condensed ? "" : "group/contact"}`}>
          {condensed ? (
            <NormalCellContent>{email || "—"}</NormalCellContent>
          ) : (
            <ContactEmailPhoneHover email={email || "—"} phone={phone || "—"} />
          )}
        </DashboardTableDataCell>
        <DashboardTableDataCell align="start" className="py-3.5">
          {memStatus ? (
            <StatusCellContent label={memLabel} color={memColor} />
          ) : (
            <NormalCellContent>—</NormalCellContent>
          )}
        </DashboardTableDataCell>
        <DashboardTableDataCell align="start" collapsible className={`py-3.5 ${condensed ? "" : "group/countbd"}`}>
          {sponsorships.length ? (
            <CountBreakdownHover summary={spSummary} lines={spLines} />
          ) : (
            <NormalCellContent>—</NormalCellContent>
          )}
        </DashboardTableDataCell>
        <DashboardTableDataCell align="start" collapsible className="py-3.5">
          <NormalCellContent>{row.address ?? "—"}</NormalCellContent>
        </DashboardTableDataCell>
      </DashboardTableRow>
    );
  }

  return (
    <DashboardTableRow
      selected={selected}
      checked={checked}
      onCheckChange={onCheck}
      onClick={onToggle}
      menuItems={[{ label: "View", onClick: onToggle }]}
    >
      <DashboardTableDataCell align="start" className="py-3.5">
        <StackedCellContent primary={bizName} secondary={contact || "—"} />
      </DashboardTableDataCell>
      <DashboardTableDataCell align="start" className="py-3.5">
        {memStatus ? (
          <StatusCellContent label={memLabel} color={memColor} />
        ) : (
          <NormalCellContent>—</NormalCellContent>
        )}
      </DashboardTableDataCell>
      <DashboardTableDataCell align="start" className="py-3.5">
        <StackedCellContent
          primary={bm?.payment_method ?? "—"}
          secondary={bm?.is_subscription ? "Subscription" : "One-time"}
        />
      </DashboardTableDataCell>
      <DashboardTableDataCell align="start" collapsible className="py-3.5">
        <NormalCellContent>{bm?.last_renewal ? formatShortDate(bm.last_renewal) : "—"}</NormalCellContent>
      </DashboardTableDataCell>
      <DashboardTableDataCell align="start" collapsible className="py-3.5">
        <NormalCellContent>{spSummary}</NormalCellContent>
      </DashboardTableDataCell>
    </DashboardTableRow>
  );
}

function BusinessAllSidebar({ row }: { row: BusinessWithDetails }) {
  const bm = row.membership;
  const sponsorships = row.sponsorships ?? [];
  return (
    <div className="flex flex-col">
      <SidebarField label="Business">
        <span className="text-lg font-semibold tracking-tight">{row.business_name ?? "—"}</span>
      </SidebarField>
      <SidebarMutedLine>
        {(row.contact_name ?? "—") + " · " + (row.email ?? "—") + " · " + (row.phone ?? "—")}
      </SidebarMutedLine>
      <SidebarField label="Address">{row.address ?? "—"}</SidebarField>
      {row.notes && (
        <SidebarField label="Notes">
          <span className="font-normal">{row.notes}</span>
        </SidebarField>
      )}
      <SidebarDivider />
      <SidebarSectionTitle>Membership</SidebarSectionTitle>
      <SidebarField label="Status">{bm?.status ?? "—"}</SidebarField>
      <SidebarField label="Payment">{paymentSubtitle(bm?.payment_method, !!bm?.is_subscription)}</SidebarField>
      <SidebarField label="Last renewal">{bm?.last_renewal ? formatShortDate(bm.last_renewal) : "—"}</SidebarField>
      <SidebarDivider />
      <SidebarSectionTitle>Sponsorships</SidebarSectionTitle>
      {sponsorships.length === 0 && <SidebarMutedLine>None</SidebarMutedLine>}
      {sponsorships.map((s, i) => {
        const amt = splitCurrency(Number(s.amount ?? 0));
        return (
          <div key={i} className="rounded-lg border border-gray-100 p-3 dark:border-white/[0.06]">
            <SidebarField label="Amount">{`${amt.dollars}.${amt.cents}`}</SidebarField>
            <SidebarField label="Status">{s.status ?? "—"}</SidebarField>
            {s.event_id && (
              <SidebarField label="Event">{s.event_id}</SidebarField>
            )}
            <SidebarField label="Paid">{s.paid_date ? formatShortDate(s.paid_date) : "—"}</SidebarField>
            {s.memo && <SidebarMutedLine>{s.memo}</SidebarMutedLine>}
          </div>
        );
      })}
    </div>
  );
}

function BusinessMemberSidebar({ row }: { row: BusinessWithDetails }) {
  const bm = row.membership;
  const sponsorships = row.sponsorships ?? [];
  return (
    <div className="flex flex-col">
      <SidebarField label="Business">
        <span className="text-lg font-semibold tracking-tight">{row.business_name ?? "—"}</span>
      </SidebarField>
      <SidebarMutedLine>
        {(row.contact_name ?? "—") + " · " + (row.email ?? "—") + " · " + (row.phone ?? "—")}
      </SidebarMutedLine>
      <SidebarDivider />
      <SidebarSectionTitle>Membership</SidebarSectionTitle>
      <SidebarField label="Status">{bm?.status ?? "—"}</SidebarField>
      <SidebarField label="Payment">{paymentSubtitle(bm?.payment_method, !!bm?.is_subscription)}</SidebarField>
      <SidebarField label="Last renewal">{bm?.last_renewal ? formatShortDate(bm.last_renewal) : "—"}</SidebarField>
      <SidebarField label="Address">{row.address ?? "—"}</SidebarField>
      {row.notes && (
        <SidebarField label="Notes">
          <span className="font-normal">{row.notes}</span>
        </SidebarField>
      )}
      <SidebarDivider />
      <SidebarSectionTitle>Sponsorships</SidebarSectionTitle>
      {sponsorships.length === 0 && <SidebarMutedLine>None</SidebarMutedLine>}
      {sponsorships.map((s, i) => {
        const amt = splitCurrency(Number(s.amount ?? 0));
        return (
          <div key={i} className="rounded-lg border border-gray-100 p-3 dark:border-white/[0.06]">
            <SidebarField label="Amount">{`${amt.dollars}.${amt.cents}`}</SidebarField>
            <SidebarField label="Status">{s.status ?? "—"}</SidebarField>
            {s.event_id && (
              <SidebarField label="Event">{s.event_id}</SidebarField>
            )}
            <SidebarField label="Paid">{s.paid_date ? formatShortDate(s.paid_date) : "—"}</SidebarField>
            {s.memo && <SidebarMutedLine>{s.memo}</SidebarMutedLine>}
          </div>
        );
      })}
    </div>
  );
}

function InvoiceHeaders() {
  return (
    <>
      <DashboardTableDataCell isHeader align="start" className={mercuryHeaderCell}>
        Customer
      </DashboardTableDataCell>
      <DashboardTableDataCell isHeader align="start" collapsible className={mercuryHeaderCell}>
        Invoice
      </DashboardTableDataCell>
      <DashboardTableDataCell isHeader align="end" className={`${mercuryHeaderCell} text-right`}>
        Amount
      </DashboardTableDataCell>
      <DashboardTableDataCell isHeader align="start" className={mercuryHeaderCell}>
        Status
      </DashboardTableDataCell>
      <DashboardTableDataCell isHeader align="start" collapsible className={mercuryHeaderCell}>
        Due
      </DashboardTableDataCell>
    </>
  );
}

function InvoiceRowView({
  row,
  selected,
  checked,
  onToggle,
  onCheck,
}: {
  row: StripeInvoiceTableRow;
  selected: boolean;
  checked: boolean;
  onToggle: () => void;
  onCheck: () => void;
}) {
  const { dollars, cents } = splitCurrency(row.amount_due / 100);
  const statusNorm = (row.status ?? "").toLowerCase();
  const absDue = row.due_date != null ? formatDueDate(row.due_date) : "—";
  const dueIso =
    row.due_date != null ? new Date(row.due_date * 1000).toISOString() : null;

  let duePrimary = "—";
  let dueSecondary: string | undefined = absDue;

  if (row.due_date == null) {
    duePrimary = "—";
    dueSecondary = "—";
  } else if (statusNorm === "paid") {
    duePrimary = absDue;
    dueSecondary = absDue;
  } else {
    const then = new Date(row.due_date * 1000);
    if (then <= new Date()) {
      const stacked = formatStackedRelativePast(dueIso!);
      duePrimary = stacked.primary;
      dueSecondary = stacked.secondary;
    } else {
      duePrimary = formatRelativeFutureLabel(dueIso!);
      dueSecondary = duePrimary === absDue ? undefined : absDue;
    }
  }

  const invLabel = row.number ?? row.id.slice(0, 14);
  return (
    <DashboardTableRow
      selected={selected}
      checked={checked}
      onCheckChange={onCheck}
      onClick={onToggle}
      menuItems={[{ label: "View", onClick: onToggle }]}
    >
      <DashboardTableDataCell align="start" className="py-3.5">
        <NormalCellContent>{row.customer_email ?? "—"}</NormalCellContent>
      </DashboardTableDataCell>
      <DashboardTableDataCell align="start" collapsible className="group/invmeta py-3.5">
        <InvoiceNumberCreatedHover number={invLabel} created={formatDueDate(row.created)} />
      </DashboardTableDataCell>
      <DashboardTableDataCell align="end" className="py-3.5">
        <CurrencyCellContent dollars={dollars} cents={cents} align="end" />
      </DashboardTableDataCell>
      <DashboardTableDataCell align="start" className="py-3.5">
        <StatusCellContent
          label={row.status ?? "—"}
          color={invoiceStatusColor(row.status ?? "draft")}
        />
      </DashboardTableDataCell>
      <DashboardTableDataCell align="start" collapsible className="py-3.5">
        <StackedCellContent primary={duePrimary} secondary={dueSecondary} />
      </DashboardTableDataCell>
    </DashboardTableRow>
  );
}

function InvoiceSidebar({ inv }: { inv: StripeInvoiceTableRow }) {
  const { dollars, cents } = splitCurrency(inv.amount_due / 100);
  const invLabel = inv.number ?? inv.id.slice(0, 14);
  return (
    <div className="flex flex-col">
      <SidebarField label="Customer">{inv.customer_email ?? "—"}</SidebarField>
      <SidebarMutedLine>
        {invLabel} · {formatDueDate(inv.created)}
      </SidebarMutedLine>
      <SidebarDivider />
      <SidebarSectionTitle>Payment</SidebarSectionTitle>
      <div className="py-1">
        <span className="text-3xl font-light tracking-tight text-gray-900 dark:text-white/90">
          {dollars}
          <sup className="text-sm font-medium align-super leading-none">{cents}</sup>
        </span>
      </div>
      <SidebarField label="Status">
        <Badge variant="light" color={invoiceStatusColor(inv.status ?? "draft")} size="sm">
          {inv.status ?? "—"}
        </Badge>
      </SidebarField>
      <SidebarField label="Due date">
        {inv.due_date != null ? formatDueDate(inv.due_date) : "—"}
      </SidebarField>
      <SidebarDivider />
      <SidebarSectionTitle>Links</SidebarSectionTitle>
      {inv.hosted_invoice_url ? (
        <ActionLink
          href={inv.hosted_invoice_url}
          external
          className="inline-flex w-fit rounded-lg border border-gray-200 px-3 py-2 text-theme-sm dark:border-white/[0.08]"
        >
          Open hosted invoice
        </ActionLink>
      ) : (
        <SidebarMutedLine>No hosted invoice URL</SidebarMutedLine>
      )}
      <SidebarDivider />
      <SidebarMutedLine>catalog_product_ids</SidebarMutedLine>
      <ul className="mt-1 space-y-1 font-mono text-[11px] text-gray-500 dark:text-gray-400">
        {inv.catalog_product_ids.map((id) => (
          <li key={id}>{id}</li>
        ))}
      </ul>
    </div>
  );
}
