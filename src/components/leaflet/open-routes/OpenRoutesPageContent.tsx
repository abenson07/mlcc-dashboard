"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useLeafletContext } from "../LeafletContext";
import DelivererPicker from "../routes/DelivererPicker";

export default function OpenRoutesPageContent() {
  const { deliveries, updateDelivery, setSelectedDeliveryId } = useLeafletContext();
  const [search, setSearch] = useState("");
  const [pickerOpenId, setPickerOpenId] = useState<string | null>(null);
  const [editingCountId, setEditingCountId] = useState<string | null>(null);
  const [countDraft, setCountDraft] = useState("");

  // Once a route appears in this list, keep it visible for the rest of this
  // page visit even after it gets assigned, so the row doesn't abruptly
  // disappear out from under the admin — it just reflects the new deliverer.
  const [stickyIds, setStickyIds] = useState<Set<string>>(() => new Set());
  useEffect(() => {
    setStickyIds((prev) => {
      let changed = false;
      const next = new Set(prev);
      for (const d of deliveries) {
        if ((!d.person_id || d.is_skipped) && !next.has(d.id)) {
          next.add(d.id);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [deliveries]);

  const openDeliveries = useMemo(
    () => deliveries.filter((d) => stickyIds.has(d.id)),
    [deliveries, stickyIds],
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const effectiveSelectedId = selectedId ?? openDeliveries[0]?.id ?? null;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return openDeliveries.filter((d) => {
      const name = d.routes?.route_name?.toLowerCase() ?? "";
      return !q || name.includes(q);
    });
  }, [openDeliveries, search]);

  const selected = filtered.find((d) => d.id === effectiveSelectedId) ?? null;

  useEffect(() => {
    setSelectedDeliveryId(selected?.id ?? null);
    return () => setSelectedDeliveryId(null);
  }, [selected, setSelectedDeliveryId]);

  const handleInlineAssign = useCallback(
    async (delivery: (typeof openDeliveries)[number], person: { id: string; name: string }) => {
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
    async (delivery: (typeof openDeliveries)[number], raw: string) => {
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

  return (
    <div className="lf-page-layout">
      <div className="lf-page-header">
        <h1 className="lf-h2">Open Routes</h1>
      </div>

      <div className="lf-filters">
        <label className="lf-search">
          <input type="search" placeholder="Search routes..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </label>
      </div>

      <div className="lf-table-wrap">
        <table className="lf-table">
          <thead>
            <tr>
              <th>Route name</th>
              <th>Deliverer</th>
              <th>Count</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => {
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
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
