"use client";

import React, { useMemo, useState } from "react";
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
import type { DuplicateMember } from "@/app/api/stripe/duplicate-members/route";
import type { StripeInvoiceTableRow } from "@/components/billing/InvoicesListTable";
import {
  formatDueDate,
  formatShortMonthDay,
  isOpenPastDue,
  mercuryInvoiceDisplayStatus,
  mercuryInvoiceStatusColor,
  customerLabelFromEmail,
} from "@/components/billing/invoiceUtils";
import Link from "next/link";
import { CardLineIcon, DollarLineIcon } from "@/icons";
import {
  formatRelativeFutureLabel,
  formatShortDate,
  formatStackedRelativePast,
} from "@/lib/formatRelativeTime";
import type { Sponsorships } from "@/types/database";
import type { MercuryVariantId } from "./types";
import type { MercuryPlaygroundData } from "./useMercuryPlaygroundData";
import type { BusinessWithDetails, PersonWithMembership, RouteWithDeliverer } from "hooks";
import {
  mercuryHeaderCell,
  SidebarDivider,
  SidebarSectionTitle,
  SidebarField,
  SidebarMutedLine,
  CopyableMuted,
  NameEmailHoverCell,
  NeighborNameAddressHoverCell,
  ContactEmailPhoneHover,
  BusinessNameWithStatusIcons,
  businessTableNameCellClass,
  truncateDisplayText,
  DelivererHoverCell,
  CoverageDeliverersHover,
  CountBreakdownHover,
  TruncatedTagPills,
  membershipBadgeColor,
  splitCurrency,
} from "./shared";

function routeCoverage(route: RouteWithDeliverer): { label: string; deliverers: string[] } {
  const names: string[] = [];
  if (route.primary_deliverer) names.push(route.primary_deliverer.full_name);
  if (route.secondary_deliverer) names.push(route.secondary_deliverer.full_name);
  if (route.is_skipped) return { label: "Skipped", deliverers: names };
  if (route.primary_deliverer || route.secondary_deliverer) return { label: "Covered", deliverers: names };
  return { label: "Open", deliverers: [] };
}

