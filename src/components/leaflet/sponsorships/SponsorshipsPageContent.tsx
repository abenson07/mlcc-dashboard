"use client";

import { useMemo, useState } from "react";
import InvoiceComposerModal from "@/components/billing/InvoiceComposerModal";
import AddSponsorModal from "@/components/sponsorship/AddSponsorModal";
import { useLeafletContext } from "../LeafletContext";

type SponsorTab = "all" | "paid" | "pledged" | "invoiced";
type InvoiceTab = "all" | "paid" | "sent" | "overdue" | "draft";

export default function SponsorshipsPageContent() {
  const {
    leaflet,
    sponsors,
    invoices,
    sponsorshipTierSeeds,
    readOnly,
    createSponsorship,
    updateSponsorship,
    refetchAll,
  } = useLeafletContext();
  const [sponsorTab, setSponsorTab] = useState<SponsorTab>("all");
  const [invoiceTab, setInvoiceTab] = useState<InvoiceTab>("all");
  const [sponsorModalOpen, setSponsorModalOpen] = useState(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);

  const filteredSponsors = useMemo(() => {
    if (sponsorTab === "paid") return sponsors.filter((s) => s.status === "Paid");
    if (sponsorTab === "pledged") return sponsors.filter((s) => s.status === "Pledged");
    if (sponsorTab === "invoiced") return sponsors.filter((s) => s.status === "Invoiced");
    return sponsors;
  }, [sponsors, sponsorTab]);

  const filteredInvoices = useMemo(() => {
    if (invoiceTab === "paid") return invoices.filter((i) => i.status === "Paid");
    if (invoiceTab === "sent") return invoices.filter((i) => i.status === "Sent");
    if (invoiceTab === "overdue") return invoices.filter((i) => i.status === "Overdue");
    if (invoiceTab === "draft") return invoices.filter((i) => i.status === "Draft");
    return invoices;
  }, [invoices, invoiceTab]);

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
            {!readOnly && (
              <button type="button" className="lf-link" onClick={() => setSponsorModalOpen(true)}>
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
            {filteredSponsors.length === 0 ? (
              <p className="lf-meta">No sponsors yet.</p>
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

        <section className="lf-card" data-lf-card="invoices">
          <div className="lf-card-header">
            <span className="lf-card-title">Invoices</span>
            {!readOnly && (
              <button type="button" className="lf-link" onClick={() => setInvoiceModalOpen(true)}>
                Issue invoice
              </button>
            )}
          </div>
          <div className="lf-card-body">
            <div className="lf-sponsor-tabs">
              {(["all", "paid", "sent", "overdue", "draft"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={invoiceTab === tab ? "lf-tab lf-tab--active" : "lf-tab"}
                  onClick={() => setInvoiceTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            {filteredInvoices.length === 0 ? (
              <p className="lf-meta">No invoices linked to this leaflet run.</p>
            ) : (
              <table className="lf-table">
                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>Sponsor</th>
                    <th>Amount</th>
                    <th>Due date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((inv) => (
                    <tr key={inv.id}>
                      <td style={{ fontWeight: 500 }}>{inv.invoice}</td>
                      <td className="lf-meta">{inv.sponsor}</td>
                      <td className="lf-meta">${inv.amount.toLocaleString()}</td>
                      <td className="lf-meta">{inv.dueDate}</td>
                      <td
                        className={
                          inv.status === "Paid"
                            ? "lf-status-paid"
                            : inv.status === "Overdue"
                              ? "lf-text-red"
                              : inv.status === "Sent"
                                ? "lf-text-green"
                                : "lf-status-muted"
                        }
                      >
                        {inv.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>

      <AddSponsorModal
        isOpen={sponsorModalOpen}
        onClose={() => setSponsorModalOpen(false)}
        onSubmit={createSponsorship}
        tierOptions={sponsorshipTierSeeds}
      />

      <InvoiceComposerModal
        isOpen={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        defaultLeafletId={leaflet?.id}
        defaultLeafletLabel={leafletLabel}
        onIssued={() => {
          setInvoiceModalOpen(false);
          void refetchAll();
        }}
      />
    </div>
  );
}
