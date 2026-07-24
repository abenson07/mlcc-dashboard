"use client";

import InvoiceComposerLayout from "@/components/billing/InvoiceComposerLayout";
import InvoiceDocumentPreview, {
  type InvoicePreviewData,
} from "@/components/billing/InvoiceDocumentPreview";
import { partitionEventsByRange } from "@/components/events/eventsListUtils";
import { SPONSORSHIP_TIER_DEFS } from "@/components/leaflet/leafletData";
import Label from "@/components/form/Label";
import DatePickerField from "@/components/form/DatePicker";
import { PlusIcon } from "@/icons";
import { getApiBase } from "@/lib/apiBase";
import { useBusinesses, useLeaflets, useWebflowEvents } from "hooks";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { supabaseClient } from "@/lib/supabaseClient";
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

/** Card padding + avatar + gap — item column aligns with customer name text. */
const CUSTOMER_CARD_PAD_PX = 16;
const CUSTOMER_AVATAR_PX = 40;
const CUSTOMER_GAP_PX = 12;
const CONTENT_INDENT =
  CUSTOMER_CARD_PAD_PX + CUSTOMER_AVATAR_PX + CUSTOMER_GAP_PX;

const ITEM_PRESETS = SPONSORSHIP_TIER_DEFS.map((tier) => ({
  label: tier.name,
  description: tier.name,
  amount: tier.amount,
  searchText: `${tier.name} ${tier.amount}`.toLowerCase(),
}));

type WizardStep = 1 | 2 | 3;

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

function customerInitial(name: string, email: string): string {
  const src = name.trim() || email.trim().split("@")[0] || "?";
  return src.charAt(0).toUpperCase();
}

function CustomerSummaryCard({
  name,
  email,
  onEdit,
}: {
  name: string;
  email: string;
  onEdit: () => void;
}) {
  const initial = customerInitial(name, email);
  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-900">
      <div
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-semibold text-sky-700 dark:bg-sky-900/40 dark:text-sky-300"
        aria-hidden
      >
        {initial}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-gray-900 dark:text-white">{name}</p>
        <p className="truncate text-sm text-gray-500 dark:text-gray-400">
          {email || "Email required before sending"}
        </p>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="shrink-0 text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
      >
        Edit
      </button>
    </div>
  );
}

