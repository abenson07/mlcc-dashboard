"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IconPlus, IconSearch } from "@/components/leaflet/icons";
import { useLeaflets, useStories } from "hooks";
import { getCurrentPersonId } from "@/lib/people/currentPerson";
import StoryDetailPanel from "./StoryDetailPanel";

export default function StoriesPageContent() {
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

  const { stories, loading, error, create } = useStories({
    filters: { search: debouncedSearch || undefined },
  });
  const { leaflets } = useLeaflets();

  const selectedFromUrl = searchParams.get("selected");

  useEffect(() => {
    if (selectedFromUrl && stories.some((s) => s.id === selectedFromUrl)) {
      setSelectedId(selectedFromUrl);
      return;
    }
    if (selectedFromUrl && !stories.some((s) => s.id === selectedFromUrl)) {
      setSelectedId(null);
    }
  }, [stories, selectedFromUrl]);

  const selected = useMemo(
    () => (selectedId ? (stories.find((s) => s.id === selectedId) ?? null) : null),
    [stories, selectedId],
  );

  const leafletTitleById = useMemo(() => {
    const map = new Map<string, string>();
    for (const leaflet of leaflets) map.set(leaflet.id, leaflet.title);
    return map;
  }, [leaflets]);

  const buildPath = useCallback((params: URLSearchParams) => {
    const query = params.toString();
    return query ? `/admin/stories?${query}` : "/admin/stories";
  }, []);

  function selectStory(id: string) {
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

  async function handleNewStory() {
    setCreating(true);
    try {
      const authorId = await getCurrentPersonId();
      const newStory = await create({
        title: "",
        author_id: authorId,
        publish_date: new Date().toISOString().slice(0, 10),
      });
      if (newStory) selectStory(newStory.id);
    } finally {
      setCreating(false);
    }
  }

  return (
    <main className="lf-canvas lf-canvas--white lf-faqs-layout">
      <div className="lf-faqs-list">
        <div className="lf-page-header">
          <h1 className="lf-h1">Stories</h1>
        </div>
        <button
          type="button"
          className="lf-btn lf-btn--accent"
          style={{ width: "100%", justifyContent: "center" }}
          disabled={creating}
          onClick={() => void handleNewStory()}
        >
          <IconPlus />
          {creating ? "Creating…" : "New story"}
        </button>
        <label className="lf-search" style={{ width: "100%" }}>
          <IconSearch />
          <input
            type="search"
            placeholder="Search stories…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>

        {error ? (
          <p className="lf-meta">{error}</p>
        ) : loading ? (
          <p className="lf-meta">Loading…</p>
        ) : stories.length === 0 ? (
          <p className="lf-meta">No stories found.</p>
        ) : (
          <nav className="lf-faqs-nav" aria-label="Story list">
            {stories.map((story) => (
              <button
                key={story.id}
                type="button"
                className={
                  selectedId === story.id
                    ? "lf-faqs-nav-item lf-faqs-nav-item--active"
                    : "lf-faqs-nav-item"
                }
                onClick={() => selectStory(story.id)}
              >
                {story.title || "Untitled story"}
                <small>
                  {story.status === "published" ? "Published" : "Draft"}
                  {story.leaflet_id ? ` · ${leafletTitleById.get(story.leaflet_id) ?? "Leaflet"}` : ""}
                </small>
              </button>
            ))}
          </nav>
        )}
      </div>

      <div className="lf-faqs-detail">
        {selected ? (
          <StoryDetailPanel key={selected.id} story={selected} onClose={clearSelection} onDeleted={clearSelection} />
        ) : (
          <p className="lf-meta">Select a story to view or edit it.</p>
        )}
      </div>
    </main>
  );
}
