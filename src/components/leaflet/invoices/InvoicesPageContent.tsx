"use client";

import { useMemo, useState } from "react";
import { IconSearch } from "@/components/leaflet/icons";
import { useLeafletContext } from "../LeafletContext";

type InvoiceTab = "all" | "paid" | "sent" | "overdue" | "draft";

export default function InvoicesPageContent() {
  const { invoices } = useLeafletContext();
  const [invoiceTab, setInvoiceTab] = useState<InvoiceTab>("all");
  const [search, setSearch] = useState("");

  const filteredInvoices = useMemo(() => {
    const q = search.trim().toLowerCase();
    return invoices.filter((i) => {
      if (invoiceTab === "paid" && i.status !== "Paid") return false;
      if (invoiceTab === "sent" && i.status !== "Sent") return false;
      if (invoiceTab === "overdue" && i.status !== "Overdue") return false;
      if (invoiceTab === "draft" && i.status !== "Draft") return false;
      if (q && !i.sponsor.toLowerCase().includes(q) && !i.invoice.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [invoices, invoiceTab, search]);

  return (
    <div className="lf-overview-layout lf-overview-layout--single">
      <div className="lf-overview-main">
        <h1 className="lf-h2">Invoices</h1>

        <section className="lf-card" data-lf-card="invoices">
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
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {invoices.length > 0 && (
              <div className="lf-filters" style={{ marginTop: 12, marginBottom: 12 }}>
                <label className="lf-search">
                  <IconSearch />
                  <input
                    type="search"
                    placeholder="Search invoices..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </label>
              </div>
            )}

            {invoices.length === 0 ? (
              <div className="lf-empty-state">
                <p className="lf-meta">No invoices yet.</p>
                <p className="lf-meta">Add a sponsor from the Sponsorships page to create one.</p>
              </div>
            ) : filteredInvoices.length === 0 ? (
              <p className="lf-meta" style={{ padding: "8px 0" }}>
                No invoices match your search or filters.
              </p>
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
    </div>
  );
}