function ItemTypeaheadField({
  id,
  value,
  unitPriceDollars,
  onDescriptionChange,
  onPickPreset,
}: {
  id: string;
  value: string;
  unitPriceDollars: string;
  onDescriptionChange: (value: string) => void;
  onPickPreset: (preset: { description: string; amount: number }) => void;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const q = value.trim().toLowerCase();

  const matches = useMemo(() => {
    if (!q) return ITEM_PRESETS;
    return ITEM_PRESETS.filter(
      (p) =>
        p.searchText.includes(q) ||
        p.label.toLowerCase().includes(q) ||
        String(p.amount).includes(q),
    );
  }, [q]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const inputRing =
    "h-11 w-full min-w-0 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 dark:border-gray-600 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-blue-400 dark:focus:ring-blue-400/20";

  const showPanel = open && (value.length > 0 || matches.length > 0);

  return (
    <div ref={wrapRef} className="relative min-w-0">
      <input
        id={id}
        value={value}
        onChange={(e) => {
          onDescriptionChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
        placeholder="Item"
        autoComplete="off"
        role="combobox"
        aria-expanded={showPanel}
        aria-controls={`${id}-listbox`}
        className={inputRing}
      />
      {showPanel ? (
        <ul
          id={`${id}-listbox`}
          role="listbox"
          className="absolute top-full z-50 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-600 dark:bg-gray-900"
        >
          {matches.length === 0 ? (
            <li className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
              Press enter to use &ldquo;{value.trim() || "your text"}&rdquo;
            </li>
          ) : (
            matches.map((preset) => (
              <li key={preset.label} role="presentation">
                <button
                  type="button"
                  role="option"
                  className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onPickPreset({
                      description: preset.description,
                      amount: preset.amount,
                    });
                    setOpen(false);
                  }}
                >
                  <span className="font-medium text-gray-900 dark:text-white">
                    {preset.label}
                  </span>
                  <span className="shrink-0 tabular-nums text-gray-500 dark:text-gray-400">
                    ${preset.amount.toLocaleString()}
                  </span>
                </button>
              </li>
            ))
          )}
          {value.trim() &&
          !matches.some((m) => m.label.toLowerCase() === value.trim().toLowerCase()) ? (
            <li role="presentation" className="border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-sm text-brand-600 hover:bg-gray-50 dark:text-brand-400 dark:hover:bg-gray-800"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setOpen(false)}
              >
                Use custom: {value.trim()}
                {unitPriceDollars.trim() ? ` · $${unitPriceDollars.trim()}` : ""}
              </button>
            </li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}

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
    "rounded-lg border border-gray-300 bg-white text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 dark:border-gray-600 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-blue-400 dark:focus:ring-blue-400/20";

  return (
    <li
      ref={(node) => {
        ref.current = node;
        drop(preview(node));
      }}
      className="relative flex items-center gap-2"
      style={{ opacity: isDragging ? 0.45 : 1, paddingLeft: CONTENT_INDENT }}
    >
      <div
        ref={(node) => {
          drag(node);
        }}
        className="absolute left-0 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing"
        style={{ left: CUSTOMER_CARD_PAD_PX }}
      >
        <LineDragHandle />
      </div>
      <div className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_3.5rem_7.5rem] items-center gap-2">
        <ItemTypeaheadField
          id={`line-desc-${row.key}`}
          value={row.description}
          unitPriceDollars={row.unitPriceDollars}
          onDescriptionChange={(val) => updateLine(row.key, { description: val })}
          onPickPreset={(preset) =>
            updateLine(row.key, {
              description: preset.description,
              quantity: row.quantity || "1",
              unitPriceDollars: String(preset.amount),
            })
          }
        />
        <input
          id={`line-qty-${row.key}`}
          inputMode="decimal"
          value={row.quantity}
          onChange={(e) => updateLine(row.key, { quantity: e.target.value })}
          placeholder="1"
          maxLength={3}
          className={`h-11 w-full px-2 text-center tabular-nums ${inputRing}`}
        />
        <div className="relative h-11 w-[7.5rem] shrink-0">
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

function dueDatePlusDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
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
  onCreateNewBusiness,
}: {
  id: string;
  email: string;
  onEmailChange: (value: string) => void;
  onPickBusiness: (picked: { businessId: string; email: string; stripeName: string }) => void;
  onCreateNewBusiness: (email: string) => void;
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
                    onCreateNewBusiness(debouncedQ.trim());
                    setOpen(false);
                  }}
                >
                  Add as new business: {debouncedQ.trim()}
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
              return (
                <li key={b.id} role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={false}
                    className="flex w-full flex-col gap-0.5 px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      onPickBusiness({
                        businessId: b.id,
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
                        em
                          ? "text-gray-500 dark:text-gray-400"
                          : "italic text-amber-700 dark:text-amber-400"
                      }`}
                    >
                      {em || "No email on file"}
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
  defaultLeafletId,
  defaultLeafletLabel,
  defaultDueDate,
  titleOverride,
  onIssued,
  onClose,
  fullScreen = false,
}: {
  fixedEventId?: string;
  fixedEventLabel?: string;
  defaultLeafletId?: string;
  defaultLeafletLabel?: string;
  defaultDueDate?: string;
  titleOverride?: string;
  onIssued?: (invoiceId: string) => void;
  onClose?: () => void;
  fullScreen?: boolean;
} = {}) {
  const router = useRouter();
  const {
    data: eventsData,
    isLoading: eventsLoading,
    error: eventsError,
  } = useWebflowEvents();
  const { leaflets, loading: leafletsLoading, error: leafletsError } = useLeaflets({
    autoFetch: true,
  });
  const { create: createBusiness, update: updateBusiness } = useBusinesses({ autoFetch: false });
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState<"event" | "leaflet">(
    defaultLeafletId ? "leaflet" : "event",
  );
  const [eventId, setEventId] = useState(fixedEventId ?? "");
  const [leafletId, setLeafletId] = useState(defaultLeafletId ?? "");
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);
  const [missingEmailInput, setMissingEmailInput] = useState("");
  const [dueDate, setDueDate] = useState(() => defaultDueDate || dueDatePlusDays(30));
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
  const [step, setStep] = useState<WizardStep>(1);

  useEffect(() => {
    if (fixedEventId) {
      setEventId(fixedEventId);
      setCategory("event");
    }
  }, [fixedEventId]);

  useEffect(() => {
    if (defaultLeafletId) {
      setLeafletId(defaultLeafletId);
      setCategory("leaflet");
    }
  }, [defaultLeafletId]);

  const handlePickBusiness = (picked: { businessId: string; email: string; stripeName: string }) => {
    setSelectedBusinessId(picked.businessId);
    if (picked.email) {
      setEmail(picked.email);
      setMissingEmailInput("");
    } else {
      setEmail("");
      setMissingEmailInput(picked.stripeName || "Business");
    }
    setName(picked.stripeName);
  };

  const handleCreateNewBusiness = (businessEmail: string) => {
    setSelectedBusinessId(null);
    setEmail(businessEmail);
    setName("");
    setMissingEmailInput("");
  };

  const sponsorshipSelectValue = useMemo(() => {
    if (category === "event" && eventId) return `event:${eventId}`;
    if (category === "leaflet" && leafletId) return `leaflet:${leafletId}`;
    return "";
  }, [category, eventId, leafletId]);

  const handleSponsorshipChange = (value: string) => {
    if (value.startsWith("event:")) {
      setCategory("event");
      setEventId(value.slice(6));
      setLeafletId("");
      return;
    }
    if (value.startsWith("leaflet:")) {
      setCategory("leaflet");
      setLeafletId(value.slice(8));
      setEventId("");
    }
  };

  /** Today's date in YYYY-MM-DD, used for due-date validation. */
  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, []);

  const dueDateError = useMemo(() => {
    if (!dueDate.trim()) return null;
    if (dueDate <= todayStr) return "Due date must be in the future.";
    return null;
  }, [dueDate, todayStr]);

  const openEventOptions = useMemo(() => {
    if (!eventsData?.items) {
      if (fixedEventId && fixedEventLabel) {
        return [{ id: fixedEventId, label: fixedEventLabel, sortKey: "0000-01-01" }];
      }
      return [];
    }
    const titleSlug = eventsData.titleFieldSlug ?? "name";
    const calSlug = eventsData.calendarFieldSlug ?? null;
    const { upcoming } = partitionEventsByRange(eventsData.items, calSlug);
    const options = upcoming.map((item) => {
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
    });
    if (
      fixedEventId &&
      fixedEventLabel &&
      !options.some((o) => o.id === fixedEventId)
    ) {
      options.unshift({
        id: fixedEventId,
        label: fixedEventLabel,
        sortKey: "0000-01-01",
      });
    }
    return options;
  }, [eventsData, fixedEventId, fixedEventLabel]);

  const openLeafletOptions = useMemo(() => {
    const options = leaflets
      .filter((l) => l.status === "active" || l.status === "planned")
      .map((l) => ({
        id: l.id,
        label: `${l.title} — ${new Date(`${l.distribution_date}T12:00:00`).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}`,
      }));
    if (
      defaultLeafletId &&
      defaultLeafletLabel &&
      !options.some((o) => o.id === defaultLeafletId)
    ) {
      options.unshift({ id: defaultLeafletId, label: defaultLeafletLabel });
    }
    return options;
  }, [leaflets, defaultLeafletId, defaultLeafletLabel]);

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

  const sponsorshipLabel = useMemo(() => {
    if (category === "event" && eventId) {
      return (
        openEventOptions.find((o) => o.id === eventId)?.label ??
        fixedEventLabel ??
        ""
      );
    }
    if (category === "leaflet" && leafletId) {
      return (
        openLeafletOptions.find((o) => o.id === leafletId)?.label ??
        defaultLeafletLabel ??
        ""
      );
    }
    return "";
  }, [
    category,
    eventId,
    leafletId,
    openEventOptions,
    openLeafletOptions,
    fixedEventLabel,
    defaultLeafletLabel,
  ]);

  const previewData = useMemo((): InvoicePreviewData => {
    const today = new Date();
    const invoiceDateLabel = today.toLocaleDateString(undefined, {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
    let dueDateLabel = "Net 30";
    if (dueDate.trim()) {
      const d = new Date(`${dueDate.trim()}T12:00:00`);
      if (!Number.isNaN(d.getTime())) {
        dueDateLabel = d.toLocaleDateString(undefined, {
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
        });
      }
    }
    return {
      customerName: name.trim() || missingEmailInput || "",
      customerEmail: email.trim(),
      lines: lines.map((row) => ({
        description: row.description,
        quantity: row.quantity,
        unitPriceDollars: row.unitPriceDollars,
        amountCents: lineAmountCents(row),
      })),
      totalCents,
      memo,
      dueDate,
      sponsorshipLabel,
      invoiceDateLabel,
      dueDateLabel,
    };
  }, [
    name,
    missingEmailInput,
    email,
    lines,
    totalCents,
    memo,
    dueDate,
    sponsorshipLabel,
  ]);

  const customerDisplayName =
    name.trim() || missingEmailInput || email.trim().split("@")[0] || "Customer";

  const validateStep1 = (): boolean => {
    if (!email.trim()) {
      toast.error("Customer email is required.");
      return false;
    }
    if (!resemblesEmailAddress(email)) {
      toast.error("Enter a valid customer email.");
      return false;
    }
    if (category === "event" && !eventId.trim()) {
      toast.error("Select an open event for this invoice.");
      return false;
    }
    if (category === "leaflet" && !leafletId.trim()) {
      toast.error("Select an open leaflet run for this invoice.");
      return false;
    }
    return true;
  };

  const validateStep2 = (): boolean => {
    let hasLine = false;
    for (let i = 0; i < lines.length; i++) {
      const row = lines[i];
      if (!row) continue;
      const desc = row.description.trim();
      const q = parseQtyInput(row.quantity);
      const p = parseMoneyInput(row.unitPriceDollars);
      if (!desc && !row.quantity.trim() && !row.unitPriceDollars.trim()) continue;
      hasLine = true;
      if (!desc) {
        toast.error(`Line ${String(i + 1)}: item description is required.`);
        return false;
      }
      if (!Number.isFinite(q) || q <= 0) {
        toast.error(`Line ${String(i + 1)}: enter a positive quantity.`);
        return false;
      }
      if (!Number.isFinite(p) || p <= 0) {
        toast.error(`Line ${String(i + 1)}: enter a positive unit price.`);
        return false;
      }
    }
    if (!hasLine) {
      toast.error("Add at least one line item.");
      return false;
    }
    return true;
  };

  const goNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep((s) => (s < 3 ? ((s + 1) as WizardStep) : s));
  };

  const goBack = () => {
    if (step === 1) {
      onClose?.();
      return;
    }
    setStep((s) => (s > 1 ? ((s - 1) as WizardStep) : s));
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

    if (category === "leaflet" && !leafletId.trim()) {
      toast.error("Select the leaflet run this sponsorship invoice is for.");
      return;
    }

    if (!dueDate.trim()) {
      toast.error("Due date is required.");
      return;
    }
    if (dueDateError) {
      toast.error(dueDateError);
      return;
    }

    const resolvedEventId = eventId.trim();
    const resolvedLeafletId = leafletId.trim();

    const body: Record<string, unknown> = {
      email: em,
      lineItems,
      category,
    };
    if (category === "event") {
      body.eventId = resolvedEventId;
    }
    if (category === "leaflet") {
      body.leafletId = resolvedLeafletId;
    }
    const nm = name.trim();
    if (nm) body.name = nm;
    body.dueDate = dueDate.trim();
    const mem = memo.trim();
    if (mem) body.memo = mem;

    setIssuing(true);
    try {
      // If a business without email was picked and user entered one, save it
      if (selectedBusinessId && missingEmailInput && email.trim()) {
        await updateBusiness(selectedBusinessId, { email: email.trim() });
      }

      // If the email doesn't match any business, create one
      if (!selectedBusinessId) {
        const nm = name.trim() || email.trim().split("@")[0] || "";
        const newBiz = await createBusiness({
          email: email.trim(),
          business_name: nm,
          contact_name: nm,
        });
        if (newBiz) setSelectedBusinessId(newBiz.id);
      }

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

      // Create a sponsorship record so the invoice shows up in the sponsor table
      const resolvedBizId = selectedBusinessId;
      if (resolvedBizId && (category === "event" || category === "leaflet")) {
        const totalAmountCents = lineItems.reduce((s, li) => s + li.amountCents, 0);
        if (supabaseClient) {
          await supabaseClient.from("sponsorships").insert({
            business_id: resolvedBizId,
            event_id: category === "event" ? resolvedEventId : null,
            leaflet_id: category === "leaflet" ? resolvedLeafletId : null,
            amount: totalAmountCents / 100,
            status: "invoiced",
            description: lineItems.map((li) => li.description).join(", "),
            quantity: 1,
            memo: memo.trim() || null,
          });
        }
      }

      if (onIssued) {
        onIssued(data.id);
      } else {
        router.push(`/old-admin/sponsorship/invoices/${encodeURIComponent(data.id)}`);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not issue invoice.");
    } finally {
      setIssuing(false);
    }
  };

  const stepTitle =
    titleOverride ?? (step === 3 ? "Invoice details" : "Invoice set up");

  const step1Panel = (
    <div className="space-y-6">
      <div>
        <h1 className="font-mercury-display text-mercury-h3 font-[450] text-mercury-ink dark:text-white/90">
          {stepTitle}
        </h1>
        <p className="mt-1 text-sm text-mercury-muted dark:text-white/60">
          Choose who to bill and what this sponsorship is for.
        </p>
      </div>

      <div>
        <Label htmlFor="inv-email">Customer</Label>
        <div className="mt-2 space-y-3">
          <BusinessCustomerEmailField
            id="inv-email"
            email={email}
            onEmailChange={setEmail}
            onPickBusiness={handlePickBusiness}
            onCreateNewBusiness={handleCreateNewBusiness}
          />
          {missingEmailInput ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20">
              <Label htmlFor="inv-missing-email">Email for this business</Label>
              <input
                id="inv-missing-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address…"
                className="mt-1 h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-blue-400"
              />
              <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
                This business has no email on file. Enter one above and it will
                be saved when you issue the invoice.
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <div>
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

      <div>
        <Label htmlFor="inv-sponsorship">Sponsorship for</Label>
        <select
          id="inv-sponsorship"
          value={sponsorshipSelectValue}
          onChange={(e) => handleSponsorshipChange(e.target.value)}
          disabled={eventsLoading || leafletsLoading}
          className="mt-2 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:text-white/90 dark:focus:border-blue-400"
        >
          <option value="">
            {eventsLoading || leafletsLoading
              ? "Loading open events and leaflets…"
              : "Select an event or leaflet run…"}
          </option>
          {openEventOptions.length > 0 ? (
            <optgroup label="Open events">
              {openEventOptions.map((opt) => (
                <option key={opt.id} value={`event:${opt.id}`}>
                  {opt.label}
                </option>
              ))}
            </optgroup>
          ) : null}
          {openLeafletOptions.length > 0 ? (
            <optgroup label="Open leaflet runs">
              {openLeafletOptions.map((opt) => (
                <option key={opt.id} value={`leaflet:${opt.id}`}>
                  {opt.label}
                </option>
              ))}
            </optgroup>
          ) : null}
        </select>
        {eventsError ? (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
            {eventsError instanceof Error
              ? eventsError.message
              : "Could not load events."}
          </p>
        ) : null}
        {leafletsError ? (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
            {leafletsError}
          </p>
        ) : null}
        {!eventsLoading &&
        !leafletsLoading &&
        openEventOptions.length === 0 &&
        openLeafletOptions.length === 0 ? (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            No open events or leaflet runs available.
          </p>
        ) : null}
      </div>
    </div>
  );

  const step2Panel = (
    <div className="space-y-6">
      <div>
        <h1 className="font-mercury-display text-mercury-h3 font-[450] text-mercury-ink dark:text-white/90">
          {stepTitle}
        </h1>
      </div>

      <div>
        <Label>Customer</Label>
        <div className="mt-2">
          <CustomerSummaryCard
            name={customerDisplayName}
            email={email.trim()}
            onEdit={() => setStep(1)}
          />
        </div>
      </div>

      <div className="space-y-3">
        <div
          className="grid items-end gap-2"
          style={{
            gridTemplateColumns: `minmax(0, 1fr) 3.5rem 7.5rem 2.25rem`,
            paddingLeft: CONTENT_INDENT,
          }}
        >
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Item
          </span>
          <span className="text-center text-xs font-medium text-gray-600 dark:text-gray-400">
            Quantity
          </span>
          <span className="text-right text-xs font-medium text-gray-600 dark:text-gray-400">
            Unit price
          </span>
          <span aria-hidden />
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
        <div style={{ paddingLeft: CONTENT_INDENT }}>
          <button
            type="button"
            onClick={addLine}
            className="mt-1 inline-flex items-center gap-2 rounded-full border border-sky-200/80 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50 dark:border-sky-500/30 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
          >
            <PlusIcon className="size-4 shrink-0" />
            Add line item
          </button>
        </div>
        <div style={{ paddingLeft: CONTENT_INDENT }}>
          <InvoiceTotal cents={totalCents} />
        </div>
      </div>

      <div>
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
  );

  const step3Panel = (
    <div className="space-y-6">
      <div>
        <h1 className="font-mercury-display text-mercury-h3 font-[450] text-mercury-ink dark:text-white/90">
          {stepTitle}
        </h1>
        <p className="mt-1 text-sm text-mercury-muted dark:text-white/60">
          Set payment terms and review before sending.
        </p>
      </div>

      <div>
        <Label>Customer</Label>
        <div className="mt-2">
          <CustomerSummaryCard
            name={customerDisplayName}
            email={email.trim()}
            onEdit={() => setStep(1)}
          />
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/40">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Total
        </p>
        <p className="mt-1 text-2xl font-semibold tabular-nums text-gray-900 dark:text-white">
          ${(totalCents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        {sponsorshipLabel ? (
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            For {sponsorshipLabel}
          </p>
        ) : null}
      </div>

      <div className="max-w-xs">
        <DatePickerField id="inv-due" label="Due date" value={dueDate} onChange={setDueDate} />
        {dueDateError ? (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
            {dueDateError}
          </p>
        ) : null}
      </div>
    </div>
  );

  const formPanel = (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-6 px-8 py-8">
        {step === 1 ? step1Panel : null}
        {step === 2 ? step2Panel : null}
        {step === 3 ? step3Panel : null}
      </div>

      <div className="flex shrink-0 items-center justify-between gap-3 border-t border-gray-200 px-8 py-4 dark:border-gray-700">
        <button
          type="button"
          onClick={goBack}
          className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          Back
        </button>
        {step < 3 ? (
          <button
            type="button"
            onClick={goNext}
            className="inline-flex items-center gap-1 rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-mercury-on-accent hover:bg-brand-600 hover:text-white"
          >
            Next
            <span aria-hidden>›</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => void issueInvoice()}
            disabled={issuing}
            className="inline-flex items-center rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-mercury-on-accent hover:bg-brand-600 hover:text-white disabled:opacity-50"
          >
            {issuing ? "Sending…" : "Create & send"}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <InvoiceComposerLayout
      fullScreen={fullScreen}
      form={formPanel}
      preview={<InvoiceDocumentPreview data={previewData} />}
    />
  );
}
