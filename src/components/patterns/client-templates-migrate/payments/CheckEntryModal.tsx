"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { toast } from "sonner";
import { STRIPE_INVOICES_QUERY_KEY, useDemoGuard } from "hooks";
import { getApiBase } from "@/lib/apiBase";
import { newDemoId, patchDemoEntity, upsertDemoEntity } from "@/lib/demo/demoStore";
import { formatUsd } from "@/lib/memberships/tierPricing";
import { INVOICE_CATEGORY_LABEL } from "@/lib/stripe/invoiceDashboardMetadata";
import { Button } from "@/components/patterns/primitives/Button";
import type { CheckEntry, InvoiceEntry, MembershipEntry, RowState } from "./checkEntryTypes";
import { MembershipCheckCard } from "./MembershipCheckCard";
import { InvoiceCheckCard } from "./InvoiceCheckCard";
import { cardStyle } from "./checkEntryStyles";

type Tab = "membership" | "invoice";

const TABS: { id: Tab; label: string }[] = [
  { id: "membership", label: "Membership payment" },
  { id: "invoice", label: "Invoice payment" },
];

export type CheckEntryModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

/** Inline `all: unset` on the controls would wipe any outline, hence !important. */
const FOCUS_CSS = `
.check-entry-root :is(input, button, [role="tab"], [role="option"]):focus-visible {
  outline: 2px solid var(--linear-color-accent) !important;
  outline-offset: 2px !important;
}
.check-entry-root input[type="text"]:focus {
  border-color: var(--linear-color-accent) !important;
}
/* globals.css sets a light-gray tbody row hover that assumes Tailwind dark mode; admin uses its own theme. */
.check-entry-root tbody tr:hover {
  background: var(--linear-color-sidebar-item-selected) !important;
}
.check-entry-root label:has(input[type="radio"]:focus-visible) {
  outline: 2px solid var(--linear-color-accent) !important;
  outline-offset: 2px !important;
}
`;

function entryTotal(e: CheckEntry): number {
  return e.kind === "membership" ? e.membershipCents + e.donationCents : e.amountCents;
}

function entryTitle(e: CheckEntry): string {
  return e.kind === "membership" ? e.payer.name : (e.invoice.customer_email ?? e.invoice.number ?? e.invoice.id);
}

function entryDetail(e: CheckEntry): string {
  if (e.kind === "invoice") {
    return `Invoice ${e.invoice.number ?? e.invoice.id} · ${formatUsd(e.amountCents)} of ${formatUsd(e.invoice.amount_due)} · ${e.date}`;
  }
  const donation = e.donationCents > 0 ? ` + ${formatUsd(e.donationCents)} donation` : "";
  const tier = e.tier === "Business" ? "Business" : e.tier;
  return `${tier} · ${formatUsd(e.membershipCents)}${donation} · ${e.date}`;
}

/**
 * Full-screen, keyboard-first bulk entry for mailed checks. Each confirmed card
 * collapses to a row and a fresh card takes focus; nothing is written until
 * "I'm all done".
 */
