"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { substitutionTableStatusClass, substitutionTableStatusLabel } from "../deliveryUtils";
import { useLeafletContext } from "../LeafletContext";
import DelivererCell from "../routes/DelivererCell";
import RouteNameCell from "../routes/RouteNameCell";
import RouteTable from "../routes/RouteTable";

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

      <RouteTable
        columns={[
          { key: "route", label: "Route name" },
          { key: "deliverer", label: "Deliverer", width: 200 },
          { key: "count", label: "Count", width: 72 },
          { key: "status", label: "Status", width: 100 },
        ]}
      >
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
                <RouteNameCell routeName={d.routes?.route_name} routeType={d.routes?.route_type} />
                <DelivererCell
                  personName={d.people?.full_name}
                  excludePersonId={d.person_id}
                  isOpen={pickerOpenId === d.id}
                  onToggle={() => setPickerOpenId((cur) => (cur === d.id ? null : d.id))}
                  onClose={() => setPickerOpenId(null)}
                  onSelect={(person) => handleInlineAssign(d, person)}
                />
                <td className="lf-meta">{d.leaflet_count ?? "—"}</td>
                <td className={substitutionTableStatusClass(status)}>{status}</td>
              </tr>
            );
          })
        )}
      </RouteTable>
    </div>
  );
}
