"use client";

import ComponentCard from "@/components/common/ComponentCard";
import Badge from "@/components/ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getApiBase } from "@/lib/apiBase";
import { defaultExpiresAtIso } from "@/lib/webflow/banner-helpers";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export type BannerRow = {
  id: string;
  name: string;
  slug: string;
  message: string;
  linkUrl: string;
  active: boolean;
  expiresAt: string | null;
  urgent: boolean;
  urgentUntil: string | null;
  editorNotes: string;
  isArchived: boolean;
  isDraft: boolean;
  derived: {
    isExpired: boolean;
    inUrgentWindow: boolean;
    hiddenByRetention: boolean;
  };
};

function toDatetimeLocalValue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocalValue(v: string): string | null {
  if (!v.trim()) return null;
  const ms = new Date(v).getTime();
  if (!Number.isFinite(ms)) return null;
  return new Date(ms).toISOString();
}

const emptyForm = {
  name: "",
  message: "",
  linkUrl: "",
  active: true,
  expiresAt: "",
  urgent: false,
  urgentUntil: "",
  editorNotes: "",
};

export default function BannersManager() {
  const [banners, setBanners] = useState<BannerRow[]>([]);
  const [loading, setLoading] = useState(true);
  /** Set when GET /api/banners returns 503 — missing server env vars */
  const [missingEnv, setMissingEnv] = useState<string[] | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [creating, setCreating] = useState(false);
  const [pendingConflict, setPendingConflict] = useState<{
    payload: Record<string, unknown>;
    mode: "create" | "edit";
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const base = getApiBase();
      const res = await fetch(`${base}/api/banners`, {
        credentials: "include",
      });
      const data = (await res.json().catch(() => ({}))) as {
        banners?: BannerRow[];
        error?: string;
        missing?: string[];
      };
      if (!res.ok) {
        if (res.status === 503 && Array.isArray(data.missing)) {
          setMissingEnv(data.missing);
          const list = data.missing.join(", ");
          toast.error(
            `Webflow is not configured. Add: ${list}. Restart the dev server after editing .env.local.`
          );
        } else {
          setMissingEnv(null);
          throw new Error(data.error || `Failed to load (${res.status})`);
        }
        setBanners([]);
        return;
      }
      setMissingEnv(null);
      setBanners(data.banners ?? []);
    } catch (e) {
      setMissingEnv(null);
      toast.error(e instanceof Error ? e.message : "Failed to load banners");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function openCreate() {
    setEditingId(null);
    setCreating(true);
    setForm({
      ...emptyForm,
      expiresAt: toDatetimeLocalValue(defaultExpiresAtIso(Date.now())),
    });
  }

  function openEdit(b: BannerRow) {
    setCreating(false);
    setEditingId(b.id);
    setForm({
      name: b.name,
      message: b.message,
      linkUrl: b.linkUrl,
      active: b.active,
      expiresAt: toDatetimeLocalValue(b.expiresAt),
      urgent: b.urgent,
      urgentUntil: toDatetimeLocalValue(b.urgentUntil),
      editorNotes: b.editorNotes,
    });
  }

  function closeForm() {
    setCreating(false);
    setEditingId(null);
    setForm({ ...emptyForm });
    setPendingConflict(null);
  }

  async function submit(
    body: Record<string, unknown>,
    opts?: { confirmReplaceUrgent?: boolean }
  ) {
    const base = getApiBase();
    const payload = { ...body, confirmReplaceUrgent: opts?.confirmReplaceUrgent === true };
    const url =
      editingId == null
        ? `${base}/api/banners`
        : `${base}/api/banners/${encodeURIComponent(editingId)}`;
    const res = await fetch(url, {
      method: editingId == null ? "POST" : "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
      code?: string;
      conflict?: { id: string; name: string };
      missing?: string[];
    };
    if (res.status === 503 && Array.isArray(data.missing)) {
      setMissingEnv(data.missing);
      toast.error(
        `Webflow is not configured. Add: ${data.missing.join(", ")}. Restart the dev server after editing .env.local.`
      );
      return;
    }
    if (res.status === 409 && data.code === "URGENT_CONFLICT") {
      setPendingConflict({
        mode: editingId == null ? "create" : "edit",
        payload: body,
      });
      toast.message(
        `${data.conflict?.name ?? "Another banner"} is already marked urgent.`
      );
      return;
    }
    if (!res.ok) {
      throw new Error(data.error || `Save failed (${res.status})`);
    }
    toast.success(editingId == null ? "Banner created." : "Banner updated.");
    closeForm();
    await load();
  }

  function buildBodyFromForm(): Record<string, unknown> {
    const expiresIso = fromDatetimeLocalValue(form.expiresAt);
    const urgentUntilIso = fromDatetimeLocalValue(form.urgentUntil);
    return {
      name: form.name.trim(),
      message: form.message.trim(),
      linkUrl: form.linkUrl.trim(),
      active: form.active,
      expiresAt: expiresIso,
      urgent: form.urgent,
      urgentUntil: urgentUntilIso,
      editorNotes: form.editorNotes.trim(),
    };
  }

  async function onSave() {
    try {
      await submit(buildBodyFromForm());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    }
  }

  async function onConfirmReplaceUrgent() {
    if (!pendingConflict) return;
    try {
      await submit(pendingConflict.payload, { confirmReplaceUrgent: true });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    }
  }

  return (
    <div className="space-y-6">
      <ComponentCard
        title="Website banners"
        headerLayout="stacked"
        desc={
          missingEnv && missingEnv.length > 0 ? (
            <div className="space-y-2 text-sm text-amber-800 dark:text-amber-200/90">
              <p className="font-medium">Server environment is incomplete.</p>
              <p>
                Set these variables where the Next.js server runs (e.g.{" "}
                <code className="rounded bg-amber-100/80 px-1 dark:bg-amber-900/40">
                  .env.local
                </code>{" "}
                for local dev, or your Webflow Cloud / Vercel env for production),
                then restart the dev server or redeploy:
              </p>
              <ul className="list-inside list-disc font-mono text-xs">
                {missingEnv.map((k) => (
                  <li key={k}>{k}</li>
                ))}
              </ul>
              <p className="text-gray-600 dark:text-gray-400">
                Token: Webflow token with <strong>CMS:read</strong> and{" "}
                <strong>CMS:write</strong> (and <strong>sites:read</strong> for the
                list step). One-time setup from the repo:{" "}
                <code className="rounded bg-gray-100 px-1 dark:bg-white/10">
                  npm run webflow:list-sites
                </code>{" "}
                then{" "}
                <code className="rounded bg-gray-100 px-1 dark:bg-white/10">
                  npm run webflow:setup-banners
                </code>{" "}
                (see <code className="rounded bg-gray-100 px-1 dark:bg-white/10">.env.example</code>).
              </p>
            </div>
          ) : (
          <span>
            Stored in your Webflow &quot;Site banners&quot; CMS collection.
            Times use each editor&apos;s browser local time when you pick a
            date; compare urgent vs expiration on the server in absolute time.
            Banners more than 30 days past expiration are archived in Webflow
            when you save—they stay in the CMS but no longer appear in this list.
          </span>
          )
        }
        action={
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => openCreate()}
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
            >
              New banner
            </button>
          </div>
        }
      >
        {loading ? (
          <p className="px-6 pb-6 text-sm text-gray-500">Loading…</p>
        ) : banners.length === 0 ? (
          <p className="px-6 pb-6 text-sm text-gray-500">
            No banners. Let&apos;s make one.
          </p>
        ) : (
          <div className="overflow-x-auto px-6 pb-6">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                  >
                    Name
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                  >
                    Status
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                  >
                    Expires
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                  >
                    Urgent
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 text-end text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {banners.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="px-5 py-3 font-medium text-gray-800 dark:text-white/90">
                      {b.name}
                    </TableCell>
                    <TableCell className="px-5 py-3">
                      <div className="flex flex-wrap gap-1">
                        {b.active ? (
                          <Badge color="success" size="sm">
                            Active
                          </Badge>
                        ) : (
                          <Badge color="light" size="sm">
                            Inactive
                          </Badge>
                        )}
                        {b.isArchived ? (
                          <Badge color="warning" size="sm">
                            Archived
                          </Badge>
                        ) : null}
                        {b.derived.isExpired ? (
                          <Badge color="error" size="sm">
                            Expired
                          </Badge>
                        ) : null}
                        {b.derived.inUrgentWindow ? (
                          <Badge color="warning" size="sm">
                            Urgent window
                          </Badge>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {b.expiresAt
                        ? new Date(b.expiresAt).toLocaleString()
                        : "—"}
                    </TableCell>
                    <TableCell className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {b.urgent ? "Yes" : "No"}
                    </TableCell>
                    <TableCell className="px-5 py-3 text-end">
                      <button
                        type="button"
                        onClick={() => openEdit(b)}
                        className="text-sm font-medium text-brand-500 hover:text-brand-600"
                      >
                        Edit
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </ComponentCard>

      {(creating || editingId) && (
        <ComponentCard
          title={editingId ? "Edit banner" : "New banner"}
          headerLayout="stacked"
          action={
            <button
              type="button"
              onClick={closeForm}
              className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              Cancel
            </button>
          }
        >
          <div className="grid gap-4 px-6 pb-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Internal name
              </label>
              <input
                className="w-full rounded-lg border border-gray-200 bg-transparent px-3 py-2 text-sm dark:border-gray-800"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Message
              </label>
              <textarea
                rows={3}
                className="w-full rounded-lg border border-gray-200 bg-transparent px-3 py-2 text-sm dark:border-gray-800"
                value={form.message}
                onChange={(e) =>
                  setForm((f) => ({ ...f, message: e.target.value }))
                }
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Link URL (optional)
              </label>
              <input
                className="w-full rounded-lg border border-gray-200 bg-transparent px-3 py-2 text-sm dark:border-gray-800"
                value={form.linkUrl}
                onChange={(e) =>
                  setForm((f) => ({ ...f, linkUrl: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Expiration{" "}
                <span className="font-normal text-gray-500 dark:text-gray-400">
                  (required by Webflow; 30 days from now if left empty on create)
                </span>
              </label>
              <input
                type="datetime-local"
                className="w-full rounded-lg border border-gray-200 bg-transparent px-3 py-2 text-sm dark:border-gray-800"
                value={form.expiresAt}
                onChange={(e) =>
                  setForm((f) => ({ ...f, expiresAt: e.target.value }))
                }
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                id="active"
                type="checkbox"
                checked={form.active}
                onChange={(e) =>
                  setForm((f) => ({ ...f, active: e.target.checked }))
                }
              />
              <label htmlFor="active" className="text-sm text-gray-700 dark:text-gray-300">
                Active on site
              </label>
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <input
                id="urgent"
                type="checkbox"
                checked={form.urgent}
                onChange={(e) =>
                  setForm((f) => ({ ...f, urgent: e.target.checked }))
                }
              />
              <label htmlFor="urgent" className="text-sm text-gray-700 dark:text-gray-300">
                Urgent (only one at a time; the public site should treat urgent
                as overriding other banners until urgent-until passes—even if
                this switch stays on).
              </label>
            </div>
            {form.urgent ? (
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Urgent until (optional — defaults to 14 days or expiration,
                  whichever is sooner)
                </label>
                <input
                  type="datetime-local"
                  className="w-full rounded-lg border border-gray-200 bg-transparent px-3 py-2 text-sm dark:border-gray-800"
                  value={form.urgentUntil}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, urgentUntil: e.target.value }))
                  }
                />
              </div>
            ) : null}
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Editor notes (optional — for other board members)
              </label>
              <textarea
                rows={2}
                className="w-full rounded-lg border border-gray-200 bg-transparent px-3 py-2 text-sm dark:border-gray-800"
                value={form.editorNotes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, editorNotes: e.target.value }))
                }
              />
            </div>
            {pendingConflict ? (
              <div className="sm:col-span-2 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100">
                Another banner is already urgent. Replace it with this one?
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => void onConfirmReplaceUrgent()}
                    className="rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700"
                  >
                    Replace urgent banner
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingConflict(null)}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-600"
                  >
                    Go back
                  </button>
                </div>
              </div>
            ) : null}
            <div className="sm:col-span-2 flex gap-2">
              <button
                type="button"
                onClick={() => void onSave()}
                className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
              >
                Save
              </button>
            </div>
          </div>
        </ComponentCard>
      )}
    </div>
  );
}
