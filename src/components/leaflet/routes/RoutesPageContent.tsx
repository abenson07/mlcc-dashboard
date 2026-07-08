"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeftRight } from "lucide-react";
import { toast } from "sonner";
import { evaluateCountExpression, routesTableStatusLabel } from "../deliveryUtils";
import { useLeafletContext } from "../LeafletContext";
import SkipRouteModal, { type CoveringPerson } from "../deliverers/SkipRouteModal";
import DelivererCell from "./DelivererCell";
import EditableCountCell from "./EditableCountCell";
import RouteNameCell from "./RouteNameCell";
import RouteTable from "./RouteTable";

type SkipTarget = {
  deliveryId: string;
  routeLabel: string;
  routeId?: string | null;
  excludePersonId?: string | null;
};

function statusClass(label: string) {
  if (label === "Open" || label === "Skipped") return "lf-text-amber";
  if (label === "Covered") return "lf-meta";
  return "lf-meta";
}

export default function RoutesPageContent() {
  const searchParams = useSearchParams();
  const deliveryFromUrl = searchParams.get("delivery");
  const { deliveries, updateDelivery, setSelectedDeliveryId, readOnly } = useLeafletContext();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(() => deliveryFromUrl);
  const [pickerOpenId, setPickerOpenId] = useState<string | null>(null);
  const [editingCountId, setEditingCountId] = useState<string | null>(null);
  const [countDraft, setCountDraft] = useState("");
  const [skipTarget, setSkipTarget] = useState<SkipTarget | null>(null);
  const [skipSubmitting, setSkipSubmitting] = useState(false);

  useEffect(() => {
    if (deliveryFromUrl) {
      setSelectedId(deliveryFromUrl);
    }
  }, [deliveryFromUrl]);

  const routeTypes = useMemo(() => {
    const types = new Set<string>();
    for (const d of deliveries) {
      if (d.routes?.route_type) types.add(d.routes.route_type);
    }
    return Array.from(types).sort();
  }, [deliveries]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return deliveries.filter((d) => {
      const name = d.routes?.route_name?.toLowerCase() ?? "";
      const deliverer = d.people?.full_name?.toLowerCase() ?? "";
      const status = routesTableStatusLabel(d);
      if (q && !name.includes(q) && !deliverer.includes(q)) return false;
      if (typeFilter && d.routes?.route_type !== typeFilter) return false;
      if (statusFilter && status !== statusFilter) return false;
      return true;
    });
  }, [deliveries, search, typeFilter, statusFilter]);

  const effectiveSelectedId = selectedId ?? filtered[0]?.id ?? null;
  const selected = filtered.find((d) => d.id === effectiveSelectedId) ?? null;

  useEffect(() => {
    setSelectedDeliveryId(selected?.id ?? null);
    return () => setSelectedDeliveryId(null);
  }, [selected, setSelectedDeliveryId]);

  const handleInlineAssign = useCallback(
    async (delivery: (typeof deliveries)[number], person: { id: string; name: string }) => {
      const previous = {
        person_id: delivery.person_id,
        is_skipped: delivery.is_skipped,
        response: delivery.response,
      };
      setPickerOpenId(null);
      await updateDelivery(delivery.id, {
        person_id: person.id,
        is_skipped: false,
        response: "pending",
      });
      toast.success(`${person.name} assigned`, {
        action: {
          label: "Undo",
          onClick: () => {
            void updateDelivery(delivery.id, previous);
          },
        },
      });
    },
    [updateDelivery],
  );

  const handleSaveCount = useCallback(
    async (delivery: (typeof deliveries)[number], raw: string) => {
      const trimmed = raw.trim();
      const value = trimmed === "" ? NaN : (evaluateCountExpression(trimmed) ?? NaN);
      if (!Number.isInteger(value) || value < 0) {
        toast.error("Leaflet count must be a non-negative whole number");
        return;
      }
      setEditingCountId(null);
      if (value === delivery.leaflet_count) return;
      try {
        await updateDelivery(delivery.id, { leaflet_count: value });
      } catch {
        toast.error("Failed to update leaflet count");
      }
    },
    [updateDelivery],
  );

  function openSkipModal(delivery: (typeof deliveries)[number]) {
    setSkipTarget({
      deliveryId: delivery.id,
      routeLabel: delivery.routes?.route_name ?? "this route",
      routeId: delivery.route_id,
      excludePersonId: delivery.person_id,
    });
  }

  async function handleConfirmSkip(coveringPerson: CoveringPerson | null) {
    if (!skipTarget) return;
    const { deliveryId, routeLabel } = skipTarget;
    const row = deliveries.find((d) => d.id === deliveryId);
    const previous = {
      person_id: row?.person_id ?? null,
      is_skipped: row?.is_skipped ?? false,
      response: row?.response ?? "pending",
    };
    setSkipSubmitting(true);
    try {
      await updateDelivery(
        deliveryId,
        coveringPerson
          ? { is_skipped: true, person_id: coveringPerson.id, response: "confirmed" }
          : { is_skipped: true, response: "needs_cover" },
      );
      setSkipTarget(null);
      toast.success(
        coveringPerson
          ? `${coveringPerson.name} is now covering ${routeLabel}`
          : `${routeLabel} marked as needing a substitute`,
        {
          action: {
            label: "Undo",
            onClick: () => {
              void updateDelivery(deliveryId, previous);
            },
          },
        },
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to skip route");
    } finally {
      setSkipSubmitting(false);
    }
  }

  return (
    <div className="lf-page-layout">
      <div className="lf-page-header">
        <h1 className="lf-h2">Routes</h1>
      </div>

      <div className="lf-filters">
        <label className="lf-search">
          <input type="search" placeholder="Search routes..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </label>
        <select className="lf-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">All types</option>
          {routeTypes.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select className="lf-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          {["Covered", "Open", "Skipped"].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <RouteTable
        columns={[
          { key: "route", label: "Route name" },
          { key: "deliverer", label: "Deliverer", width: 200 },
          { key: "count", label: "Count", width: 72 },
          { key: "status", label: "Status", width: 100 },
          { key: "actions", label: "", width: 36 },
        ]}
      >
        {filtered.map((d) => {
          const status = routesTableStatusLabel(d);
          return (
            <tr
              key={d.id}
              className={effectiveSelectedId === d.id ? "selected" : undefined}
              onClick={() => setSelectedId(d.id)}
            >
              <RouteNameCell routeName={d.routes?.route_name} routeType={d.routes?.route_type} />
              <DelivererCell
                personName={d.people?.full_name}
                excludePersonId={d.person_id}
                isOpen={pickerOpenId === d.id}
                onToggle={() => setPickerOpenId((cur) => (cur === d.id ? null : d.id))}
                onClose={() => setPickerOpenId(null)}
                onSelect={(person) => handleInlineAssign(d, person)}
              />
              <EditableCountCell
                value={d.leaflet_count}
                isEditing={editingCountId === d.id}
                draft={countDraft}
                onStartEdit={(initial) => {
                  setCountDraft(initial);
                  setEditingCountId(d.id);
                }}
                onDraftChange={setCountDraft}
                onSave={() => handleSaveCount(d, countDraft)}
                onCancel={() => setEditingCountId(null)}
              />
              <td className={statusClass(status)}>{status}</td>
              <td>
                {d.person_id && !d.is_skipped && (
                  <button
                    type="button"
                    className="lf-icon-btn lf-row-skip-btn"
                    disabled={readOnly}
                    onClick={(e) => {
                      e.stopPropagation();
                      openSkipModal(d);
                    }}
                    aria-label={`Skip ${d.routes?.route_name ?? "route"}`}
                    title="Skip this deliverer"
                  >
                    <ArrowLeftRight size={13} />
                  </button>
                )}
              </td>
            </tr>
          );
        })}
      </RouteTable>

      {skipTarget && (
        <SkipRouteModal
          routeLabel={skipTarget.routeLabel}
          routeId={skipTarget.routeId}
          excludePersonId={skipTarget.excludePersonId}
          submitting={skipSubmitting}
          onConfirm={handleConfirmSkip}
          onCancel={() => setSkipTarget(null)}
        />
      )}
    </div>
  );
}
