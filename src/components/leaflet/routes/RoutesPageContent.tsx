"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeftRight } from "lucide-react";
import { toast } from "sonner";
import { routesTableStatusLabel } from "../deliveryUtils";
import { useLeafletContext } from "../LeafletContext";
import SkipRouteModal, { type CoveringPerson } from "../deliverers/SkipRouteModal";
import DelivererPicker from "./DelivererPicker";

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
      const value = Number(trimmed);
      if (trimmed === "" || !Number.isInteger(value) || value < 0) {
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

      <div className="lf-table-wrap">
        <table className="lf-table">
          <thead>
            <tr>
              <th>Route name</th>
              <th>Deliverer</th>
              <th>Count</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => {
              const status = routesTableStatusLabel(d);
              return (
                <tr
                  key={d.id}
                  className={effectiveSelectedId === d.id ? "selected" : undefined}
                  onClick={() => setSelectedId(d.id)}
                >
                  <td>
                    <span className="lf-table-title">{d.routes?.route_name ?? "—"}</span>
                    {d.routes?.route_type ? (
                      <span className="lf-table-subtitle">{d.routes.route_type}</span>
                    ) : null}
                  </td>
                  <td>
                    <div className="lf-selector">
                      <button
                        type="button"
                        className={`lf-table-deliverer-trigger${d.people ? "" : " lf-table-deliverer-placeholder"}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setPickerOpenId((cur) => (cur === d.id ? null : d.id));
                        }}
                      >
                        {d.people?.full_name ?? "Assign deliverer"}
                      </button>
                      {pickerOpenId === d.id && (
                        <>
                          <div
                            className="lf-selector-backdrop"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPickerOpenId(null);
                            }}
                          />
                          <div
                            className="lf-selector-menu"
                            style={{ width: 260, padding: 8 }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <DelivererPicker
                              excludePersonId={d.person_id}
                              onSelect={(person) => handleInlineAssign(d, person)}
                              onCancel={() => setPickerOpenId(null)}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="lf-meta">
                    {editingCountId === d.id ? (
                      <input
                        type="number"
                        min={0}
                        step={1}
                        className="lf-count-input"
                        autoFocus
                        value={countDraft}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => setCountDraft(e.target.value)}
                        onBlur={() => handleSaveCount(d, countDraft)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.currentTarget.blur();
                          } else if (e.key === "Escape") {
                            setEditingCountId(null);
                          }
                        }}
                      />
                    ) : (
                      <button
                        type="button"
                        className="lf-count-trigger"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCountDraft(d.leaflet_count != null ? String(d.leaflet_count) : "");
                          setEditingCountId(d.id);
                        }}
                      >
                        {d.leaflet_count ?? "—"}
                      </button>
                    )}
                  </td>
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
          </tbody>
        </table>
      </div>

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
