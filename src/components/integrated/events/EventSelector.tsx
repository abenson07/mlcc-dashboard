"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useEvents } from "hooks";
import { IconChevronsUpDown } from "@/components/leaflet/icons";

export default function EventSelector({ eventId }: { eventId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { events } = useEvents();

  const current = events.find((e) => e.id === eventId) ?? {
    id: eventId,
    title: "Event",
    status: "",
    distributionLabel: "",
    monthLabel: "",
    date: "",
    day: 0,
    month: "",
    location: "",
    daysUntil: 0,
    kind: "council" as const,
  };

  const { upcoming, others } = useMemo(() => {
    const council = events
      .filter((e) => e.kind === "council" && e.status.toLowerCase() !== "completed")
      .sort((a, b) => a.date.localeCompare(b.date));

    const upcomingEvents = council.filter((e) => e.id !== eventId);
    const currentIsUpcoming = council.some((e) => e.id === eventId);
    const rest = events
      .filter((e) => {
        if (e.id === eventId) return false;
        if (council.some((c) => c.id === e.id)) return false;
        return true;
      })
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      upcoming: currentIsUpcoming ? council.filter((e) => e.id !== eventId) : upcomingEvents,
      others: rest,
    };
  }, [events, eventId]);

  const filteredOthers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return others;
    return others.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.distributionLabel.toLowerCase().includes(q) ||
        e.monthLabel.toLowerCase().includes(q),
    );
  }, [others, search]);

  function navigateToEvent(id: string) {
    const segment = pathname?.split(`/old-admin/events-hub/${eventId}/`)[1] ?? "overview";
    router.push(`/old-admin/events-hub/${id}/${segment}`);
    setOpen(false);
    setSearch("");
  }

  return (
    <div className="lf-selector">
      <button type="button" className="lf-selector-trigger" onClick={() => setOpen((v) => !v)}>
        <span className="lf-selector-title">{current.title}</span>
        <IconChevronsUpDown />
      </button>

      {open && (
        <>
          <div className="lf-selector-backdrop" onClick={() => setOpen(false)} aria-hidden />
          <div className="lf-selector-menu">
            <button type="button" className="lf-selector-item" onClick={() => setOpen(false)}>
              <span className="font-medium">{current.title}</span>
              <span className="text-[var(--lf-text-muted)]">(current)</span>
            </button>
            {upcoming.map((e) => (
              <button
                key={e.id}
                type="button"
                className="lf-selector-item"
                onClick={() => navigateToEvent(e.id)}
              >
                <span className="font-medium">{e.title}</span>
                <span className="text-emerald-600">Upcoming</span>
              </button>
            ))}
            {(upcoming.length > 0 || others.length > 0) && <div className="lf-selector-divider" />}
            <div className="lf-selector-search">
              <input
                type="search"
                placeholder="Search events…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {filteredOthers.map((e) => (
              <button
                key={e.id}
                type="button"
                className="lf-selector-item"
                onClick={() => navigateToEvent(e.id)}
              >
                <span className="font-medium">{e.title}</span>
                <span className="text-[var(--lf-text-muted)]">
                  {e.status} · {e.distributionLabel}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
