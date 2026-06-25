"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconPlus } from "@/components/leaflet/icons";
import IntegratedTopbar from "../IntegratedTopbar";
import SidebarFooterNav from "../SidebarFooterNav";

const FINANCE_NAV = [
  { label: "Overview", href: "/admin/finance" },
  { label: "Invoices", href: "/admin/finance/invoices" },
  { label: "Memberships", href: "/admin/finance/memberships" },
  { label: "Sponsorships", href: "/admin/finance/sponsorships" },
  { label: "Reports", href: "/admin/finance/reports" },
] as const;

const METRICS = [
  { label: "Total balance", value: "$94,250" },
  { label: "Monthly income", value: "$8,500", sub: "+12%" },
  { label: "Monthly expenses", value: "$5,200", sub: "+5%" },
  { label: "Savings rate", value: "38%" },
  { label: "Total debt", value: "$12,000" },
];

const TRANSACTIONS = [
  { date: "Jan 12", merchant: "Amazon", category: "Shopping", amount: "$120.50", status: "Completed" },
  { date: "Jan 11", merchant: "Starbucks", category: "Food & Drink", amount: "$5.40", status: "Pending" },
  { date: "Jan 10", merchant: "Rent", category: "Housing", amount: "$1,500.00", status: "Completed" },
];

export default function FinancePageContent() {
  const pathname = usePathname();

  return (
    <>
      <IntegratedTopbar
        primaryAction={
          <button type="button" className="lf-btn lf-btn--outline">
            <IconPlus />
            New invoice
          </button>
        }
      />
      <div className="lf-main">
        <div className="lf-sidebar-col lf-finance-sidebar-nav">
          <aside className="lf-sidebar">
            <div className="lf-finance-title-block">
              <strong>Financial Tracker</strong>
              <span>MLCC · 2026 fiscal year</span>
            </div>
            <nav className="lf-sidebar-nav" aria-label="Finance sections">
              {FINANCE_NAV.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className={pathname === href ? "lf-nav-item lf-nav-item--active" : "lf-nav-item"}
                >
                  {label}
                </Link>
              ))}
              <SidebarFooterNav />
            </nav>
          </aside>
        </div>
        <div className="lf-content-col">
          <main className="lf-canvas">
            <h1 className="lf-h1">Financial overview</h1>

            <div className="lf-finance-metrics" style={{ marginTop: 20 }}>
              {METRICS.map((m) => (
                <div key={m.label} className="lf-stat-box">
                  <div className="lf-stat-label">{m.label}</div>
                  <div className="lf-stat-value">{m.value}</div>
                  {m.sub && <div className="lf-stat-sub">{m.sub}</div>}
                </div>
              ))}
            </div>

            <div className="lf-finance-layout" style={{ marginTop: 20 }}>
              <div>
                <section className="lf-card" style={{ marginBottom: 16 }}>
                  <div className="lf-card-header"><span className="lf-card-title">Spending by category</span></div>
                  <div className="lf-card-body">
                    <div className="lf-donut-wrap">
                      <div className="lf-donut" />
                      <div>
                        {[
                          ["Housing", "40%"],
                          ["Food", "20%"],
                          ["Transport", "15%"],
                          ["Entertainment", "15%"],
                          ["Other", "10%"],
                        ].map(([label, pct]) => (
                          <div key={label} className="lf-detail-row">
                            <span>{label}</span>
                            <span className="lf-meta">{pct}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                <section className="lf-card">
                  <div className="lf-card-header">
                    <span className="lf-card-title">Recent transactions</span>
                    <button type="button" className="lf-link">View all</button>
                  </div>
                  <div className="lf-card-body">
                    <table className="lf-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Merchant</th>
                          <th>Category</th>
                          <th>Amount</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {TRANSACTIONS.map((t) => (
                          <tr key={t.merchant + t.date}>
                            <td className="lf-meta">{t.date}</td>
                            <td>{t.merchant}</td>
                            <td className="lf-meta">{t.category}</td>
                            <td>{t.amount}</td>
                            <td className={t.status === "Completed" ? "lf-status-paid" : "lf-status-pledged"}>{t.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>

              <aside className="lf-overview-aside">
                <section className="lf-card">
                  <div className="lf-card-header"><span className="lf-card-title">Upcoming bills</span></div>
                  <div className="lf-card-body">
                    <div className="lf-detail-row"><span>Rent</span><span>Jan 15 · $1,500</span></div>
                    <div className="lf-detail-row"><span>Utilities</span><span>Jan 18 · $180</span></div>
                  </div>
                </section>
                <section className="lf-card">
                  <div className="lf-card-header"><span className="lf-card-title">Savings goals</span></div>
                  <div className="lf-card-body">
                    {[
                      ["New Car", 45],
                      ["Vacation", 80],
                      ["Emergency Fund", 100],
                    ].map(([label, pct]) => (
                      <div key={String(label)} style={{ marginBottom: 12 }}>
                        <div className="lf-detail-row"><span>{label}</span><span>{pct}%</span></div>
                        <div className="lf-progress-track"><div className="lf-progress-fill" style={{ width: `${pct}%` }} /></div>
                      </div>
                    ))}
                  </div>
                </section>
              </aside>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
