import React from "react";
import { InvoiceStatus } from "./types";

const config: Record<InvoiceStatus, string> = {
  Overdue: "bg-orange-50 text-orange-600 border border-orange-200",
  Active:  "bg-blue-50 text-blue-500 border border-blue-200",
  Paid:    "bg-green-50 text-green-600 border border-green-200",
};

export default function StatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${config[status]}`}>
      {status}
    </span>
  );
}
