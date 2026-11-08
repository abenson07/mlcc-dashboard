"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Filter, Mail, Search } from "lucide-react";
import { toast } from "sonner";
import { useDeliveries, useDemoGuard } from "hooks";
import { pixel, proportional, type TableColumn } from "@/components/patterns/primitives/table";
import { GroupedTable } from "@/components/patterns/grouped-table/GroupedTable";
import { Dropdown, DropdownItem } from "@/components/patterns/shared/dropdown";
import { IconButton } from "@/components/patterns/shared/IconButton";
import { sampleDeliverers, type LeafletDelivererRow } from "@/data/mocks/leaflets";
import { DEMO_STORE_EVENT, listDemoScoped } from "@/lib/demo/demoStore";
import { deliveriesToDelivererRows } from "./adapters";
import {
  applyLeafletDeliveryStatus,
  deliveryIdsForDeliverer,
  type LeafletDeliveryStatusAction,
} from "./leafletDeliveryStatus";

type DelivererStatus = LeafletDelivererRow["status"];
type StatusFilter = "all" | DelivererStatus;

const STATUS_OPTIONS: { value: DelivererStatus; label: string; action: LeafletDeliveryStatusAction }[] = [
  { value: "Confirmed", label: "Confirmed", action: "confirm" },
  { value: "Invited", label: "Invited", action: "invite" },
  { value: "Declined", label: "Not confirmed", action: "decline" },
];

const STATUS_FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All statuses" },
  ...STATUS_OPTIONS.map(({ value, label }) => ({ value, label })),
];

const STATUS_LABEL: Record<DelivererStatus, string> = {
  Confirmed: "Confirmed",
  Invited: "Invited",
  Declined: "Not confirmed",
};

const STATUS_COLOR: Record<DelivererStatus, { bg: string; fg: string }> = {
  Confirmed: { bg: "rgba(39, 166, 68, 0.12)", fg: "#27a644" },
  Invited: { bg: "rgba(242, 201, 76, 0.16)", fg: "#a67a00" },
  Declined: { bg: "rgba(242, 153, 74, 0.14)", fg: "#c96a1a" },
};

function StatusCell({
  deliverer,
  onChange,
}: {
  deliverer: LeafletDelivererRow;
  onChange: (deliverer: LeafletDelivererRow, action: LeafletDeliveryStatusAction, label: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const color = STATUS_COLOR[deliverer.status];
  return (
    <Dropdown
      label={`Change status for ${deliverer.name}`}
      open={open}
      onOpenChange={setOpen}
      placement="below"
      alignment="start"
      trigger={
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          style={{
            all: "unset",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
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
          {STATUS_LABEL[deliverer.status]}
          <ChevronDown size={12} strokeWidth={2} />
        </button>
      }
    >
      {STATUS_OPTIONS.map((option) => (
        <DropdownItem
          key={option.value}
          label={option.label}
          selected={deliverer.status === option.value}
          onSelect={() => {
            setOpen(false);
            if (deliverer.status !== option.value) onChange(deliverer, option.action, option.label);
          }}
        />
      ))}
    </Dropdown>
  );
}

export type LeafletDeliverersPageProps = {
  leafletId: string;
  demo: boolean;
  onEmailDeliverer?: (deliverer: LeafletDelivererRow) => void;
};

/**
 * Deliverers list: name, email, status (editable) and a per-person email action.
 */
export function LeafletDeliverersPage({ leafletId, demo, onEmailDeliverer }: LeafletDeliverersPageProps) {
  const { enabled: demoGuard } = useDemoGuard();
  const isDemo = demo || demoGuard;
  const { deliveries, update, refetch } = useDeliveries(leafletId, { enabled: !isDemo && Boolean(leafletId) });
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const scopeKey = leafletId || "default";
  const [localDeliverers, setLocalDeliverers] = useState<LeafletDelivererRow[]>(sampleDeliverers);

  useEffect(() => {
    if (!isDemo) return;
    const load = () => {
      setLocalDeliverers(
        listDemoScoped<LeafletDelivererRow>("leafletDeliverers", scopeKey) ?? sampleDeliverers,
      );
    };
    load();
    window.addEventListener(DEMO_STORE_EVENT, load);
    return () => window.removeEventListener(DEMO_STORE_EVENT, load);
  }, [isDemo, scopeKey]);

  const liveDeliverers = useMemo(
    () => (isDemo ? [] : deliveriesToDelivererRows(deliveries)),
    [isDemo, deliveries],
  );
  const deliverers = isDemo ? localDeliverers : liveDeliverers;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return deliverers.filter((deliverer) => {
      if (statusFilter !== "all" && deliverer.status !== statusFilter) return false;
      if (!q) return true;
      return deliverer.name.toLowerCase().includes(q) || deliverer.email.toLowerCase().includes(q);
    });
  }, [deliverers, query, statusFilter]);

  const activeFilterLabel =
    STATUS_FILTER_OPTIONS.find((option) => option.value === statusFilter)?.label ?? "All statuses";

  async function changeStatus(
    deliverer: LeafletDelivererRow,
    action: LeafletDeliveryStatusAction,
    label: string,
  ) {
    const ids = deliveryIdsForDeliverer(deliverer);
    if (ids.length === 0) return;
    try {
      await applyLeafletDeliveryStatus({ isDemo, scopeKey, deliveryIds: ids, action, update, refetch });
      toast.success(
        isDemo
          ? `${deliverer.name} set to ${label} — demo mode, saved locally only`
          : `${deliverer.name} set to ${label}`,
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update status");
    }
  }

  const columns: TableColumn<LeafletDelivererRow>[] = [
    {
      key: "name",
      header: "Name",
      width: proportional(1, { minWidth: 160 }),
      renderCell: (row) => (
        <span style={{ color: "var(--linear-color-ink)", fontWeight: 500 }}>{row.name}</span>
      ),
    },
    {
      key: "email",
      header: "Email",
      width: proportional(1.2, { minWidth: 180 }),
      renderCell: (row) => (
        <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.email || "No email on file"}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: pixel(150),
      renderCell: (row) => <StatusCell deliverer={row} onChange={(d, a, l) => void changeStatus(d, a, l)} />,
    },
    {
      key: "actions",
      header: "",
      width: pixel(48),
      renderCell: (row) => (
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <IconButton
            label={`Email ${row.name}`}
            variant="ghost"
            size="sm"
            icon={<Mail size={15} strokeWidth={1.75} />}
            onClick={() => onEmailDeliverer?.(row)}
          />
        </div>
      ),
    },
  ];

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
            placeholder="Search deliverers..."
            style={{ all: "unset", flex: 1, minWidth: 0, fontSize: 13, color: "var(--linear-color-ink)" }}
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

      {filtered.length === 0 ? (
        <span style={{ fontSize: 13, color: "var(--linear-color-ink-subtle)", padding: "0 4px" }}>
          {deliverers.length === 0 ? "No deliverers assigned to this leaflet yet." : "No deliverers match this filter."}
        </span>
      ) : (
        <div style={{ marginInline: -8 }}>
          <GroupedTable data={filtered} columns={columns} getRowKey={(row) => row.id} listChrome hasHover />
        </div>
      )}
    </div>
  );
}
