"use client";

import { useMemo, useState } from "react";
import { IconPlus, IconSearch } from "@/components/leaflet/icons";
import IntegratedTopbar from "../IntegratedTopbar";
import SidebarFooterNav from "../SidebarFooterNav";
import { MOCK_STORIES } from "../mockData";

export default function StoriesPageContent() {
  const [selectedId, setSelectedId] = useState(MOCK_STORIES[0].id);
  const [search, setSearch] = useState("");

  const groups = useMemo(() => {
    const q = search.trim().toLowerCase();
    const items = q
      ? MOCK_STORIES.filter((s) => s.title.toLowerCase().includes(q))
      : MOCK_STORIES;
    const map = new Map<string, typeof items>();
    for (const story of items) {
      const list = map.get(story.group) ?? [];
      list.push(story);
      map.set(story.group, list);
    }
    return [...map.entries()];
  }, [search]);

  const selected = MOCK_STORIES.find((s) => s.id === selectedId) ?? MOCK_STORIES[0];

  return (
    <>
      <IntegratedTopbar
        primaryAction={
          <button type="button" className="lf-btn lf-btn--outline">
            New story
          </button>
        }
      />
      <div className="lf-main">
        <div className="lf-sidebar-col">
          <aside className="lf-sidebar">
            <label className="lf-search" style={{ width: "100%" }}>
              <IconSearch />
              <input
                type="search"
                placeholder="Search stories…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
            <button type="button" className="lf-small-btn" style={{ width: "100%", justifyContent: "center" }}>
              <IconPlus />
              New story
            </button>
            <nav className="lf-sidebar-nav" aria-label="Stories sections">
              {groups.map(([group, stories]) => (
                <div key={group}>
                  <p className="lf-nav-section">{group}</p>
                  {stories.map((story) => (
                    <button
                      key={story.id}
                      type="button"
                      className={selectedId === story.id ? "lf-story-nav-item lf-story-nav-item--active" : "lf-story-nav-item"}
                      onClick={() => setSelectedId(story.id)}
                    >
                      {story.title}
                      <small>{story.date}</small>
                    </button>
                  ))}
                </div>
              ))}
              <SidebarFooterNav />
            </nav>
          </aside>
        </div>
        <div className="lf-content-col">
          <main className="lf-canvas lf-canvas--white lf-stories-layout" style={{ display: "block", padding: "28px 32px" }}>
            <h1 className="lf-h1" style={{ marginBottom: 8 }}>{selected.title}</h1>
            <div className="lf-editor-toolbar">
              {["B", "I", "Link", "Quote", "Code", "Image", "•", "1."].map((tool) => (
                <button key={tool} type="button">{tool}</button>
              ))}
            </div>
            <div className="lf-editor-body">{selected.body}</div>
          </main>
        </div>
      </div>
    </>
  );
}
