"use client";

import { formatUsd } from "@/components/billing/invoiceUtils";

export type InvoicePreviewLine = {
  description: string;
  quantity: string;
  unitPriceDollars: string;
  amountCents: number;
};

export type InvoicePreviewData = {
  customerName: string;
  customerEmail: string;
  lines: InvoicePreviewLine[];
  totalCents: number;
  memo: string;
  dueDate: string;
  sponsorshipLabel: string;
  invoiceDateLabel: string;
  dueDateLabel: string;
};

const FROM_LINES = [
  "Maple Leaf Community Council",
  "Seattle, Washington",
];

function PlaceholderBar({ width = "w-24" }: { width?: string }) {
  return (
    <div
      className={`h-3 rounded bg-gray-100 dark:bg-gray-800 ${width}`}
      aria-hidden
    />
  );
}

function InvoiceTabPreview({ data }: { data: InvoicePreviewData }) {
  const toName = data.customerName.trim() || "Customer";
  const toEmail = data.customerEmail.trim();

  return (
    <div className="mx-auto max-w-2xl rounded-xl border border-gray-200 bg-white p-8 shadow-theme-sm dark:border-gray-700 dark:bg-gray-900">
      <h2 className="font-mercury-display text-3xl font-[450] text-gray-900 dark:text-white">
        Invoice
      </h2>

      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            From
          </p>
          <div className="mt-2 space-y-0.5 text-sm text-gray-800 dark:text-gray-200">
            {FROM_LINES.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            To
          </p>
          <div className="mt-2 space-y-0.5 text-sm text-gray-800 dark:text-gray-200">
            <p className="font-medium">{toName}</p>
            {toEmail ? (
              <p className="text-gray-500 dark:text-gray-400">{toEmail}</p>
            ) : (
              <PlaceholderBar width="w-32" />
            )}
          </div>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Details
          </p>
          <div className="mt-2 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-gray-500 dark:text-gray-400">Invoice no.</span>
              <span className="text-gray-400 dark:text-gray-500">Draft</span>
            </div>
            {data.sponsorshipLabel ? (
              <div className="flex justify-between gap-4">
                <span className="text-gray-500 dark:text-gray-400">For</span>
                <span className="text-right text-gray-800 dark:text-gray-200">
                  {data.sponsorshipLabel}
                </span>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[420px] text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:border-gray-700 dark:text-gray-400">
              <th className="pb-3 pr-4 font-medium">Item</th>
              <th className="pb-3 pr-4 text-center font-medium">Quantity</th>
              <th className="pb-3 pr-4 text-right font-medium">Unit price</th>
              <th className="pb-3 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {data.lines.length === 0 ||
            data.lines.every((l) => !l.description.trim()) ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-gray-400 dark:text-gray-500">
                  Add line items to preview the invoice
                </td>
              </tr>
            ) : (
              data.lines.map((line, i) => {
                const desc = line.description.trim();
                if (!desc) return null;
                const qty = line.quantity.trim() || "1";
                const price = line.unitPriceDollars.trim();
                return (
                  <tr
                    key={i}
                    className="border-b border-gray-100 dark:border-gray-800"
                  >
                    <td className="py-3 pr-4 text-gray-900 dark:text-white">
                      {desc}
                    </td>
                    <td className="py-3 pr-4 text-center tabular-nums text-gray-700 dark:text-gray-300">
                      {qty}
                    </td>
                    <td className="py-3 pr-4 text-right tabular-nums text-gray-700 dark:text-gray-300">
                      {price ? `$${price}` : "—"}
                    </td>
                    <td className="py-3 text-right tabular-nums font-medium text-gray-900 dark:text-white">
                      {line.amountCents > 0
                        ? formatUsd(line.amountCents)
                        : "—"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-end border-t border-gray-200 pt-4 dark:border-gray-700">
        <div className="text-right">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Total
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-gray-900 dark:text-white">
            {formatUsd(data.totalCents)}
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 border-t border-gray-100 pt-6 sm:grid-cols-2 dark:border-gray-800">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Memo
          </p>
          <p className="mt-1 text-sm text-gray-800 dark:text-gray-200">
            {data.memo.trim() || (
              <span className="text-gray-400 dark:text-gray-500">—</span>
            )}
          </p>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between gap-4 text-sm">
            <span className="text-gray-500 dark:text-gray-400">Invoice date</span>
            <span className="text-gray-800 dark:text-gray-200">
              {data.invoiceDateLabel}
            </span>
          </div>
          <div className="flex justify-between gap-4 text-sm">
            <span className="text-gray-500 dark:text-gray-400">Due date</span>
            <span className="text-gray-800 dark:text-gray-200">
              {data.dueDateLabel}
            </span>
          </div>
          <div className="flex justify-between gap-4 text-sm">
            <span className="text-gray-500 dark:text-gray-400">Pay via</span>
            <span className="text-gray-800 dark:text-gray-200">Stripe</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InvoiceDocumentPreview({
  data,
}: {
  data: InvoicePreviewData;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-8 py-8">
        <InvoiceTabPreview data={data} />
      </div>
    </div>
  );
}
