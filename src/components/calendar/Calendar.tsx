"use client";

import React, { useMemo, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  EventInput,
  DateSelectArg,
  EventClickArg,
  EventContentArg,
} from "@fullcalendar/core";
import { useModal } from "@/hooks/useModal";
import { Modal } from "@/components/ui/modal";
import {
  useWebflowEvents,
  type WebflowCollectionFieldDTO,
  type WebflowOptionChoice,
} from "hooks";
import { webflowItemToEventInput, type WebflowCalendarExtras } from "./eventMapping";
import { slugifyFromEventName } from "@/lib/webflow/slugifyEvent";
import { toast } from "sonner";
import { fromDatetimeLocalValue, toDatetimeLocalValue } from "@/lib/webflow/datetimeLocal";
import {
  plainTextToEventRichTextHtml,
  richTextValueToPlain,
} from "@/lib/webflow/richTextPlain";
import Link from "next/link";
import { getApiBase } from "@/lib/apiBase";

interface CalendarEvent extends EventInput {
  extendedProps: WebflowCalendarExtras;
}

/** Field types we cannot edit in-app (values still pass through on save via baseFieldData). Image fields upload to Webflow assets. */
const NON_EDITABLE_FIELD_TYPES = new Set(
  ["File", "MultiImage", "MultiReference", "Reference", "VideoLink", "ExtFileRef"].map((t) =>
    t.toLowerCase()
  )
);

function fieldType(f: WebflowCollectionFieldDTO): string {
  return f.type.trim();
}

function imageFormUrlKey(slug: string): string {
  return `__wfimg_url__${slug}`;
}

/** Webflow slug for “External Organizer” (optional env, else match display name). */
function resolveExternalOrganizerSlug(fields: WebflowCollectionFieldDTO[]): string | null {
  const fromEnv = process.env.NEXT_PUBLIC_WEBFLOW_EVENT_EXTERNAL_ORGANIZER_SLUG?.trim();
  if (fromEnv) return fromEnv;
  const match = fields.find(
    (f) => f.displayName.trim().toLowerCase() === "external organizer"
  );
  return match?.slug ?? null;
}

function cmsFieldRawLooksEmpty(raw: unknown): boolean {
  if (raw === undefined || raw === null) return true;
  if (typeof raw === "string") return !raw.trim();
  if (typeof raw === "boolean") return false;
  if (typeof raw === "number") return false;
  if (typeof raw === "object" && raw !== null && "id" in raw) {
    const id = (raw as { id?: unknown }).id;
    return id == null || String(id).trim() === "";
  }
  if (typeof raw === "object" && raw !== null && "url" in raw) {
    const url = (raw as { url?: unknown }).url;
    return url == null || String(url).trim() === "";
  }
  return String(raw).trim() === "";
}

/** CMS Option / dropdown choices from Webflow collection field payload. */
function optionChoicesFromField(f: WebflowCollectionFieldDTO): WebflowOptionChoice[] {
  const fromVal = f.validations?.options;
  if (Array.isArray(fromVal) && fromVal.length > 0) {
    return fromVal
      .filter((o) => o != null && typeof o === "object")
      .map((o) => {
        const row = o as Record<string, unknown>;
        return {
          id: typeof row.id === "string" ? row.id : String(row.id ?? ""),
          name:
            typeof row.name === "string" && row.name
              ? row.name
              : typeof row.id === "string"
                ? row.id
                : String(row.id ?? ""),
        };
      })
      .filter((o) => o.id.length > 0);
  }
  const fromMeta = f.metadata?.options;
  if (Array.isArray(fromMeta) && fromMeta.length > 0) {
    return fromMeta
      .filter((o) => o != null && typeof o === "object")
      .map((o) => {
        const row = o as Record<string, unknown>;
        return {
          id: typeof row.id === "string" ? row.id : row.id != null ? String(row.id) : "",
          name: typeof row.name === "string" ? row.name : row.id != null ? String(row.id) : "",
        };
      })
      .filter((o) => o.id.length > 0);
  }
  return [];
}