export function CheckEntryModal({ isOpen, onClose }: CheckEntryModalProps) {
  const { enabled: demo } = useDemoGuard();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("membership");
  const [entries, setEntries] = useState<CheckEntry[]>([]);
  const [states, setStates] = useState<Record<string, RowState>>({});
  const [draftKey, setDraftKey] = useState(0);
  const [editing, setEditing] = useState<CheckEntry | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<"entry" | "review">("entry");
  const keySeq = useRef(0);
  const tabRefs = useRef<Record<Tab, HTMLButtonElement | null>>({ membership: null, invoice: null });

  const reset = useCallback(() => {
    setTab("membership");
    setEntries([]);
    setStates({});
    setEditing(null);
    setStep("entry");
    setDraftKey((k) => k + 1);
  }, []);

  const requestClose = useCallback(() => {
    if (submitting) return;
    if (entries.length > 0 && !window.confirm(`Discard ${entries.length} unsubmitted check row(s)?`)) return;
    reset();
    onClose();
  }, [entries.length, onClose, reset, submitting]);

  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !e.defaultPrevented) requestClose();
    }
    document.addEventListener("keydown", onKeyDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [isOpen, requestClose]);

  function addEntry(entry: Omit<MembershipEntry, "key"> | Omit<InvoiceEntry, "key">) {
    const key = editing?.key ?? `check-${(keySeq.current += 1)}`;
    const next = { ...entry, key } as CheckEntry;
    setEntries((prev) => {
      const i = prev.findIndex((e) => e.key === key);
      if (i === -1) return [...prev, next];
      const copy = prev.slice();
      copy[i] = next;
      return copy;
    });
    setStates((s) => {
      const { [key]: _drop, ...rest } = s;
      return rest;
    });
    setEditing(null);
    setDraftKey((k) => k + 1); // fresh card, focus lands on Name / invoice search
  }

  function editEntry(entry: CheckEntry) {
    setTab(entry.kind);
    setEditing(entry);
    setDraftKey((k) => k + 1);
  }

  function removeEntry(key: string) {
    setEntries((prev) => prev.filter((e) => e.key !== key));
    setStates((s) => {
      const { [key]: _drop, ...rest } = s;
      return rest;
    });
  }

  function submitDemo(entry: CheckEntry) {
    const now = Math.floor(Date.now() / 1000);
    if (entry.kind === "invoice") {
      const short = entry.amountCents < entry.invoice.amount_due;
      patchDemoEntity("invoices", entry.invoice.id, {
        ...(short ? {} : { status: "paid", payment_method: "check" }),
        check_received_cents: entry.amountCents,
        manual_payment_date: entry.date,
      });
      return;
    }
    const { payer } = entry;
    upsertDemoEntity("invoices", {
      id: newDemoId("inv"),
      number: `DEMO-${Math.floor(1000 + Math.random() * 9000)}`,
      status: "paid",
      customer_email: payer.email,
      amount_due: entryTotal(entry),
      due_date: null,
      created: now,
      hosted_invoice_url: null,
      catalog_product_ids: [],
      sponsorship_category: INVOICE_CATEGORY_LABEL.MEMBERSHIP,
      created_by_name: "You (demo)",
      event_id: null,
      event_name: null,
      leaflet_id: null,
      sponsorship_id: null,
      payment_method: "check",
      payer_name: payer.name,
      line_items: [
        { description: `${entry.tier} membership (check)`, amountCents: entry.membershipCents },
        ...(entry.donationCents > 0
          ? [{ description: "Donation (check)", amountCents: entry.donationCents }]
          : []),
      ],
    });
    const year = new Date(`${entry.date}T00:00:00Z`);
    year.setUTCFullYear(year.getUTCFullYear() + 1);
    const membership = {
      id: `demo-membership-${payer.id}`,
      tier: entry.tier === "Business" ? "Business membership" : entry.tier,
      status: "Active",
      payment_method: "check",
      last_renewal: entry.date,
      current_period_end: year.toISOString().slice(0, 10),
    };
    patchDemoEntity(payer.kind === "person" ? "people" : "businesses", payer.id, {
      membership_id: membership.id,
      membership,
      ...(payer.kind === "business" ? { is_member: true } : {}),
    });
  }

  async function submitLive(entry: CheckEntry) {
    const base = getApiBase();
    const res =
      entry.kind === "invoice"
        ? await fetch(`${base}/api/stripe/invoices/${entry.invoice.id}/mark-paid`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ method: "check", date: entry.date, amountCents: entry.amountCents }),
          })
        : await fetch(`${base}/api/admin/check-payments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              payerType: entry.payer.kind,
              payerId: entry.payer.id,
              tier: entry.tier,
              membershipCents: entry.membershipCents,
              donationCents: entry.donationCents,
              checkDate: entry.date,
            }),
          });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string; invoiceId?: string };
      const suffix = data.invoiceId ? ` (Stripe invoice ${data.invoiceId} was already paid — do not resubmit)` : "";
      throw new Error((data.error ?? `Request failed (${res.status})`) + suffix);
    }
  }

  function allDone() {
    if (entries.length === 0) {
      reset();
      onClose();
      return;
    }
    setStates({});
    setStep("review");
  }

  async function submitAll() {
    setSubmitting(true);
    const failed: CheckEntry[] = [];
    for (const entry of entries) {
      setStates((s) => ({ ...s, [entry.key]: { status: "submitting" } }));
      try {
        if (demo) submitDemo(entry);
        else await submitLive(entry);
      } catch (e) {
        failed.push(entry);
        setStates((s) => ({
          ...s,
          [entry.key]: { status: "error", error: e instanceof Error ? e.message : "Failed" },
        }));
      }
    }
    setSubmitting(false);
    const ok = entries.length - failed.length;
    if (!demo) {
      void queryClient.invalidateQueries({ queryKey: STRIPE_INVOICES_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ["people"] });
      void queryClient.invalidateQueries({ queryKey: ["businesses"] });
      void queryClient.invalidateQueries({ queryKey: ["memberships"] });
    }
    if (ok > 0) {
      toast.success(
        demo
          ? `${ok} check${ok === 1 ? "" : "s"} logged — demo mode, saved locally only`
          : `${ok} check${ok === 1 ? "" : "s"} logged`,
      );
    }
    if (failed.length === 0) {
      reset();
      onClose();
    } else {
      setEntries(failed);
      toast.error(`${failed.length} check${failed.length === 1 ? "" : "s"} failed — fix and resubmit`);
    }
  }

  if (!isOpen) return null;

  const draftInitial = editing?.kind === tab ? editing : undefined;
  const queuedInvoiceIds = entries
    .filter((e): e is InvoiceEntry => e.kind === "invoice" && e.key !== editing?.key)
    .map((e) => e.invoice.id);

  function onTabKeyDown(e: React.KeyboardEvent) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next: Tab = tab === "membership" ? "invoice" : "membership";
    setTab(next);
    setEditing(null);
    setDraftKey((k) => k + 1);
    tabRefs.current[next]?.focus();
  }

  const node = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Log check payments"
      className="check-entry-root"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        overflow: "auto",
        background: "var(--linear-color-background)",
        color: "var(--linear-color-ink)",
      }}
    >
      <style>{FOCUS_CSS}</style>
      <div
        style={{
          position: "absolute",
          top: 24,
          right: 32,
        }}
      >
        <button
          type="button"
          aria-label="Close"
          onClick={requestClose}
          style={{
            all: "unset",
            cursor: "pointer",
            width: 36,
            height: 36,
            display: "grid",
            placeItems: "center",
            borderRadius: 8,
            color: "var(--linear-color-ink-muted)",
          }}
        >
          <X size={22} strokeWidth={1.5} />
        </button>
      </div>

      <div
        style={{
          boxSizing: "border-box",
          width: "100%",
          maxWidth: step === "review" ? 960 : 576,
          margin: "0 auto",
          padding: "96px 16px 64px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 500, letterSpacing: "-0.01em" }}>
          {step === "review" ? "Review check payments" : "Log check payments"}
        </h1>

        {step === "review" ? (
          <ReviewTable
            entries={entries}
            states={states}
            submitting={submitting}
            demo={demo}
            onBack={() => {
              setStates({});
              setStep("entry");
            }}
            onSubmit={() => void submitAll()}
          />
        ) : (
          <>

        <div
          role="tablist"
          aria-label="Payment type"
          onKeyDown={onTabKeyDown}
          style={{ display: "flex", gap: 4, padding: 4, borderRadius: 10, background: "var(--linear-color-panel)", alignSelf: "flex-start" }}
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              ref={(el) => {
                tabRefs.current[t.id] = el;
              }}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              tabIndex={tab === t.id ? 0 : -1}
              onClick={() => {
                if (tab === t.id) return;
                setTab(t.id);
                setEditing(null);
                setDraftKey((k) => k + 1);
              }}
              style={{
                all: "unset",
                cursor: "pointer",
                padding: "6px 14px",
                borderRadius: 7,
                fontSize: 13,
                fontWeight: 500,
                color: tab === t.id ? "var(--linear-color-ink)" : "var(--linear-color-ink-subtle)",
                background: tab === t.id ? "var(--linear-color-sidebar-item-selected)" : "transparent",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {entries
          .filter((e) => e.key !== editing?.key)
          .map((e) => {
            const state = states[e.key];
            return (
              <div
                key={e.key}
                style={{
                  ...cardStyle,
                  padding: "14px 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  ...(state?.status === "error" ? { borderColor: "#e5484d" } : null),
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{entryTitle(e)}</div>
                  <div style={{ fontSize: 12, color: "var(--linear-color-ink-subtle)" }}>{entryDetail(e)}</div>
                  {state?.status === "error" ? (
                    <div style={{ fontSize: 12, color: "#e5484d", marginTop: 4 }}>{state.error}</div>
                  ) : null}
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  {state?.status === "submitting" ? (
                    <span style={{ fontSize: 12, color: "var(--linear-color-ink-subtle)" }}>Saving…</span>
                  ) : (
                    <>
                      <Button label="Edit" variant="ghost" onClick={() => editEntry(e)} />
                      <Button label="Remove" variant="ghost" onClick={() => removeEntry(e.key)} />
                    </>
                  )}
                </div>
              </div>
            );
          })}

        {tab === "membership" ? (
          <MembershipCheckCard
            key={`m-${draftKey}`}
            initial={draftInitial as MembershipEntry | undefined}
            onConfirm={addEntry}
          />
        ) : (
          <InvoiceCheckCard
            key={`i-${draftKey}`}
            initial={draftInitial as InvoiceEntry | undefined}
            excludeIds={queuedInvoiceIds}
            onConfirm={addEntry}
          />
        )}

        <div
          style={{
            ...cardStyle,
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <span style={{ fontSize: 15 }}>
            Submit {entries.length} check row{entries.length === 1 ? "" : "s"}
            {entries.length > 0 ? (
              <span style={{ color: "var(--linear-color-ink-subtle)" }}>
                {" "}
                · {formatUsd(entries.reduce((sum, e) => sum + entryTotal(e), 0))}
              </span>
            ) : null}
          </span>
          <Button
            label="I'm all done"
            variant="primary"
            size="md"
            onClick={allDone}
          />
        </div>
          </>
        )}
      </div>
    </div>
  );

  // Rendered in place (not portaled) so the Linear theme CSS variables still apply.
  return node;
}

const th: React.CSSProperties = {
  textAlign: "left",
  fontWeight: 500,
  fontSize: 12,
  color: "var(--linear-color-ink-subtle)",
  padding: "10px 12px",
  borderBottom: "var(--linear-border-width) solid var(--linear-color-hairline-strong)",
  whiteSpace: "nowrap",
};
const td: React.CSSProperties = {
  fontSize: 14,
  padding: "12px",
  borderBottom: "var(--linear-border-width) solid var(--linear-color-hairline)",
  verticalAlign: "top",
};
const num: React.CSSProperties = { textAlign: "right", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" };

function entryType(e: CheckEntry): string {
  if (e.kind === "invoice") return "Invoice payment";
  return e.payer.kind === "business" ? "Business membership" : "Membership";
}

function entryWhat(e: CheckEntry): string {
  if (e.kind === "invoice") {
    const due = e.invoice.amount_due;
    const note =
      e.amountCents < due
        ? `short ${formatUsd(due - e.amountCents)} · stays open`
        : e.amountCents > due
          ? `over ${formatUsd(e.amountCents - due)}`
          : "paid in full";
    return `Invoice ${e.invoice.number ?? e.invoice.id} · ${formatUsd(due)} due · ${note}`;
  }
  if (e.payer.kind === "business") return "Business · 1 year";
  return `${e.tier} · ${e.payer.activeMembership ? "renewal" : "new member"}`;
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${m}/${d}/${y}`;
}

