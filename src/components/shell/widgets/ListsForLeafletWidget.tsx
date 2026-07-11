"use client";

import { useCallback, useMemo, useState } from "react";
import { useBusinesses, useEvents } from "hooks";
import { IconCopy } from "@/components/leaflet/icons";
import { toast } from "sonner";
import ShellWidget from "./ShellWidget";

type View = "members" | "events";

const BUSINESS_LIST_CAP = 8;

export default function ListsForLeafletWidget() {
  const [view, setView] = useState<View>("members");
  const [membersExpanded, setMembersExpanded] = useState(false);

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

  const visibleNames = useMemo(
    () => (membersExpanded ? names : names.slice(0, BUSINESS_LIST_CAP)),
    [names, membersExpanded],
  );
  const hiddenNameCount = names.length - visibleNames.length;

  const onCopy = useCallback(async () => {
    if (lines.length === 0) return;
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      toast.success(`Copied ${view === "members" ? "business members" : "upcoming events"}`);
    } catch {
      toast.error("Could not copy to clipboard");
    }
  }, [lines, view]);

  const onCopyEvent = useCallback(async (event: { title: string; date: string }) => {
    try {
      await navigator.clipboard.writeText(formatEventLine(event));
      toast.success(`Copied ${event.title}`);
    } catch {
      toast.error("Could not copy to clipboard");
    }
  }, []);

  return (
    <ShellWidget
      title="Lists for leaflet"
      widgetId="lists-for-leaflet"
      headerAction={
        <button
          type="button"
          className="lf-copy-btn"
          style={{ opacity: 1 }}
          onClick={() => void onCopy()}
          disabled={loading || lines.length === 0}
          aria-label="Copy list"
          title="Copy to clipboard"
        >
          <IconCopy />
        </button>
      }
    >
      {/* Segmented toggle */}
      <div className="shell-widget-segment-row">
        <button
          type="button"
          className={`shell-widget-segment${view === "members" ? " shell-widget-segment--active" : ""}`}
          onClick={() => setView("members")}
        >
          Business List
        </button>
        <button
          type="button"
          className={`shell-widget-segment${view === "events" ? " shell-widget-segment--active" : ""}`}
          onClick={() => setView("events")}
        >
          Upcoming Events
        </button>
      </div>

      {/* List */}
      {loading ? null : view === "members" ? (
        <ul className="shell-widget-list">
          {visibleNames.map((name, i) => (
            <li key={name ?? i} className="shell-widget-list-item">
              {name}
            </li>
          ))}
          {hiddenNameCount > 0 && (
            <li className="shell-widget-list-item">
              <button
                type="button"
                className="shell-widget-list-more"
                onClick={() => setMembersExpanded(true)}
              >
                {hiddenNameCount} more
              </button>
            </li>
          )}
        </ul>
      ) : (
        <ul className="shell-widget-list">
          {displayedEvents.map((event) => (
            <li key={event.id} className="shell-widget-event-row">
              <div className="shell-widget-event-info">
                <span className="shell-widget-event-title">{event.title}</span>
                <span className="shell-widget-event-date">{formatEventDate(event.date)}</span>
              </div>
              <button
                type="button"
                className="shell-widget-event-copy"
                onClick={() => onCopyEvent(event)}
                aria-label={`Copy ${event.title}`}
                title="Copy event"
              >
                <IconCopy />
              </button>
            </li>
          ))}
        </ul>
      )}
    </ShellWidget>
  );
}

function formatEventDate(date: string): string {
  if (!date) return "";
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatEventLine(event: { title: string; date: string }): string {
  const formatted = formatEventDate(event.date);
  return formatted ? `${event.title} — ${formatted}` : event.title;
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