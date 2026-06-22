"use client";

import { useMemo, useState } from "react";
import { IconPlus } from "@/components/leaflet/icons";
import { MOCK_VOLUNTEER_HUBS, MOCK_VOLUNTEERS } from "../mockData";

export default function EventVolunteersContent() {
  const [tab, setTab] = useState<"all" | "confirmed" | "pending" | "declined">("all");

  const filtered = useMemo(() => {
    if (tab === "confirmed") return MOCK_VOLUNTEERS.filter((v) => v.status === "Confirmed");
    if (tab === "pending") return MOCK_VOLUNTEERS.filter((v) => v.status === "Pending");
    if (tab === "declined") return MOCK_VOLUNTEERS.filter((v) => v.status === "Declined");
    return MOCK_VOLUNTEERS;
  }, [tab]);

  return (
    <div>
      <h1 className="lf-h1">Volunteers</h1>

      <p className="lf-overview-card-title" style={{ margin: "20px 0 12px" }}>Volunteer hubs</p>
      <div className="lf-hub-grid">
        {MOCK_VOLUNTEER_HUBS.map((hub) => (
          <div key={hub.id} className="lf-hub-card">
            <h3>{hub.name}</h3>
            <p className="lf-hub-stat">Required: {hub.registered}</p>
            <p className="lf-hub-stat">Min hours: {hub.minHours} hrs</p>
            <p className="lf-hub-stat">Target: {hub.target}</p>
          </div>
        ))}
        <button type="button" className="lf-hub-new">
          <IconPlus />
          New volunteer hub
        </button>
      </div>

      <div className="lf-sponsor-tabs" style={{ marginTop: 24 }}>
        {(["all", "confirmed", "pending", "declined"] as const).map((t) => (
          <button key={t} type="button" className={tab === t ? "lf-tab lf-tab--active" : "lf-tab"} onClick={() => setTab(t)}>
            {t === "all" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="lf-table-wrap" style={{ marginTop: 12 }}>
        <table className="lf-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Volunteer hub</th>
              <th>Email</th>
              <th>Hours</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((v) => (
              <tr key={v.id}>
                <td style={{ fontWeight: 500 }}>{v.name}</td>
                <td className="lf-meta">{v.hub}</td>
                <td className="lf-meta">{v.email}</td>
                <td className="lf-meta">{v.hours} hrs</td>
                <td>
                  <span className={`lf-status-badge lf-status-badge--${v.status === "Confirmed" ? "green" : "amber"}`}>
                    {v.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
