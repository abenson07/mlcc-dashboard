"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { IconFile, IconPlus } from "../icons";
import { useLeafletContext } from "../LeafletContext";
import CreateLeafletModal from "./CreateLeafletModal";

export default function NoActiveLeaflet() {
  const { setLeafletId, leaflets, createLeaflet } = useLeafletContext();
  const [modalOpen, setModalOpen] = useState(false);

  const pastLeaflets = useMemo(
    () =>
      leaflets
        .filter((l) => l.status === "closed")
        .sort((a, b) => b.distribution_date.localeCompare(a.distribution_date))
        .slice(0, 6),
    [leaflets],
  );

  async function handleCreate(input: { title: string; distribution_date: string }) {
    const created = await createLeaflet(input);
    setLeafletId(created.id);
    toast.success("Leaflet created");
  }

  return (
    <>
      <div className="lf-empty-page">
        <div className="lf-empty-icon">
          <IconFile />
        </div>
        <h1 className="lf-h2">No leaflet currently planned</h1>
        <p className="lf-page-desc" style={{ maxWidth: 420 }}>
          Create a new leaflet or select a past leaflet to view historical data.
        </p>
        <button
          type="button"
          className="lf-btn lf-btn--primary"
          style={{ marginTop: 16 }}
          onClick={() => setModalOpen(true)}
        >
          <IconPlus />
          Create new leaflet
        </button>

        {pastLeaflets.length > 0 && (
          <section className="lf-card lf-past-list" data-lf-card="past-leaflets">
            <div className="lf-card-header">
              <span className="lf-card-title">Past leaflets</span>
              <span className="lf-meta">Read-only</span>
            </div>
            <div className="lf-card-body">
              {pastLeaflets.map((item) => (
                <div key={item.id} className="lf-past-item" data-lf-card={`past-leaflet-${item.id}`}>
                  <div>
                    <div style={{ fontWeight: 500 }}>{item.title}</div>
                    <div className="lf-meta">
                      Delivered{" "}
                      {new Date(`${item.distribution_date}T12:00:00`).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="lf-link"
                    style={{ border: "none", background: "none", padding: 0 }}
                    onClick={() => setLeafletId(item.id)}
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <CreateLeafletModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreate}
      />
    </>
  );
}
