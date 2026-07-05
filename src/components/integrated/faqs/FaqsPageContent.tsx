"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IconPlus, IconSearch } from "@/components/leaflet/icons";
import { useFaqs } from "hooks";
import FaqDetailPanel from "./FaqDetailPanel";

export default function FaqsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedId, setSelectedId] = useState<string | null>(() => searchParams.get("selected"));
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const { faqs, loading, error, create } = useFaqs({
    filters: { search: debouncedSearch || undefined },
  });

  const selectedFromUrl = searchParams.get("selected");

  useEffect(() => {
    if (selectedFromUrl && faqs.some((f) => f.id === selectedFromUrl)) {
      setSelectedId(selectedFromUrl);
      return;
    }
    if (selectedFromUrl && !faqs.some((f) => f.id === selectedFromUrl)) {
      setSelectedId(null);
    }
  }, [faqs, selectedFromUrl]);

  const selected = useMemo(
    () => (selectedId ? (faqs.find((f) => f.id === selectedId) ?? null) : null),
    [faqs, selectedId],
  );

  const buildPath = useCallback(
    (params: URLSearchParams) => {
      const query = params.toString();
      return query ? `/admin/faqs?${query}` : "/admin/faqs";
    },
    [],
  );

  function selectFaq(id: string) {
    setSelectedId(id);
    const params = new URLSearchParams(searchParams.toString());
    params.set("selected", id);
    router.replace(buildPath(params), { scroll: false });
  }

  function clearSelection() {
    setSelectedId(null);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("selected");
    router.replace(buildPath(params), { scroll: false });
  }

  async function handleNewFaq() {
    setCreating(true);
    try {
      const newFaq = await create({
        question: "New question",
        answer: "",
        sort_order: faqs.length,
      });
      if (newFaq) selectFaq(newFaq.id);
    } finally {
      setCreating(false);
    }
  }

  return (
    <main className="lf-canvas lf-canvas--white lf-faqs-layout">
      <div className="lf-faqs-list">
        <div className="lf-page-header">
          <h1 className="lf-h1">FAQs</h1>
        </div>
        <button
          type="button"
          className="lf-btn lf-btn--accent"
          style={{ width: "100%", justifyContent: "center" }}
          disabled={creating}
          onClick={() => void handleNewFaq()}
        >
          <IconPlus />
          {creating ? "Creating…" : "New FAQ"}
        </button>
        <label className="lf-search" style={{ width: "100%" }}>
          <IconSearch />
          <input
            type="search"
            placeholder="Search FAQs…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>

        {error ? (
          <p className="lf-meta">{error}</p>
        ) : loading ? (
          <p className="lf-meta">Loading…</p>
        ) : faqs.length === 0 ? (
          <p className="lf-meta">No FAQs found.</p>
        ) : (
          <nav className="lf-faqs-nav" aria-label="FAQ list">
            {faqs.map((faq) => (
              <button
                key={faq.id}
                type="button"
                className={
                  selectedId === faq.id
                    ? "lf-faqs-nav-item lf-faqs-nav-item--active"
                    : "lf-faqs-nav-item"
                }
                onClick={() => selectFaq(faq.id)}
              >
                {faq.question}
                <small>
                  {faq.pages.length} page{faq.pages.length === 1 ? "" : "s"}
                </small>
              </button>
            ))}
          </nav>
        )}
      </div>

      <div className="lf-faqs-detail">
        {selected ? (
          <FaqDetailPanel faq={selected} onClose={clearSelection} onDeleted={clearSelection} />
        ) : (
          <p className="lf-meta">Select a FAQ to view or edit it.</p>
        )}
      </div>
    </main>
  );
}
