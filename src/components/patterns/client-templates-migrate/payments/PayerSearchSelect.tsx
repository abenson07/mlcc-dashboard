"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { useBusinesses, useDemoGuard, usePeople } from "hooks";
import type { BusinessWithDetails, PersonWithMembership } from "hooks";
import type { CheckTierKey } from "@/lib/memberships/tierPricing";
import { isPersonTier } from "@/lib/memberships/tierPricing";
import type { Payer } from "./checkEntryTypes";
import { fieldInputStyle } from "./checkEntryStyles";

function personToPayer(p: PersonWithMembership): Payer {
  const m = p.membership;
  const active = m?.status === "Active";
  const tier: CheckTierKey = isPersonTier(m?.tier) ? m.tier : "Individual";
  return {
    kind: "person",
    id: p.id,
    name: p.full_name ?? p.email ?? "Unnamed",
    email: p.email ?? null,
    subtitle: [p.email, m ? `${m.tier ?? "Member"} · ${m.status ?? ""}` : "No membership"]
      .filter(Boolean)
      .join(" · "),
    activeMembership: active ? { tier, periodEnd: m?.current_period_end ?? null } : null,
  };
}

function businessToPayer(b: BusinessWithDetails): Payer {
  const m = b.membership;
  return {
    kind: "business",
    id: b.id,
    name: b.business_name ?? "Unnamed business",
    email: b.email ?? null,
    subtitle: ["Business", m ? m.status : "No membership"].join(" · "),
    activeMembership:
      m?.status === "Active" ? { tier: "Business", periodEnd: m.current_period_end ?? null } : null,
  };
}

type Props = {
  value: Payer | null;
  onSelect: (payer: Payer) => void;
  onClear: () => void;
};

/** Combobox: type to search people and businesses, ↑/↓ to move, Enter to pick. */
export function PayerSearchSelect({ value, onSelect, onClear }: Props) {
  const listId = useId();
  const [text, setText] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const { enabled: demo, store } = useDemoGuard();

  useEffect(() => {
    const t = setTimeout(() => setDebounced(text.trim()), 180);
    return () => clearTimeout(t);
  }, [text]);

  const enabled = debounced.length >= 2;
  const { people } = usePeople({ autoFetch: enabled, filters: { search: debounced } });
  const { businesses } = useBusinesses({ autoFetch: enabled, filters: { search: debounced } });

  const results = useMemo<Payer[]>(() => {
    if (!enabled) return [];
    const ppl = demo ? store.merge<PersonWithMembership>("people", people) : people;
    const biz = demo ? store.merge<BusinessWithDetails>("businesses", businesses) : businesses;
    const q = debounced.toLowerCase();
    const bizMatches = biz.filter((b) => (b.business_name ?? "").toLowerCase().includes(q));
    return [...ppl.slice(0, 8).map(personToPayer), ...bizMatches.slice(0, 5).map(businessToPayer)];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, people, businesses, debounced, demo, store.version]);

  useEffect(() => setActive(0), [results.length]);

  if (value) {
    return (
      <div
        style={{
          ...fieldInputStyle,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          height: 56,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 500 }}>{value.name}</div>
          <div
            style={{
              fontSize: 12,
              color: "var(--linear-color-ink-subtle)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {value.subtitle}
          </div>
        </div>
        <button
          type="button"
          onClick={onClear}
          style={{
            all: "unset",
            cursor: "pointer",
            fontSize: 12,
            color: "var(--linear-color-accent)",
          }}
        >
          Change
        </button>
      </div>
    );
  }

  function choose(i: number) {
    const payer = results[i];
    if (!payer) return;
    setOpen(false);
    setText("");
    onSelect(payer);
  }

  return (
    <div style={{ position: "relative" }}>
      <input
        autoFocus
        type="text"
        role="combobox"
        aria-expanded={open && results.length > 0}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && results[active] ? `${listId}-${active}` : undefined}
        aria-label="Search by name"
        placeholder="Search by name…"
        autoComplete="off"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setOpen(true);
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
      {open && enabled ? (
        <ul
          id={listId}
          role="listbox"
          style={{
            position: "absolute",
            zIndex: 5,
            left: 0,
            right: 0,
            top: 44,
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
              No matches
            </li>
          ) : (
            results.map((p, i) => (
              <li
                key={`${p.kind}-${p.id}`}
                id={`${listId}-${i}`}
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
                <div style={{ fontSize: 14 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: "var(--linear-color-ink-subtle)" }}>{p.subtitle}</div>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
