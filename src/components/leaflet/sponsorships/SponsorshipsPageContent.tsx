"use client";

import { useMemo, useState } from "react";
import { useLeafletContext } from "../LeafletContext";

type SponsorTab = "all" | "paid" | "pledged" | "previous";
type InvoiceTab = "all" | "paid" | "sent" | "overdue" | "draft";

export default function SponsorshipsPageContent() {
  const { sponsors, invoices, budget, sponsorshipTiers } = useLeafletContext();
  const [sponsorTab, setSponsorTab] = useState<SponsorTab>("all");
  const [invoiceTab, setInvoiceTab] = useState<InvoiceTab>("all");

  const filteredSponsors = useMemo(() => {
    if (sponsorTab === "paid") return sponsors.filter((s) => s.status === "Paid");
    if (sponsorTab === "pledged") return sponsors.filter((s) => s.status === "Pledged");
    if (sponsorTab === "previous") return sponsors.filter((s) => s.status === "Previous");
    return sponsors;
  }, [sponsors, sponsorTab]);

  const filteredInvoices = useMemo(() => {
    if (invoiceTab === "paid") return invoices.filter((i) => i.status === "Paid");
    if (invoiceTab === "sent") return invoices.filter((i) => i.status === "Sent");
    if (invoiceTab === "overdue") return invoices.filter((i) => i.status === "Overdue");
    if (invoiceTab === "draft") return invoices.filter((i) => i.status === "Draft");
    return invoices;
  }, [invoices, invoiceTab]);

  return (
    <div className="lf-overview-layout lf-overview-layout--single">
      <div className="lf-overview-main">
        <h1 className="lf-h2">Sponsorship</h1>

        <div className="lf-overview-mid-row">
          <section className="lf-card">
            <div className="lf-card-header"><span className="lf-card-title">Budget & sponsorships</span></div>
            <div className="lf-card-body">
              <div className="lf-metric-row">
                <span className="lf-metric-label">Sponsorship progress</span>
                <span>{budget.sponsorshipProgressPct}%</span>
              </div>
              <div className="lf-progress-track" style={{ marginBottom: 12 }}>
                <div className="lf-progress-fill" style={{ width: `${budget.sponsorshipProgressPct}%` }} />
              </div>
              <div className="lf-metric-row"><span className="lf-metric-label">Goal</span><span>${budget.sponsorshipGoal.toLocaleString()}</span></div>
              <div className="lf-metric-row"><span className="lf-metric-label">Raised</span><span>${budget.raised.toLocaleString()}</span></div>
              <div className="lf-metric-row"><span className="lf-metric-label">Pledged</span><span>${budget.pledged.toLocaleString()}</span></div>
            </div>
          </section>

          <section className="lf-card">
            <div className="lf-card-header"><span className="lf-card-title">Sponsorship levels</span></div>
            <div className="lf-card-body">
              {sponsorshipTiers.map((tier) => (
                <div key={tier.name} className="lf-detail-row">
                  <div>
                    <div style={{ fontWeight: 500 }}>{tier.name}</div>
                    <div className="lf-meta">${tier.amount.toLocaleString()}</div>
                  </div>
                  <span className={tier.left === "Sold out" ? "lf-status-muted" : "lf-status-paid"}>{tier.left}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="lf-card">
          <div className="lf-card-header"><span className="lf-card-title">Sponsors</span></div>
          <div className="lf-card-body">
            <div className="lf-sponsor-tabs">
              {(["all", "paid", "pledged", "previous"] as const).map((tab) => (
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
            <table className="lf-table">
              <thead>
                <tr>
                  <th>Business</th>
                  <th>Contact</th>
                  <th>Level</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredSponsors.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 500 }}>{s.business}</td>
                    <td className="lf-meta">{s.contact}</td>
                    <td className="lf-meta">{s.level}</td>
                    <td className="lf-meta">${s.amount.toLocaleString()}</td>
                    <td className={s.status === "Paid" ? "lf-status-paid" : s.status === "Pledged" ? "lf-status-pledged" : "lf-status-muted"}>
                      {s.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="lf-card">
          <div className="lf-card-header"><span className="lf-card-title">Invoices</span></div>
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
                    <td className={inv.status === "Paid" ? "lf-status-paid" : inv.status === "Overdue" ? "lf-text-red" : "lf-status-muted"}>
                      {inv.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
