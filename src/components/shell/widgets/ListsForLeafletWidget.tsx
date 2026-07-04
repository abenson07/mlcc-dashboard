"use client";

import { useCallback, useMemo, useState } from "react";
import { useBusinesses, useEvents } from "hooks";
import { ChevronDown } from "lucide-react";
import { IconCopy } from "@/components/leaflet/icons";
import { toast } from "sonner";
import ShellWidget from "./ShellWidget";

type View = "members" | "events";

export default function ListsForLeafletWidget() {
  const [view, setView] = useState<View>("members");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { businesses, loading: membersLoading } = useBusinesses({
    filters: { isMember: true },
  });
  const { events, loading: eventsLoading } = useEvents();

  const names = useMemo(
    () => businesses.map((b) => b.business_name).filter(Boolean),
    [businesses],
  );

  const displayedEvents = useMemo(() => selectUpcomingEvents(events), [events]);

  const loading = view === "members" ? membersLoading : eventsLoading;

  const lines = useMemo(
    () => (view === "members" ? names : displayedEvents.map(formatEventLine)),
    [view, names, displayedEvents],
  );

  const countLabel = loading
    ? "Loading…"
    : `${lines.length} ${view === "members" ? "member" : "event"}${lines.length === 1 ? "" : "s"}`;

  const onCopy = useCallback(async () => {
    if (lines.length === 0) return;
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      toast.success(`Copied ${view === "members" ? "business members" : "upcoming events"}`);
    } catch {
      toast.error("Could not copy to clipboard");
    }
  }, [lines, view]);

  return (
    <ShellWidget title="Lists for leaflet">
      {/* Dropdown + copy row */}
      <div className="shell-widget-dropdown-row">
        <div className="shell-widget-dropdown-wrap">
          <button
            type="button"
            className="shell-widget-dropdown-trigger"
            onClick={() => setDropdownOpen((o) => !o)}
            onBlur={() => setDropdownOpen(false)}
          >
            <span className="shell-widget-dropdown-label">
              {view === "members" ? "Business Members" : "Upcoming Events"}
            </span>
            <ChevronDown size={12} strokeWidth={1.5} className="shell-widget-dropdown-chevron" />
          </button>
          {dropdownOpen && (
            <div className="shell-widget-dropdown-menu">
              <button
                type="button"
                className={`shell-widget-dropdown-item${view === "members" ? " shell-widget-dropdown-item--active" : ""}`}
                onClick={() => {
                  setView("members");
                  setDropdownOpen(false);
                }}
              >
                Business Members
              </button>
              <button
                type="button"
                className={`shell-widget-dropdown-item${view === "events" ? " shell-widget-dropdown-item--active" : ""}`}
                onClick={() => {
                  setView("events");
                  setDropdownOpen(false);
                }}
              >
                Upcoming Events
              </button>
            </div>
          )}
        </div>
        <button
          type="button"
          className="shell-widget-copy-btn"
          onClick={onCopy}
          disabled={loading || lines.length === 0}
          aria-label="Copy list to clipboard"
          title="Copy list"
        >
          <IconCopy />
        </button>
      </div>

      {/* List */}
      {loading ? null : (
        <ul className="shell-widget-list">
          {lines.map((line, i) => (
            <li key={view === "members" ? names[i] : displayedEvents[i]?.id ?? i} className="shell-widget-list-item">
              {line}
            </li>
          ))}
        </ul>
      )}
    </ShellWidget>
  );
}

function formatEventLine(event: { title: string; date: string }): string {
  if (!event.date) return event.title;
  const formatted = new Date(`${event.date}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${event.title} — ${formatted}`;
}

function selectUpcomingEvents(
  events: { id: string; title: string; date: string }[],
): { id: string; title: string; date: string }[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const threeMonthsLater = new Date(today);
  threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);

  const upcoming = events
    .filter((event) => {
      if (!event.date) return false;
      return new Date(`${event.date}T00:00:00`) >= today;
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  const inThreeMonths = upcoming.filter((event) => {
    return new Date(`${event.date}T00:00:00`) <= threeMonthsLater;
  });

  return inThreeMonths.length >= 5 ? inThreeMonths : upcoming.slice(0, 5);
}