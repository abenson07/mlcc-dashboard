"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ChevronDown, Filter, Mail, Search } from "lucide-react";
import { toast } from "sonner";
import { useDeliveries, useDemoGuard } from "hooks";
import { pixel, proportional, type TableColumn } from "@/components/patterns/primitives/table";
import { GroupedTable } from "@/components/patterns/grouped-table/GroupedTable";
import { Dropdown, DropdownItem } from "@/components/patterns/shared/dropdown";
import { IconButton } from "@/components/patterns/shared/IconButton";
import { Checkbox } from "@/components/patterns/primitives/Checkbox";
import { RowClickCell } from "@/components/patterns/client-templates/shared";
import { sampleDeliverers, type LeafletDelivererRow, type LeafletRouteRow } from "@/data/mocks/leaflets";
import { DEMO_STORE_EVENT, listDemoScoped, writeDemoScoped } from "@/lib/demo/demoStore";
import type { DeliveriesUpdate } from "@/types/database";
import { summarizePersonSends, type CommSend } from "@/lib/leaflets/comm/commSends";
import { deliveriesToDelivererRows, sampleAllRouteRows } from "./adapters";
import { DeliverersBulkBar } from "./DeliverersBulkBar";
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

/** What a status change overwrote, so Undo can put it back exactly. */
type StatusSnapshot =
  | { kind: "demo"; routes: LeafletRouteRow[]; deliverers: LeafletDelivererRow[] }
  | { kind: "live"; rows: { id: string; patch: DeliveriesUpdate }[] };

/** Undo toasts stay up longer than sonner's 4s default. */
const UNDO_TOAST_MS = 8000;

