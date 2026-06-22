"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { IconPlus, IconSearch } from "@/components/leaflet/icons";
import IntegratedTopbar from "../IntegratedTopbar";
import { MOCK_EVENTS } from "../mockData";

const CALENDAR_DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

export default function EventsListPageContent() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const filtered = useMemo(() => {
    return MOCK_EVENTS.filter((e) => {
      const q = search.trim().toLowerCase();
      const matchesSearch = !q || e.title.toLowerCase().includes(q);
      const matchesStatus = status === "all" || e.status.toLowerCase() === status;
      return matchesSearch && matchesStatus;
    });
  }, [search, status]);

  const byMonth = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const event of filtered) {
      const list = map.get(event.monthLabel) ?? [];
      list.push(event);
      map.set(event.monthLabel, list);
    }
    return [...map.entries()];
  }, [filtered]);

  return (
    <>
      <IntegratedTopbar
        primaryAction={
          <button type="button" className="lf-btn lf-btn--outline">
            <IconPlus />
            New event
          </button>
        }
      />
      <div className="lf-main">
        <div className="lf-content-col">
          <main className="lf-canvas">
            <div className="lf-events-centered">
              <div className="lf-events-list-col">
                <h1 className="lf-h1">Events</h1>
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
                    <option value="draft">Draft</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                {byMonth.map(([month, events]) => (
                  <section key={month}>
                    <p className="lf-event-month-label">{month}</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {events.map((event) => (
                        <Link
                          key={event.id}
                          href={`/events-hub/${event.id}/overview`}
                          className="lf-event-row"
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
                          <span className="lf-small-btn">Manage</span>
                        </Link>
                      ))}
                    </div>
                  </section>
                ))}
              </div>

              <aside className="lf-event-calendar">
                <div className="lf-event-calendar-header">
                  <button type="button" className="lf-small-btn">‹</button>
                  <span>August 2026</span>
                  <button type="button" className="lf-small-btn">›</button>
                </div>
                <div className="lf-event-calendar-grid">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                    <span key={d} className="lf-event-calendar-dow">{d}</span>
                  ))}
                  {CALENDAR_DAYS.map((day) => (
                    <span
                      key={day}
                      className={day === 31 ? "lf-event-calendar-day lf-event-calendar-day--active" : "lf-event-calendar-day"}
                    >
                      {day}
                    </span>
                  ))}
                </div>
              </aside>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
