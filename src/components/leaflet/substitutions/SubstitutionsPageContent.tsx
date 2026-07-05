"use client";

import { useMemo, useState } from "react";
import { getApiBase } from "@/lib/apiBase";
import { useLeafletContext } from "../LeafletContext";

export default function SubstitutionsPageContent() {
  const { leafletId, substitutions } = useLeafletContext();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return substitutions;
    return substitutions.filter(
      (s) =>
        s.route.toLowerCase().includes(q) ||
        s.covering.toLowerCase().includes(q) ||
        s.forPerson.toLowerCase().includes(q),
    );
  }, [substitutions, search]);

  const selected = filtered.find((s) => s.id === (selectedId ?? filtered[0]?.id)) ?? null;
  const coverSheetHref =
    leafletId != null && selected
      ? `${getApiBase()}/api/leaflets/${leafletId}/deliveries/${selected.deliveryId}/cover-sheet`
      : null;

  return (
    <div className="lf-page-layout">
      <div>
        <h1 className="lf-h2">Substitutions</h1>
        <p className="lf-page-desc">
          Records of substitutions: who is covering which route, and for whom.
        </p>
      </div>

      <div className="lf-filters">
        <label className="lf-search">
          <input type="search" placeholder="Search substitutions..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </label>
      </div>

      <div className="lf-master-detail lf-master-detail--wide">
        <div className="lf-table-wrap">
          <table className="lf-table">
            <thead>
              <tr>
                <th>Route</th>
                <th>Covering</th>
                <th>For</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="lf-meta" style={{ padding: 24 }}>
                    No skipped routes for this leaflet.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr
                    key={s.id}
                    className={selected?.id === s.id ? "selected" : undefined}
                    onClick={() => setSelectedId(s.id)}
                  >
                    <td style={{ fontWeight: 500 }}>{s.route}</td>
                    <td className="lf-meta">{s.covering}</td>
                    <td className="lf-meta">{s.forPerson}</td>
                    <td className="lf-meta">{s.date}</td>
                    <td className={s.status === "Pending" ? "lf-text-amber" : s.status === "Scheduled" ? "lf-text-green" : "lf-meta"}>
                      {s.status}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {selected && (
          <aside>
            <div style={{ fontWeight: 600, marginBottom: 12 }}>{selected.route}</div>
            <div className="lf-detail-card" data-lf-card="substitution-details">
              <div className="lf-card-header"><span className="lf-card-title">Substitution details</span></div>
              <div className="lf-card-body">
                <p className="lf-meta" style={{ fontWeight: 600, marginBottom: 8 }}>Covering</p>
                <div className="lf-detail-row"><span className="lf-detail-label">Name</span><span>{selected.covering}</span></div>
                <div className="lf-detail-row"><span className="lf-detail-label">Email address</span><span>{selected.coveringEmail ?? "—"}</span></div>
                <div className="lf-detail-row"><span className="lf-detail-label">Phone number</span><span>{selected.coveringPhone ?? "—"}</span></div>
                <p className="lf-meta" style={{ fontWeight: 600, margin: "16px 0 8px" }}>For whom</p>
                <div className="lf-detail-row"><span className="lf-detail-label">Substitute</span><span>{selected.forPerson}</span></div>
                <div className="lf-detail-row"><span className="lf-detail-label">Shift</span><span>{selected.route}</span></div>
                <div className="lf-detail-row"><span className="lf-detail-label">Shift start date</span><span>{selected.date}</span></div>
                <div className="lf-detail-row"><span className="lf-detail-label">Status</span><span>{selected.status}</span></div>
                {coverSheetHref && (
                  <div className="lf-detail-row">
                    <span className="lf-detail-label">Cover sheet</span>
                    <a className="lf-link" href={coverSheetHref} target="_blank" rel="noopener noreferrer">
                      Print cover sheet
                    </a>
                  </div>
                )}
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
