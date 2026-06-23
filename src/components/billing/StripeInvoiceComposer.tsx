"use client";

import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import { PlusIcon } from "@/icons";
import { getApiBase } from "@/lib/apiBase";
import { useBusinesses, useWebflowEvents } from "hooks";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { toast } from "sonner";

type LineRow = {
  key: string;
  description: string;
  quantity: string;
  unitPriceDollars: string;
};

type IssueOk = {
  id: string;
  status: string | null;
};

const LINE_DRAG_TYPE = "INVOICE_LINE_ITEM";

function parseQtyInput(s: string): number {
  const t = s.replace(/,/g, "").trim();
  if (t === "") return Number.NaN;
  return Number(t);
}

function parseMoneyInput(s: string): number {
  const t = s.replace(/,/g, "").trim();
  if (t === "") return Number.NaN;
  return Number(t);
}

function lineAmountCents(row: LineRow): number {
  const q = parseQtyInput(row.quantity);
  const p = parseMoneyInput(row.unitPriceDollars);
  if (!Number.isFinite(q) || !Number.isFinite(p)) return 0;
  return Math.round(q * p * 100);
}

function LineDragHandle() {
  return (
    <div
      className="flex shrink-0 cursor-grab flex-col gap-0.5 px-1 py-2 active:cursor-grabbing"
      aria-hidden
    >
      <div className="flex gap-0.5">
        <span className="size-1 rounded-full bg-gray-400 dark:bg-gray-500" />
        <span className="size-1 rounded-full bg-gray-400 dark:bg-gray-500" />
      </div>
      <div className="flex gap-0.5">
        <span className="size-1 rounded-full bg-gray-400 dark:bg-gray-500" />
        <span className="size-1 rounded-full bg-gray-400 dark:bg-gray-500" />
      </div>
      <div className="flex gap-0.5">
        <span className="size-1 rounded-full bg-gray-400 dark:bg-gray-500" />
        <span className="size-1 rounded-full bg-gray-400 dark:bg-gray-500" />
      </div>
    </div>
  );
}

function InvoiceTotal({ cents }: { cents: number }) {
  const negative = cents < 0;
  const abs = Math.abs(cents);
  const whole = Math.floor(abs / 100);
  const frac = String(abs % 100).padStart(2, "0");
  const wholeFmt = whole.toLocaleString("en-US");
  return (
    <div className="mt-4 flex items-end justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
      <span className="text-lg font-medium text-gray-800 dark:text-white/90">
        Total
      </span>
      <span className="tabular-nums">
        <span className="text-2xl font-semibold text-gray-900 dark:text-white">
          {negative ? "−" : ""}${wholeFmt}
        </span>
        <span className="text-lg font-semibold text-gray-500 dark:text-gray-400">
          .{frac}
        </span>
      </span>
    </div>
  );
}

type DragItem = { index: number };

