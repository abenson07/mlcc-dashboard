"use client";

import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import { getApiBase } from "@/lib/apiBase";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type LineRow = { key: string; description: string; amountDollars: string };

type IssueOk = {
  id: string;
  status: string | null;
};

export default function StripeInvoiceComposer() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [lines, setLines] = useState<LineRow[]>([
    { key: crypto.randomUUID(), description: "", amountDollars: "" },
  ]);
  const [issuing, setIssuing] = useState(false);

  const addLine = () => {
    setLines((prev) => [
      ...prev,
      { key: crypto.randomUUID(), description: "", amountDollars: "" },
    ]);
  };

  const removeLine = (key: string) => {
    setLines((prev) => {
      const next = prev.filter((row) => row.key !== key);
      return next.length > 0
        ? next
        : [{ key: crypto.randomUUID(), description: "", amountDollars: "" }];
    });
  };

  const updateLine = (key: string, patch: Partial<Omit<LineRow, "key">>) => {
    setLines((prev) =>
      prev.map((row) => (row.key === key ? { ...row, ...patch } : row))
    );
  };

  const issueInvoice = async () => {
    const em = email.trim();
    if (!em) {
      toast.error("Customer email is required.");
      return;
    }

    const lineItems: { description: string; amountCents: number }[] = [];
    for (let i = 0; i < lines.length; i++) {
      const row = lines[i];
      if (!row) continue;
      const desc = row.description.trim();
      const raw = row.amountDollars.trim();
      const dollars = Number(raw);
      if (!desc) {
        toast.error(`Line ${String(i + 1)}: description is required.`);
        return;
      }
      if (!Number.isFinite(dollars) || dollars <= 0) {
        toast.error(`Line ${String(i + 1)}: enter a positive amount in dollars.`);
        return;
      }
      const amountCents = Math.round(dollars * 100);
      if (amountCents < 1) {
        toast.error(`Line ${String(i + 1)}: amount too small after converting to cents.`);
        return;
      }
      lineItems.push({ description: desc, amountCents });
    }

    const body: Record<string, unknown> = {
      email: em,
      lineItems,
    };
    const nm = name.trim();
    if (nm) body.name = nm;
    const due = dueDate.trim();
    if (due) body.dueDate = due;

    setIssuing(true);
    try {
      const res = await fetch(`${getApiBase()}/api/stripe/invoices/issue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as IssueOk & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || "Could not issue invoice.");
      }
      toast.success(`Invoice sent (${data.id}).`);
      router.push(`/billing/invoices/${encodeURIComponent(data.id)}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not issue invoice.");
    } finally {
      setIssuing(false);
    }
  };

  return (
    <div className="space-y-6">
      <ComponentCard
        title="Create & send invoice"
        desc="Stripe matches recipients by email to an existing Stripe customer or creates one. Invoice is finalized and emailed immediately; all amounts are USD."
      >
        <div className="space-y-4 px-6 pb-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="inv-email">Customer email</Label>
              <input
                id="inv-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="neighbor@example.com"
                autoComplete="email"
                className="mt-2 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90 dark:placeholder:text-white/30"
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="inv-name">Customer name (optional)</Label>
              <input
                id="inv-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Neighbor"
                autoComplete="name"
                className="mt-2 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90 dark:placeholder:text-white/30"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="inv-due">Due date (optional)</Label>
            <input
              id="inv-due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="mt-2 h-11 max-w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90 sm:max-w-xs"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              If empty, Stripe uses net 30 from issuance.
            </p>
          </div>

          <div className="space-y-6">
            <Label className="!mb-0">Line items</Label>
            <ul className="space-y-5">
              {lines.map((row, index) => (
                <li key={row.key}>
                  <div>
                    <Label htmlFor={`line-desc-${row.key}`}>{`Description ${String(index + 1)}`}</Label>
                    <input
                      id={`line-desc-${row.key}`}
                      value={row.description}
                      onChange={(e) =>
                        updateLine(row.key, { description: e.target.value })
                      }
                      placeholder='e.g. Annual sponsorship'
                      className="mt-2 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90"
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap items-end gap-3">
                    <div className="min-w-[9rem]">
                      <Label htmlFor={`line-amt-${row.key}`}>Amount</Label>
                      <input
                        id={`line-amt-${row.key}`}
                        inputMode="decimal"
                        value={row.amountDollars}
                        onChange={(e) =>
                          updateLine(row.key, {
                            amountDollars: e.target.value,
                          })
                        }
                        placeholder="0.00"
                        className="mt-2 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90"
                      />
                    </div>
                    {lines.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => removeLine(row.key)}
                        className="mb-px rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={addLine}
              className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
            >
              Add line
            </button>
          </div>

          <button
            type="button"
            onClick={() => void issueInvoice()}
            disabled={issuing}
            className="inline-flex items-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-mercury-on-accent hover:bg-brand-600 hover:text-white disabled:opacity-50"
          >
            {issuing ? "Sending…" : "Create & send"}
          </button>
        </div>
      </ComponentCard>
    </div>
  );
}
