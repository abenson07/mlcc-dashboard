"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Filter, MapPin, Search } from "lucide-react";
import { pixel, proportional, type TableColumn } from "@/components/patterns/primitives/table";
import { GroupedTable } from "@/components/patterns/grouped-table/GroupedTable";
import { Dropdown, DropdownItem } from "@/components/patterns/shared/dropdown";
import { sampleDeliverers, type LeafletDelivererRouteRow, type LeafletDelivererRow } from "@/data/mocks/leaflets";

type StatusFilter = "all" | LeafletDelivererRow["status"];

const STATUS_FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "Confirmed", label: "Confirmed" },
  { value: "Invited", label: "Invited" },
  { value: "Declined", label: "Not confirmed" },
];

const STATUS_LABEL: Record<LeafletDelivererRow["status"], string> = {
  Confirmed: "Confirmed",
  Invited: "Invited",
  Declined: "Not confirmed",
};

const STATUS_COLOR: Record<LeafletDelivererRow["status"], { bg: string; fg: string }> = {
  Confirmed: { bg: "rgba(39, 166, 68, 0.12)", fg: "#27a644" },
  Invited: { bg: "rgba(242, 201, 76, 0.16)", fg: "#a67a00" },
  Declined: { bg: "rgba(242, 153, 74, 0.14)", fg: "#c96a1a" },
};

function StatusBadge({ status }: { status: LeafletDelivererRow["status"] }) {
  const color = STATUS_COLOR[status];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 22,
        paddingInline: 8,
        borderRadius: 999,
        background: color.bg,
        color: color.fg,
        fontSize: 12,
        fontWeight: 500,
        whiteSpace: "nowrap",
      }}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

function routeColumns(totalLeaflets: number): TableColumn<LeafletDelivererRouteRow>[] {
  return [
    {
      key: "name",
      header: "Route",
      width: proportional(1, { minWidth: 200 }),
      renderCell: (row) => <span style={{ color: "var(--linear-color-ink)" }}>{row.name}</span>,
    },
    {
      key: "leafletCount",
      header: `Leaflets (${totalLeaflets})`,
      width: pixel(120),
      renderCell: (row) => (
        <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.leafletCount} leaflets</span>
      ),
    },
  ];
}

function DelivererCard({ deliverer }: { deliverer: LeafletDelivererRow }) {
  const totalLeaflets = deliverer.routes.reduce((sum, route) => sum + route.leafletCount, 0);
  const columns = useMemo(() => routeColumns(totalLeaflets), [totalLeaflets]);

  return (
    <div
      data-slot="deliverer-card"
      style={{
        boxSizing: "border-box",
        border: "var(--linear-border-width) solid var(--linear-color-hairline)",
        borderRadius: "var(--linear-radius-md)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
          padding: "16px 20px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--linear-color-ink)" }}>
            {deliverer.name}
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              color: "var(--linear-color-ink-subtle)",
            }}
          >
            <MapPin size={13} strokeWidth={1.75} style={{ flexShrink: 0 }} />
            {deliverer.address}
          </span>
        </div>
        <StatusBadge status={deliverer.status} />
      </div>

      <GroupedTable
        data={deliverer.routes}
        columns={columns}
        getRowKey={(row) => row.id}
        appearance="nested"
        hasHover={false}
      />
    </div>
  );
}

/**
 * Deliverers as stacked cards — one card per deliverer with address/status
 * up top and a nested route table below, so each deliverer can carry its
 * own per-route breakdown instead of one flat grouped table.
 */
export function LeafletDeliverersPage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sampleDeliverers.filter((deliverer) => {
      if (statusFilter !== "all" && deliverer.status !== statusFilter) return false;
      if (!q) return true;
      return (
        deliverer.name.toLowerCase().includes(q) ||
        deliverer.routes.some((route) => route.name.toLowerCase().includes(q))
      );
    });
  }, [query, statusFilter]);

  const activeFilterLabel =
    STATUS_FILTER_OPTIONS.find((option) => option.value === statusFilter)?.label ?? "All statuses";

  return (
    <div
      style={{
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        padding: "20px 8px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            alignItems: "center",
            gap: 8,
            height: 36,
            paddingInline: 10,
            borderRadius: "var(--linear-radius-md)",
            border: "var(--linear-border-width) solid var(--linear-color-hairline)",
            background: "var(--linear-color-canvas)",
          }}
        >
          <Search size={14} strokeWidth={1.75} style={{ color: "var(--linear-color-ink-subtle)", flexShrink: 0 }} />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search deliverers or routes..."
            style={{
              all: "unset",
              flex: 1,
              minWidth: 0,
              fontSize: 13,
              color: "var(--linear-color-ink)",
            }}
          />
        </div>

        <Dropdown
          label="Filter by status"
          open={isFilterOpen}
          onOpenChange={setIsFilterOpen}
          placement="below"
          alignment="end"
          trigger={
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={isFilterOpen}
              style={{
                all: "unset",
                boxSizing: "border-box",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                height: 36,
                paddingInline: 10,
                borderRadius: "var(--linear-radius-md)",
                border: "var(--linear-border-width) solid var(--linear-color-hairline)",
                background: isFilterOpen ? "var(--linear-color-sidebar-item-selected)" : "var(--linear-color-canvas)",
                color: "var(--linear-color-ink)",
                fontSize: 13,
                whiteSpace: "nowrap",
              }}
            >
              <Filter size={14} strokeWidth={1.75} style={{ color: "var(--linear-color-ink-subtle)", flexShrink: 0 }} />
              {activeFilterLabel}
              <ChevronDown size={14} strokeWidth={1.75} style={{ color: "var(--linear-color-ink-subtle)", flexShrink: 0 }} />
            </button>
          }
        >
          {STATUS_FILTER_OPTIONS.map((option) => (
            <DropdownItem
              key={option.value}
              label={option.label}
              selected={statusFilter === option.value}
              onSelect={() => {
                setStatusFilter(option.value);
                setIsFilterOpen(false);
              }}
            />
          ))}
        </Dropdown>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {filtered.length === 0 ? (
          <span style={{ fontSize: 13, color: "var(--linear-color-ink-subtle)", padding: "0 4px" }}>
            No deliverers match this filter.
          </span>
        ) : (
          filtered.map((deliverer) => <DelivererCard key={deliverer.id} deliverer={deliverer} />)
        )}
      </div>
    </div>
  );
}
