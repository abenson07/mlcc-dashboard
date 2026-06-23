"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { getApiBase } from "@/lib/apiBase";

type PlaceSuggest = {
  placeId: string;
  mainText: string;
  secondaryText: string;
};

type LocationPlaceFieldProps = {
  value: string;
  onChange: (address: string) => void;
  placeholder?: string;
  disabled?: boolean;
};

function useDebouncedCallback<T extends unknown[]>(
  fn: (...args: T) => void,
  delay: number,
) {
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  return useCallback(
    (...args: T) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => fnRef.current(...args), delay);
    },
    [delay],
  );
}

export default function LocationPlaceField({
  value,
  onChange,
  placeholder = "Search for an address…",
  disabled = false,
}: LocationPlaceFieldProps) {
  const listId = useId();
  const sessionTokenRef = useRef(crypto.randomUUID());
  const [placeQuery, setPlaceQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<PlaceSuggest[]>([]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync from parent when loaded externally (e.g. opening meeting details).
  useEffect(() => {
    setPlaceQuery(value);
  }, [value]);

  const runAutocomplete = useDebouncedCallback(async (q: string) => {
    if (!q.trim()) {
      setSuggestions([]);
      setOpen(false);
      setError(null);
      return;
    }
    try {
      const res = await fetch(`${getApiBase()}/api/places/autocomplete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: q,
          sessionToken: sessionTokenRef.current,
        }),
      });
      const json = (await res.json()) as {
        error?: string;
        suggestions?: PlaceSuggest[];
      };
      if (!res.ok) throw new Error(json.error || "Autocomplete failed");
      setSuggestions(json.suggestions ?? []);
      setOpen((json.suggestions ?? []).length > 0);
      setError(null);
    } catch (e) {
      console.error("[LocationPlaceField]", e);
      setSuggestions([]);
      setOpen(false);
      setError(e instanceof Error ? e.message : "Address search unavailable");
    }
  }, 300);

  useEffect(() => {
    runAutocomplete(placeQuery);
  }, [placeQuery, runAutocomplete]);

  async function pickSuggestion(s: PlaceSuggest) {
    try {
      const res = await fetch(`${getApiBase()}/api/places/details`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          placeId: s.placeId,
          sessionToken: sessionTokenRef.current,
        }),
      });
      const json = (await res.json()) as {
        error?: string;
        place?: { displayName: string; formattedAddress: string };
      };
      if (!res.ok) throw new Error(json.error || "Place details failed");
      const p = json.place;
      const label = p?.formattedAddress || p?.displayName || s.mainText;
      onChange(label);
      setPlaceQuery(label);
      setSuggestions([]);
      setOpen(false);
      setError(null);
      sessionTokenRef.current = crypto.randomUUID();
    } catch (e) {
      console.error("[LocationPlaceField]", e);
      onChange(s.mainText);
      setPlaceQuery(s.mainText);
      setOpen(false);
    }
  }

  return (
    <div className="lf-place-field">
      <input
        type="search"
        className="lf-input"
        value={placeQuery}
        disabled={disabled}
        placeholder={placeholder}
        aria-autocomplete="list"
        aria-controls={listId}
        aria-expanded={open}
        onChange={(e) => setPlaceQuery(e.target.value)}
        onFocus={() => {
          if (suggestions.length > 0) setOpen(true);
        }}
        onBlur={() => {
          setTimeout(() => {
            setOpen(false);
            // Allow free-text entry if user didn't pick a suggestion.
            if (placeQuery.trim() && placeQuery.trim() !== value.trim()) {
              onChange(placeQuery.trim());
            }
          }, 150);
        }}
      />
      {open && suggestions.length > 0 && (
        <ul className="lf-place-suggestions" id={listId} role="listbox">
          {suggestions.map((s) => (
            <li key={s.placeId}>
              <button
                type="button"
                className="lf-mention-item"
                role="option"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => void pickSuggestion(s)}
              >
                <strong>{s.mainText}</strong>
                {s.secondaryText ? (
                  <span className="lf-meta"> · {s.secondaryText}</span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      )}
      {error && !open && placeQuery.trim().length > 0 && (
        <p className="lf-meta lf-text-red" style={{ marginTop: 6 }}>{error}</p>
      )}
    </div>
  );
}
