"use client";

import { useMemo, useState } from "react";
import { routesTableStatusLabel, exportDeliveriesCsv } from "../deliveryUtils";
import { useLeafletContext } from "../LeafletContext";
import DeliveryDetailPanel from "./DeliveryDetailPanel";
import type { DeliveryWithRelations } from "hooks";

function statusClass(label: string) {
  if (label === "Open" || label === "Skipped") return "lf-text-amber";
  if (label === "Covered") return "lf-meta";
  return "lf-meta";
}

export default function RoutesPageContent() {
  const { deliveries, countChangeByRouteId, deliveryHistoryForRoute } = useLeafletContext();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

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

  const selected = filtered.find((d) => d.id === (selectedId ?? filtered[0]?.id)) ?? null;

  function handleExport() {
    exportDeliveriesCsv(filtered, [
      { header: "Route", value: (d) => d.routes?.route_name ?? "" },
      { header: "Deliverer", value: (d) => d.people?.full_name ?? "" },
      { header: "Type", value: (d) => d.routes?.route_type ?? "" },
      { header: "Count", value: (d) => String(d.leaflet_count ?? "") },
      { header: "Status", value: routesTableStatusLabel },
    ]);
  }

  return (
    <div className="lf-page-layout">
      <div className="lf-page-header">
        <h1 className="lf-h2">Routes</h1>
        <button type="button" className="lf-small-btn" onClick={handleExport}>Export</button>
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

      <div className="lf-master-detail">
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
                const status = routesTableStatusLabel(d);
                const change = countChangeByRouteId(d.route_id, d.leaflet_count);
                return (
                  <tr
                    key={d.id}
                    className={selected?.id === d.id ? "selected" : undefined}
                    onClick={() => setSelectedId(d.id)}
                  >
                    <td style={{ fontWeight: 500 }}>{d.routes?.route_name ?? "—"}</td>
                    <td className="lf-meta">{d.people?.full_name ?? "—"}</td>
                    <td className="lf-meta">{d.routes?.route_type ?? "—"}</td>
                    <td className="lf-meta">{d.leaflet_count ?? "—"}</td>
                    <td className={change != null && change < 0 ? "lf-text-red" : "lf-text-green"}>
                      {change == null ? "—" : change > 0 ? `+${change}` : change === 0 ? "+0" : `−${Math.abs(change)}`}
                    </td>
                    <td className={statusClass(status)}>{status}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {selected && (
          <DeliveryDetailPanel
            delivery={selected}
            countChange={countChangeByRouteId(selected.route_id, selected.leaflet_count)}
            history={deliveryHistoryForRoute(selected.route_id)}
          />
        )}
      </div>
    </div>
  );
}