function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`;
}

export type LeafletDeliverersPageProps = {
  leafletId: string;
  demo: boolean;
  onSelectDeliverer?: (deliverer: LeafletDelivererRow) => void;
  onEmailDeliverer?: (deliverer: LeafletDelivererRow) => void;
  /** Bulk email for the rows picked with the checkboxes. */
  onEmailDeliverers?: (deliverers: LeafletDelivererRow[]) => void;
  /** Logged emails for this leaflet, shown in the Emailed column. */
  sends?: CommSend[];
  /** Template names by step key, for the Emailed column. */
  stepLabels?: Record<string, string>;
};

/** Cell wrapper that opens the row's details on click but lets inner controls handle their own clicks. */
function RowClickArea({
  onClick,
  align = "start",
  children,
}: {
  onClick?: () => void;
  align?: "start" | "end";
  children: ReactNode;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: align === "end" ? "flex-end" : "flex-start",
        width: "100%",
        height: "100%",
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <div onClick={(event) => event.stopPropagation()} style={{ display: "inline-flex" }}>
        {children}
      </div>
    </div>
  );
}

/**
 * Deliverers list: name, email, status (editable) and a per-person email action.
 */
export function LeafletDeliverersPage({
  leafletId,
  demo,
  onSelectDeliverer,
  onEmailDeliverer,
  onEmailDeliverers,
  sends = [],
  stepLabels = {},
}: LeafletDeliverersPageProps) {
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

  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const lastToggledId = useRef<string | null>(null);
  // Rows can leave (filter, removal); only act on selected rows that still exist.
  const selectedRows = useMemo(
    () => deliverers.filter((d) => selectedIds.has(d.id)),
    [deliverers, selectedIds],
  );

  function toggleRow(row: LeafletDelivererRow, next: boolean, range: boolean) {
    // Read the anchor now: the updater runs after lastToggledId is overwritten below.
    const anchor = lastToggledId.current;
    setSelectedIds((prev) => {
      const out = new Set(prev);
      const from = anchor ? filtered.findIndex((d) => d.id === anchor) : -1;
      const to = filtered.findIndex((d) => d.id === row.id);
      if (range && from !== -1 && to !== -1) {
        const [a, b] = from < to ? [from, to] : [to, from];
        for (const d of filtered.slice(a, b + 1)) {
          if (next) out.add(d.id);
          else out.delete(d.id);
        }
      } else if (next) out.add(row.id);
      else out.delete(row.id);
      return out;
    });
    lastToggledId.current = row.id;
  }

  // "All" means every row currently shown, so a filter or search narrows it.
  const allSelected = filtered.length > 0 && filtered.every((d) => selectedIds.has(d.id));

  function toggleAll(next: boolean) {
    setSelectedIds((prev) => {
      const out = new Set(prev);
      for (const d of filtered) {
        if (next) out.add(d.id);
        else out.delete(d.id);
      }
      return out;
    });
  }

  function clearSelection() {
    const previous = new Set(selectedIds);
    setSelectedIds(new Set());
    toast(`Cleared ${plural(previous.size, "selection", "selections")}`, {
      duration: UNDO_TOAST_MS,
      action: { label: "Undo", onClick: () => setSelectedIds(previous) },
    });
  }

  const activeFilterLabel =
    STATUS_FILTER_OPTIONS.find((option) => option.value === statusFilter)?.label ?? "All statuses";

  function snapshotStatus(ids: string[]): StatusSnapshot {
    if (isDemo) {
      return {
        kind: "demo",
        routes: listDemoScoped<LeafletRouteRow>("leafletRoutes", scopeKey) ?? sampleAllRouteRows(),
        deliverers: listDemoScoped<LeafletDelivererRow>("leafletDeliverers", scopeKey) ?? sampleDeliverers,
      };
    }
    const wanted = new Set(ids);
    return {
      kind: "live",
      rows: deliveries
        .filter((d) => wanted.has(d.id))
        .map((d) => ({
          id: d.id,
          patch: { response: d.response, is_skipped: d.is_skipped, responded_at: d.responded_at },
        })),
    };
  }

  async function restoreStatus(snapshot: StatusSnapshot) {
    if (snapshot.kind === "demo") {
      writeDemoScoped("leafletRoutes", scopeKey, snapshot.routes);
      writeDemoScoped("leafletDeliverers", scopeKey, snapshot.deliverers);
      return;
    }
    await Promise.all(snapshot.rows.map((row) => update(row.id, row.patch)));
    await refetch();
  }

  async function setStatusFor(
    targets: LeafletDelivererRow[],
    action: LeafletDeliveryStatusAction,
    label: string,
  ) {
    const ids = targets.flatMap(deliveryIdsForDeliverer);
    if (ids.length === 0) return;
    const who = targets.length === 1 ? targets[0]!.name : plural(targets.length, "deliverer", "deliverers");
    const snapshot = snapshotStatus(ids);
    try {
      await applyLeafletDeliveryStatus({ isDemo, scopeKey, deliveryIds: ids, action, update, refetch });
      toast.success(
        isDemo ? `${who} set to ${label} — demo mode, saved locally only` : `${who} set to ${label}`,
        {
          duration: UNDO_TOAST_MS,
          action: {
            label: "Undo",
            onClick: () => {
              restoreStatus(snapshot).then(
                () => toast(`Restored status for ${who}`),
                (e: unknown) => toast.error(e instanceof Error ? e.message : "Failed to undo"),
              );
            },
          },
        },
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update status");
    }
  }

  const columns: TableColumn<LeafletDelivererRow>[] = [
    {
      key: "select",
      header: (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%" }}>
          <Checkbox
            label={allSelected ? "Deselect all deliverers" : "Select all deliverers"}
            isLabelHidden
            value={allSelected}
            onChange={toggleAll}
          />
        </div>
      ),
      width: pixel(36),
      renderCell: (row) => (
        <div
          onClickCapture={(event) => {
            // Shift-click extends the selection from the last toggled row.
            if (event.shiftKey) {
              event.preventDefault();
              event.stopPropagation();
              toggleRow(row, !selectedIds.has(row.id), true);
            }
          }}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}
        >
          <Checkbox
            label={`Select ${row.name}`}
            isLabelHidden
            value={selectedIds.has(row.id)}
            onChange={(next) => toggleRow(row, next, false)}
          />
        </div>
      ),
    },
    {
      key: "name",
      header: "Name",
      width: proportional(1, { minWidth: 160 }),
      renderCell: (row) => (
        <RowClickCell onClick={onSelectDeliverer ? () => onSelectDeliverer(row) : undefined}>
          <span style={{ color: "var(--linear-color-ink)", fontWeight: 500 }}>{row.name}</span>
        </RowClickCell>
      ),
    },
    {
      key: "email",
      header: "Email",
      width: proportional(1.2, { minWidth: 180 }),
      renderCell: (row) => (
        <RowClickCell onClick={onSelectDeliverer ? () => onSelectDeliverer(row) : undefined}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.email || "No email on file"}</span>
        </RowClickCell>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: pixel(150),
      renderCell: (row) => (
        <RowClickArea onClick={onSelectDeliverer ? () => onSelectDeliverer(row) : undefined}>
          <StatusCell deliverer={row} onChange={(d, a, l) => void setStatusFor([d], a, l)} />
        </RowClickArea>
      ),
    },
    {
      key: "emailed",
      header: "Emailed",
      width: proportional(1, { minWidth: 150 }),
      renderCell: (row) => {
        const summary = summarizePersonSends(sends, row.id, stepLabels);
        return (
          <RowClickCell onClick={onSelectDeliverer ? () => onSelectDeliverer(row) : undefined}>
            <span title={summary?.title} style={{ color: "var(--linear-color-ink-subtle)" }}>
              {summary?.text ?? "—"}
            </span>
          </RowClickCell>
        );
      },
    },
    {
      key: "actions",
      header: "",
      width: pixel(48),
      renderCell: (row) => (
        <RowClickArea align="end" onClick={onSelectDeliverer ? () => onSelectDeliverer(row) : undefined}>
          <IconButton
            label={`Email ${row.name}`}
            variant="ghost"
            size="sm"
            icon={<Mail size={15} strokeWidth={1.75} />}
            onClick={() => onEmailDeliverer?.(row)}
          />
        </RowClickArea>
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
        minHeight: "100%",
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

      <DeliverersBulkBar
        selected={selectedRows}
        statusOptions={STATUS_OPTIONS}
        onSetStatus={(status) => {
          const option = STATUS_OPTIONS.find((o) => o.value === status);
          if (option) void setStatusFor(selectedRows, option.action, option.label);
        }}
        onEmail={() => onEmailDeliverers?.(selectedRows)}
        onClear={clearSelection}
      />
    </div>
  );
}