function DraggableLineRow({
  row,
  index,
  moveLine,
  updateLine,
  removeLine,
}: {
  row: LineRow;
  index: number;
  moveLine: (from: number, to: number) => void;
  updateLine: (key: string, patch: Partial<Omit<LineRow, "key">>) => void;
  removeLine: (key: string) => void;
}) {
  const ref = useRef<HTMLLIElement | null>(null);

  const [, drop] = useDrop({
    accept: LINE_DRAG_TYPE,
    hover(item: DragItem, monitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;

      const hoverRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverRect.bottom - hoverRect.top) / 2;
      const offset = monitor.getClientOffset();
      if (!offset) return;
      const hoverClientY = offset.y - hoverRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      moveLine(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag, preview] = useDrag({
    type: LINE_DRAG_TYPE,
    item: { index },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  const inputRing =
    "rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 dark:border-gray-600 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-blue-400 dark:focus:ring-blue-400/20";

  return (
    <li
      ref={(node) => {
        ref.current = node;
        drop(preview(node));
      }}
      className="flex items-center gap-2 sm:gap-3"
      style={{ opacity: isDragging ? 0.45 : 1 }}
    >
      <div
        ref={(node) => {
          drag(node);
        }}
        className="cursor-grab shrink-0 active:cursor-grabbing"
      >
        <LineDragHandle />
      </div>
      <div className="grid min-w-0 flex-1 grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_5.5rem_7.5rem] sm:items-center sm:gap-3">
        <input
          id={`line-desc-${row.key}`}
          value={row.description}
          onChange={(e) =>
            updateLine(row.key, { description: e.target.value })
          }
          placeholder="Line item"
          className={`h-11 w-full min-w-0 ${inputRing}`}
        />
        <input
          id={`line-qty-${row.key}`}
          inputMode="decimal"
          value={row.quantity}
          onChange={(e) =>
            updateLine(row.key, { quantity: e.target.value })
          }
          placeholder="1"
          className={`h-11 w-full text-center tabular-nums sm:w-full ${inputRing}`}
        />
        <div className="relative h-11 w-full min-w-0 sm:w-full">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400">
            $
          </span>
          <input
            id={`line-price-${row.key}`}
            inputMode="decimal"
            value={row.unitPriceDollars}
            onChange={(e) =>
              updateLine(row.key, { unitPriceDollars: e.target.value })
            }
            placeholder="0.00"
            className={`h-11 w-full pl-7 text-right tabular-nums ${inputRing}`}
          />
        </div>
      </div>
      <button
        type="button"
        onClick={() => removeLine(row.key)}
        className="mb-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg text-xl leading-none text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
        aria-label="Remove line item"
      >
        ×
      </button>
    </li>
  );
}

const MIN_SEARCH_LEN = 2;

function readEventDateKey(
  fd: Record<string, unknown>,
  slug: string | null
): string | null {
  if (!slug) return null;
  const v = fd[slug];
  if (typeof v !== "string" || !v) return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v.slice(0, 10);
  return d.toISOString().slice(0, 10);
}

function formatEventOptionDate(ymd: string): string {
  return new Date(`${ymd}T12:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Loose check for “looks like an email” (typed-in search, not RFC validation). */
function resemblesEmailAddress(raw: string): boolean {
  const s = raw.trim();
  if (s.length < 5) return false;
  const at = s.indexOf("@");
  if (at <= 0 || at >= s.length - 1) return false;
  const local = s.slice(0, at);
  const domain = s.slice(at + 1);
  if (!local || !domain || /\s/.test(s)) return false;
  return true;
}

function BusinessCustomerEmailField({
  id,
  email,
  onEmailChange,
  onPickBusiness,
}: {
  id: string;
  email: string;
  onEmailChange: (value: string) => void;
  onPickBusiness: (picked: { email: string; stripeName: string }) => void;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [debouncedQ, setDebouncedQ] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(email.trim()), 275);
    return () => clearTimeout(t);
  }, [email]);

  const canSearch = debouncedQ.length >= MIN_SEARCH_LEN;
  const { businesses, loading } = useBusinesses({
    autoFetch: canSearch,
    filters: { search: debouncedQ },
  });

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const showPanel =
    open && (email.trim().length > 0 || canSearch || loading);

  const inputRing =
    "mt-2 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-blue-400";

  return (
    <div ref={wrapRef} className="relative">
      <input
        id={id}
        type="email"
        autoComplete="off"
        value={email}
        onChange={(e) => {
          onEmailChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
        placeholder="Search by business or email…"
        role="combobox"
        aria-expanded={showPanel}
        aria-controls={`${id}-listbox`}
        aria-autocomplete="list"
        className={inputRing}
      />
      {showPanel ? (
        <ul
          id={`${id}-listbox`}
          role="listbox"
          className="absolute top-full z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-600 dark:bg-gray-900"
        >
          {email.trim().length > 0 && email.trim().length < MIN_SEARCH_LEN ? (
            <li className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
              Type at least {MIN_SEARCH_LEN} characters to search businesses.
            </li>
          ) : null}

          {canSearch && loading ? (
            <li className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
              Searching…
            </li>
          ) : null}

          {canSearch && !loading && businesses.length === 0 ? (
            <li role="presentation" className="px-3 py-2 text-sm">
              {resemblesEmailAddress(debouncedQ) ? (
                <button
                  type="button"
                  className="w-full rounded-md text-left font-medium text-brand-600 hover:underline dark:text-brand-400"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onEmailChange(debouncedQ.trim());
                    setOpen(false);
                  }}
                >
                  Send invoice to {debouncedQ.trim()}
                </button>
              ) : (
                <span className="text-gray-500 dark:text-gray-400">
                  No matching businesses on file matching that entry
                </span>
              )}
            </li>
          ) : null}

          {canSearch &&
            !loading &&
            businesses.map((b) => {
              const label = b.business_name?.trim() || "Business";
              const em = b.email?.trim() ?? "";
              const hasEmail = em.length > 0;
              return (
                <li key={b.id} role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={false}
                    className={`flex w-full flex-col gap-0.5 px-3 py-2 text-left text-sm ${
                      hasEmail
                        ? "hover:bg-gray-50 dark:hover:bg-gray-800"
                        : "cursor-not-allowed opacity-70"
                    }`}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      if (!hasEmail) {
                        toast.error(
                          "This business has no email on file. Add one in Businesses, or enter an email above."
                        );
                        return;
                      }
                      onPickBusiness({
                        email: em,
                        stripeName:
                          b.business_name?.trim() ||
                          b.contact_name?.trim() ||
                          "",
                      });
                      setOpen(false);
                    }}
                  >
                    <span className="truncate font-medium text-gray-900 dark:text-white">
                      {label}
                    </span>
                    <span
                      className={`truncate text-xs tabular-nums ${
                        hasEmail
                          ? "text-gray-500 dark:text-gray-400"
                          : "italic text-amber-700 dark:text-amber-400"
                      }`}
                    >
                      {hasEmail ? em : "No email on file"}
                    </span>
                  </button>
                </li>
              );
            })}
        </ul>
      ) : null}
    </div>
  );
}

export default function StripeInvoiceComposer({
  fixedEventId,
  fixedEventLabel,
  onIssued,
}: {
  fixedEventId?: string;
  fixedEventLabel?: string;
  onIssued?: (invoiceId: string) => void;
} = {}) {
  const router = useRouter();
  const presetEvent = Boolean(fixedEventId);
  const {
    data: eventsData,
    isLoading: eventsLoading,
    error: eventsError,
  } = useWebflowEvents({ enabled: !presetEvent });
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState<"event" | "leaflet">("event");
  const [eventId, setEventId] = useState(fixedEventId ?? "");
  const [dueDate, setDueDate] = useState("");
  const [memo, setMemo] = useState("");
  const [lines, setLines] = useState<LineRow[]>([
    {
      key: crypto.randomUUID(),
      description: "",
      quantity: "1",
      unitPriceDollars: "",
    },
  ]);
  const [issuing, setIssuing] = useState(false);

  useEffect(() => {
    if (fixedEventId) setEventId(fixedEventId);
  }, [fixedEventId]);

  const eventOptions = useMemo(() => {
    if (!eventsData?.items) return [];
    const titleSlug = eventsData.titleFieldSlug ?? "name";
    const calSlug = eventsData.calendarFieldSlug ?? null;
    return [...eventsData.items]
      .filter((item) => !item.isArchived)
      .map((item) => {
        const fd = item.fieldData ?? {};
        const name = String(fd[titleSlug] ?? fd.name ?? "Untitled event").trim();
        const dateKey = readEventDateKey(fd, calSlug);
        const label = dateKey
          ? `${name || "Untitled event"} — ${formatEventOptionDate(dateKey)}`
          : name || "Untitled event";
        return {
          id: item.id,
          label,
          sortKey: dateKey ?? "9999-12-31",
        };
      })
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  }, [eventsData]);

  const addLine = () => {
    setLines((prev) => [
      ...prev,
      {
        key: crypto.randomUUID(),
        description: "",
        quantity: "1",
        unitPriceDollars: "",
      },
    ]);
  };

  const removeLine = (key: string) => {
    setLines((prev) => {
      const next = prev.filter((row) => row.key !== key);
      return next.length > 0
        ? next
        : [
            {
              key: crypto.randomUUID(),
              description: "",
              quantity: "1",
              unitPriceDollars: "",
            },
          ];
    });
  };

  const updateLine = (key: string, patch: Partial<Omit<LineRow, "key">>) => {
    setLines((prev) =>
      prev.map((row) => (row.key === key ? { ...row, ...patch } : row))
    );
  };

  const moveLine = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    setLines((prev) => {
      const next = [...prev];
      const [removed] = next.splice(fromIndex, 1);
      if (!removed) return prev;
      next.splice(toIndex, 0, removed);
      return next;
    });
  }, []);

  const totalCents = lines.reduce(
    (acc, row) => acc + lineAmountCents(row),
    0
  );

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
      const q = parseQtyInput(row.quantity);
      const p = parseMoneyInput(row.unitPriceDollars);
      const amountCents = Math.round(q * p * 100);

      if (!desc) {
        toast.error(`Line ${String(i + 1)}: item description is required.`);
        return;
      }
      if (!Number.isFinite(q) || q <= 0) {
        toast.error(`Line ${String(i + 1)}: enter a positive quantity.`);
        return;
      }
      if (!Number.isFinite(p) || p <= 0) {
        toast.error(`Line ${String(i + 1)}: enter a positive unit price.`);
        return;
      }
      if (amountCents < 1) {
        toast.error(`Line ${String(i + 1)}: line total is too small.`);
        return;
      }
      lineItems.push({ description: desc, amountCents });
    }

    if (category === "event" && !eventId.trim()) {
      toast.error("Select the event this sponsorship invoice is for.");
      return;
    }

    const resolvedEventId = presetEvent ? (fixedEventId ?? eventId.trim()) : eventId.trim();

    const body: Record<string, unknown> = {
      email: em,
      lineItems,
      category,
    };
    if (category === "event") {
      body.eventId = resolvedEventId;
    }
    const nm = name.trim();
    if (nm) body.name = nm;
    const due = dueDate.trim();
    if (due) body.dueDate = due;
    const mem = memo.trim();
    if (mem) body.memo = mem;

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
      if (onIssued) {
        onIssued(data.id);
      } else {
        router.push(`/sponsorship/invoices/${encodeURIComponent(data.id)}`);
      }
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
        desc="Pick a business to use its email, or enter any email. Stripe finds or creates the customer by that email, then finalizes and emails the invoice (USD)."
      >
        <div className="space-y-4 px-6 pb-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="inv-email">Customer email</Label>
              <BusinessCustomerEmailField
                id="inv-email"
                email={email}
                onEmailChange={setEmail}
                onPickBusiness={({ email: em, stripeName }) => {
                  setEmail(em);
                  setName(stripeName);
                }}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Suggestions come from your businesses list; billing still uses
                Stripe’s customer for that email.
              </p>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="inv-name">Customer name (optional)</Label>
              <input
                id="inv-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Neighbor"
                autoComplete="name"
                className="mt-2 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-blue-400"
              />
            </div>
            {!presetEvent && (
              <div className="sm:col-span-2">
                <Label htmlFor="inv-category">Sponsorship category</Label>
                <select
                  id="inv-category"
                  value={category}
                  onChange={(e) => {
                    const next =
                      e.target.value === "leaflet" ? "leaflet" : "event";
                    setCategory(next);
                    if (next === "leaflet") setEventId("");
                  }}
                  className="mt-2 h-11 w-full max-w-md rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:text-white/90 dark:focus:border-blue-400"
                >
                  <option value="event">Event Sponsorship</option>
                  <option value="leaflet">Leaflet Sponsorship</option>
                </select>
              </div>
            )}
            {category === "event" && !presetEvent ? (
              <div className="sm:col-span-2">
                <Label htmlFor="inv-event">Event</Label>
                <select
                  id="inv-event"
                  value={eventId}
                  onChange={(e) => setEventId(e.target.value)}
                  disabled={eventsLoading || !!eventsError}
                  className="mt-2 h-11 w-full max-w-xl rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:text-white/90 dark:focus:border-blue-400"
                >
                  <option value="">
                    {eventsLoading
                      ? "Loading events…"
                      : eventsError
                        ? "Could not load events"
                        : "Select an event…"}
                  </option>
                  {eventOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {eventsError ? (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {eventsError instanceof Error
                      ? eventsError.message
                      : "Could not load events from Webflow."}
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Required for event sponsorship. Saved on the invoice as Webflow
                    event id and name.
                  </p>
                )}
              </div>
            ) : null}
            {presetEvent && fixedEventLabel ? (
              <div className="sm:col-span-2">
                <Label>Event</Label>
                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{fixedEventLabel}</p>
              </div>
            ) : null}
          </div>

          <div>
            <Label htmlFor="inv-due">Due date (optional)</Label>
            <input
              id="inv-due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="mt-2 h-11 max-w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:text-white/90 sm:max-w-xs dark:focus:border-blue-400"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              If empty, Stripe uses net 30 from issuance.
            </p>
          </div>

          <div className="space-y-3">
            <div className="mb-1 grid min-w-0 grid-cols-[auto_minmax(0,1fr)_5.5rem_7.5rem_auto] items-end gap-2 sm:mb-0 sm:gap-3">
              <span className="w-6 sm:w-8" aria-hidden />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Item
              </span>
              <span className="text-center text-xs font-medium text-gray-600 dark:text-gray-400">
                Quantity
              </span>
              <span className="text-right text-xs font-medium text-gray-600 dark:text-gray-400">
                Unit price
              </span>
              <span className="w-9 sm:w-9" aria-hidden />
            </div>
            <DndProvider backend={HTML5Backend}>
              <ul className="space-y-3">
                {lines.map((row, index) => (
                  <DraggableLineRow
                    key={row.key}
                    row={row}
                    index={index}
                    moveLine={moveLine}
                    updateLine={updateLine}
                    removeLine={removeLine}
                  />
                ))}
              </ul>
            </DndProvider>
            <button
              type="button"
              onClick={addLine}
              className="mt-1 inline-flex items-center gap-2 rounded-full border border-sky-200/80 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50 dark:border-sky-500/30 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
            >
              <PlusIcon className="size-4 shrink-0" />
              Add line item
            </button>
            <InvoiceTotal cents={totalCents} />
            <div className="pt-2">
              <Label htmlFor="inv-memo">Payer memo (optional)</Label>
              <textarea
                id="inv-memo"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                rows={3}
                placeholder="Appears on the Stripe invoice."
                className="mt-2 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-blue-400"
              />
            </div>
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
