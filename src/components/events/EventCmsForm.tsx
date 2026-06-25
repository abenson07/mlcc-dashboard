"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  useWebflowEvents,
  type WebflowCollectionFieldDTO,
} from "hooks";
import {
  DEFAULT_EVENT_FIELD_SLUGS,
  type EventFieldSlugs,
} from "@/lib/webflow/event-field-slugs";
import { getApiBase } from "@/lib/apiBase";
import { slugifyFromEventName } from "@/lib/webflow/slugifyEvent";
import { fromDatetimeLocalValue, toDatetimeLocalValue } from "@/lib/webflow/datetimeLocal";
import {
  plainTextToEventRichTextHtml,
  richTextValueToPlain,
} from "@/lib/webflow/richTextPlain";
import { toast } from "sonner";

type CommitteeRow = { id: string; name: string; slug: string };

type PlaceSuggest = {
  placeId: string;
  mainText: string;
  secondaryText: string;
};

function fieldForSlug(
  fields: WebflowCollectionFieldDTO[],
  slug: string
): WebflowCollectionFieldDTO | undefined {
  return fields.find((f) => f.slug === slug);
}

function readRefId(raw: unknown): string {
  if (typeof raw === "string") return raw;
  if (raw && typeof raw === "object" && "id" in raw) {
    const id = (raw as { id: unknown }).id;
    return id != null ? String(id) : "";
  }
  return "";
}

function readImageUrl(raw: unknown): string {
  if (typeof raw === "string") return raw;
  if (raw && typeof raw === "object" && "url" in raw) {
    const u = (raw as { url: unknown }).url;
    return u != null ? String(u) : "";
  }
  return "";
}

function readSwitch(raw: unknown): boolean {
  return raw === true || raw === "true";
}

function splitDatetimeLocal(local: string): { date: string; time: string } {
  const v = (local ?? "").trim();
  if (!v) return { date: "", time: "" };
  const i = v.indexOf("T");
  if (i === -1) return { date: v, time: "" };
  return { date: v.slice(0, i), time: v.slice(i + 1) };
}

function combineDateAndTime(date: string, time: string): string {
  const d = (date ?? "").trim();
  const t = (time ?? "").trim();
  if (!d || !t) return "";
  return `${d}T${t}`;
}