/** Webflow-only fields we do not show in the dashboard modal (values still pass through on save via baseFieldData). */
function hiddenEventFieldSlugs(): Set<string> {
  const fromEnv = (process.env.NEXT_PUBLIC_WEBFLOW_EVENT_HIDDEN_FIELD_SLUGS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return new Set(["committee-reference", "committee-sponsor", ...fromEnv]);
}

function isHiddenEventField(f: WebflowCollectionFieldDTO): boolean {
  if (NON_EDITABLE_FIELD_TYPES.has(fieldType(f).toLowerCase())) return true;
  if (f.slug.trim().toLowerCase() === "slug") return true;
  if (hiddenEventFieldSlugs().has(f.slug.trim().toLowerCase())) return true;
  const label = f.displayName.trim().toLowerCase();
  if (label === "committee reference" || label === "committee sponsor") return true;
  return false;
}

function initFormFromFieldData(
  fields: WebflowCollectionFieldDTO[],
  fd: Record<string, unknown>
): Record<string, string> {
  const form: Record<string, string> = {};
  for (const f of fields) {
    if (!f.isEditable || isHiddenEventField(f)) continue;
    const raw = fd[f.slug];
    const t = fieldType(f).toLowerCase();
    if (t === "image") {
      if (raw === undefined || raw === null) {
        form[imageFormUrlKey(f.slug)] = "";
        continue;
      }
      if (typeof raw === "object" && raw !== null && "url" in raw) {
        const img = raw as { url?: unknown };
        form[imageFormUrlKey(f.slug)] = img.url != null ? String(img.url) : "";
      } else if (typeof raw === "string") {
        form[imageFormUrlKey(f.slug)] = raw;
      } else {
        form[imageFormUrlKey(f.slug)] = "";
      }
      continue;
    }
    if (t === "option") {
      if (raw === undefined || raw === null) {
        form[f.slug] = "";
      } else if (typeof raw === "object" && raw !== null && "id" in raw) {
        form[f.slug] = String((raw as { id: unknown }).id);
      } else {
        form[f.slug] = String(raw);
      }
      continue;
    }
    if (raw === undefined || raw === null) {
      form[f.slug] = "";
      continue;
    }
    if (f.type === "DateTime") {
      form[f.slug] = toDatetimeLocalValue(raw);
    } else if (f.type === "Switch") {
      form[f.slug] = raw === true || raw === "true" ? "true" : "false";
    } else if (f.type === "RichText") {
      form[f.slug] = richTextValueToPlain(raw);
    } else {
      form[f.slug] = String(raw);
    }
  }
  return form;
}

type EventOrganizerKind = "mlcc" | "non-mlcc";

function buildFieldDataFromForm(
  fields: WebflowCollectionFieldDTO[],
  form: Record<string, string>,
  baseFd: Record<string, unknown>,
  opts?: {
    eventKind?: EventOrganizerKind;
    externalOrganizerSlug?: string | null;
    titleFieldSlug?: string;
  }
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...baseFd };
  for (const f of fields) {
    if (!f.isEditable || isHiddenEventField(f)) continue;
    if (fieldType(f).toLowerCase() === "image") {
      const url = (form[imageFormUrlKey(f.slug)] ?? "").trim();
      if (url) out[f.slug] = { url };
      else out[f.slug] = null;
      continue;
    }
    if (fieldType(f).toLowerCase() === "option") {
      const ov = (form[f.slug] ?? "").trim();
      out[f.slug] = ov ? ov : null;
      continue;
    }
    const v = form[f.slug];
    if (v === undefined) continue;
    switch (f.type) {
      case "Switch":
        out[f.slug] = v === "true" || v === "on";
        break;
      case "Number":
        out[f.slug] = v === "" ? null : Number(v);
        break;
      case "DateTime":
        out[f.slug] = v === "" ? null : fromDatetimeLocalValue(v);
        break;
      case "RichText": {
        const text = (v ?? "").trim();
        out[f.slug] = text ? plainTextToEventRichTextHtml(v) : null;
        break;
      }
      default:
        out[f.slug] = v;
    }
  }
  const extSlug = opts?.externalOrganizerSlug;
  if (opts?.eventKind === "mlcc" && extSlug) {
    const def = fields.find((x) => x.slug === extSlug);
    const ty = def ? fieldType(def).toLowerCase() : "";
    if (ty === "option") out[extSlug] = null;
    else if (ty === "number") out[extSlug] = null;
    else if (ty === "switch") out[extSlug] = false;
    else if (ty === "image") {
      out[extSlug] = null;
    }     else {
      out[extSlug] = "";
    }
  }
  const titleKey = opts?.titleFieldSlug ?? "name";
  const nameForSlug = String((out as Record<string, unknown>).name ?? out[titleKey] ?? "").trim();
  if (nameForSlug) {
    (out as Record<string, unknown>).slug = slugifyFromEventName(nameForSlug);
  }
  return out;
}

