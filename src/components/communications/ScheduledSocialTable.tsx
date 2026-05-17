"use client";

import FilterPills from "@/components/common/FilterPills";
import ScheduleSocialModal from "@/components/communications/ScheduleSocialModal";
import { serviceLabel } from "@/lib/buffer/services";
import type {
  BufferPostsListResponse,
  BufferSocialPostRow,
} from "@/lib/buffer/types";
import { useModal } from "@/hooks/useModal";
import { getApiBase } from "@/lib/apiBase";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type StatusFilter = "all" | "scheduled" | "sent" | "other";

const thClass =
  "px-4 py-3 text-left text-xs font-medium whitespace-nowrap text-gray-500 dark:text-gray-400";

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function statusLabel(status: string): string {
  const normalized = status.toLowerCase().replace(/_/g, " ");
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function statusBadgeClass(status: string): string {
  const s = status.toLowerCase();
  if (s === "scheduled" || s === "sending") {
    return "bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300";
  }
  if (s === "sent") {
    return "bg-emerald-50 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300";
  }
  if (s === "error" || s === "failed") {
    return "bg-red-50 text-red-800 dark:bg-red-500/15 dark:text-red-300";
  }
  return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
}

function matchesFilter(row: BufferSocialPostRow, filter: StatusFilter): boolean {
  const s = row.status.toLowerCase();
  if (filter === "all") return true;
  if (filter === "scheduled") {
    return s === "scheduled" || s === "sending" || s === "draft";
  }
  if (filter === "sent") return s === "sent";
  return s !== "scheduled" && s !== "sending" && s !== "sent" && s !== "draft";
}

function previewText(text: string): string {
  const t = text.trim();
  if (!t) return "—";
  return t.length > 120 ? `${t.slice(0, 120)}…` : t;
}

function firstImageUrl(row: BufferSocialPostRow): string | null {
  for (const a of row.assets) {
    if (a.url) return a.url;
  }
  return null;
}

export default function ScheduledSocialTable() {
  const { isOpen, openModal, closeModal } = useModal();
  const [data, setData] = useState<BufferPostsListResponse>({
    posts: [],
    queueMax: 10,
    perChannel: [],
    channels: [],
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${getApiBase()}/api/buffer/posts`);
      const json = (await res.json()) as BufferPostsListResponse & {
        error?: string;
      };
      if (!res.ok) {
        throw new Error(json.error || "Could not load social posts.");
      }
      setData({
        posts: json.posts ?? [],
        queueMax: json.queueMax ?? 10,
        perChannel: json.perChannel ?? [],
        channels: json.channels ?? [],
      });
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Could not load social posts.",
      );
      setData({ posts: [], queueMax: 10, perChannel: [], channels: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const visibleRows = useMemo(() => {
    return data.posts.filter((row) => matchesFilter(row, statusFilter));
  }, [data.posts, statusFilter]);

  const cancelPost = async (postId: string) => {
    setCancellingId(postId);
    try {
      const res = await fetch(`${getApiBase()}/api/buffer/posts/${postId}`, {
        method: "DELETE",
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(json.error || "Could not cancel post.");
      }
      toast.success("Post removed from Buffer.");
      void load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not cancel post.");
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
        <FilterPills<StatusFilter>
          aria-label="Post status"
          value={statusFilter}
          onChange={setStatusFilter}
          pills={[
            { value: "all", label: "All" },
            { value: "scheduled", label: "Upcoming" },
            { value: "sent", label: "Sent" },
            { value: "other", label: "Other" },
          ]}
        />
        <button
          type="button"
          onClick={openModal}
          className="inline-flex shrink-0 items-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-mercury-on-accent hover:bg-brand-600 hover:text-white"
        >
            Schedule posts
        </button>
      </div>

      <div className="overflow-x-auto rounded-b-xl pt-4">
          <table className="min-w-full border-collapse border-t border-gray-100 dark:border-gray-800">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className={thClass}>Preview</th>
                <th className={thClass}>Channel</th>
                <th className={thClass}>Scheduled for</th>
                <th className={thClass}>Status</th>
                <th className={thClass}>Created</th>
                <th className={thClass} />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    Loading social posts…
                  </td>
                </tr>
              ) : visibleRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    {data.posts.length === 0
                      ? "No posts yet. Schedule your first Instagram or Facebook post."
                      : "No posts match this filter."}
                  </td>
                </tr>
              ) : (
                visibleRows.map((row) => {
                  const thumb = firstImageUrl(row);
                  const canCancel =
                    row.status.toLowerCase() === "scheduled" ||
                    row.status.toLowerCase() === "draft";
                  return (
                    <tr
                      key={row.id}
                      className="border-b border-gray-100 last:border-0 dark:border-gray-800"
                    >
                      <td className="max-w-xs px-4 py-3 text-sm text-gray-900 dark:text-white/90">
                        <div className="flex items-start gap-3">
                          {thumb ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={thumb}
                              alt=""
                              className="h-12 w-12 shrink-0 rounded object-cover"
                            />
                          ) : (
                            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-gray-100 text-xs text-gray-400 dark:bg-gray-800">
                              —
                            </span>
                          )}
                          <span className="line-clamp-3">
                            {previewText(row.text)}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-medium text-gray-900 dark:text-white/90">
                          {serviceLabel(row.channelService)}
                        </span>
                        <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">
                          {row.channelName}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {formatDateTime(row.dueAt)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeClass(row.status)}`}
                        >
                          {statusLabel(row.status)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {formatDateTime(row.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {canCancel && (
                          <button
                            type="button"
                            disabled={cancellingId === row.id}
                            onClick={() => void cancelPost(row.id)}
                            className="text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50 dark:text-red-400"
                          >
                            {cancellingId === row.id ? "Removing…" : "Cancel"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
      </div>

      <ScheduleSocialModal
        isOpen={isOpen}
        onClose={closeModal}
        onScheduled={() => void load()}
        channels={data.channels}
        perChannel={data.perChannel}
      />
    </>
  );
}
