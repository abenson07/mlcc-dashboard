"use client";

import { useMemo, useRef, useState } from "react";
import { useStripeInvoices } from "hooks";
import type { StripeInvoiceTableRow } from "@/components/billing/InvoicesListTable";
import { formatUsd, parseDollarsToCents } from "@/lib/memberships/tierPricing";
import type { InvoiceEntry } from "./checkEntryTypes";
import { DateDigitsInput, digitsToIso, isoToDigits, todayDigits } from "./DateDigitsInput";
import { ConfirmSubmit } from "./MembershipCheckCard";
import { MoneyInput } from "./MoneyInput";
import { cardStyle, fieldInputStyle, fieldLabelStyle } from "./checkEntryStyles";

type Props = {
  initial?: InvoiceEntry;
  /** Invoices already queued, so the same one is not recorded twice. */
  excludeIds: string[];
  onConfirm: (entry: Omit<InvoiceEntry, "key">) => void;
};

function label(inv: StripeInvoiceTableRow): string {
  return `${inv.number ?? inv.id} · ${inv.customer_email ?? "No email"}`;
}

export function InvoiceCheckCard({ initial, excludeIds, onConfirm }: Props) {
  const dateRef = useRef<HTMLInputElement>(null);
  const { invoices } = useStripeInvoices();
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [invoice, setInvoice] = useState<StripeInvoiceTableRow | null>(initial?.invoice ?? null);
  const [digits, setDigits] = useState(initial ? isoToDigits(initial.date) : todayDigits());
  const [amount, setAmount] = useState(initial ? (initial.amountCents / 100).toFixed(2) : "");
  const [attempted, setAttempted] = useState(false);

  const results = useMemo(() => {
    const q = text.trim().toLowerCase();
    return invoices
      .filter((i) => i.status === "open" && !excludeIds.includes(i.id))
      .filter((i) => !q || label(i).toLowerCase().includes(q))
      .slice(0, 8);
  }, [invoices, text, excludeIds]);

  const isoDate = digitsToIso(digits);
  const amountCents = parseDollarsToCents(amount);
  const diff = invoice && amountCents != null ? amountCents - invoice.amount_due : 0;

  function choose(i: number) {
    const picked = results[i];
    if (!picked) return;
    setInvoice(picked);
    setAmount((picked.amount_due / 100).toFixed(2));
    setOpen(false);
    setText("");
    setTimeout(() => dateRef.current?.focus(), 0);
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setAttempted(true);
        if (invoice && isoDate && amountCents != null) {
          onConfirm({ kind: "invoice", invoice, date: isoDate, amountCents });
        }
      }}
      style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: 20 }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 8, position: "relative" }}>
        <span style={fieldLabelStyle}>Invoice</span>
        {invoice ? (
          <div
            style={{
              ...fieldInputStyle,
              height: 56,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{label(invoice)}</div>
              <div style={{ fontSize: 12, color: "var(--linear-color-ink-subtle)" }}>
                {invoice.sponsorship_category ?? "Invoice"} · {formatUsd(invoice.amount_due)} due
              </div>
            </div>
            <button
              type="button"
              onClick={() => setInvoice(null)}
              style={{ all: "unset", cursor: "pointer", fontSize: 12, color: "var(--linear-color-accent)" }}
            >
              Change
            </button>
          </div>
        ) : (
          <>
            <input
              autoFocus
              type="text"
              role="combobox"
              aria-expanded={open && results.length > 0}
              aria-controls="open-invoice-list"
              aria-label="Search open invoices"
              placeholder="Search by invoice number or email…"
              autoComplete="off"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setOpen(true);
                setActive(0);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setOpen(true);
                  setActive((i) => Math.min(i + 1, Math.max(results.length - 1, 0)));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setActive((i) => Math.max(i - 1, 0));
                } else if (e.key === "Enter" && open && results[active]) {
                  e.preventDefault();
                  choose(active);
                } else if (e.key === "Escape" && open) {
                  e.preventDefault();
                  setOpen(false);
                }
              }}
              style={fieldInputStyle}
            />
            {open ? (
              <ul
                id="open-invoice-list"
                role="listbox"
                style={{
                  position: "absolute",
                  zIndex: 5,
                  left: 0,
                  right: 0,
                  top: 70,
                  margin: 0,
                  padding: 4,
                  listStyle: "none",
                  maxHeight: 280,
                  overflow: "auto",
                  borderRadius: 8,
                  border: "var(--linear-border-width) solid var(--linear-color-hairline-strong)",
                  background: "var(--linear-color-side-panel)",
                  boxShadow: "var(--linear-shadow-panel)",
                }}
              >
                {results.length === 0 ? (
                  <li style={{ padding: 10, fontSize: 13, color: "var(--linear-color-ink-subtle)" }}>
                    No open invoices
                  </li>
                ) : (
                  results.map((inv, i) => (
                    <li
                      key={inv.id}
                      role="option"
                      aria-selected={i === active}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        choose(i);
                      }}
                      onMouseEnter={() => setActive(i)}
                      style={{
                        padding: "8px 10px",
                        borderRadius: 6,
                        cursor: "pointer",
                        background: i === active ? "var(--linear-color-sidebar-item-selected)" : "transparent",
                      }}
                    >
                      <div style={{ fontSize: 14 }}>{label(inv)}</div>
                      <div style={{ fontSize: 12, color: "var(--linear-color-ink-subtle)" }}>
                        {inv.sponsorship_category ?? "Invoice"} · {formatUsd(inv.amount_due)} due
                      </div>
                    </li>
                  ))
                )}
              </ul>
            ) : null}
          </>
        )}
      </div>

      {invoice ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={fieldLabelStyle}>
            Amount on check · invoice total {formatUsd(invoice.amount_due)}
          </span>
          <MoneyInput
            aria-label="Check amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onFocus={(e) => e.currentTarget.select()}
            placeholder="0.00"
            aria-invalid={attempted && amountCents == null ? true : undefined}
          />
          {amountCents != null && diff !== 0 ? (
            <span style={{ fontSize: 12, color: diff < 0 ? "#f5a524" : "var(--linear-color-ink-subtle)" }}>
              {diff < 0
                ? `Short by ${formatUsd(-diff)} — the invoice will stay open with this check noted.`
                : `Over by ${formatUsd(diff)} — the invoice is marked paid and the overage is noted.`}
            </span>
          ) : null}
        </div>
      ) : null}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <span style={fieldLabelStyle}>Check date</span>
        <DateDigitsInput ref={dateRef} digits={digits} onChange={setDigits} invalid={attempted && !isoDate} />
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <ConfirmSubmit dimmed={attempted && (!invoice || !isoDate || amountCents == null)} />
      </div>
    </form>
  );
}