/** Human-readable route type under the route name (DB value is freeform text). */
function formatRouteTypeLabel(routeType: string | null | undefined): string | undefined {
  const raw = routeType?.trim();
  if (!raw) return undefined;
  const norm = raw.toLowerCase().replace(/[\s-]+/g, "_");
  const aliases: Record<string, string> = {
    single_family: "Single-family residence",
    single_family_residence: "Single-family residence",
    sfr: "Single-family residence",
    multi_family: "Multi-family residence",
    multifamily: "Multi-family residence",
    apartment: "Apartment",
    apartments: "Apartment",
    commercial: "Commercial",
    mixed_use: "Mixed use",
    other: "Other",
  };
  if (aliases[norm]) return aliases[norm];
  return raw
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function RouteNameTypeCell({
  routeName,
  routeType,
  condensed,
}: {
  routeName: string;
  routeType: string | null | undefined;
  condensed: boolean;
}) {
  const typeLine = formatRouteTypeLabel(routeType);
  const titleClass = condensed
    ? "max-w-[50ch] truncate text-sm font-semibold tracking-tight text-gray-800 dark:text-white/90"
    : "max-w-[50ch] truncate text-base font-semibold tracking-tight text-gray-900 dark:text-white/90";
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <div className={titleClass} title={routeName.trim() ? routeName : undefined}>
        {routeName}
      </div>
      {typeLine ? (
        <div className="truncate text-theme-xs text-gray-500 dark:text-gray-400">{typeLine}</div>
      ) : null}
    </div>
  );
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

/** Neighbors-members merged column: subscription vs one-time (no card / cadence detail). */
function membershipPlanTypeLine(m: PersonWithMembership["membership"]): string | undefined {
  if (!m) return undefined;
  return m.is_subscription ? "Type: Subscription" : "Type: One-time";
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


export type MercurySelectedUnion =
  | PersonWithMembership
  | DuplicateMember
  | RouteWithDeliverer
  | BusinessWithDetails
  | StripeInvoiceTableRow;

export function resolveMercurySelectedItem(
  variant: MercuryVariantId,
  mercury: MercuryPlaygroundData,
  selectedKey: string | null,
): MercurySelectedUnion | null {
  if (!selectedKey) return null;
  switch (variant) {
    case "neighbors-all":
      return mercury.neighborsAllPeople.find((r) => r.id === selectedKey) ?? null;
    case "neighbors-members":
      return mercury.neighborsMembersPeople.find((r) => r.id === selectedKey) ?? null;
    case "neighbors-duplicate-memberships":
      return mercury.duplicateMembers.find((r) => r.customerId === selectedKey) ?? null;
    case "routes-all":
      return mercury.routesAllList.find((r) => r.id === selectedKey) ?? null;
    case "routes-claimed":
      return mercury.routesClaimedList.find((r) => r.id === selectedKey) ?? null;
    case "routes-open":
      return mercury.routesOpenList.find((r) => r.id === selectedKey) ?? null;
    case "businesses-all":
      return mercury.businessesAllList.find((r) => r.id === selectedKey) ?? null;
    case "businesses-members":
      return mercury.businessesMembersList.find((r) => r.id === selectedKey) ?? null;
    case "billing-invoices":
      return mercury.stripeInvoices.find((r) => r.id === selectedKey) ?? null;
    default:
      return null;
  }
}

export function mercuryReadOnlySidebarTitle(
  variant: MercuryVariantId,
  item: MercurySelectedUnion | null,
): string {
  if (!item) return "Details";
  switch (variant) {
    case "neighbors-all":
    case "neighbors-members":
      return (item as PersonWithMembership).full_name;
    case "neighbors-duplicate-memberships":
      return (item as DuplicateMember).name;
    case "routes-all":
    case "routes-claimed":
    case "routes-open":
      return (item as RouteWithDeliverer).route_name;
    case "businesses-all":
    case "businesses-members":
      return (item as BusinessWithDetails).business_name ?? "Business";
    case "billing-invoices": {
      const inv = item as StripeInvoiceTableRow;
      return `Invoice to ${customerLabelFromEmail(inv.customer_email)}`;
    }
    default:
      return "Details";
  }
}

export function renderMercuryReadOnlySidebar(
  variant: MercuryVariantId,
  item: MercurySelectedUnion,
): React.ReactNode {
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

export type InvoiceRowActions = {
  onRemind?: (invoiceId: string) => void;
  remindingId?: string | null;
  onCopyProductIds?: (inv: StripeInvoiceTableRow) => void;
};

export type BusinessRowActions = {
  onEdit: (row: BusinessWithDetails) => void;
  onToggleMember: (row: BusinessWithDetails) => void;
  onTogglePastSponsor: (row: BusinessWithDetails) => void;
};

export interface MercuryVariantTableProps {
  variant: MercuryVariantId;
  mercury: MercuryPlaygroundData;
  selectedKey: string | null;
  onSelectKey: (key: string | null) => void;
  /** When set for billing-invoices, renders these rows instead of mercury.stripeInvoices. */
  invoiceRowsOverride?: StripeInvoiceTableRow[];
  invoiceRowActions?: InvoiceRowActions;
  emptyInvoicesMessage?: React.ReactNode;
  businessRowActions?: BusinessRowActions;
}

export function MercuryVariantTable({
  variant,
  mercury,
  selectedKey,
  onSelectKey,
  invoiceRowsOverride,
  invoiceRowActions,
  emptyInvoicesMessage,
  businessRowActions,
}: MercuryVariantTableProps) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [allChecked, setAllChecked] = useState(false);

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
      case "billing-invoices": {
        const rows = invoiceRowsOverride ?? mercury.stripeInvoices;
        return rows.map((i) => i.id);
      }
      default:
        return [];
    }
  }, [variant, mercury, invoiceRowsOverride]);

  const invoiceRows =
    variant === "billing-invoices"
      ? (invoiceRowsOverride ?? mercury.stripeInvoices)
      : [];

  const toggleRow = (id: string) => onSelectKey(selectedKey === id ? null : id);
  const toggleCheck = (id: string) => setChecked((prev) => ({ ...prev, [id]: !prev[id] }));

  const detailOpen = selectedKey != null;

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
    <div className="bg-white dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto overflow-y-visible">
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
                <DupMembersHeaders condensed={detailOpen} />
              )}
              {variant === "routes-all" && <RoutesAllHeaders />}
              {variant === "routes-claimed" && <RoutesClaimedHeaders />}
              {variant === "routes-open" && <RoutesOpenHeaders />}
              {(variant === "businesses-all" || variant === "businesses-members") && (
                <BusinessTableHeaders />
              )}
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
                      selected={selectedKey === row.id}
                      checked={!!checked[row.id] || allChecked}
                      onToggle={() => toggleRow(row.id)}
                      onCheck={() => toggleCheck(row.id)}
                      condensed={detailOpen}
                    />
                  ))}
                {variant === "neighbors-members" &&
                  mercury.neighborsMembersPeople.map((row) => (
                    <NeighborsMembersRow
                      key={row.id}
                      row={row}
                      selected={selectedKey === row.id}
                      checked={!!checked[row.id] || allChecked}
                      onToggle={() => toggleRow(row.id)}
                      onCheck={() => toggleCheck(row.id)}
                      condensed={detailOpen}
                    />
                  ))}
                {variant === "neighbors-duplicate-memberships" &&
                  mercury.duplicateMembers.map((row) => (
                    <DupMemberRow
                      key={row.customerId}
                      row={row}
                      selected={selectedKey === row.customerId}
                      checked={!!checked[row.customerId] || allChecked}
                      onToggle={() => toggleRow(row.customerId)}
                      onCheck={() => toggleCheck(row.customerId)}
                      condensed={detailOpen}
                    />
                  ))}
                {(variant === "routes-all" || variant === "routes-claimed" || variant === "routes-open") &&
                  routesForVariant.map((row) => (
                    <RouteRowView
                      key={row.id}
                      variant={variant}
                      row={row}
                      selected={selectedKey === row.id}
                      checked={!!checked[row.id] || allChecked}
                      onToggle={() => toggleRow(row.id)}
                      onCheck={() => toggleCheck(row.id)}
                      condensed={detailOpen}
                    />
                  ))}
                {(variant === "businesses-all" || variant === "businesses-members") &&
                  businessesForVariant.map((row) => (
                    <BusinessRowView
                      key={row.id}
                      variant={variant}
                      row={row}
                      selected={selectedKey === row.id}
                      checked={!!checked[row.id] || allChecked}
                      onToggle={() => toggleRow(row.id)}
                      onCheck={() => toggleCheck(row.id)}
                      condensed={detailOpen}
                      businessRowActions={businessRowActions}
                    />
                  ))}
                {variant === "billing-invoices" &&
                  invoiceRows.length === 0 &&
                  !mercury.activeLoading &&
                  !mercury.activeError && (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-4 py-12 text-center text-theme-sm text-gray-500 dark:text-gray-400"
                      >
                        {emptyInvoicesMessage ?? "No invoices."}
                      </td>
                    </tr>
                  )}
                {variant === "billing-invoices" &&
                  invoiceRows.map((row) => (
                    <OriginalInvoiceRowView
                      key={row.id}
                      row={row}
                      selected={selectedKey === row.id}
                      checked={!!checked[row.id] || allChecked}
                      onToggle={() => toggleRow(row.id)}
                      onCheck={() => toggleCheck(row.id)}
                      actions={invoiceRowActions}
                    />
                  ))}
              </>
            )}
          </TableBody>
        </Table>
      </div>
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
          <NeighborNameAddressHoverCell
            name={row.full_name}
            address={row.address ?? ""}
            phoneCondensed={row.phone ?? ""}
          />
        ) : (
          <NeighborNameAddressHoverCell name={row.full_name} address={row.address ?? ""} />
        )}
      </DashboardTableDataCell>
      <DashboardTableDataCell align="start" collapsible className="py-3.5">
        <NormalCellContent>{email || "—"}</NormalCellContent>
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
        Membership
      </DashboardTableDataCell>
      <DashboardTableDataCell isHeader align="start" className={mercuryHeaderCell}>
        Status
      </DashboardTableDataCell>
      <DashboardTableDataCell isHeader align="start" collapsible className={mercuryHeaderCell}>
        Last renewed
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
  const tierLabel = m?.tier ?? "—";
  const email = row.email ?? "";
  const lastRenewalSource = m?.last_renewal ?? null;
  const renewedStack = lastRenewalSource ? formatStackedRelativePast(lastRenewalSource) : null;
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
        <StackedCellContent primary={tierLabel} secondary={membershipPlanTypeLine(m)} />
      </DashboardTableDataCell>
      <DashboardTableDataCell align="start" className="py-3.5">
        <StatusCellContent label={statusLabel} color={membershipBadgeColor(m?.status ?? null)} />
      </DashboardTableDataCell>
      <DashboardTableDataCell align="start" collapsible className="py-3.5">
        {renewedStack ? (
          <StackedCellContent primary={renewedStack.primary} secondary={renewedStack.secondary} />
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

export function DupMemberSidebar({ row }: { row: DuplicateMember }) {
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
          <RouteNameTypeCell routeName={row.route_name} routeType={row.route_type} condensed={condensed} />
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
            <CoverageDeliverersHover
              label={cov.label}
              deliverers={cov.deliverers}
              color={coverageBadgeColor(cov.label)}
            />
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
          <RouteNameTypeCell routeName={row.route_name} routeType={row.route_type} condensed={condensed} />
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
        <RouteNameTypeCell routeName={row.route_name} routeType={row.route_type} condensed={condensed} />
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
          {formatRouteTypeLabel(row.route_type) ?? "—"} · {row.leaflet_count ?? 0} leaflets
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
        {formatRouteTypeLabel(row.route_type) ?? "—"} · {row.leaflet_count ?? 0} leaflets
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

function BusinessTableHeaders() {
  return (
    <>
      <DashboardTableDataCell
        isHeader
        align="start"
        className={`${mercuryHeaderCell} ${businessTableNameCellClass}`}
      >
        Business
      </DashboardTableDataCell>
      <DashboardTableDataCell isHeader align="start" className={mercuryHeaderCell}>
        Contact
      </DashboardTableDataCell>
      <DashboardTableDataCell isHeader align="start" className={mercuryHeaderCell}>
        Email
      </DashboardTableDataCell>
    </>
  );
}

function buildBusinessMenuItems(
  row: BusinessWithDetails,
  actions: BusinessRowActions
): { label: string; onClick: () => void }[] {
  return [
    { label: "Edit", onClick: () => actions.onEdit(row) },
    {
      label: row.is_member ? "Remove member" : "Mark as member",
      onClick: () => actions.onToggleMember(row),
    },
    {
      label: row.is_past_sponsor ? "Remove past sponsor" : "Mark as past sponsor",
      onClick: () => actions.onTogglePastSponsor(row),
    },
  ];
}

const businessStatusIconClass = "size-[1em] shrink-0";
const businessMemberIcon = <CardLineIcon className={businessStatusIconClass} />;
const businessPastSponsorIcon = <DollarLineIcon className={businessStatusIconClass} />;

function BusinessRowView({
  row,
  selected,
  checked,
  onToggle,
  onCheck,
  condensed,
  businessRowActions,
}: {
  variant: MercuryVariantId;
  row: BusinessWithDetails;
  selected: boolean;
  checked: boolean;
  onToggle: () => void;
  onCheck: () => void;
  condensed: boolean;
  businessRowActions?: BusinessRowActions;
}) {
  const bizName = row.business_name ?? "—";
  const contact = row.contact_name?.trim() || "—";
  const email = row.email?.trim() || "—";
  const phone = row.phone?.trim() || "—";
  const address = row.address?.trim() ?? "";

  const menuItems = businessRowActions
    ? buildBusinessMenuItems(row, businessRowActions)
    : [{ label: "View", onClick: onToggle }];

  return (
    <DashboardTableRow
      selected={selected}
      checked={checked}
      onCheckChange={onCheck}
      onClick={onToggle}
      menuItems={menuItems}
    >
      <DashboardTableDataCell
        align="start"
        className={`overflow-visible py-3.5 ${businessTableNameCellClass} ${condensed ? "" : "group/business"}`}
      >
        {condensed ? (
          <StackedCellContent
            primary={
              <span title={bizName} className="block truncate">
                {truncateDisplayText(bizName)}
              </span>
            }
            secondary={address || "—"}
          />
        ) : (
          <BusinessNameWithStatusIcons
            business_name={bizName}
            address={address}
            is_member={row.is_member}
            is_past_sponsor={row.is_past_sponsor}
            memberIcon={businessMemberIcon}
            pastSponsorIcon={businessPastSponsorIcon}
          />
        )}
      </DashboardTableDataCell>
      <DashboardTableDataCell align="start" className="py-3.5">
        <StackedCellContent primary={contact} secondary={phone} />
      </DashboardTableDataCell>
      <DashboardTableDataCell align="start" className="py-3.5">
        <NormalCellContent>{email}</NormalCellContent>
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
        Due date
      </DashboardTableDataCell>
      <DashboardTableDataCell isHeader align="start" className={mercuryHeaderCell}>
        <span className="inline-flex items-center gap-1">
          Status
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden>
            <path
              d="M5.5 2v7M2.5 6l3 3 3-3"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </DashboardTableDataCell>
      <DashboardTableDataCell isHeader align="start" className={mercuryHeaderCell}>
        Customer
      </DashboardTableDataCell>
      <DashboardTableDataCell isHeader align="end" className={`${mercuryHeaderCell} text-right`}>
        Amount
      </DashboardTableDataCell>
      <DashboardTableDataCell isHeader align="start" collapsible className={mercuryHeaderCell}>
        Invoice no.
      </DashboardTableDataCell>
      <DashboardTableDataCell isHeader align="start" collapsible className={mercuryHeaderCell}>
        Invoice date
      </DashboardTableDataCell>
      <DashboardTableDataCell isHeader align="start" className={mercuryHeaderCell}>
        Type
      </DashboardTableDataCell>
    </>
  );
}

function customerFromEmail(email: string | null): { primary: string; secondary: string } {
  if (!email) return { primary: "—", secondary: "" };
  const primary = customerLabelFromEmail(email);
  const secondary = email.length > 28 ? `${email.slice(0, 25)}…` : email;
  return { primary, secondary };
}

function originalInvoiceDueStack(row: StripeInvoiceTableRow): {
  primary: string;
  secondary?: string;
} {
  const statusNorm = (row.status ?? "").toLowerCase();
  const absDue = formatShortMonthDay(row.due_date);
  const dueIso =
    row.due_date != null ? new Date(row.due_date * 1000).toISOString() : null;

  if (row.due_date == null) {
    return { primary: "—", secondary: undefined };
  }
  if (statusNorm === "paid") {
    return { primary: absDue, secondary: undefined };
  }
  const then = new Date(row.due_date * 1000);
  if (then <= new Date()) {
    const stacked = formatStackedRelativePast(dueIso!);
    return { primary: stacked.primary, secondary: stacked.secondary };
  }
  const rel = formatRelativeFutureLabel(dueIso!);
  return {
    primary: rel,
    secondary: rel === absDue ? undefined : absDue,
  };
}

function OriginalInvoiceRowView({
  row,
  selected,
  checked,
  onToggle,
  onCheck,
  actions,
}: {
  row: StripeInvoiceTableRow;
  selected: boolean;
  checked: boolean;
  onToggle: () => void;
  onCheck: () => void;
  actions?: InvoiceRowActions;
}) {
  const { dollars, cents } = splitCurrency(row.amount_due / 100);
  const displayStatus = mercuryInvoiceDisplayStatus(row);
  const { primary: duePrimary, secondary: dueSecondary } = originalInvoiceDueStack(row);
  const customer = customerFromEmail(row.customer_email);
  const invLabel = row.number ?? row.id.slice(0, 14);
  const detailHref = `/sponsorship/invoices/${encodeURIComponent(row.id)}`;
  const overdue = isOpenPastDue(row);

  const menuItems = [
    { label: "View invoice", onClick: onToggle },
    ...(actions?.onCopyProductIds && row.catalog_product_ids.length > 0
      ? [{ label: "Copy product ID", onClick: () => actions.onCopyProductIds!(row) }]
      : []),
    ...(overdue && actions?.onRemind
      ? [
          {
            label:
              actions.remindingId === row.id ? "Sending reminder…" : "Send reminder",
            onClick: () => actions.onRemind!(row.id),
          },
        ]
      : []),
    ...(row.hosted_invoice_url
      ? [
          {
            label: "Open pay link",
            onClick: () => window.open(row.hosted_invoice_url!, "_blank", "noopener,noreferrer"),
          },
        ]
      : []),
  ];

  return (
    <DashboardTableRow
      selected={selected}
      checked={checked}
      onCheckChange={onCheck}
      onClick={onToggle}
      menuItems={menuItems}
    >
      <DashboardTableDataCell align="start" className="py-3.5">
        <StackedCellContent primary={duePrimary} secondary={dueSecondary} />
      </DashboardTableDataCell>
      <DashboardTableDataCell align="start" className="py-3.5">
        <StatusCellContent
          label={displayStatus}
          color={mercuryInvoiceStatusColor(displayStatus)}
        />
      </DashboardTableDataCell>
      <DashboardTableDataCell align="start" className="max-w-[200px] py-3.5">
        <StackedCellContent primary={customer.primary} secondary={customer.secondary} />
      </DashboardTableDataCell>
      <DashboardTableDataCell align="end" className="py-3.5">
        <CurrencyCellContent dollars={dollars} cents={cents} align="end" />
      </DashboardTableDataCell>
      <DashboardTableDataCell align="start" collapsible className="py-3.5">
        <Link
          href={detailHref}
          onClick={(e) => e.stopPropagation()}
          className="text-theme-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
        >
          <NormalCellContent>{invLabel}</NormalCellContent>
        </Link>
      </DashboardTableDataCell>
      <DashboardTableDataCell align="start" collapsible className="py-3.5">
        <NormalCellContent>{formatShortMonthDay(row.created)}</NormalCellContent>
      </DashboardTableDataCell>
      <DashboardTableDataCell align="start" className="py-3.5">
        <NormalCellContent>{row.sponsorship_category ?? "One time"}</NormalCellContent>
      </DashboardTableDataCell>
    </DashboardTableRow>
  );
}

export function InvoiceSidebar({
  inv,
  actions,
}: {
  inv: StripeInvoiceTableRow;
  actions?: InvoiceRowActions;
}) {
  const { dollars, cents } = splitCurrency(inv.amount_due / 100);
  const invLabel = inv.number ?? inv.id.slice(0, 14);
  const detailHref = `/sponsorship/invoices/${encodeURIComponent(inv.id)}`;
  const displayStatus = mercuryInvoiceDisplayStatus(inv);
  const overdue = isOpenPastDue(inv);

  return (
    <div className="flex flex-col">
      <SidebarField label="Customer">{inv.customer_email ?? "—"}</SidebarField>
      <SidebarMutedLine>
        {invLabel} · {formatDueDate(inv.created)}
      </SidebarMutedLine>
      {inv.sponsorship_category ? (
        <SidebarField label="Category">{inv.sponsorship_category}</SidebarField>
      ) : null}
      {inv.event_name ? (
        <SidebarField label="Event">{inv.event_name}</SidebarField>
      ) : null}
      {inv.created_by_name ? (
        <SidebarField label="Created by">{inv.created_by_name}</SidebarField>
      ) : null}
      <SidebarDivider />
      <SidebarSectionTitle>Payment</SidebarSectionTitle>
      <div className="py-1">
        <span className="text-3xl font-light tracking-tight text-gray-900 dark:text-white/90">
          {dollars}
          <sup className="text-sm font-medium align-super leading-none">{cents}</sup>
        </span>
      </div>
      <SidebarField label="Status">
        <Badge variant="light" color={mercuryInvoiceStatusColor(displayStatus)} size="sm">
          {displayStatus}
        </Badge>
      </SidebarField>
      <SidebarField label="Due date">
        {inv.due_date != null ? formatDueDate(inv.due_date) : "—"}
      </SidebarField>
      <SidebarDivider />
      <SidebarSectionTitle>Actions</SidebarSectionTitle>
      <div className="flex flex-wrap gap-2">
        <Link
          href={detailHref}
          className="inline-flex rounded-lg border border-gray-200 px-3 py-2 text-theme-sm font-medium text-gray-800 hover:bg-gray-50 dark:border-white/[0.08] dark:text-white/85 dark:hover:bg-white/[0.06]"
        >
          View invoice
        </Link>
        {overdue && actions?.onRemind ? (
          <button
            type="button"
            disabled={actions.remindingId === inv.id}
            onClick={() => actions.onRemind!(inv.id)}
            className="inline-flex rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-theme-sm font-medium text-amber-900 hover:bg-amber-100 disabled:opacity-50 dark:border-amber-500/35 dark:bg-amber-500/10 dark:text-amber-100"
          >
            {actions.remindingId === inv.id ? "Sending…" : "Send reminder"}
          </button>
        ) : null}
        {actions?.onCopyProductIds && inv.catalog_product_ids.length > 0 ? (
          <button
            type="button"
            onClick={() => actions.onCopyProductIds!(inv)}
            className="inline-flex rounded-lg border border-gray-200 px-3 py-2 text-theme-sm font-medium text-gray-800 hover:bg-gray-50 dark:border-white/[0.08] dark:text-white/85 dark:hover:bg-white/[0.06]"
          >
            Copy product ID
          </button>
        ) : null}
      </div>
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