/** End = start + 1 hour on the same calendar date; clamp to 23:59 that day if needed. */
function defaultEndTimeOneHourAfter(eventDate: string, startTime: string): string {
  if (!eventDate || !startTime) return "";
  const start = new Date(`${eventDate}T${startTime}`);
  if (Number.isNaN(start.getTime())) return "";
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const dayEnd = new Date(`${eventDate}T23:59:59.999`);
  const effective = end > dayEnd ? dayEnd : end;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(effective.getHours())}:${pad(effective.getMinutes())}`;
}

/** Next full clock hour after "now" (e.g. 5:02 PM → 6:00 PM), local time. */
function defaultNewEventSchedule(): {
  eventDate: string;
  startTime: string;
  endTime: string;
} {
  const now = new Date();
  const candidate = new Date(now);
  candidate.setMinutes(0, 0, 0);
  candidate.setSeconds(0, 0);
  candidate.setMilliseconds(0);
  if (candidate.getTime() <= now.getTime()) {
    candidate.setHours(candidate.getHours() + 1);
  }
  const pad = (n: number) => String(n).padStart(2, "0");
  const eventDate = `${candidate.getFullYear()}-${pad(candidate.getMonth() + 1)}-${pad(candidate.getDate())}`;
  const startTime = `${pad(candidate.getHours())}:${pad(candidate.getMinutes())}`;
  const endTime = defaultEndTimeOneHourAfter(eventDate, startTime);
  return { eventDate, startTime, endTime };
}

function initialScheduleFields(itemId?: string) {
  if (itemId) {
    return { eventDate: "", startTime: "", endTime: "" };
  }
  return defaultNewEventSchedule();
}

function readLinkOrText(raw: unknown): string {
  if (typeof raw === "string") return raw;
  if (raw && typeof raw === "object" && "url" in raw) {
    const u = (raw as { url: unknown }).url;
    return u != null ? String(u) : "";
  }
  return "";
}

function EventWhereField({
  slugs,
  slugHint,
  required: requiredMark,
  hasPlaceSelected,
  pickedLabel,
  placeQuery,
  onPlaceQueryChange,
  placeOpen,
  onPlaceOpen,
  placeSuggestions,
  placeHighlightIndex,
  setPlaceHighlightIndex,
  onPick,
  onClear,
}: {
  slugs: EventFieldSlugs;
  slugHint: (slug: string) => React.ReactNode;
  required?: boolean;
  hasPlaceSelected: boolean;
  pickedLabel: string;
  placeQuery: string;
  onPlaceQueryChange: (v: string) => void;
  placeOpen: boolean;
  onPlaceOpen: (v: boolean) => void;
  placeSuggestions: PlaceSuggest[];
  placeHighlightIndex: number;
  setPlaceHighlightIndex: React.Dispatch<React.SetStateAction<number>>;
  onPick: (s: PlaceSuggest) => void;
  onClear: () => void;
}) {
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      onPlaceOpen(false);
      return;
    }
    if (placeSuggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setPlaceHighlightIndex((i) => {
        const cur = i < 0 ? -1 : i;
        const next = cur + 1;
        return Math.min(placeSuggestions.length - 1, next);
      });
      onPlaceOpen(true);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setPlaceHighlightIndex((i) => {
        if (i <= 0) return 0;
        return i - 1;
      });
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const idx =
        placeHighlightIndex >= 0
          ? placeHighlightIndex
          : Math.min(0, placeSuggestions.length - 1);
      const s = placeSuggestions[idx];
      if (s) onPick(s);
    }
  };

  return (
    <div className="relative max-w-xl">
      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
        Where{requiredMark ? " *" : ""}
      </label>
      {hasPlaceSelected ? (
        <div className="flex h-11 w-full items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 shadow-theme-xs dark:border-gray-700 dark:bg-gray-900">
          <span className="min-w-0 flex-1 truncate text-sm text-gray-800 dark:text-white/90">
            {pickedLabel || "Selected place"}
          </span>
          <button
            type="button"
            onClick={onClear}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-lg leading-none text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
            aria-label="Remove location"
          >
            ×
          </button>
        </div>
      ) : (
        <>
          <input
            type="text"
            value={placeQuery}
            onChange={(e) => onPlaceQueryChange(e.target.value)}
            onFocus={() => {
              if (placeSuggestions.length) onPlaceOpen(true);
            }}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search for a venue or address…"
            autoComplete="off"
            className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs dark:border-gray-700 dark:text-white/90"
          />
          {placeOpen && placeSuggestions.length > 0 ? (
            <ul
              role="listbox"
              className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-900"
            >
              {placeSuggestions.map((s, i) => (
                <li key={s.placeId} role="option" aria-selected={i === placeHighlightIndex}>
                  <button
                    type="button"
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800 ${
                      i === placeHighlightIndex ? "bg-gray-50 dark:bg-gray-800" : ""
                    }`}
                    onMouseEnter={() => setPlaceHighlightIndex(i)}
                    onClick={() => onPick(s)}
                  >
                    <span className="font-medium text-gray-900 dark:text-white">{s.mainText}</span>
                    {s.secondaryText ? (
                      <span className="block text-xs text-gray-500">{s.secondaryText}</span>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </>
      )}
      <p className="mt-1 text-xs text-gray-500">
        {slugHint(slugs.locationName)} Place ID stored in “{slugs.locationPlaceId}”.
      </p>
    </div>
  );
}

