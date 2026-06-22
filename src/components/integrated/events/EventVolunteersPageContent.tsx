"use client";

import { useMemo, useState } from "react";
import { IconPlus } from "@/components/leaflet/icons";
import { MOCK_VOLUNTEER_HUBS, MOCK_VOLUNTEERS } from "../mockData";

type VolunteerTab = "all" | "confirmed" | "pending" | "declined";

export default function EventVolunteersPageContent() {
  const [tab, setTab] = useState<VolunteerTab>("all");

  const filtered = useMemo(() => {
    if (tab === "confirmed") return MOCK_VOLUNTEERS.filter((v) => v.status === "Confirmed");
    if (tab === "pending") return MOCK_VOLUNTEERS.filter((v) => v.status === "Pending");
    if (tab === "declined") return MOCK_VOLUNTEERS.filter((v) => v.status === "Declined");
    return MOCK_VOLUNTEERS;
  }, [tab]);

  return (
    <div className="lf-page-layout">
      <h1 className="lf-h1">Volunteers</h1>

      <section className="lf-volunteer-hubs">
        {MOCK_VOLUNTEER_HUBS.map((hub) => (
          <article key={hub.id} className="lf-volunteer-hub-card">
            <h3 className="lf-card-title">{hub.name}</h3>
            <div className="lf-detail-row">
              <span className="lf-detail-label">Registered</span>
              <span>{hub.registered}</span>
            </div>
            <div className="lf-detail-row">
              <span className="lf-detail-label">Min hours</span>
              <span>{hub.minHours} hrs</span>
            </div>
            <div className="lf-detail-row">
              <span className="lf-detail-label">Target</span>
              <span>{hub.target}</span>
            </div>
          </article>
        ))}
        <button type="button" className="lf-volunteer-hub-card lf-volunteer-hub-card--new">
          <IconPlus />
          New Volunteer Opportunity
        </button>
      </section>

      <section className="lf-card">
        <div className="lf-card-body">
          <div className="lf-sponsor-tabs">
            {(["all", "confirmed", "pending", "declined"] as const).map((t) => (
              <button
                key={t}
                type="button"
                className={tab === t ? "lf-tab lf-tab--active" : "lf-tab"}
                onClick={() => setTab(t)}
              >
                {t === "all" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
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
                  <td>{v.hours} hrs</td>
                  <td>
                    <span
                      className={
                        v.status === "Confirmed"
                          ? "lf-status-badge lf-status-badge--green"
                          : v.status === "Pending"
                            ? "lf-status-badge lf-status-badge--amber"
                            : "lf-status-badge"
                      }
                    >
                      {v.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