function ReviewTable({
  entries,
  states,
  submitting,
  demo,
  onBack,
  onSubmit,
}: {
  entries: CheckEntry[];
  states: Record<string, RowState>;
  submitting: boolean;
  demo: boolean;
  onBack: () => void;
  onSubmit: () => void;
}) {
  const membershipTotal = entries.reduce(
    (n, e) => n + (e.kind === "membership" ? e.membershipCents : e.amountCents),
    0,
  );
  const donationTotal = entries.reduce((n, e) => n + (e.kind === "membership" ? e.donationCents : 0), 0);
  const hasErrors = entries.some((e) => states[e.key]?.status === "error");

  return (
    <>
      <p style={{ margin: 0, fontSize: 14, color: "var(--linear-color-ink-subtle)" }}>
        {demo
          ? "Demo mode — nothing will be sent to Stripe or the database."
          : "Each row becomes an invoice marked paid by check."}{" "}
        Look these over, then submit.
      </p>
      <div style={{ ...cardStyle, padding: 0, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={th}>#</th>
              <th style={th}>Name</th>
              <th style={th}>Payment</th>
              <th style={th}>Check date</th>
              <th style={{ ...th, ...num }}>Membership</th>
              <th style={{ ...th, ...num }}>Donation</th>
              <th style={{ ...th, ...num }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e, i) => {
              const state = states[e.key];
              const dues = e.kind === "membership" ? e.membershipCents : e.amountCents;
              const gift = e.kind === "membership" ? e.donationCents : 0;
              return (
                <tr key={e.key}>
                  <td style={{ ...td, color: "var(--linear-color-ink-subtle)" }}>{i + 1}</td>
                  <td style={td}>
                    <div style={{ fontWeight: 500 }}>{entryTitle(e)}</div>
                    {e.kind === "membership" && e.payer.email ? (
                      <div style={{ fontSize: 12, color: "var(--linear-color-ink-subtle)" }}>{e.payer.email}</div>
                    ) : null}
                    {state?.status === "error" ? (
                      <div style={{ fontSize: 12, color: "#e5484d", marginTop: 4 }}>{state.error}</div>
                    ) : null}
                  </td>
                  <td style={td}>
                    <div>{entryType(e)}</div>
                    <div style={{ fontSize: 12, color: "var(--linear-color-ink-subtle)" }}>{entryWhat(e)}</div>
                  </td>
                  <td style={{ ...td, whiteSpace: "nowrap" }}>{formatDate(e.date)}</td>
                  <td style={{ ...td, ...num }}>{formatUsd(dues)}</td>
                  <td style={{ ...td, ...num }}>{gift > 0 ? formatUsd(gift) : "—"}</td>
                  <td style={{ ...td, ...num, fontWeight: 500 }}>
                    {state?.status === "submitting" ? "Saving…" : formatUsd(dues + gift)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td style={{ ...td, borderBottom: "none", fontWeight: 500 }} colSpan={4}>
                {entries.length} check{entries.length === 1 ? "" : "s"}
              </td>
              <td style={{ ...td, ...num, borderBottom: "none" }}>{formatUsd(membershipTotal)}</td>
              <td style={{ ...td, ...num, borderBottom: "none" }}>{formatUsd(donationTotal)}</td>
              <td style={{ ...td, ...num, borderBottom: "none", fontWeight: 600 }}>
                {formatUsd(membershipTotal + donationTotal)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <Button label="Back to edit" variant="secondary" size="md" disabled={submitting} onClick={onBack} />
        <Button
          label={
            submitting
              ? "Submitting…"
              : hasErrors
                ? `Retry ${entries.length} failed`
                : `Looks good — submit ${entries.length} check${entries.length === 1 ? "" : "s"}`
          }
          variant="primary"
          size="md"
          disabled={submitting}
          onClick={onSubmit}
        />
      </div>
    </>
  );
}
