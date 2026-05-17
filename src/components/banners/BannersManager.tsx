"use client";

import FilterPills from "@/components/common/FilterPills";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { getApiBase } from "@/lib/apiBase";
import {
  classifyBannerTimeframe,
  defaultExpiresAtIso,
  type BannerTimeframe,
} from "@/lib/webflow/banner-helpers";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
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

export type BannersManagerHandle = {
  openCreate: () => void;
};

const thClass =
  "px-4 py-3 text-left text-xs font-medium whitespace-nowrap text-gray-500 dark:text-gray-400";

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

const BannersManager = forwardRef<BannersManagerHandle>(function BannersManager(
  _props,
  ref,
) {
  const [banners, setBanners] = useState<BannerRow[]>([]);
  const [loading, setLoading] = useState(true);
  /** Set when GET /api/banners returns 503 — missing server env vars */
  const [missingEnv, setMissingEnv] = useState<string[] | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [timeframe, setTimeframe] = useState<BannerTimeframe>("current");
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pendingConflict, setPendingConflict] = useState<{
    payload: Record<string, unknown>;
    mode: "create" | "edit";
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const base = getApiBase();
      const res = await fetch(`${base}/api/banners?showArchived=1`, {
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

  const openCreate = useCallback(() => {
    setEditingId(null);
    setCreating(true);
    setForm({
      ...emptyForm,
      expiresAt: toDatetimeLocalValue(defaultExpiresAtIso(Date.now())),
    });
  }, []);

  useImperativeHandle(ref, () => ({ openCreate }), [openCreate]);

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
    setSaving(true);
    try {
      await submit(buildBodyFromForm());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function onConfirmReplaceUrgent() {
    if (!pendingConflict) return;
    setSaving(true);
    try {
      await submit(pendingConflict.payload, { confirmReplaceUrgent: true });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const filteredBanners = useMemo(
    () => banners.filter((b) => classifyBannerTimeframe(b) === timeframe),
    [banners, timeframe],
  );

  const formOpen = creating || editingId != null;

  const emptyLabel =
    timeframe === "current"
      ? "No banners are live right now."
      : timeframe === "upcoming"
        ? "No upcoming banners."
        : "No past banners.";

  return (
    <>
      {missingEnv && missingEnv.length > 0 ? (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100">
          <p className="font-medium">Server environment is incomplete.</p>
          <p className="mt-2">
            Set these variables where the Next.js server runs, then restart or
            redeploy:{" "}
            <span className="font-mono text-xs">{missingEnv.join(", ")}</span>
          </p>
        </div>
      ) : null}

      <div className="pt-4">
        <FilterPills<BannerTimeframe>
          aria-label="Banner timeframe"
          value={timeframe}
          onChange={setTimeframe}
          pills={[
            { value: "current", label: "Current" },
            { value: "upcoming", label: "Upcoming" },
            { value: "past", label: "Past" },
          ]}
        />
      </div>

      <div className="overflow-x-auto rounded-b-xl pt-4">
        <table className="min-w-full border-collapse border-t border-gray-100 dark:border-gray-800">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800">
              <th className={thClass}>Name</th>
              <th className={thClass}>Status</th>
              <th className={thClass}>Expires</th>
              <th className={thClass}>Urgent</th>
              <th className={`${thClass} text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  Loading banners…
                </td>
              </tr>
            ) : filteredBanners.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  {emptyLabel}
                </td>
              </tr>
            ) : (
              filteredBanners.map((b) => (
                <tr
                  key={b.id}
                  className="border-b border-gray-100 last:border-0 dark:border-gray-800"
                >
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white/90">
                    {b.name}
                  </td>
                  <td className="px-4 py-3">
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
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {b.expiresAt ? new Date(b.expiresAt).toLocaleString() : "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {b.urgent ? "Yes" : "No"}
                  </td>
                  <td className="px-4 py-3 text-end">
                    <button
                      type="button"
                      onClick={() => openEdit(b)}
                      className="text-sm font-medium text-brand-500 hover:text-brand-600"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={formOpen}
        onClose={closeForm}
        className="max-h-[min(90vh,900px)] max-w-[640px] overflow-y-auto p-5 lg:p-8"
      >
        <h4 className="mb-6 pr-10 text-lg font-medium text-gray-800 dark:text-white/90">
          {editingId ? "Edit banner" : "New banner"}
        </h4>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void onSave();
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
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
                id="banner-active"
                type="checkbox"
                checked={form.active}
                onChange={(e) =>
                  setForm((f) => ({ ...f, active: e.target.checked }))
                }
              />
              <label htmlFor="banner-active" className="text-sm text-gray-700 dark:text-gray-300">
                Active on site
              </label>
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <input
                id="banner-urgent"
                type="checkbox"
                checked={form.urgent}
                onChange={(e) =>
                  setForm((f) => ({ ...f, urgent: e.target.checked }))
                }
              />
              <label htmlFor="banner-urgent" className="text-sm text-gray-700 dark:text-gray-300">
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
            <div className="sm:col-span-2 mt-2 flex justify-end gap-3">
              <Button size="sm" type="button" variant="outline" onClick={closeForm}>
                Cancel
              </Button>
              <Button size="sm" type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
});

export default BannersManager;