function buildFieldData(
  base: Record<string, unknown>,
  fields: WebflowCollectionFieldDTO[],
  s: EventFieldSlugs,
  input: {
    name: string;
    startsAtLocal: string;
    endsAtLocal: string;
    locationName: string;
    locationPlaceId: string;
    locationAddress: string;
    locationUrl: string;
    shortDescription: string;
    longDescription: string;
    committeeId: string;
    isExternal: boolean;
    externalEventUrl: string;
    externalOrgName: string;
    externalOrgUrl: string;
    featuredImageUrl: string;
  }
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...base };
  const name = input.name.trim();
  const setVal = (slug: string, value: unknown) => {
    const f = fieldForSlug(fields, slug);
    if (!f) return;
    const ty = f.type.trim().toLowerCase();
    if (value === null || value === undefined) {
      out[slug] = null;
      return;
    }
    if (ty === "image") {
      const url = typeof value === "string" ? value.trim() : "";
      out[slug] = url ? { url } : null;
      return;
    }
    if (ty === "switch") {
      out[slug] = Boolean(value);
      return;
    }
    if (ty === "datetime") {
      const v = typeof value === "string" ? value : "";
      out[slug] = v ? fromDatetimeLocalValue(v) : null;
      return;
    }
    if (ty === "reference") {
      const id = typeof value === "string" ? value.trim() : "";
      out[slug] = id || null;
      return;
    }
    if (ty === "richtext") {
      const plain = typeof value === "string" ? value.trim() : "";
      out[slug] = plain ? plainTextToEventRichTextHtml(plain) : null;
      return;
    }
    out[slug] = value;
  };

  setVal(s.name, name);
  setVal(s.slug, slugifyFromEventName(name));
  setVal(s.startsAt, input.startsAtLocal);
  setVal(s.eventDateAndTime, input.startsAtLocal);
  setVal(s.endsAt, input.endsAtLocal);

  setVal(s.locationName, input.locationName.trim() || null);
  setVal(s.locationPlaceId, input.locationPlaceId.trim() || null);
  setVal(s.locationAddress, input.locationAddress.trim() || null);
  setVal(s.locationUrl, input.locationUrl.trim() || null);

  setVal(s.shortDescription, input.shortDescription.trim() || null);

  const hasLongDescriptionField = fieldForSlug(fields, s.longDescription);
  if (hasLongDescriptionField) {
    setVal(s.longDescription, input.longDescription.trim() || null);
    if (fieldForSlug(fields, s.body)) {
      setVal(s.body, null);
    }
  } else {
    setVal(s.body, input.longDescription.trim() || null);
  }

  setVal(s.committee, input.committeeId.trim() || null);
  setVal(s.isExternal, input.isExternal);
  setVal(s.externalEventUrl, input.externalEventUrl.trim() || null);
  setVal(s.externalOrgName, input.externalOrgName.trim() || null);
  setVal(s.externalOrgUrl, input.externalOrgUrl.trim() || null);
  setVal(s.featuredImage, input.featuredImageUrl.trim() || null);

  return out;
}

function useDebouncedCallback<T extends unknown[]>(
  fn: (...args: T) => void,
  delay: number
): (...args: T) => void {
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);
  return useCallback(
    (...args: T) => {
      if (t.current) clearTimeout(t.current);
      t.current = setTimeout(() => fn(...args), delay);
    },
    [fn, delay]
  );
}

