"use client";

import type { EventItem } from "./api";

export const SITE_PAGES = [
  { path: "/", label: "Home" },
  { path: "/events", label: "Events" },
  { path: "/community-meeting", label: "Community meeting" },
];

const row = (selected: boolean): React.CSSProperties => ({
  all: "unset",
  boxSizing: "border-box",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: 6,
  width: "100%",
  padding: "5px 10px",
  borderRadius: 6,
  fontSize: 13,
  color: "var(--linear-color-ink)",
  background: selected ? "var(--linear-color-hairline)" : "transparent",
  fontWeight: selected ? 600 : 400,
});

const heading: React.CSSProperties = { fontSize: 11, fontWeight: 600, opacity: 0.55, padding: "12px 10px 4px", textTransform: "uppercase", letterSpacing: 0.4 };

/** The L2 menu: the pages of the site. Picking one opens it in the frame. */
export function PageMenu({
  currentPath,
  events,
  eventsError,
  onSelect,
}: {
  currentPath: string;
  events: EventItem[];
  eventsError: string | null;
  onSelect: (path: string) => void;
}) {
  const fmt = (iso?: string) =>
    iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "America/Los_Angeles" }) : "";
  const withSlug = events.filter((e) => e.slug);

  return (
    <nav aria-label="Website pages" style={{ width: 232, flexShrink: 0, height: "100%", overflowY: "auto", padding: 8, boxSizing: "border-box", borderRight: "var(--linear-border-width) solid var(--linear-color-hairline)" }}>
      <div style={{ ...heading, paddingTop: 4 }}>Pages</div>
      {SITE_PAGES.map((p) => (
        <button key={p.path} type="button" style={row(currentPath === p.path)} onClick={() => onSelect(p.path)}>
          {p.label}
        </button>
      ))}
      <div style={heading}>Event pages</div>
      {eventsError && <div style={{ fontSize: 12, color: "#d64545", padding: "0 10px" }}>{eventsError}</div>}
      {withSlug.map((e) => {
        const path = `/events/${e.slug}`;
        return (
          <button key={e.id} type="button" style={row(currentPath === path)} onClick={() => onSelect(path)} title={e.title}>
            <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.title}</span>
            {e.hasDraft && <span aria-label="Unpublished changes" title="Unpublished changes" style={{ width: 6, height: 6, borderRadius: 3, background: "#e5a000", flexShrink: 0 }} />}
            <span style={{ fontSize: 11, opacity: 0.55, flexShrink: 0 }}>{fmt(e.startsAt)}</span>
          </button>
        );
      })}
    </nav>
  );
}
