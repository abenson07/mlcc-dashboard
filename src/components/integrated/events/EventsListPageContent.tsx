"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useEvents, createCommitteeMeetingApi, EVENTS_QUERY_KEY } from "hooks";
import { useQueryClient } from "@tanstack/react-query";
import { eventsOnCalendarDay, groupEventsByMonth } from "@/lib/events/eventData";
import { IconPlus, IconSearch } from "@/components/leaflet/icons";
import IntegratedTopbar from "../IntegratedTopbar";
import CreateEventModal from "./CreateEventModal";
import CreateCommitteeMeetingModal from "./CreateCommitteeMeetingModal";
import EventsListSidebar from "./EventsListSidebar";

function calendarCells(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

export default function EventsListPageContent({ embedded = false }: { embedded?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const highlightedEventId = searchParams.get("event");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [committeeCreateOpen, setCommitteeCreateOpen] = useState(false);
  const [createInitialName, setCreateInitialName] = useState("");
  const queryClient = useQueryClient();

  const { events, loading, error, create } = useEvents();

  const filtered = useMemo(() => {
    return events.filter((e) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        e.title.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q);
      const matchesStatus = status === "all" || e.status.toLowerCase() === status;
      const matchesHighlight = !highlightedEventId || e.id === highlightedEventId;
      const y = calendarMonth.getFullYear();
      const m = calendarMonth.getMonth();
      const matchesDay =
        selectedDay == null ||
        eventsOnCalendarDay([e], y, m, selectedDay).length > 0;
      return matchesSearch && matchesStatus && matchesHighlight && matchesDay;
    });
  }, [events, search, status, highlightedEventId, calendarMonth, selectedDay]);

  const byMonth = useMemo(() => groupEventsByMonth(filtered), [filtered]);

  const calYear = calendarMonth.getFullYear();
  const calMonthIndex = calendarMonth.getMonth();
  const monthLabel = calendarMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const cells = calendarCells(calYear, calMonthIndex);

  function shiftMonth(delta: number) {
    setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
    setSelectedDay(null);
  }

  const eventsListPath = embedded ? "/admin/shell-preview/events" : "/admin/events";
  const eventOverviewPath = (id: string) =>
    embedded ? `/admin/shell-preview/events/${id}/overview` : `/admin/events-hub/${id}/overview`;

  async function handleCreate(input: Parameters<typeof create>[0]) {
    const event = await create(input);
    router.push(eventOverviewPath(event.id));
  }

  async function handleCreateCommitteeMeeting(
    input: Parameters<typeof createCommitteeMeetingApi>[0],
  ) {
    const { event } = await createCommitteeMeetingApi(input);
    await queryClient.invalidateQueries({ queryKey: EVENTS_QUERY_KEY });
    router.push(eventOverviewPath(event.id));
  }

  function openCreateModal(prefillName = "") {
    setCreateInitialName(prefillName);
    setCreateOpen(true);
  }

  const searchTrimmed = search.trim();
  const showEmptyState = !loading && filtered.length === 0;
  const emptyFromFilters =
    events.length > 0 &&
    (searchTrimmed.length > 0 || status !== "all" || selectedDay != null);

  const createActions = (
    <div style={{ display: "flex", gap: 8 }}>
      <button
        type="button"
        className="lf-btn lf-btn--ghost"
        onClick={() => setCommitteeCreateOpen(true)}
      >
        Committee meeting
      </button>
      <button type="button" className="lf-btn lf-btn--outline" onClick={() => openCreateModal()}>
        <IconPlus />
        New event
      </button>
    </div>
  );

  const main = (
    <main className="lf-canvas lf-canvas--white">
      <div className="lf-events-centered">
        <div className="lf-events-list-col">
          <div className="lf-page-header">
            <h1 className="lf-h1">Events</h1>
            {embedded ? createActions : null}
          </div>
          {error && <p className="lf-text-red">{error}</p>}
                <div className="lf-filters">
                  <label className="lf-search" style={{ flex: 1, maxWidth: 360 }}>
                    <IconSearch />
                    <input
                      type="search"
                      placeholder="Search events…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </label>
                  <select className="lf-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="all">Status</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="planning">Planning</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                {loading && <p className="lf-meta">Loading events…</p>}
                {showEmptyState && (
                  <div className="lf-events-empty-box">
                    <h2 className="lf-h2">
                      {emptyFromFilters ? "No matching events" : "No events yet"}
                    </h2>
                    <p className="lf-meta">
                      {emptyFromFilters
                        ? searchTrimmed
                          ? `Nothing matched “${searchTrimmed}”. Create a new event with that name?`
                          : "Try clearing filters, or create a new event."
                        : "Schedule your first council event to unlock overview, volunteers, and sponsorship tools."}
                    </p>
                    <button
                      type="button"
                      className="lf-btn lf-btn--outline"
                      onClick={() => openCreateModal(searchTrimmed)}
                    >
                      <IconPlus />
                      Make an event now
                    </button>
                  </div>
                )}

                {byMonth.map(([month, monthEvents]) => (
                  <section key={month}>
                    <p className="lf-event-month-label">{month}</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {monthEvents.map((event) => {
                        const rowClassName =
                          highlightedEventId === event.id
                            ? "lf-event-row lf-event-row--active"
                            : "lf-event-row";

                        if (event.kind === "council" || event.kind === "committee_meeting") {
                          return (
                            <Link
                              key={event.id}
                              href={eventOverviewPath(event.id)}
                              className={rowClassName}
                            >
                              <div className="lf-event-date-col">
                                <strong>{event.day}</strong>
                                <span>{event.month}</span>
                              </div>
                              <div className="lf-event-row-body">
                                <div className="lf-event-row-title">
                                  {event.title}
                                  {event.kind === "committee_meeting" && (
                                    <span className="lf-committee-badge">Meeting</span>
                                  )}
                                  <span className="lf-event-status-tag">{event.status}</span>
                                </div>
                                <p className="lf-meta">{event.location}</p>
                              </div>
                            </Link>
                          );
                        }

                        return (
                          <Link
                            key={event.id}
                            href={`${eventsListPath}?event=${event.id}`}
                            className={rowClassName}
                          >
                            <div className="lf-event-date-col">
                              <strong>{event.day}</strong>
                              <span>{event.month}</span>
                            </div>
                            <div className="lf-event-row-body">
                              <div className="lf-event-row-title">
                                {event.title}
                                <span className="lf-event-status-tag">{event.status}</span>
                              </div>
                              <p className="lf-meta">{event.location}</p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>

              <aside className="lf-event-calendar">
                <div className="lf-event-calendar-header">
                  <button type="button" className="lf-small-btn" onClick={() => shiftMonth(-1)}>
                    ‹
                  </button>
                  <span>{monthLabel}</span>
                  <button type="button" className="lf-small-btn" onClick={() => shiftMonth(1)}>
                    ›
                  </button>
                </div>
                <div className="lf-event-calendar-grid">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                    <span key={d} className="lf-event-calendar-dow">{d}</span>
                  ))}
                  {cells.map((day, i) => {
                    if (day == null) {
                      return <span key={`empty-${i}`} className="lf-event-calendar-day" />;
                    }
                    const hasEvent = eventsOnCalendarDay(events, calYear, calMonthIndex, day).length > 0;
                    const isSelected = selectedDay === day;
                    const className = [
                      "lf-event-calendar-day",
                      hasEvent ? "lf-event-calendar-day--has-event" : "",
                      isSelected ? "lf-event-calendar-day--active" : "",
                    ]
                      .filter(Boolean)
                      .join(" ");
                    return (
                      <button
                        key={day}
                        type="button"
                        className={className}
                        onClick={() => setSelectedDay(isSelected ? null : day)}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </aside>
            </div>
          </main>
  );

  const modals = (
    <>
      <CreateEventModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreate}
        initialName={createInitialName}
      />
      <CreateCommitteeMeetingModal
        isOpen={committeeCreateOpen}
        onClose={() => setCommitteeCreateOpen(false)}
        onCreate={handleCreateCommitteeMeeting}
      />
    </>
  );

  if (embedded) {
    return (
      <>
        {main}
        {modals}
      </>
    );
  }

  return (
    <>
      <IntegratedTopbar primaryAction={createActions} />
      <div className="lf-main">
        <div className="lf-sidebar-col">
          <EventsListSidebar />
        </div>
        <div className="lf-content-col">{main}</div>
      </div>
      {modals}
    </>
  );
}
