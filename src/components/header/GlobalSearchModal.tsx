"use client";

import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { Modal } from "@/components/ui/modal";

type GlobalSearchModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const QUICK_LINKS: { label: string; href: string }[] = [
  { label: "Neighbors", href: "/old-admin/neighbors" },
  { label: "Volunteers", href: "/old-admin/volunteers" },
  { label: "Routes", href: "/old-admin/routes" },
  { label: "Invoices", href: "/old-admin/sponsorship?view=invoices" },
  { label: "Events", href: "/old-admin/events" },
  { label: "Features dashboard", href: "/old-admin/features/dashboard" },
  { label: "Communications", href: "/old-admin/communications" },
];

const FILTERS = ["All", "Neighbors", "Routes", "Business", "Events", "Features"];

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setActiveFilter("All");
      return;
    }
    const id = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(id);
  }, [isOpen]);

  const q = query.trim().toLowerCase();
  const filtered =
    q === ""
      ? QUICK_LINKS
      : QUICK_LINKS.filter((l) => l.label.toLowerCase().includes(q));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={false}
      className="max-w-xl border-0 bg-mercury-bg p-0 shadow-theme-lg dark:bg-gray-900 sm:m-4"
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-center gap-3 border-b border-brand-400/45 pb-3 dark:border-brand-400/35">
          <svg
            className="shrink-0 fill-mercury-muted dark:fill-white/45"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z"
              fill=""
            />
          </svg>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search or type a destination…"
            className="min-w-0 flex-1 border-0 bg-transparent text-mercury-body text-mercury-ink outline-none placeholder:text-mercury-muted dark:text-white/90 dark:placeholder:text-white/40"
            autoComplete="off"
            aria-label="Search"
          />
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-mercury-muted transition hover:bg-gray-100 hover:text-mercury-ink dark:text-white/50 dark:hover:bg-white/10 dark:hover:text-white/90"
            aria-label="Close search"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="no-scrollbar -mx-1 mt-3 flex gap-1.5 overflow-x-auto px-1 pb-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setActiveFilter(f)}
              className={`shrink-0 rounded-mercury-pill px-3 py-1 text-mercury-caption font-medium transition ${
                activeFilter === f
                  ? "bg-brand-50 text-brand-600 dark:bg-brand-500/12 dark:text-brand-400"
                  : "text-mercury-muted hover:bg-gray-100 dark:text-white/50 dark:hover:bg-white/10"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="mt-4">
          <p className="mb-2 px-1 text-mercury-caption font-medium uppercase tracking-wide text-mercury-muted dark:text-white/45">
            Quick links
          </p>
          <ul className="max-h-[45vh] space-y-0.5 overflow-y-auto" role="listbox">
            {filtered.length === 0 ? (
              <li className="px-3 py-4 text-center text-mercury-caption text-mercury-muted dark:text-white/50">
                No matches
              </li>
            ) : (
              filtered.map((item) => (
                <li key={item.href + item.label}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className="flex items-center justify-between rounded-mercury-button px-3 py-2.5 text-mercury-small text-mercury-ink transition hover:bg-gray-50 dark:text-white/85 dark:hover:bg-white/10"
                  >
                    <span>{item.label}</span>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="text-mercury-muted dark:text-white/40"
                      aria-hidden
                    >
                      <path
                        d="M9 6l6 6-6 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </Modal>
  );
}
