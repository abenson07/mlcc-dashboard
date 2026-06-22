"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { IconBell, IconRepeat, IconSearch } from "../icons";
import { useLeafletContext } from "../LeafletContext";
import CommunicationPanel from "./CommunicationPanel";

export default function DeliverersPageContent() {
  const { delivererCards, commStages, sendComm, resendComm, unconfirmedCount, readOnly } =
    useLeafletContext();
  const [search, setSearch] = useState("");
  const [remindingId, setRemindingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return delivererCards;
    return delivererCards.filter(
      (d) => d.name.toLowerCase().includes(q) || d.email.toLowerCase().includes(q),
    );
  }, [delivererCards, search]);

  async function handleRemind(personId: string) {
    setRemindingId(personId);
    try {
      await resendComm(personId);
      toast.success("Reminder sent");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send reminder");
    } finally {
      setRemindingId(null);
    }
  }

  return (
    <div className="lf-deliverers-layout">
      <div className="lf-page-layout">
        <div>
          <h1 className="lf-h2">Deliverers</h1>
          <p className="lf-page-desc">
            Manage deliverer assignments and outbound communication for this leaflet.
          </p>
        </div>

        <label className="lf-search" style={{ width: "100%", maxWidth: 360 }}>
          <IconSearch />
          <input
            type="search"
            placeholder="Search deliverers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((card) => (
            <article key={card.id} className="lf-deliverer-card">
              <div className="lf-deliverer-header">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className="lf-deliverer-name">{card.name}</span>
                  <span
                    className={
                      card.status === "Confirmed"
                        ? "lf-status-badge lf-status-badge--green"
                        : "lf-status-badge lf-status-badge--amber"
                    }
                  >
                    {card.status}
                  </span>
                </div>
                <div className="lf-card-actions">
                  <button
                    type="button"
                    className="lf-small-btn"
                    disabled={readOnly || card.status === "Confirmed" || remindingId === card.id}
                    onClick={() => handleRemind(card.id)}
                  >
                    <IconBell />
                    {remindingId === card.id ? "Sending…" : "Remind"}
                  </button>
                  <button type="button" className="lf-small-btn">
                    <IconRepeat />
                    Swap routes
                  </button>
                </div>
              </div>
              <table className="lf-mini-table">
                <thead>
                  <tr>
                    <th>Route</th>
                    <th>Households</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {card.routes.map((route) => (
                    <tr key={route.name} className={route.muted ? "muted" : undefined}>
                      <td style={{ fontWeight: 500, color: route.muted ? "var(--lf-text-subtle)" : undefined }}>
                        {route.name}
                      </td>
                      <td className="lf-meta">{route.households}</td>
                      <td className={route.status.includes("Awaiting") ? "lf-text-amber" : "lf-meta"}>
                        {route.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </article>
          ))}
        </div>
      </div>

      <CommunicationPanel
        stages={commStages}
        unconfirmedCount={unconfirmedCount}
        onSend={sendComm}
      />
    </div>
  );
}
