"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { substitutionTableStatusClass, substitutionTableStatusLabel } from "../deliveryUtils";
import { useLeafletContext } from "../LeafletContext";
import DelivererPicker from "../routes/DelivererPicker";

export default function SubstitutionsPageContent() {
  const { deliveries, updateDelivery, setSelectedDeliveryId } = useLeafletContext();
  const [search, setSearch] = useState("");
  const [pickerOpenId, setPickerOpenId] = useState<string | null>(null);

  const skippedDeliveries = useMemo(
    () => deliveries.filter((d) => d.is_skipped),
    [deliveries],
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const effectiveSelectedId = selectedId ?? skippedDeliveries[0]?.id ?? null;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return skippedDeliveries.filter((d) => {
      const name = d.routes?.route_name?.toLowerCase() ?? "";
      return !q || name.includes(q);
    });
  }, [skippedDeliveries, search]);

  const selected = filtered.find((d) => d.id === effectiveSelectedId) ?? null;

  useEffect(() => {
    setSelectedDeliveryId(selected?.id ?? null);
    return () => setSelectedDeliveryId(null);
  }, [selected, setSelectedDeliveryId]);

  const handleInlineAssign = useCallback(
    async (delivery: (typeof skippedDeliveries)[number], person: { id: string; name: string }) => {
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

  return (
    <div className="lf-page-layout">
      <div className="lf-page-header">
        <h1 className="lf-h2">Skipped Routes</h1>
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
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="lf-meta" style={{ padding: 24 }}>
                  No skipped routes for this leaflet.
                </td>
              </tr>
            ) : (
              filtered.map((d) => {
                const status = substitutionTableStatusLabel(d);
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
                    <td className="lf-meta">{d.leaflet_count ?? "—"}</td>
                    <td className={substitutionTableStatusClass(status)}>{status}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
