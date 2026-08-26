"use client";

import { useEffect, useMemo, useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { useDeliveries, useDemoGuard } from "hooks";
import { pixel, proportional, type TableColumn } from "@/components/patterns/primitives/table";
import { GroupedTable } from "@/components/patterns/grouped-table/GroupedTable";
import { RowClickCell, ClassContentPage } from "@/components/patterns/client-templates/shared";
import { Text } from "@/components/patterns/primitives/Text";
import { Dropdown, DropdownItem } from "@/components/patterns/shared/dropdown";
import { IconButton } from "@/components/patterns/shared/IconButton";
import type { LeafletRouteRow, LeafletRouteStatus } from "@/data/mocks/leaflets";
import { DEMO_STORE_EVENT, listDemoScoped } from "@/lib/demo/demoStore";
import { deliveriesToRouteRows, sampleAllRouteRows } from "./adapters";
import {
  RemoveRoutesConfirmModal,
  SkipRouteConfirmModal,
} from "./LeafletRouteActionModals";
import { applyLeafletDeliveryStatus, routeHasDeliverer } from "./leafletDeliveryStatus";

const GROUP_ORDER = ["unassigned", "in-progress", "skipped"];

const GROUP_LABEL: Record<string, string> = {
  unassigned: "Open",
  "in-progress": "Assigned",
  skipped: "Skipped",
};

const groupColors: Record<string, string> = {
  unassigned: "#eb5757",
  "in-progress": "#27a644",
  skipped: "#8a8f98",
};

function SummaryCard({
  title,
  value,
  hint,
  selected,
  onClick,
}: {
  title: string;
  value: number;
  hint: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      style={{
        all: "unset",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        padding: 20,
        background: selected
          ? "var(--linear-color-sidebar-item-selected)"
          : "var(--linear-color-panel)",
        border: selected
          ? "var(--linear-border-width) solid var(--linear-color-accent)"
          : "var(--linear-border-width) solid var(--linear-color-panel-border)",
        borderRadius: "var(--linear-radius-md)",
        boxShadow: "var(--linear-shadow-panel)",
        cursor: "pointer",
      }}
    >
      <Text weight="semibold">{title}</Text>
      <Text size="md" weight="semibold">
        {value}
      </Text>
      <Text size="sm" color="secondary">
        {hint}
      </Text>
    </button>
  );
}

export type LeafletRoutesPageProps = {
  leafletId: string;
  demo: boolean;
  onSelectRoute?: (row: LeafletRouteRow) => void;
};

function RouteActionsCell({
  row,
  onConfirm,
  onSkip,
  onRemove,
}: {
  row: LeafletRouteRow;
  onConfirm: (row: LeafletRouteRow) => void;
  onSkip: (row: LeafletRouteRow) => void;
  onRemove: (row: LeafletRouteRow) => void;
}) {
  const [open, setOpen] = useState(false);
  const hasDeliverer = routeHasDeliverer(row);
  const alreadyConfirmed = row.response === "confirmed" && row.status !== "skipped";
  if (!hasDeliverer) return null;
  return (
    <div className="leaflet-route-row-actions" style={{ display: "flex", justifyContent: "flex-end" }}>
      <Dropdown
        label="Route actions"
        open={open}
        onOpenChange={setOpen}
        placement="below"
        alignment="end"
        trigger={
          <IconButton
            label="Route actions"
            variant="ghost"
            size="sm"
            icon={<MoreHorizontal size={16} strokeWidth={1.75} />}
          />
        }
      >
        {!alreadyConfirmed ? (
          <DropdownItem
            label="Confirm route"
            onSelect={() => {
              setOpen(false);
              onConfirm(row);
            }}
          />
        ) : null}
        <DropdownItem
          label="Skip route"
          onSelect={() => {
            setOpen(false);
            onSkip(row);
          }}
        />
        <DropdownItem
          label="Remove route"
          onSelect={() => {
            setOpen(false);
            onRemove(row);
          }}
        />
      </Dropdown>
    </div>
  );
}

/**
 * Mixed-content Routes page — summary cards + grouped table (max-width shell).
 */
export function LeafletRoutesPage({ leafletId, demo, onSelectRoute }: LeafletRoutesPageProps) {
  const { enabled: demoGuard } = useDemoGuard();
  const isDemo = demo || demoGuard;
  const { deliveries, update, refetch } = useDeliveries(leafletId, {
    enabled: !isDemo && Boolean(leafletId),
  });
  const scopeKey = leafletId || "default";
  const [localRoutes, setLocalRoutes] = useState<LeafletRouteRow[]>(() => sampleAllRouteRows());
  const [skipRow, setSkipRow] = useState<LeafletRouteRow | null>(null);
  const [removeRow, setRemoveRow] = useState<LeafletRouteRow | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<LeafletRouteStatus | null>(null);

  useEffect(() => {
    if (!isDemo) return;
    const load = () => {
      setLocalRoutes(listDemoScoped<LeafletRouteRow>("leafletRoutes", scopeKey) ?? sampleAllRouteRows());
    };
    load();
    window.addEventListener(DEMO_STORE_EVENT, load);
    return () => window.removeEventListener(DEMO_STORE_EVENT, load);
  }, [isDemo, scopeKey]);

  const routes = isDemo ? localRoutes : deliveriesToRouteRows(deliveries);

  const assignedCount = routes.filter((r) => r.status === "in-progress").length;
  const openCount = routes.filter((r) => r.status === "unassigned").length;
  const skippedCount = routes.filter((r) => r.status === "skipped").length;
  const visibleRoutes = statusFilter ? routes.filter((r) => r.status === statusFilter) : routes;

  function toggleStatusFilter(status: LeafletRouteStatus) {
    setStatusFilter((current) => (current === status ? null : status));
  }

  async function applyStatus(
    row: LeafletRouteRow,
    action: "confirm" | "skip" | "remove",
    liveMessage: string,
    demoMessage: string,
  ) {
    await applyLeafletDeliveryStatus({
      isDemo,
      scopeKey,
      deliveryIds: [row.id],
      action,
      update,
      refetch,
    });
    toast.success(isDemo ? demoMessage : liveMessage);
  }

  async function handleConfirm(row: LeafletRouteRow) {
    try {
      await applyStatus(
        row,
        "confirm",
        "Route confirmed",
        "Route confirmed — demo mode, saved locally only",
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to confirm");
    }
  }

  async function handleSkip() {
    if (!skipRow) return;
    setSubmitting(true);
    try {
      await applyStatus(
        skipRow,
        "skip",
        "Route skipped",
        "Route skipped — demo mode, saved locally only",
      );
      setSkipRow(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to skip");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove() {
    if (!removeRow) return;
    setSubmitting(true);
    try {
      await applyStatus(
        removeRow,
        "remove",
        "Deliverer removed",
        "Route removed — demo mode, saved locally only",
      );
      setRemoveRow(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to remove");
    } finally {
      setSubmitting(false);
    }
  }

  const columns = useMemo((): TableColumn<LeafletRouteRow>[] => {
    return [
      {
        key: "name",
        header: "Route",
        width: proportional(1, { minWidth: 220 }),
        renderCell: (row) => (
          <RowClickCell onClick={() => onSelectRoute?.(row)}>
            <span style={{ color: "var(--linear-color-ink)" }}>{row.name}</span>
          </RowClickCell>
        ),
      },
      {
        key: "detail",
        header: "Detail",
        width: proportional(1, { minWidth: 160 }),
        renderCell: (row) => (
          <RowClickCell onClick={() => onSelectRoute?.(row)}>
            <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.detail}</span>
          </RowClickCell>
        ),
      },
      {
        key: "actions",
        header: "",
        width: pixel(48),
        renderCell: (row) => (
          <RouteActionsCell
            row={row}
            onConfirm={(r) => void handleConfirm(r)}
            onSkip={setSkipRow}
            onRemove={(r) => {
              if (!routeHasDeliverer(r)) {
                toast.message("Route has no deliverer to remove");
                return;
              }
              setRemoveRow(r);
            }}
          />
        ),
      },
    ];
  }, [onSelectRoute, handleConfirm]);

  return (
    <ClassContentPage>
      <style>{`
        .leaflet-route-row-actions { opacity: 0; transition: opacity 0.12s ease; }
        .grouped-table-row:hover .leaflet-route-row-actions,
        .leaflet-route-row-actions:focus-within { opacity: 1; }
      `}</style>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        <SummaryCard
          title="Assigned Routes"
          value={assignedCount}
          hint="Have a deliverer"
          selected={statusFilter === "in-progress"}
          onClick={() => toggleStatusFilter("in-progress")}
        />
        <SummaryCard
          title="Open Routes"
          value={openCount}
          hint="Still need a deliverer"
          selected={statusFilter === "unassigned"}
          onClick={() => toggleStatusFilter("unassigned")}
        />
        <SummaryCard
          title="Skipped Routes"
          value={skippedCount}
          hint="Need a substitute"
          selected={statusFilter === "skipped"}
          onClick={() => toggleStatusFilter("skipped")}
        />
      </div>

      <div style={{ marginInline: -8, minHeight: 0 }}>
        <GroupedTable
          data={visibleRoutes}
          columns={columns}
          getRowKey={(row) => row.id}
          groupBy={(row) => row.status}
          groupOrder={statusFilter ? [statusFilter] : GROUP_ORDER}
          getGroupMeta={(key) => ({ color: groupColors[key], label: GROUP_LABEL[key] ?? key })}
          listChrome
        />
      </div>

      <SkipRouteConfirmModal
        isOpen={skipRow != null}
        routeLabel={skipRow?.name ?? ""}
        submitting={submitting}
        onCancel={() => setSkipRow(null)}
        onConfirm={handleSkip}
      />
      <RemoveRoutesConfirmModal
        isOpen={removeRow != null}
        personName={removeRow?.detail ?? removeRow?.name ?? ""}
        submitting={submitting}
        onCancel={() => setRemoveRow(null)}
        onConfirm={handleRemove}
      />
    </ClassContentPage>
  );
}
