"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Calendar from "@/components/calendar/Calendar";
import { useWebflowEvents } from "hooks";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

function todayIsoLocal(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function readDateKey(fd: Record<string, unknown>, slug: string | null): string | null {
  if (!slug) return null;
  const v = fd[slug];
  if (typeof v !== "string" || !v) return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v.slice(0, 10);
  return d.toISOString().slice(0, 10);
}

export default function EventsHub() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = searchParams.get("view") === "calendar" ? "calendar" : "list";

  const { data, isLoading, error, refetch } = useWebflowEvents();

  const titleSlug = data?.titleFieldSlug ?? "name";
  const calSlug = data?.calendarFieldSlug ?? null;

  const upcoming = useMemo(() => {
    if (!data?.items) return [];
    const t = todayIsoLocal();
    return [...data.items]
      .filter((i) => !i.isArchived)
      .filter((i) => {
        const day = readDateKey(i.fieldData ?? {}, calSlug);
        return day && day >= t;
      })
      .sort((a, b) => {
        const da = readDateKey(a.fieldData ?? {}, calSlug) ?? "";
        const db = readDateKey(b.fieldData ?? {}, calSlug) ?? "";
        return da.localeCompare(db);
      });
  }, [data, calSlug]);

  const setView = (next: "list" | "calendar") => {
    router.replace(next === "calendar" ? "/events?view=calendar" : "/events");
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Events" />
      <div className="mt-2 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div
            className="inline-flex rounded-xl border border-gray-200 p-1 dark:border-gray-700"
            role="tablist"
            aria-label="Events view"
          >
            <button
              type="button"
              role="tab"
              aria-selected={view === "list"}
              onClick={() => setView("list")}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                view === "list"
                  ? "bg-brand-500 text-mercury-on-accent shadow-sm"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              List
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={view === "calendar"}
              onClick={() => setView("calendar")}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                view === "calendar"
                  ? "bg-brand-500 text-mercury-on-accent shadow-sm"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              Calendar
            </button>
          </div>
          <Link
            href="/events/new"
            className="inline-flex rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-mercury-on-accent hover:bg-brand-600 hover:text-white"
          >
            New event
          </Link>
        </div>

        {view === "calendar" ? (
          <Calendar embedded />
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Upcoming events
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                From your Webflow Events CMS. Edit inline on the calendar or open the full
                editor.
              </p>
            </div>
            {error ? (
              <p className="text-sm text-red-600">
                {(error as Error).message}{" "}
                <button type="button" className="underline" onClick={() => refetch()}>
                  Retry
                </button>
              </p>
            ) : null}
            {isLoading ? <p className="text-sm text-gray-500">Loading…</p> : null}
            {!calSlug && !isLoading && data ? (
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Set a DateTime field on the collection, or configure{" "}
                <code className="rounded bg-gray-100 px-1 dark:bg-gray-800">
                  WEBFLOW_EVENT_CALENDAR_FIELD_SLUG
                </code>
                .
              </p>
            ) : null}
            {!isLoading && !upcoming.length && calSlug ? (
              <p className="text-sm text-gray-500">No upcoming events in Webflow.</p>
            ) : null}
            {upcoming.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="py-2 pr-4 font-medium text-gray-700 dark:text-gray-300">
                        Title
                      </th>
                      <th className="py-2 pr-4 font-medium text-gray-700 dark:text-gray-300">
                        Schedule
                      </th>
                      <th className="py-2 pr-4 font-medium text-gray-700 dark:text-gray-300">
                        Status
                      </th>
                      <th className="py-2 font-medium text-gray-700 dark:text-gray-300" />
                    </tr>
                  </thead>
                  <tbody>
                    {upcoming.map((row) => {
                      const fd = row.fieldData ?? {};
                      const title = String(fd[titleSlug] ?? fd.name ?? "—");
                      const when = calSlug ? String(fd[calSlug] ?? "—") : "—";
                      return (
                        <tr
                          key={row.id}
                          className="border-b border-gray-100 dark:border-gray-800"
                        >
                          <td className="py-3 pr-4 text-gray-900 dark:text-white/90">
                            {title}
                          </td>
                          <td className="py-3 pr-4 text-gray-600 dark:text-gray-300">
                            {when}
                          </td>
                          <td className="py-3 pr-4 text-gray-600 dark:text-gray-300">
                            {row.isDraft ? "Draft" : "Live"}
                          </td>
                          <td className="py-3">
                            <Link
                              href={`/events/edit/${encodeURIComponent(row.id)}`}
                              className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
                            >
                              Edit
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
