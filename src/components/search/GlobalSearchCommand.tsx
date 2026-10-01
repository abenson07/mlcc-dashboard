"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useGlobalSearch } from "@/hooks/useGlobalSearch";
import { ACTION_INDEX, INTEGRATED_PAGE_INDEX } from "@/lib/search/pageIndex";
import {
  SEARCH_SECTION_LABELS,
  SEARCH_SECTION_ORDER,
  type SearchResult,
  type SearchSection,
} from "@/lib/search/types";
import { useGlobalSearchContext } from "./GlobalSearchProvider";
import "./global-search.css";

function quickLinkResults(): Partial<Record<SearchSection, SearchResult[]>> {
  return {
    actions: ACTION_INDEX.map((a) => ({ id: a.id, section: "actions", title: a.label, href: a.href })),
    pages: INTEGRATED_PAGE_INDEX.slice(0, 8).map((page) => ({
      id: page.id,
      section: "pages",
      title: page.label,
      href: page.href,
    })),
  };
}

export default function GlobalSearchCommand() {
  const router = useRouter();
  const { isOpen, close } = useGlobalSearchContext();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const trimmed = query.trim();
  const { data, isFetching, error } = useGlobalSearch(trimmed, isOpen);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
    else setQuery("");
  }, [isOpen]);

  const sections = useMemo<Partial<Record<SearchSection, SearchResult[]>>>(() => {
    if (!trimmed) return quickLinkResults();
    return data?.sections ?? {};
  }, [trimmed, data?.sections]);

  const flat = useMemo(
    () => SEARCH_SECTION_ORDER.flatMap((section) => sections[section] ?? []),
    [sections],
  );

  useEffect(() => setActive(0), [flat.length, trimmed]);

  useEffect(() => {
    if (!isOpen) return;
    document.querySelector(`[data-gs-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active, isOpen]);

  if (!isOpen) return null;

  function go(item: SearchResult | undefined) {
    if (!item) return;
    close();
    router.push(item.href);
  }

  let index = -1;

  return (
    <div
      className="gs-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        className="gs-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Global search"
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault();
            close();
          } else if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((i) => Math.min(i + 1, Math.max(flat.length - 1, 0)));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((i) => Math.max(i - 1, 0));
          } else if (e.key === "Enter") {
            e.preventDefault();
            go(flat[active]);
          }
        }}
      >
        <div className="gs-input-wrap">
          <Search size={18} strokeWidth={1.75} aria-hidden />
          <input
            ref={inputRef}
            className="gs-input"
            placeholder="Search pages, events, people, routes…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
          />
          <span className="gs-kbd">Esc</span>
        </div>

        <div className="gs-list">
          {isFetching && trimmed ? <div className="gs-loading">Searching…</div> : null}
          {error ? (
            <div className="gs-empty">{error instanceof Error ? error.message : "Search failed"}</div>
          ) : null}
          {!isFetching && !error && flat.length === 0 ? (
            <div className="gs-empty">{trimmed ? "No results found." : "No quick links available."}</div>
          ) : null}

          {SEARCH_SECTION_ORDER.map((section) => {
            const items = sections[section];
            if (!items?.length) return null;
            return (
              <div key={section}>
                <div className="gs-group-heading">{SEARCH_SECTION_LABELS[section]}</div>
                {items.map((item) => {
                  index += 1;
                  const i = index;
                  return (
                    <div
                      key={`${section}-${item.id}`}
                      className="gs-item"
                      data-gs-index={i}
                      data-selected={i === active}
                      onMouseMove={() => setActive(i)}
                      onClick={() => go(item)}
                    >
                      <div className="gs-item-main">
                        <div className="gs-item-title">{item.title}</div>
                        {item.subtitle ? <div className="gs-item-subtitle">{item.subtitle}</div> : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        <div className="gs-footer">
          <span><kbd>↑</kbd> <kbd>↓</kbd> navigate</span>
          <span><kbd>↵</kbd> open</span>
          <span><kbd>esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
}