function emptyForm(fields: WebflowCollectionFieldDTO[]): Record<string, string> {
  const form: Record<string, string> = {};
  for (const f of fields) {
    if (!f.isEditable || isHiddenEventField(f)) continue;
    if (fieldType(f).toLowerCase() === "image") {
      form[imageFormUrlKey(f.slug)] = "";
      continue;
    }
    if (f.type === "Switch") form[f.slug] = "false";
    else form[f.slug] = "";
  }
  return form;
}

function isFieldVisibleInModal(
  f: WebflowCollectionFieldDTO,
  externalOrganizerSlug: string | null,
  eventOrganizerKind: EventOrganizerKind
): boolean {
  if (!f.isEditable) return false;
  if (isHiddenEventField(f)) return false;
  if (
    externalOrganizerSlug &&
    eventOrganizerKind === "mlcc" &&
    f.slug === externalOrganizerSlug
  ) {
    return false;
  }
  return true;
}

function isFieldValueValid(f: WebflowCollectionFieldDTO, form: Record<string, string>): boolean {
  const ty = fieldType(f).toLowerCase();
  if (ty === "image") {
    const url = (form[imageFormUrlKey(f.slug)] ?? "").trim();
    return /^https?:\/\//i.test(url);
  }
  if (ty === "option") {
    return (form[f.slug] ?? "").trim() !== "";
  }
  if (f.type === "DateTime") {
    return (form[f.slug] ?? "").trim() !== "";
  }
  if (f.type === "Switch") {
    if (!f.isRequired) return true;
    return form[f.slug] === "true";
  }
  if (f.type === "Number") {
    const v = form[f.slug] ?? "";
    if (!v.trim()) return false;
    return !Number.isNaN(Number(v));
  }
  if (f.type === "RichText") {
    return (form[f.slug] ?? "").trim() !== "";
  }
  return (form[f.slug] ?? "").trim() !== "";
}

function fieldShowsError(
  f: WebflowCollectionFieldDTO,
  form: Record<string, string>,
  titleSlug: string,
  externalOrganizerSlug: string | null,
  eventOrganizerKind: EventOrganizerKind
): boolean {
  if (!isFieldVisibleInModal(f, externalOrganizerSlug, eventOrganizerKind)) return false;
  if (f.slug === titleSlug && !String(form[titleSlug] ?? "").trim()) return true;
  if (!f.isRequired) return false;
  return !isFieldValueValid(f, form);
}

function getRequiredFieldMessage(
  f: WebflowCollectionFieldDTO,
  titleSlug: string
): string {
  if (f.slug === titleSlug) return "Enter a name for this event.";
  const ty = fieldType(f).toLowerCase();
  if (ty === "image") return "Upload an image.";
  if (ty === "option") return "Select an option.";
  if (f.type === "DateTime") return "Choose a date and time.";
  if (f.type === "Number") return "Enter a valid number.";
  if (f.type === "RichText") return "This field is required.";
  return "This field is required.";
}