export default function EventCmsForm({ itemId }: { itemId?: string }) {
  const router = useRouter();
  const sessionTokenRef = useRef(
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `st-${Date.now()}`
  );

  const {
    data: wf,
    isLoading: wfLoading,
    error: wfError,
    invalidate,
  } = useWebflowEvents();

  const fields = wf?.collection.fields ?? [];
  const slugs: EventFieldSlugs = wf?.eventFieldSlugs ?? DEFAULT_EVENT_FIELD_SLUGS;

  const { data: itemRow } = useQuery({
    queryKey: ["webflow-event-item", itemId],
    enabled: Boolean(itemId),
    queryFn: async () => {
      const res = await fetch(
        `${getApiBase()}/api/events/webflow/${encodeURIComponent(itemId!)}`
      );
      const json = (await res.json()) as {
        error?: string;
        fieldData?: Record<string, unknown>;
      };
      if (!res.ok) throw new Error(json.error || "Failed to load event");
      return json.fieldData ?? {};
    },
  });

  const { data: committeesPayload } = useQuery({
    queryKey: ["webflow-committee-items"],
    queryFn: async () => {
      const res = await fetch(`${getApiBase()}/api/webflow/committee-items`);
      const json = (await res.json()) as { error?: string; items?: CommitteeRow[] };
      if (!res.ok) return [];
      return json.items ?? [];
    },
  });

  const [name, setName] = useState("");
  const [eventDate, setEventDate] = useState(() => initialScheduleFields(itemId).eventDate);
  const [startTime, setStartTime] = useState(() => initialScheduleFields(itemId).startTime);
  const [endTime, setEndTime] = useState(() => initialScheduleFields(itemId).endTime);
  const startsAtLocal = useMemo(
    () => combineDateAndTime(eventDate, startTime),
    [eventDate, startTime]
  );
  const endsAtLocal = useMemo(
    () => combineDateAndTime(eventDate, endTime),
    [eventDate, endTime]
  );
  const [locationName, setLocationName] = useState("");
  const [locationPlaceId, setLocationPlaceId] = useState("");
  const [locationAddress, setLocationAddress] = useState("");
  const [locationUrl, setLocationUrl] = useState("");
  const [placeQuery, setPlaceQuery] = useState("");
  const [placeSuggestions, setPlaceSuggestions] = useState<PlaceSuggest[]>([]);
  const [placeOpen, setPlaceOpen] = useState(false);
  const [placeHighlightIndex, setPlaceHighlightIndex] = useState(-1);
  const [shortDescription, setShortDescription] = useState("");
  const [longDescription, setLongDescription] = useState("");
  const [committeeId, setCommitteeId] = useState("");
  const [isExternal, setIsExternal] = useState(false);
  const [externalEventUrl, setExternalEventUrl] = useState("");
  const [externalOrgName, setExternalOrgName] = useState("");
  const [externalOrgUrl, setExternalOrgUrl] = useState("");
  const [featuredImageUrl, setFeaturedImageUrl] = useState("");
  const [uploadingFeatured, setUploadingFeatured] = useState(false);
  const [composeBusy, setComposeBusy] = useState(false);
  const [draftBusy, setDraftBusy] = useState(false);
  const [creationMode, setCreationMode] = useState<"manual" | "ai">("ai");
  const [aiPhase, setAiPhase] = useState<"basics" | "review">("basics");
  const [userBrief, setUserBrief] = useState("");
  const [aiDraftGenerated, setAiDraftGenerated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [baseFieldData, setBaseFieldData] = useState<Record<string, unknown>>({});
  const slugsRef = useRef(slugs);
  slugsRef.current = slugs;

  useEffect(() => {
    if (!itemRow || !itemId) return;
    setBaseFieldData(itemRow);
    const fd = itemRow;
    const s = slugsRef.current;
    const flds = wf?.collection.fields ?? [];
    setName(String(fd[s.name] ?? ""));
    const startDl = toDatetimeLocalValue(fd[s.startsAt]);
    const { date: loadedDate, time: loadedStartT } = splitDatetimeLocal(startDl);
    setEventDate(loadedDate);
    setStartTime(loadedStartT);
    const endRaw = fd[s.endsAt];
    const endDl = toDatetimeLocalValue(endRaw);
    const { time: loadedEndT } = splitDatetimeLocal(endDl);
    setEndTime(
      loadedEndT ||
        (loadedDate && loadedStartT
          ? defaultEndTimeOneHourAfter(loadedDate, loadedStartT)
          : "")
    );
    setLocationName(String(fd[s.locationName] ?? ""));
    setLocationPlaceId(String(fd[s.locationPlaceId] ?? ""));
    setLocationAddress(String(fd[s.locationAddress] ?? ""));
    setLocationUrl(readLinkOrText(fd[s.locationUrl]));
    setShortDescription(String(fd[s.shortDescription] ?? ""));
    if (fieldForSlug(flds, s.longDescription)) {
      const fromLong = richTextValueToPlain(fd[s.longDescription]);
      const legacyBody = String(fd[s.body] ?? "").trim();
      setLongDescription(fromLong || legacyBody);
    } else {
      setLongDescription(String(fd[s.body] ?? ""));
    }
    setCommitteeId(readRefId(fd[s.committee]));
    setIsExternal(readSwitch(fd[s.isExternal]));
    setExternalEventUrl(readLinkOrText(fd[s.externalEventUrl]));
    setExternalOrgName(String(fd[s.externalOrgName] ?? ""));
    setExternalOrgUrl(readLinkOrText(fd[s.externalOrgUrl]));
    setFeaturedImageUrl(readImageUrl(fd[s.featuredImage]));
  }, [itemRow, itemId, wf]);

  const runAutocomplete = useDebouncedCallback(async (q: string) => {
    if (!q.trim()) {
      setPlaceSuggestions([]);
      return;
    }
    try {
      const res = await fetch(`${getApiBase()}/api/places/autocomplete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: q,
          sessionToken: sessionTokenRef.current,
        }),
      });
      const json = (await res.json()) as {
        error?: string;
        suggestions?: PlaceSuggest[];
      };
      if (!res.ok) throw new Error(json.error || "Autocomplete failed");
      setPlaceSuggestions(json.suggestions ?? []);
      setPlaceOpen(true);
    } catch (e) {
      console.error(e);
      setPlaceSuggestions([]);
    }
  }, 300);

  useEffect(() => {
    setPlaceHighlightIndex(placeSuggestions.length > 0 ? 0 : -1);
  }, [placeSuggestions]);

  useEffect(() => {
    runAutocomplete(placeQuery);
  }, [placeQuery, runAutocomplete]);

  const clearPlace = useCallback(() => {
    setLocationPlaceId("");
    setLocationName("");
    setLocationAddress("");
    setLocationUrl("");
    setPlaceQuery("");
    setPlaceSuggestions([]);
    setPlaceOpen(false);
    setPlaceHighlightIndex(-1);
  }, []);

  const hasPlaceSelected = useMemo(
    () =>
      Boolean(
        locationPlaceId.trim() || locationName.trim() || locationAddress.trim()
      ),
    [locationPlaceId, locationName, locationAddress]
  );

  const pickedPlaceLabel = useMemo(() => {
    const n = locationName.trim();
    const a = locationAddress.trim();
    return n || a || "";
  }, [locationName, locationAddress]);

  const pickSuggestion = async (s: PlaceSuggest) => {
    try {
      const res = await fetch(`${getApiBase()}/api/places/details`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          placeId: s.placeId,
          sessionToken: sessionTokenRef.current,
        }),
      });
      const json = (await res.json()) as {
        error?: string;
        place?: {
          displayName: string;
          formattedAddress: string;
          googleMapsUri: string;
          placeId: string;
        };
      };
      if (!res.ok) throw new Error(json.error || "Place details failed");
      const p = json.place;
      if (!p) throw new Error("No place returned");
      setLocationPlaceId(p.placeId);
      setLocationName(p.displayName || s.mainText);
      setLocationAddress(p.formattedAddress || "");
      setLocationUrl(p.googleMapsUri || "");
      setPlaceQuery("");
      setPlaceSuggestions([]);
      setPlaceOpen(false);
      setPlaceHighlightIndex(-1);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Places error");
    }
  };

  const handleFeaturedUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      toast.error("Image must be 4MB or smaller.");
      return;
    }
    setUploadingFeatured(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${getApiBase()}/api/events/webflow/upload-image`, {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      const json = (await res.json()) as { error?: string; url?: string };
      if (!res.ok) throw new Error(json.error || "Upload failed");
      if (json.url) setFeaturedImageUrl(json.url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingFeatured(false);
    }
  };

  const committeeLabel = useMemo(
    () =>
      (committeesPayload ?? []).find((c) => c.id === committeeId)?.name ?? "",
    [committeesPayload, committeeId]
  );

  const isNew = !itemId;
  const showAiBasicsOnly = isNew && creationMode === "ai" && aiPhase === "basics";
  const showFullForm =
    !isNew ||
    creationMode === "manual" ||
    (creationMode === "ai" && aiPhase === "review");

  const handleDraftFromBrief = async () => {
    if (!eventDate.trim() || !startTime.trim()) {
      toast.error("Add an event date and start time.");
      return;
    }
    const brief = userBrief.trim();
    if (brief.length < 8) {
      toast.error("Add a short description of what this event is (a few words or more).");
      return;
    }
    const locationLabel =
      [locationName, locationAddress].filter(Boolean).join(", ").trim() ||
      placeQuery.trim() ||
      "";
    if (!locationLabel) {
      toast.error(
        "Add where the event takes place — search for a place or type the venue and address."
      );
      return;
    }
    if (!endTime.trim()) {
      toast.error("Add an end time.");
      return;
    }
    setDraftBusy(true);
    try {
      const res = await fetch(`${getApiBase()}/api/marketing/events/draft-from-brief`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userBrief: brief,
          startsAt: fromDatetimeLocalValue(startsAtLocal),
          endsAt: fromDatetimeLocalValue(endsAtLocal),
          locationLabel,
        }),
      });
      const json = (await res.json()) as {
        error?: string;
        eventName?: string;
        shortDescription?: string;
        body?: string;
        isExternal?: boolean;
        externalEventUrl?: string;
        externalOrgName?: string;
        externalOrgUrl?: string;
      };
      if (!res.ok) throw new Error(json.error || "Could not generate draft.");
      if (json.eventName) setName(json.eventName);
      if (json.shortDescription) setShortDescription(json.shortDescription);
      if (json.body) setLongDescription(json.body);
      setIsExternal(Boolean(json.isExternal));
      setExternalEventUrl(typeof json.externalEventUrl === "string" ? json.externalEventUrl : "");
      setExternalOrgName(typeof json.externalOrgName === "string" ? json.externalOrgName : "");
      setExternalOrgUrl(typeof json.externalOrgUrl === "string" ? json.externalOrgUrl : "");
      setAiPhase("review");
      setAiDraftGenerated(true);
      toast.success("Draft ready — review the fields below, then create.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Draft failed.");
    } finally {
      setDraftBusy(false);
    }
  };

  const handleCompose = async () => {
    if (!name.trim() || !eventDate.trim() || !startTime.trim()) {
      toast.error("Add an event name, date, and start time before generating copy.");
      return;
    }
    if (!endTime.trim()) {
      toast.error("Add an end time before generating copy.");
      return;
    }
    setComposeBusy(true);
    try {
      const res = await fetch(`${getApiBase()}/api/marketing/events/compose`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          eventName: name.trim(),
          startsAt: fromDatetimeLocalValue(startsAtLocal),
          endsAt: fromDatetimeLocalValue(endsAtLocal),
          locationLabel:
            [locationName, locationAddress].filter(Boolean).join(", ") || undefined,
          committeeName: committeeLabel || undefined,
          isExternal,
          externalEventUrl: externalEventUrl.trim() || undefined,
          externalOrgName: externalOrgName.trim() || undefined,
          externalOrgUrl: externalOrgUrl.trim() || undefined,
        }),
      });
      const json = (await res.json()) as {
        error?: string;
        shortDescription?: string;
        body?: string;
      };
      if (!res.ok) throw new Error(json.error || "Compose failed");
      if (json.shortDescription) setShortDescription(json.shortDescription);
      if (json.body) setLongDescription(json.body);
      toast.success("Draft copy generated — review before saving.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Compose failed");
    } finally {
      setComposeBusy(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Event name is required.");
      return;
    }
    if (!eventDate.trim() || !startTime.trim()) {
      toast.error("Start date and time are required.");
      return;
    }
    if (!endTime.trim()) {
      toast.error("End time is required.");
      return;
    }
    const fd = buildFieldData(
      itemId ? baseFieldData : {},
      fields,
      slugs,
      {
        name,
        startsAtLocal,
        endsAtLocal,
        locationName,
        locationPlaceId,
        locationAddress,
        locationUrl,
        shortDescription,
        longDescription,
        committeeId,
        isExternal,
        externalEventUrl,
        externalOrgName,
        externalOrgUrl,
        featuredImageUrl,
      }
    );
    if (typeof fd.name !== "string" || !String(fd.name).trim()) {
      toast.error("Invalid field data.");
      return;
    }
    setSaving(true);
    try {
      if (itemId) {
        const res = await fetch(
          `${getApiBase()}/api/events/webflow/${encodeURIComponent(itemId)}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fieldData: fd }),
          }
        );
        const json = (await res.json()) as { error?: string; warning?: string };
        if (!res.ok) throw new Error(json.error || "Save failed");
        if (json.warning) toast.info(json.warning, { duration: 10000 });
        toast.success("Event saved to Webflow.");
      } else {
        const res = await fetch(`${getApiBase()}/api/events/webflow`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fieldData: fd }),
        });
        const json = (await res.json()) as {
          error?: string;
          warning?: string;
          id?: string;
        };
        if (!res.ok) throw new Error(json.error || "Create failed");
        if (json.warning) toast.info(json.warning, { duration: 10000 });
        toast.success("Event created in Webflow.");
      }
      await invalidate();
      router.push("/admin/events");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const missingWebflow = wfError || (!wfLoading && !wf);

  const slugHint = (slug: string) =>
    fieldForSlug(fields, slug) ? (
      <span className="text-gray-400">Maps to CMS field “{slug}”.</span>
    ) : (
      <span className="text-amber-600 dark:text-amber-400">
        No “{slug}” field in this Webflow collection — add it or adjust env slug overrides.
      </span>
    );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/admin/events"
          className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
        >
          ← Events
        </Link>
      </div>

      {missingWebflow ? (
        <p className="text-sm text-red-600">
          {(wfError as Error)?.message ||
            "Could not load Webflow events. Check env and credentials."}
        </p>
      ) : null}

      {wfLoading ? (
        <p className="text-sm text-gray-500">Loading Webflow collection…</p>
      ) : null}

      {!wfLoading && wf ? (
        <>
          {isNew ? (
            <div className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-700 dark:bg-gray-900/40">
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                New event mode
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCreationMode("ai");
                    setAiPhase(aiDraftGenerated ? "review" : "basics");
                  }}
                  className={`rounded-lg px-4 py-2 text-sm font-medium ${
                    creationMode === "ai"
                      ? "bg-brand-500 text-mercury-on-accent"
                      : "border border-gray-300 bg-white text-gray-800 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                  }`}
                >
                  AI-assisted
                </button>
                <button
                  type="button"
                  onClick={() => setCreationMode("manual")}
                  className={`rounded-lg px-4 py-2 text-sm font-medium ${
                    creationMode === "manual"
                      ? "bg-brand-500 text-mercury-on-accent"
                      : "border border-gray-300 bg-white text-gray-800 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                  }`}
                >
                  Manual
                </button>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                <strong>AI-assisted:</strong> enter basics and a short note; we draft the title and
                descriptions from MLCC voice & context. <strong>Manual:</strong> fill every Webflow
                field yourself (same as before).
              </p>
            </div>
          ) : null}

          {showAiBasicsOnly ? (
            <div className="space-y-6 rounded-xl border border-brand-200/80 bg-brand-500/5 p-5 dark:border-brand-900/40 dark:bg-brand-950/20">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                Event basics
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                We use MLCC voice, tone, and master context to write the public title and long copy.
                You’ll review everything before it goes to Webflow.
              </p>

              <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:gap-6">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="dark:bg-dark-900 h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs dark:border-gray-700 dark:text-white/90"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Start time *
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="dark:bg-dark-900 h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs dark:border-gray-700 dark:text-white/90"
                  />
                  <p className="mt-1 text-xs text-gray-500">{slugHint(slugs.startsAt)}</p>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    End time *
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="dark:bg-dark-900 h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs dark:border-gray-700 dark:text-white/90"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Uses the same date as start.{` `}
                    {slugHint(slugs.endsAt)}
                  </p>
                </div>
              </div>

              <EventWhereField
                slugs={slugs}
                slugHint={slugHint}
                required
                hasPlaceSelected={hasPlaceSelected}
                pickedLabel={pickedPlaceLabel}
                placeQuery={placeQuery}
                onPlaceQueryChange={setPlaceQuery}
                placeOpen={placeOpen}
                onPlaceOpen={setPlaceOpen}
                placeSuggestions={placeSuggestions}
                placeHighlightIndex={placeHighlightIndex}
                setPlaceHighlightIndex={setPlaceHighlightIndex}
                onPick={(s) => void pickSuggestion(s)}
                onClear={clearPlace}
              />

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  What’s happening? *
                </label>
                <textarea
                  value={userBrief}
                  onChange={(e) => setUserBrief(e.target.value)}
                  rows={5}
                  placeholder="Rough notes are fine — e.g. who’s hosting, what neighbors will do, anything people should know."
                  className="dark:bg-dark-900 w-full max-w-xl rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700"
                />
              </div>

              <button
                type="button"
                onClick={() => void handleDraftFromBrief()}
                disabled={draftBusy || wfLoading}
                className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-mercury-on-accent hover:bg-brand-600 disabled:opacity-50"
              >
                {draftBusy ? "Generating draft…" : "Generate draft"}
              </button>
            </div>
          ) : null}

          {showFullForm && isNew && creationMode === "ai" && aiPhase === "review" ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-900">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Review and edit all fields, then create in Webflow. Featured image can be added here
                when you’re ready.
              </p>
              <button
                type="button"
                onClick={() => setAiPhase("basics")}
                className="shrink-0 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
              >
                Back to basics
              </button>
            </div>
          ) : null}

          {showFullForm ? (
            <>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Event name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="dark:bg-dark-900 h-11 w-full max-w-xl rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs dark:border-gray-700 dark:text-white/90"
            />
            <p className="mt-1 text-xs text-gray-500">{slugHint(slugs.name)}</p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:gap-6">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Date *
              </label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="dark:bg-dark-900 h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs dark:border-gray-700 dark:text-white/90"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Start time *
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="dark:bg-dark-900 h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs dark:border-gray-700 dark:text-white/90"
              />
              <p className="mt-1 text-xs text-gray-500">{slugHint(slugs.startsAt)}</p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                End time *
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="dark:bg-dark-900 h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs dark:border-gray-700 dark:text-white/90"
              />
              <p className="mt-1 text-xs text-gray-500">
                Uses the same date as start.{` `}
                {slugHint(slugs.endsAt)}
              </p>
            </div>
          </div>

          <EventWhereField
            slugs={slugs}
            slugHint={slugHint}
            hasPlaceSelected={hasPlaceSelected}
            pickedLabel={pickedPlaceLabel}
            placeQuery={placeQuery}
            onPlaceQueryChange={setPlaceQuery}
            placeOpen={placeOpen}
            onPlaceOpen={setPlaceOpen}
            placeSuggestions={placeSuggestions}
            placeHighlightIndex={placeHighlightIndex}
            setPlaceHighlightIndex={setPlaceHighlightIndex}
            onPick={(s) => void pickSuggestion(s)}
            onClear={clearPlace}
          />

          {fieldForSlug(fields, slugs.committee) ? (
            <div className="max-w-xl">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Committee
              </label>
              <select
                value={committeeId}
                onChange={(e) => setCommitteeId(e.target.value)}
                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs dark:border-gray-700 dark:text-white/90"
              >
                <option value="">— None —</option>
                {(committeesPayload ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">{slugHint(slugs.committee)}</p>
            </div>
          ) : (
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Add a Reference field “{slugs.committee}” in Webflow to assign a committee.
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-400">
              <input
                type="checkbox"
                checked={isExternal}
                onChange={(e) => setIsExternal(e.target.checked)}
                className="rounded border-gray-300"
              />
              External event
            </label>
            <p className="text-xs text-gray-500">{slugHint(slugs.isExternal)}</p>
          </div>

          {isExternal ? (
            <div className="grid max-w-xl gap-3">
              <input
                type="url"
                value={externalEventUrl}
                onChange={(e) => setExternalEventUrl(e.target.value)}
                placeholder="Link to event details (RSVP / info)"
                className="dark:bg-dark-900 h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700"
              />
              <input
                type="text"
                value={externalOrgName}
                onChange={(e) => setExternalOrgName(e.target.value)}
                placeholder="Organizer name"
                className="dark:bg-dark-900 h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700"
              />
              <input
                type="url"
                value={externalOrgUrl}
                onChange={(e) => setExternalOrgUrl(e.target.value)}
                placeholder="Organizer website"
                className="dark:bg-dark-900 h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700"
              />
            </div>
          ) : null}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Short description
            </label>
            <textarea
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              rows={3}
              className="dark:bg-dark-900 w-full max-w-xl rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700"
            />
            <p className="mt-1 text-xs text-gray-500">{slugHint(slugs.shortDescription)}</p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Long description
            </label>
            <textarea
              value={longDescription}
              onChange={(e) => setLongDescription(e.target.value)}
              rows={10}
              className="dark:bg-dark-900 w-full max-w-3xl rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700"
            />
            <p className="mt-1 text-xs text-gray-500">
              {fieldForSlug(fields, slugs.longDescription)
                ? slugHint(slugs.longDescription)
                : slugHint(slugs.body)}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void handleCompose()}
              disabled={composeBusy || wfLoading}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800 disabled:opacity-50"
            >
              {composeBusy ? "Generating…" : "Generate copy (AI)"}
            </button>
          </div>

          {fieldForSlug(fields, slugs.featuredImage) ? (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Featured image
              </label>
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/gif,image/webp,image/avif,image/svg+xml"
                disabled={uploadingFeatured}
                onChange={(e) => void handleFeaturedUpload(e)}
                className="block w-full max-w-xl text-sm"
              />
              {featuredImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={featuredImageUrl}
                  alt=""
                  className="mt-3 max-h-48 rounded-lg border border-gray-200 object-contain dark:border-gray-700"
                />
              ) : null}
              {featuredImageUrl ? (
                <button
                  type="button"
                  className="mt-2 text-xs font-medium text-red-600"
                  onClick={() => setFeaturedImageUrl("")}
                >
                  Remove image
                </button>
              ) : null}
              <p className="mt-1 text-xs text-gray-500">{slugHint(slugs.featuredImage)}</p>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3 pt-4">
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving || wfLoading}
              className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-mercury-on-accent hover:bg-brand-600 hover:text-white disabled:opacity-50"
            >
              {saving ? "Saving…" : itemId ? "Save to Webflow" : "Create in Webflow"}
            </button>
            <Link
              href="/admin/events"
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 dark:border-gray-600 dark:text-gray-300"
            >
              Cancel
            </Link>
          </div>
            </>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
