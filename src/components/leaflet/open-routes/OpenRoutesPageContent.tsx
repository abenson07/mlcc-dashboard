"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { getApiBase } from "@/lib/apiBase";
import { openRoutesTableStatusLabel } from "../deliveryUtils";
import { useLeafletContext } from "../LeafletContext";
import DeliveryDetailPanel from "../routes/DeliveryDetailPanel";

export default function OpenRoutesPageContent() {
  const {
    leafletId,
    deliveries,
    countChangeByRouteId,
    pastDeliverersForRoute,
    deliveryHistoryForRoute,
    updateDelivery,
    readOnly,
  } = useLeafletContext();
  const [search, setSearch] = useState("");
  const [emailingPersonId, setEmailingPersonId] = useState<string | null>(null);

  const openDeliveries = useMemo(
    () => deliveries.filter((d) => !d.person_id || d.is_skipped),
    [deliveries],
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

  const handleAssign = useCallback(
    async (deliveryId: string, personId: string) => {
      await updateDelivery(deliveryId, {
        person_id: personId,
        is_skipped: false,
        response: "pending",
      });
      toast.success("Deliverer assigned");
    },
    [updateDelivery],
  );

  const handleEmailPastDeliverer = useCallback(
    async (deliveryId: string, personId: string) => {
      if (!leafletId) return;
      setEmailingPersonId(personId);
      try {
        const res = await fetch(`${getApiBase()}/api/leaflets/${leafletId}/open-routes/email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deliveryId, personId }),
        });
        const data = (await res.json()) as { error?: string; to?: string };
        if (!res.ok) throw new Error(data.error ?? "Failed to send email");
        toast.success(`Email sent to ${data.to ?? "deliverer"}`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to send email");
      } finally {
        setEmailingPersonId(null);
      }
    },
    [leafletId],
  );

  return (
    <div className="lf-page-layout">
      <div className="lf-page-header">
        <h1 className="lf-h2">Open Routes</h1>
        <button type="button" className="lf-small-btn">Export</button>
      </div>

      <div className="lf-filters">
        <label className="lf-search">
          <input type="search" placeholder="Search routes..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </label>
      </div>

      <div className="lf-master-detail lf-master-detail--wide">
        <div className="lf-table-wrap">
          <table className="lf-table">
            <thead>
              <tr>
                <th>Route name</th>
                <th>Deliverer</th>
                <th>Type</th>
                <th>Count</th>
                <th>Change</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => {
                const change = countChangeByRouteId(d.route_id, d.leaflet_count);
                const status = openRoutesTableStatusLabel(d);
                return (
                  <tr
                    key={d.id}
                    className={effectiveSelectedId === d.id ? "selected" : undefined}
                    onClick={() => setSelectedId(d.id)}
                  >
                    <td style={{ fontWeight: 500 }}>{d.routes?.route_name ?? "—"}</td>
                    <td className="lf-meta">{d.people?.full_name ?? "—"}</td>
                    <td className="lf-meta">{d.routes?.route_type ?? "—"}</td>
                    <td className="lf-meta">{d.leaflet_count ?? "—"}</td>
                    <td className={change != null && change < 0 ? "lf-text-red" : "lf-text-green"}>
                      {change == null ? "—" : change > 0 ? `+${change}` : `−${Math.abs(change)}`}
                    </td>
                    <td className={status === "Skipped" ? "lf-text-amber" : "lf-meta"}>{status}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {selected && (
          <DeliveryDetailPanel
            delivery={selected}
            showAssign
            readOnly={readOnly}
            onAssign={(personId) => handleAssign(selected.id, personId)}
            onEmailPastDeliverer={(personId) => handleEmailPastDeliverer(selected.id, personId)}
            emailingPersonId={emailingPersonId}
            countChange={countChangeByRouteId(selected.route_id, selected.leaflet_count)}
            pastDeliverers={pastDeliverersForRoute(selected.route_id, selected.person_id)}
            history={deliveryHistoryForRoute(selected.route_id)}
          />
        )}
      </div>
    </div>
  );
}