function eventFormIsValid(
  fields: WebflowCollectionFieldDTO[],
  form: Record<string, string>,
  titleSlug: string,
  externalOrganizerSlug: string | null,
  eventOrganizerKind: EventOrganizerKind
): boolean {
  for (const f of fields) {
    if (
      fieldShowsError(f, form, titleSlug, externalOrganizerSlug, eventOrganizerKind)
    ) {
      return false;
    }
  }
  return true;
}

function invalidInputClass(show: boolean): string {
  return show
    ? "border-red-500 ring-1 ring-red-500/25 dark:border-red-500/80"
    : "border-gray-300 dark:border-gray-700";
}

const Calendar: React.FC<{ embedded?: boolean }> = ({ embedded = false }) => {
  const { data, isLoading, error, refetch, invalidate } = useWebflowEvents();
  const calendarRef = useRef<FullCalendar>(null);
  const { isOpen, openModal, closeModal } = useModal();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [baseFieldData, setBaseFieldData] = useState<Record<string, unknown>>({});
  const [eventOrganizerKind, setEventOrganizerKind] = useState<EventOrganizerKind>("mlcc");
  const [uploadingImageSlug, setUploadingImageSlug] = useState<string | null>(null);
  const [imageUploadErrorBySlug, setImageUploadErrorBySlug] = useState<
    Record<string, string | undefined>
  >({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const fields = data?.collection.fields ?? [];
  const externalOrganizerSlug = useMemo(
    () => resolveExternalOrganizerSlug(data?.collection.fields ?? []),
    [data]
  );
  const items = useMemo(
    () => (data?.items ?? []).filter((i) => !i.isArchived),
    [data?.items]
  );
  const titleSlug = data?.titleFieldSlug ?? "name";
  const calendarSlug = data?.calendarFieldSlug ?? null;
  const endFieldSlug = data?.endFieldSlug ?? null;

  const fcEvents = useMemo(
    () =>
      items.map(
        (row) =>
          webflowItemToEventInput(row, titleSlug, calendarSlug, endFieldSlug) as CalendarEvent
      ),
    [items, titleSlug, calendarSlug, endFieldSlug]
  );

  const resetModal = () => {
    setEditingId(null);
    setForm({});
    setBaseFieldData({});
    setEventOrganizerKind("mlcc");
    setUploadingImageSlug(null);
    setImageUploadErrorBySlug({});
    setSubmitAttempted(false);
  };

  const handleCloseModal = () => {
    setSubmitAttempted(false);
    closeModal();
  };

  const openCreate = (range?: { start: string; end?: string }) => {
    if (!fields.length) {
      toast.error("Webflow collection is still loading or not available.");
      return;
    }
    resetModal();
    setEditingId(null);
    const f = emptyForm(fields);
    if (calendarSlug && range?.start) {
      const day = range.start.slice(0, 10);
      f[calendarSlug] = `${day}T12:00`;
    }
    setForm(f);
    setBaseFieldData({});
    openModal();
  };

  const handleDateSelect = (sel: DateSelectArg) => {
    openCreate({ start: sel.startStr, end: sel.endStr });
  };

  const handleEventClick = (click: EventClickArg) => {
    const id = (click.event.extendedProps as WebflowCalendarExtras).itemId;
    const row = items.find((i) => i.id === id);
    if (!row) return;
    const ext = resolveExternalOrganizerSlug(fields);
    const fd = row.fieldData ?? {};
    const hasExternal = Boolean(ext && !cmsFieldRawLooksEmpty(fd[ext]));
    setEditingId(id);
    setBaseFieldData({ ...fd });
    setForm(initFormFromFieldData(fields, fd));
    setEventOrganizerKind(hasExternal ? "non-mlcc" : "mlcc");
    setImageUploadErrorBySlug({});
    setUploadingImageSlug(null);
    setSubmitAttempted(false);
    openModal();
  };

  const handleSave = async () => {
    setSubmitAttempted(true);
    if (!eventFormIsValid(fields, form, titleSlug, externalOrganizerSlug, eventOrganizerKind)) {
      return;
    }
    const fd = buildFieldDataFromForm(fields, form, baseFieldData, {
      eventKind: eventOrganizerKind,
      externalOrganizerSlug,
      titleFieldSlug: titleSlug,
    });
    if (typeof fd.name !== "string" || !fd.name.trim()) {
      return;
    }
    try {
      if (editingId) {
        const res = await fetch(`${getApiBase()}/api/events/webflow/${encodeURIComponent(editingId)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fieldData: fd }),
        });
        const json = (await res.json().catch(() => ({}))) as { error?: string; warning?: string };
        if (!res.ok) {
          toast.error(json.error || "Update failed");
          return;
        }
        if (json.warning) toast.info(json.warning, { duration: 10000 });
        toast.success("Event updated in Webflow.");
      } else {
        const res = await fetch(`${getApiBase()}/api/events/webflow`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fieldData: fd }),
        });
        const json = (await res.json().catch(() => ({}))) as { error?: string; warning?: string };
        if (!res.ok) {
          toast.error(json.error || "Create failed");
          return;
        }
        if (json.warning) toast.info(json.warning, { duration: 10000 });
        toast.success("Event created in Webflow.");
      }
      await invalidate();
      closeModal();
      resetModal();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Request failed");
    }
  };

  const handleDelete = async () => {
    if (!editingId) return;
    if (!window.confirm("Delete this event from Webflow?")) return;
    try {
      const res = await fetch(`${getApiBase()}/api/events/webflow/${encodeURIComponent(editingId)}`, {
        method: "DELETE",
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        toast.error(json.error || "Delete failed");
        return;
      }
      toast.success("Event deleted.");
      await invalidate();
      closeModal();
      resetModal();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Request failed");
    }
  };

  const handleImageUpload = async (
    slug: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      setImageUploadErrorBySlug((prev) => ({
        ...prev,
        [slug]: "Image must be 4MB or smaller.",
      }));
      return;
    }
    setUploadingImageSlug(slug);
    setImageUploadErrorBySlug((prev) => ({ ...prev, [slug]: undefined }));
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${getApiBase()}/api/events/webflow/upload-image`, {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      const json = (await res.json().catch(() => ({}))) as {
        error?: string;
        url?: string;
      };
      if (!res.ok) throw new Error(json.error || "Upload failed");
      if (!json.url) throw new Error("No image URL returned");
      setForm((prev) => ({ ...prev, [imageFormUrlKey(slug)]: json.url! }));
      setImageUploadErrorBySlug((prev) => ({ ...prev, [slug]: undefined }));
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Upload failed";
      let friendly = raw;
      if (/assets:write|OAuthForbidden|missing.*scopes/i.test(raw)) {
        friendly =
          "Your Webflow Data API token must include the assets:write scope. In Webflow: Site settings → Apps & integrations → Data API, create or regenerate a token with “Assets: Write” enabled.";
      }
      setImageUploadErrorBySlug((prev) => ({ ...prev, [slug]: friendly }));
    } finally {
      setUploadingImageSlug(null);
    }
  };

  const renderField = (f: WebflowCollectionFieldDTO) => {
    if (!f.isEditable) return null;
    if (isHiddenEventField(f)) return null;
    if (
      externalOrganizerSlug &&
      eventOrganizerKind === "mlcc" &&
      f.slug === externalOrganizerSlug
    ) {
      return null;
    }
    const v = form[f.slug] ?? "";
    const setVal = (s: string) => setForm((prev) => ({ ...prev, [f.slug]: s }));
    const showErr =
      submitAttempted &&
      fieldShowsError(f, form, titleSlug, externalOrganizerSlug, eventOrganizerKind);

    if (fieldType(f).toLowerCase() === "image") {
      const url = form[imageFormUrlKey(f.slug)] ?? "";
      const uploadErr = imageUploadErrorBySlug[f.slug];
      const highlight = Boolean(uploadErr) || showErr;
      return (
        <div key={f.id} className="mt-4">
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
            {f.displayName}
            {f.isRequired ? " *" : ""}
          </label>
          <div
            className={
              highlight
                ? "mb-2 rounded-lg border border-red-500 p-2 dark:border-red-500/80"
                : "mb-2"
            }
          >
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/gif,image/webp,image/avif,image/svg+xml"
              disabled={uploadingImageSlug === f.slug}
              onChange={(e) => void handleImageUpload(f.slug, e)}
              aria-invalid={highlight}
              className="dark:bg-dark-900 block w-full cursor-pointer text-sm text-gray-800 file:mr-4 file:rounded-lg file:border-0 file:bg-brand-500 file:px-4 file:py-2 file:text-sm file:font-medium file:text-mercury-on-accent hover:file:bg-brand-600 hover:file:text-white dark:text-white/90"
            />
          </div>
          {uploadingImageSlug === f.slug ? (
            <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Uploading…</p>
          ) : null}
          {url ? (
            <button
              type="button"
              onClick={() => {
                setForm((prev) => ({ ...prev, [imageFormUrlKey(f.slug)]: "" }));
                setImageUploadErrorBySlug((prev) => ({ ...prev, [f.slug]: undefined }));
              }}
              className="mb-2 text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400"
            >
              Remove image
            </button>
          ) : null}
          {uploadErr ? (
            <p className="mb-2 text-xs text-red-600 dark:text-red-400">{uploadErr}</p>
          ) : showErr ? (
            <p className="mb-2 text-xs text-red-600 dark:text-red-400">
              {getRequiredFieldMessage(f, titleSlug)}
            </p>
          ) : null}
          <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
            Files upload to Webflow site assets (max 4MB). The Data API token needs the{" "}
            <span className="font-medium text-gray-700 dark:text-gray-300">assets:write</span> scope.
            The CMS stores the hosted image URL.
          </p>
          {/^https?:\/\//i.test(url) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={url}
              alt=""
              className="mt-3 max-h-40 w-auto max-w-full rounded-lg border border-gray-200 object-contain dark:border-gray-700"
            />
          ) : null}
        </div>
      );
    }

    if (f.type === "RichText") {
      return (
        <div key={f.id} className="mt-4">
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
            {f.displayName}
            {f.isRequired ? " *" : ""}
          </label>
          <textarea
            rows={5}
            value={v}
            onChange={(e) => setVal(e.target.value)}
            aria-invalid={showErr}
            className={`dark:bg-dark-900 w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs dark:bg-gray-900 dark:text-white/90 ${invalidInputClass(showErr)}`}
          />
          {showErr ? (
            <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
              {getRequiredFieldMessage(f, titleSlug)}
            </p>
          ) : null}
        </div>
      );
    }

    if (f.type === "DateTime") {
      return (
        <div key={f.id} className="mt-4">
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
            {f.displayName}
            {f.isRequired ? " *" : ""}
          </label>
          <input
            type="datetime-local"
            value={v}
            onChange={(e) => setVal(e.target.value)}
            aria-invalid={showErr}
            className={`dark:bg-dark-900 h-11 w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 ${invalidInputClass(showErr)}`}
          />
          {showErr ? (
            <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
              {getRequiredFieldMessage(f, titleSlug)}
            </p>
          ) : null}
        </div>
      );
    }

    if (f.type === "Switch") {
      return (
        <div key={f.id} className="mt-4">
          <div className="flex items-center gap-2">
            <input
              id={`fld-${f.slug}`}
              type="checkbox"
              checked={v === "true"}
              onChange={(e) => setVal(e.target.checked ? "true" : "false")}
              aria-invalid={showErr}
              className={`h-4 w-4 rounded ${showErr ? "border-red-500 ring-1 ring-red-500/30" : "border-gray-300"}`}
            />
            <label htmlFor={`fld-${f.slug}`} className="text-sm text-gray-700 dark:text-gray-300">
              {f.displayName}
              {f.isRequired ? " *" : ""}
            </label>
          </div>
          {showErr ? (
            <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
              {getRequiredFieldMessage(f, titleSlug)}
            </p>
          ) : null}
        </div>
      );
    }

    if (f.type === "Number") {
      return (
        <div key={f.id} className="mt-4">
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
            {f.displayName}
            {f.isRequired ? " *" : ""}
          </label>
          <input
            type="number"
            value={v}
            onChange={(e) => setVal(e.target.value)}
            aria-invalid={showErr}
            className={`dark:bg-dark-900 h-11 w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:bg-gray-900 dark:text-white/90 ${invalidInputClass(showErr)}`}
          />
          {showErr ? (
            <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
              {getRequiredFieldMessage(f, titleSlug)}
            </p>
          ) : null}
        </div>
      );
    }

    if (fieldType(f).toLowerCase() === "option") {
      const choices = optionChoicesFromField(f);
      const knownIds = new Set(choices.map((c) => c.id));
      const orphanSelected = v.length > 0 && !knownIds.has(v);
      return (
        <div key={f.id} className="mt-4">
          <label
            htmlFor={`fld-opt-${f.slug}`}
            className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
          >
            {f.displayName}
            {f.isRequired ? " *" : ""}
          </label>
          <select
            id={`fld-opt-${f.slug}`}
            value={v}
            onChange={(e) => setVal(e.target.value)}
            required={f.isRequired}
            aria-invalid={showErr}
            className={`dark:bg-dark-900 h-11 w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs dark:bg-gray-900 dark:text-white/90 ${invalidInputClass(showErr)}`}
          >
            {!f.isRequired ? (
              <option value="">—</option>
            ) : (
              <option value="" disabled hidden>
                Select…
              </option>
            )}
            {choices.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
            {orphanSelected ? (
              <option value={v}>
                Current value (id: {v.length > 36 ? `${v.slice(0, 18)}…` : v})
              </option>
            ) : null}
          </select>
          {showErr ? (
            <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
              {getRequiredFieldMessage(f, titleSlug)}
            </p>
          ) : null}
          {choices.length === 0 ? (
            <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
              No option list returned for this field. If this stays empty, check the Webflow collection API payload includes{" "}
              <code className="rounded bg-gray-100 px-0.5 dark:bg-gray-800">validations.options</code>.
            </p>
          ) : null}
        </div>
      );
    }

    const inputType =
      f.type === "Email" ? "email" : f.type === "Phone" ? "tel" : f.type === "Link" ? "url" : "text";

    return (
      <div key={f.id} className="mt-4">
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
          {f.displayName}
          {f.isRequired ? " *" : ""}
        </label>
        <input
          type={inputType}
          value={v}
          onChange={(e) => setVal(e.target.value)}
          aria-invalid={showErr}
          className={`dark:bg-dark-900 h-11 w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs dark:bg-gray-900 dark:text-white/90 ${invalidInputClass(showErr)}`}
        />
        {showErr ? (
          <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
            {getRequiredFieldMessage(f, titleSlug)}
          </p>
        ) : null}
      </div>
    );
  };

  return (
    <div
      className={
        embedded
          ? ""
          : "rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]"
      }
    >
      {error ? (
        <p className="p-4 text-sm text-red-600 dark:text-red-400">
          {(error as Error).message}
          <button
            type="button"
            className="ml-2 text-brand-600 underline"
            onClick={() => refetch()}
          >
            Retry
          </button>
        </p>
      ) : null}
      {isLoading ? (
        <p className="p-4 text-sm text-gray-500 dark:text-gray-400">Loading Webflow events…</p>
      ) : null}
      {!isLoading && data && !calendarSlug ? (
        <p className="p-4 text-sm text-amber-700 dark:text-amber-300">
          No DateTime field found in this Webflow collection. Add a DateTime field or set{" "}
          <code className="rounded bg-gray-100 px-1 dark:bg-gray-800">WEBFLOW_EVENT_CALENDAR_FIELD_SLUG</code>{" "}
          to the slug used for scheduling.
        </p>
      ) : null}
      <div className="custom-calendar">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next addEventButton",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          events={fcEvents}
          selectable={Boolean(calendarSlug)}
          select={handleDateSelect}
          eventClick={handleEventClick}
          eventContent={renderEventContent}
          customButtons={{
            addEventButton: {
              text: "Add Event +",
              click: () => openCreate(),
            },
          }}
        />
      </div>
      <Modal isOpen={isOpen} onClose={handleCloseModal} className="max-w-[720px] p-6 lg:p-10">
        <div className="flex max-h-[85vh] flex-col overflow-y-auto px-2 custom-scrollbar">
          <div>
            <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
              {editingId ? "Edit Webflow event" : "New Webflow event"}
            </h5>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Fields come from your Webflow Events collection (
              {data?.collection.displayName ?? "…"}). Saves go directly to Webflow.
              {editingId ? (
                <>
                  {" "}
                  <Link
                    href={`/old-admin/events/edit/${encodeURIComponent(editingId)}`}
                    className="font-medium text-brand-600 hover:underline dark:text-brand-400"
                  >
                    Open full editor
                  </Link>
                </>
              ) : null}
            </p>
          </div>
          {externalOrganizerSlug ? (
            <div className="mt-5" role="radiogroup" aria-label="Event organizer scope">
              <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Organizer
              </p>
              <div className="flex rounded-xl border border-gray-200 p-1 dark:border-gray-700">
                <button
                  type="button"
                  role="radio"
                  aria-checked={eventOrganizerKind === "mlcc"}
                  onClick={() => {
                    setEventOrganizerKind("mlcc");
                    setForm((prev) => ({
                      ...prev,
                      [externalOrganizerSlug]: "",
                      [imageFormUrlKey(externalOrganizerSlug)]: "",
                    }));
                  }}
                  className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    eventOrganizerKind === "mlcc"
                      ? "bg-brand-500 text-mercury-on-accent shadow-sm"
                      : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  }`}
                >
                  MLCC event
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={eventOrganizerKind === "non-mlcc"}
                  onClick={() => setEventOrganizerKind("non-mlcc")}
                  className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    eventOrganizerKind === "non-mlcc"
                      ? "bg-brand-500 text-mercury-on-accent shadow-sm"
                      : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  }`}
                >
                  Non-MLCC event
                </button>
              </div>
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                Non-MLCC events show the External Organizer field. MLCC events clear it on save.
              </p>
            </div>
          ) : null}
          <div className="mt-6">
            {fields
              .slice()
              .sort((a, b) => {
                const aTitle = a.slug === titleSlug;
                const bTitle = b.slug === titleSlug;
                if (aTitle !== bTitle) return aTitle ? -1 : 1;
                return a.displayName.localeCompare(b.displayName);
              })
              .map((f) => renderField(f))}
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
            {editingId ? (
              <button
                type="button"
                onClick={handleDelete}
                className="order-last flex w-full justify-center rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-700 hover:bg-red-50 dark:border-red-900/40 dark:text-red-300 sm:order-first sm:mr-auto sm:w-auto"
              >
                Delete from Webflow
              </button>
            ) : null}
            <button
              type="button"
              onClick={handleCloseModal}
              className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 sm:w-auto"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={uploadingImageSlug !== null}
              className="flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-mercury-on-accent hover:bg-brand-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {editingId ? "Save changes" : "Create in Webflow"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const renderEventContent = (eventInfo: EventContentArg) => {
  const cal = (eventInfo.event.extendedProps as WebflowCalendarExtras).calendar ?? "Primary";
  const colorClass = `fc-bg-${String(cal).toLowerCase()}`;
  return (
    <div className={`event-fc-color flex fc-event-main ${colorClass} p-1 rounded-sm`}>
      <div className="fc-daygrid-event-dot"></div>
      <div className="fc-event-time">{eventInfo.timeText}</div>
      <div className="fc-event-title">{eventInfo.event.title}</div>
    </div>
  );
};

export default Calendar;
