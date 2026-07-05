"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useLeaflets } from "hooks";
import { IconPlus, IconSearch } from "@/components/leaflet/icons";
import CreateLeafletModal from "@/components/leaflet/overview/CreateLeafletModal";
import type { LeafletStatus } from "@/components/leaflet/types";
import type { Leaflets } from "@/types/database";

function statusLabel(status: LeafletStatus) {
  if (status === "active") return "Active";
  if (status === "planned") return "Planned";
  if (status === "closed") return "Closed";
  return status;
}

function groupLeafletsByMonth(
  leaflets: Leaflets[],
): [string, Leaflets[]][] {
  const groups = new Map<string, Leaflets[]>();
  for (const leaflet of leaflets) {
    const date = new Date(`${leaflet.distribution_date}T12:00:00`);
    const key = date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    const bucket = groups.get(key);
    if (bucket) bucket.push(leaflet);
    else groups.set(key, [leaflet]);
  }
  return Array.from(groups.entries());
}

export default function LeafletsListPageContent({
  embedded = false,
}: {
  embedded?: boolean;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);

  const { leaflets, loading, error, create } = useLeaflets();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return leaflets.filter((leaflet) => {
      const matchesSearch =
        !q ||
        leaflet.title.toLowerCase().includes(q) ||
        leaflet.distribution_date.includes(q);
      const matchesStatus = status === "all" || leaflet.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [leaflets, search, status]);

  const byMonth = useMemo(() => groupLeafletsByMonth(filtered), [filtered]);

  const leafletOverviewPath = (id: string) =>
    embedded
      ? `/admin/leaflet?leaflet=${id}`
      : `/old-admin/leaflet?leaflet=${id}`;

  async function handleCreate(input: {
    title: string;
    distribution_date: string;
  }) {
    const created = await create(input);
    router.push(leafletOverviewPath(created.id));
  }

  const searchTrimmed = search.trim();
  const showEmptyState = !loading && filtered.length === 0;
  const emptyFromFilters =
    leaflets.length > 0 &&
    (searchTrimmed.length > 0 || status !== "all");

  const createAction = (
    <button
      type="button"
      className="lf-btn lf-btn--outline"
      onClick={() => setCreateOpen(true)}
    >
      <IconPlus />
      New leaflet
    </button>
  );

  return (
    <>
      <main className="lf-canvas lf-canvas--white">
        <div className="lf-events-centered">
          <div className="lf-events-list-col">
            <div className="lf-page-header">
              <h1 className="lf-h1">Leaflets</h1>
              {createAction}
            </div>

            {error && <p className="lf-text-red">{error}</p>}

            <div className="lf-filters">
              <label className="lf-search" style={{ flex: 1, maxWidth: 360 }}>
                <IconSearch />
                <input
                  type="search"
                  placeholder="Search leaflets…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </label>
              <select
                className="lf-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="all">Status</option>
                <option value="planned">Planned</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {loading && <p className="lf-meta">Loading leaflets…</p>}

            {showEmptyState && (
              <div className="lf-events-empty-box">
                <h2 className="lf-h2">
                  {emptyFromFilters ? "No matching leaflets" : "No leaflets yet"}
                </h2>
                <p className="lf-meta">
                  {emptyFromFilters
                    ? searchTrimmed
                      ? `Nothing matched “${searchTrimmed}”. Create a new leaflet with that name?`
                      : "Try clearing filters, or create a new leaflet."
                    : "Schedule your first leaflet to unlock routes, deliverers, and sponsorship tools."}
                </p>
                <button
                  type="button"
                  className="lf-btn lf-btn--outline"
                  onClick={() => setCreateOpen(true)}
                >
                  <IconPlus />
                  Create a leaflet
                </button>
              </div>
            )}

            {byMonth.map(([month, monthLeaflets]) => (
              <section key={month}>
                <p className="lf-event-month-label">{month}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {monthLeaflets.map((leaflet) => {
                    const date = new Date(`${leaflet.distribution_date}T12:00:00`);
                    return (
                      <Link
                        key={leaflet.id}
                        href={leafletOverviewPath(leaflet.id)}
                        className="lf-event-row"
                      >
                        <div className="lf-event-date-col">
                          <strong>{date.getDate()}</strong>
                          <span>
                            {date.toLocaleDateString("en-US", { month: "short" })}
                          </span>
                        </div>
                        <div className="lf-event-row-body">
                          <div className="lf-event-row-title">
                            {leaflet.title}
                            <span className="lf-event-status-tag">
                              {statusLabel(leaflet.status as LeafletStatus)}
                            </span>
                          </div>
                          <p className="lf-meta">
                            Distribution{" "}
                            {date.toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>

      <CreateLeafletModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreate}
      />
    </>
  );
}
