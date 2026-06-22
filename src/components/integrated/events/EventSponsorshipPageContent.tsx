"use client";

import { useMemo, useState } from "react";
import {
  EVENT_BUDGET,
  EVENT_SPONSORSHIP_TIERS,
  MOCK_EVENT_INVOICES,
  MOCK_EVENT_SPONSORS,
} from "../mockData";

type SponsorTab = "all" | "paid" | "pledged" | "pending";
type InvoiceTab = "all" | "paid" | "sent" | "overdue" | "draft";

export default function EventSponsorshipPageContent() {
  const [sponsorTab, setSponsorTab] = useState<SponsorTab>("all");
  const [invoiceTab, setInvoiceTab] = useState<InvoiceTab>("all");

  const sponsors = useMemo(() => {
    if (sponsorTab === "paid") return MOCK_EVENT_SPONSORS.filter((s) => s.status === "Paid");
    if (sponsorTab === "pledged") return MOCK_EVENT_SPONSORS.filter((s) => s.status === "Pledged");
    if (sponsorTab === "pending") return MOCK_EVENT_SPONSORS.filter((s) => s.status === "Pending");
    return MOCK_EVENT_SPONSORS;
  }, [sponsorTab]);

  const invoices = useMemo(() => {
    if (invoiceTab === "paid") return MOCK_EVENT_INVOICES.filter((i) => i.status === "Paid");
    if (invoiceTab === "sent") return MOCK_EVENT_INVOICES.filter((i) => i.status === "Sent");
    if (invoiceTab === "overdue") return MOCK_EVENT_INVOICES.filter((i) => i.status === "Overdue");
    if (invoiceTab === "draft") return MOCK_EVENT_INVOICES.filter((i) => i.status === "Draft");
    return MOCK_EVENT_INVOICES;
  }, [invoiceTab]);

  return (
    <div className="lf-overview-layout lf-overview-layout--single">
      <div className="lf-overview-main">
        <h1 className="lf-h2">Sponsorship</h1>

        <div className="lf-overview-mid-row">
          <section className="lf-card">
            <div className="lf-card-header">
              <span className="lf-card-title">Budget & sponsorships</span>
            </div>
            <div className="lf-card-body">
              <div className="lf-metric-row">
                <span className="lf-metric-label">Goal for this event</span>
                <span>{EVENT_BUDGET.progressPct}%</span>
              </div>
              <div className="lf-progress-track" style={{ marginBottom: 12 }}>
                <div className="lf-progress-fill" style={{ width: `${EVENT_BUDGET.progressPct}%` }} />
              </div>
              <div className="lf-budget-metrics">
                <div className="lf-budget-metric">
                  <div className="lf-budget-metric-label">Goal</div>
                  <div className="lf-budget-metric-value">${EVENT_BUDGET.goal.toLocaleString()}</div>
                </div>
                <div className="lf-budget-metric">
                  <div className="lf-budget-metric-label">Raised</div>
                  <div className="lf-budget-metric-value">${EVENT_BUDGET.raised.toLocaleString()}</div>
                </div>
                <div className="lf-budget-metric">
                  <div className="lf-budget-metric-label">Pledged</div>
                  <div className="lf-budget-metric-value">${EVENT_BUDGET.pledged.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </section>

          <section className="lf-card">
            <div className="lf-card-header">
              <span className="lf-card-title">Sponsorship levels</span>
            </div>
            <div className="lf-card-body">
              {EVENT_SPONSORSHIP_TIERS.map((tier) => (
                <div key={tier.name} className="lf-line-item">
                  <span>
                    {tier.name} · ${tier.amount.toLocaleString()}
                  </span>
                  <span className="lf-qty-badge lf-qty-badge--paid">{tier.remaining}</span>
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
              {(["all", "paid", "pledged", "pending"] as const).map((tab) => (
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
                {sponsors.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 500 }}>{s.business}</td>
                    <td className="lf-meta">{s.contact}</td>
                    <td className="lf-meta">{s.level}</td>
                    <td>${s.amount.toLocaleString()}</td>
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
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td style={{ fontWeight: 500 }}>{inv.number}</td>
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
          </div>
        </section>
      </div>
    </div>
  );
}
