"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Modal } from "@/components/ui/modal";
import StripeInvoiceComposer from "@/components/billing/StripeInvoiceComposer";
import AddEventSponsorModal from "./AddEventSponsorModal";
import { useEventContext } from "./EventContext";

type SponsorTab = "all" | "paid" | "pledged" | "invoiced";
type InvoiceTab = "all" | "paid" | "sent" | "overdue" | "draft";

export default function EventSponsorshipPageContent() {
  const {
    loading,
    event,
    budget,
    sponsors,
    sponsorshipTiers,
    invoices,
    readOnly,
    createSponsorship,
    updateSponsorship,
    refetchAll,
  } = useEventContext();
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

  if (loading && !event) {
    return <p className="lf-meta">Loading sponsorship…</p>;
  }

  if (!event) {
    return (
      <div className="lf-empty-page">
        <h1 className="lf-h2">Event not found</h1>
        <Link href="/admin/events" className="lf-link">Back to events</Link>
      </div>
    );
  }

  return (
    <div className="lf-overview-layout lf-overview-layout--single">
      <div className="lf-overview-main">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
          <h1 className="lf-h2">Sponsorship</h1>
          {!readOnly && (
            <div style={{ display: "flex", gap: 12 }}>
              <button type="button" className="lf-link" onClick={() => setSponsorModalOpen(true)}>
                + Add sponsor
              </button>
              <button type="button" className="lf-link" onClick={() => setInvoiceModalOpen(true)}>
                Issue invoice
              </button>
            </div>
          )}
        </div>

        <div className="lf-overview-mid-row">
          <section className="lf-card">
            <div className="lf-card-header">
              <span className="lf-card-title">Budget & sponsorships</span>
            </div>
            <div className="lf-card-body">
              <div className="lf-metric-row">
                <span className="lf-metric-label">Goal for this event</span>
                <span>{budget.progressPct}%</span>
              </div>
              <div className="lf-progress-track" style={{ marginBottom: 12 }}>
                <div className="lf-progress-fill" style={{ width: `${budget.progressPct}%` }} />
              </div>
              <div className="lf-budget-metrics">
                <div className="lf-budget-metric">
                  <div className="lf-budget-metric-label">Goal</div>
                  <div className="lf-budget-metric-value">${budget.goal.toLocaleString()}</div>
                </div>
                <div className="lf-budget-metric">
                  <div className="lf-budget-metric-label">Raised</div>
                  <div className="lf-budget-metric-value">${budget.raised.toLocaleString()}</div>
                </div>
                <div className="lf-budget-metric">
                  <div className="lf-budget-metric-label">Pledged</div>
                  <div className="lf-budget-metric-value">${budget.pledged.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </section>

          <section className="lf-card">
            <div className="lf-card-header">
              <span className="lf-card-title">Sponsorship levels</span>
            </div>
            <div className="lf-card-body">
              {sponsorshipTiers.length === 0 && (
                <p className="lf-meta">No sponsorship tiers configured.</p>
              )}
              {sponsorshipTiers.map((tier) => (
                <div key={tier.name} className="lf-line-item">
                  <span>
                    {tier.name} · ${tier.amount.toLocaleString()}
                  </span>
                  <span className="lf-qty-badge lf-qty-badge--paid">{tier.left}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="lf-card">
          <div className="lf-card-header">
            <span className="lf-card-title">Sponsors</span>
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
                      <td>${s.amount.toLocaleString()}</td>
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

        <section className="lf-card">
          <div className="lf-card-header">
            <span className="lf-card-title">Invoices</span>
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
                  {tab === "all" ? "All" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            {filteredInvoices.length === 0 ? (
              <p className="lf-meta">No invoices linked to this event.</p>
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
                      <td>${inv.amount.toLocaleString()}</td>
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

      <AddEventSponsorModal
        isOpen={sponsorModalOpen}
        onClose={() => setSponsorModalOpen(false)}
        onSubmit={createSponsorship}
      />

      <Modal
        isOpen={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        className="max-w-3xl p-4 lg:p-6"
      >
        <StripeInvoiceComposer
          fixedEventId={event.id}
          fixedEventLabel={event.title}
          onIssued={() => {
            setInvoiceModalOpen(false);
            void refetchAll();
          }}
        />
      </Modal>
    </div>
  );
}
