"use client";

import { useShirtPreorderItems } from "@/hooks/useShirtPreorderItems";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString();
}

export default function ShirtPreordersAdminContent() {
  const { personOrders, loading, error } = useShirtPreorderItems();

  return (
    <div className="lf-canvas lf-canvas--white">
      <div className="lf-page-header">
        <h1 className="lf-h1">Shirt Preorders</h1>
        <p className="lf-meta">2026 Summer Social shirt preorders by person</p>
      </div>

      {loading && <p className="lf-meta">Loading…</p>}
      {error && (
        <p className="lf-meta" style={{ color: "var(--lf-danger, #c00)" }}>
          {error}
        </p>
      )}
      {!loading && !error && personOrders.length === 0 && (
        <p className="lf-meta">No preorders yet.</p>
      )}
      {!loading && !error && personOrders.length > 0 && (
        <div className="lf-table-wrap">
          <table className="lf-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Sizes</th>
                <th>Qty</th>
                <th>Payment</th>
                <th>Ordered</th>
              </tr>
            </thead>
            <tbody>
              {personOrders.map((row) => (
                <tr key={row.personId}>
                  <td>
                    <span className="lf-person-name-cell">{row.fullName}</span>
                  </td>
                  <td className="lf-meta">{row.email}</td>
                  <td className="lf-meta">{row.phone}</td>
                  <td className="lf-meta">{row.sizesSummary}</td>
                  <td>{row.quantity}</td>
                  <td className="lf-meta">{row.paymentStatus}</td>
                  <td className="lf-meta">{formatDate(row.latestAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
