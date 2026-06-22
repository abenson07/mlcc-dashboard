"use client";

import { useMemo, useState } from "react";
import {
  EVENT_BUDGET,
  EVENT_SPONSORSHIP_TIERS,
  MOCK_EVENT_INVOICES,
  MOCK_EVENT_SPONSORS,
} from "../mockData";

export default function EventSponsorshipContent() {
  const [sponsorTab, setSponsorTab] = useState("all");
  const [invoiceTab, setInvoiceTab] = useState("all");

  const sponsors = useMemo(() => {
    if (sponsorTab === "paid") return MOCK_EVENT_SPONSORS.filter((s) => s.status === "Paid");
    if (sponsorTab === "pledged") return MOCK_EVENT_SPONSORS.filter((s) => s.status === "Pledged");
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
    <div className="lf-event-overview-layout">
      <div className="lf-overview-main">
        <h1 className="lf-h1">Sponsorship</h1>

        <section className="lf-card">
          <div className="lf-card-header"><span className="lf-card-title">Budget & sponsorships</span></div>
          <div className="lf-card-body">
            <div className="lf-metric-row">
              <span className="lf-meta">{EVENT_BUDGET.progressPct}% of our goal reached</span>
            </div>
            <div className="lf-progress-track" style={{ marginBottom: 12 }}>
              <div className="lf-progress-fill" style={{ width: `${EVENT_BUDGET.progressPct}%` }} />
            </div>
            <div className="lf-budget-metrics">
              <div className="lf-budget-metric"><div className="lf-budget-metric-label">Goal</div><div className="lf-budget-metric-value">${EVENT_BUDGET.goal.toLocaleString()}</div></div>
              <div className="lf-budget-metric"><div className="lf-budget-metric-label">Raised</div><div className="lf-budget-metric-value">${EVENT_BUDGET.raised.toLocaleString()}</div></div>
              <div className="lf-budget-metric"><div className="lf-budget-metric-label">Pledged</div><div className="lf-budget-metric-value">${EVENT_BUDGET.pledged.toLocaleString()}</div></div>
            </div>
          </div>
        </section>

        <section className="lf-card">
          <div className="lf-card-header"><span className="lf-card-title">Sponsors</span></div>
          <div className="lf-card-body">
            <div className="lf-sponsor-tabs">
              {(["all", "paid", "pledged"] as const).map((tab) => (
                <button key={tab} type="button" className={sponsorTab === tab ? "lf-tab lf-tab--active" : "lf-tab"} onClick={() => setSponsorTab(tab)}>
                  {tab === "all" ? "All" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            <table className="lf-table">
              <thead><tr><th>Business</th><th>Contact</th><th>Level</th><th>Amount</th><th>Status</th></tr></thead>
              <tbody>
                {sponsors.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 500 }}>{s.business}</td>
                    <td className="lf-meta">{s.contact}</td>
                    <td className="lf-meta">{s.level}</td>
                    <td className="lf-meta">${s.amount.toLocaleString()}</td>
                    <td className={s.status === "Paid" ? "lf-status-paid" : s.status === "Pledged" ? "lf-status-pledged" : "lf-status-muted"}>{s.status}</td>
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
              {(["all", "sent", "paid", "overdue", "draft"] as const).map((tab) => (
                <button key={tab} type="button" className={invoiceTab === tab ? "lf-tab lf-tab--active" : "lf-tab"} onClick={() => setInvoiceTab(tab)}>
                  {tab === "all" ? "All" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            <table className="lf-table">
              <thead><tr><th>Invoice #</th><th>Sponsor</th><th>Amount</th><th>Due date</th><th>Status</th></tr></thead>
              <tbody>
                {invoices.map((i) => (
                  <tr key={i.id}>
                    <td>{i.number}</td>
                    <td className="lf-meta">{i.sponsor}</td>
                    <td className="lf-meta">${i.amount.toLocaleString()}</td>
                    <td className="lf-meta">{i.dueDate}</td>
                    <td className={i.status === "Paid" ? "lf-status-paid" : i.status === "Overdue" ? "lf-text-red" : "lf-status-muted"}>{i.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <aside className="lf-overview-aside">
        <section className="lf-card">
          <div className="lf-card-header"><span className="lf-card-title">Sponsorship levels</span></div>
          <div className="lf-card-body">
            {EVENT_SPONSORSHIP_TIERS.map((tier) => (
              <div key={tier.name} className="lf-line-item">
                <span><strong>{tier.name}</strong> · ${tier.amount.toLocaleString()}</span>
                <span className={tier.remaining === "Sold out" ? "lf-status-muted" : "lf-text-green"}>{tier.remaining}</span>
              </div>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}
