"use client";

import { useMemo, useState } from "react";
import InvoiceComposerModal from "@/components/billing/InvoiceComposerModal";
import { IconPlus, IconSearch } from "@/components/leaflet/icons";
import { useLeafletContext } from "../LeafletContext";

type SponsorTab = "all" | "paid" | "pledged" | "invoiced";

export default function SponsorshipsPageContent() {
  const {
    leaflet,
    sponsors,
    sponsorshipTierSeeds,
    readOnly,
    updateSponsorship,
    refetchAll,
    invoiceModalOpen,
    setInvoiceModalOpen,
  } = useLeafletContext();
  const [sponsorTab, setSponsorTab] = useState<SponsorTab>("all");
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("");

  const filteredSponsors = useMemo(() => {
    const q = search.trim().toLowerCase();
    return sponsors.filter((s) => {
      if (sponsorTab === "paid" && s.status !== "Paid") return false;
      if (sponsorTab === "pledged" && s.status !== "Pledged") return false;
      if (sponsorTab === "invoiced" && s.status !== "Invoiced") return false;
      if (q && !s.business.toLowerCase().includes(q)) return false;
      if (tierFilter && s.level !== tierFilter) return false;
      return true;
    });
  }, [sponsors, sponsorTab, search, tierFilter]);

  const leafletLabel = leaflet
    ? `${leaflet.title} — ${new Date(`${leaflet.distribution_date}T12:00:00`).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`
    : undefined;

  return (
    <div className="lf-overview-layout lf-overview-layout--single">
      <div className="lf-overview-main">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
          <h1 className="lf-h2">Sponsorship</h1>
        </div>

        <section className="lf-card" data-lf-card="sponsors">
          <div className="lf-card-header">
            <span className="lf-card-title">Sponsors</span>
            {!readOnly && sponsors.length > 0 && (
              <button type="button" className="lf-link" onClick={() => setInvoiceModalOpen(true)}>
                + Add sponsor
              </button>
            )}
          </div>
          <div className="lf-card-body">
            <div className="lf-sponsor-tabs">
              {(["all", "paid", "pledged", "invoiced"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={sponsorTab === tab ? "lf-tab lf-tab--active" : "lf-tab"}
                  onClick={() => setSponsorTab(tab)}
                >
                  {tab === "all" ? "All" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {sponsors.length > 0 && (
              <div className="lf-filters" style={{ marginTop: 12, marginBottom: 12 }}>
                <label className="lf-search">
                  <IconSearch />
                  <input
                    type="search"
                    placeholder="Search sponsors..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </label>
                <select className="lf-select" value={tierFilter} onChange={(e) => setTierFilter(e.target.value)}>
                  <option value="">All tiers</option>
                  {sponsorshipTierSeeds.map((tier) => (
                    <option key={tier.name} value={tier.name}>
                      {tier.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {sponsors.length === 0 ? (
              <div className="lf-empty-state">
                <p className="lf-meta">No sponsors yet.</p>
                {!readOnly && (
                  <button type="button" className="lf-small-btn" onClick={() => setInvoiceModalOpen(true)}>
                    <IconPlus />
                    Add sponsor
                  </button>
                )}
              </div>
            ) : filteredSponsors.length === 0 ? (
              <p className="lf-meta" style={{ padding: "8px 0" }}>
                No sponsors match your search or filters.
              </p>
            ) : (
              <table className="lf-table">
                <thead>
                  <tr>
                    <th>Business</th>
                    <th>Contact</th>
                    <th>Level</th>
                    <th>Amount</th>
                    <th>Status</th>
                    {!readOnly && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredSponsors.map((s) => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 500 }}>{s.business}</td>
                      <td className="lf-meta">{s.contact}</td>
                      <td className="lf-meta">{s.level}</td>
                      <td className="lf-meta">${s.amount.toLocaleString()}</td>
                      <td
                        className={
                          s.status === "Paid"
                            ? "lf-status-paid"
                            : s.status === "Pledged"
                              ? "lf-status-pledged"
                              : "lf-status-muted"
                        }
                      >
                        {s.status}
                      </td>
                      {!readOnly && (
                        <td>
                          {s.status !== "Paid" && (
                            <button
                              type="button"
                              className="lf-link"
                              onClick={() =>
                                void updateSponsorship(s.id, {
                                  status: "paid",
                                  paid_date: new Date().toISOString().slice(0, 10),
                                }).then(() => refetchAll())
                              }
                            >
                              Mark paid
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>

      <InvoiceComposerModal
        isOpen={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        defaultLeafletId={leaflet?.id}
        defaultLeafletLabel={leafletLabel}
        defaultDueDate={leaflet?.sponsorship_due_date ?? undefined}
        titleOverride="Add Sponsor"
        onIssued={() => {
          setInvoiceModalOpen(false);
          void refetchAll();
        }}
      />
    </div>
  );
}
