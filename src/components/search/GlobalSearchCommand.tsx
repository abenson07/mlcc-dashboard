"use client";

import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useGlobalSearch } from "@/hooks/useGlobalSearch";
import { INTEGRATED_PAGE_INDEX } from "@/lib/search/pageIndex";
import {
  SEARCH_SECTION_LABELS,
  SEARCH_SECTION_ORDER,
  type SearchResult,
  type SearchSection,
} from "@/lib/search/types";
import { useGlobalSearchContext } from "./GlobalSearchProvider";
import "./global-search.css";

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z"
        fill="currentColor"
      />
    </svg>
  );
}

function quickLinkResults(): SearchResult[] {
  return INTEGRATED_PAGE_INDEX.slice(0, 8).map((page) => ({
    id: page.id,
    section: "pages",
    title: page.label,
    href: page.href,
  }));
}

export default function GlobalSearchCommand() {
  const router = useRouter();
  const { isOpen, close } = useGlobalSearchContext();
  const [query, setQuery] = useState("");
  const trimmed = query.trim();
  const { data, isFetching, error } = useGlobalSearch(trimmed, isOpen);

  useEffect(() => {
    if (!isOpen) setQuery("");
  }, [isOpen]);

  const navigate = useCallback(
    (href: string) => {
      close();
      router.push(href);
    },
    [close, router],
  );

  const sections = useMemo(() => {
    if (!trimmed) {
      return { pages: quickLinkResults() } as Partial<Record<SearchSection, SearchResult[]>>;
    }
    return data?.sections ?? {};
  }, [trimmed, data?.sections]);

  const hasResults = SEARCH_SECTION_ORDER.some((section) => (sections[section]?.length ?? 0) > 0);

  return (
    <Command.Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) close();
      }}
      label="Global search"
      className="gs-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="gs-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="gs-input-wrap">
          <SearchIcon />
          <Command.Input
            className="gs-input"
            placeholder="Search pages, events, people, routes…"
            value={query}
            onValueChange={setQuery}
          />
          <span className="gs-kbd">Esc</span>
        </div>

        <Command.List className="gs-list">
          {isFetching && trimmed ? (
            <div className="gs-loading">Searching…</div>
          ) : null}

          {error ? (
            <div className="gs-empty">{error instanceof Error ? error.message : "Search failed"}</div>
          ) : null}

          {!isFetching && !error && !hasResults ? (
            <Command.Empty className="gs-empty">
              {trimmed ? "No results found." : "No quick links available."}
            </Command.Empty>
          ) : null}

          {SEARCH_SECTION_ORDER.map((section) => {
            const items = sections[section];
            if (!items?.length) return null;
            return (
              <Command.Group
                key={section}
                heading={SEARCH_SECTION_LABELS[section]}
                className="gs-group"
              >
                {items.map((item) => (
                  <Command.Item
                    key={`${section}-${item.id}`}
                    value={`${item.title} ${item.subtitle ?? ""} ${section}`}
                    className="gs-item"
                    onSelect={() => navigate(item.href)}
                  >
                    <div className="gs-item-main">
                      <div className="gs-item-title">{item.title}</div>
                      {item.subtitle ? (
                        <div className="gs-item-subtitle">{item.subtitle}</div>
                      ) : null}
                    </div>
                  </Command.Item>
                ))}
              </Command.Group>
            );
          })}
        </Command.List>

        <div className="gs-footer">
          <span>
            <kbd>↑</kbd> <kbd>↓</kbd> navigate
          </span>
          <span>
            <kbd>↵</kbd> open
          </span>
          <span>
            <kbd>esc</kbd> close
          </span>
        </div>
      </div>
    </Command.Dialog>
  );
}
