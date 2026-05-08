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
import { slugifyFromEventName } from "@/lib/webflow/slugifyEvent";
import { fromDatetimeLocalValue, toDatetimeLocalValue } from "@/lib/webflow/datetimeLocal";
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

function readLinkOrText(raw: unknown): string {
  if (typeof raw === "string") return raw;
  if (raw && typeof raw === "object" && "url" in raw) {
    const u = (raw as { url: unknown }).url;
    return u != null ? String(u) : "";
  }
  return "";
}

function buildFieldData(
  base: Record<string, unknown>,
  fields: WebflowCollectionFieldDTO[],
  s: EventFieldSlugs,
  input: {
    name: string;
    startsAtLocal: string;
    endsAtLocal: string;
    addEndTime: boolean;
    locationName: string;
    locationPlaceId: string;
    locationAddress: string;
    locationUrl: string;
    shortDescription: string;
    body: string;
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
    out[slug] = value;
  };

  setVal(s.name, name);
  setVal(s.slug, slugifyFromEventName(name));
  setVal(s.startsAt, input.startsAtLocal);
  if (input.addEndTime) setVal(s.endsAt, input.endsAtLocal);
  else setVal(s.endsAt, null);

  setVal(s.locationName, input.locationName.trim() || null);
  setVal(s.locationPlaceId, input.locationPlaceId.trim() || null);
  setVal(s.locationAddress, input.locationAddress.trim() || null);
  setVal(s.locationUrl, input.locationUrl.trim() || null);

  setVal(s.shortDescription, input.shortDescription.trim() || null);
  setVal(s.body, input.body.trim() || null);

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
        `/api/events/webflow/${encodeURIComponent(itemId!)}`
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
      const res = await fetch("/api/webflow/committee-items");
      const json = (await res.json()) as { error?: string; items?: CommitteeRow[] };
      if (!res.ok) return [];
      return json.items ?? [];
    },
  });

  const [name, setName] = useState("");
  const [startsAtLocal, setStartsAtLocal] = useState("");
  const [endsAtLocal, setEndsAtLocal] = useState("");
  const [addEndTime, setAddEndTime] = useState(false);
  const [locationName, setLocationName] = useState("");
  const [locationPlaceId, setLocationPlaceId] = useState("");
  const [locationAddress, setLocationAddress] = useState("");
  const [locationUrl, setLocationUrl] = useState("");
  const [placeQuery, setPlaceQuery] = useState("");
  const [placeSuggestions, setPlaceSuggestions] = useState<PlaceSuggest[]>([]);
  const [placeOpen, setPlaceOpen] = useState(false);
  const [shortDescription, setShortDescription] = useState("");
  const [body, setBody] = useState("");
  const [committeeId, setCommitteeId] = useState("");
  const [isExternal, setIsExternal] = useState(false);
  const [externalEventUrl, setExternalEventUrl] = useState("");
  const [externalOrgName, setExternalOrgName] = useState("");
  const [externalOrgUrl, setExternalOrgUrl] = useState("");
  const [featuredImageUrl, setFeaturedImageUrl] = useState("");
  const [uploadingFeatured, setUploadingFeatured] = useState(false);
  const [composeBusy, setComposeBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [baseFieldData, setBaseFieldData] = useState<Record<string, unknown>>({});
  const slugsRef = useRef(slugs);
  slugsRef.current = slugs;

  useEffect(() => {
    if (!itemRow || !itemId) return;
    setBaseFieldData(itemRow);
    const fd = itemRow;
    const s = slugsRef.current;
    setName(String(fd[s.name] ?? ""));
    setStartsAtLocal(toDatetimeLocalValue(fd[s.startsAt]));
    const endRaw = fd[s.endsAt];
    const hasEnd =
      (typeof endRaw === "string" && endRaw.trim() !== "") ||
      endRaw != null;
    setAddEndTime(Boolean(hasEnd));
    setEndsAtLocal(toDatetimeLocalValue(endRaw));
    setLocationName(String(fd[s.locationName] ?? ""));
    setLocationPlaceId(String(fd[s.locationPlaceId] ?? ""));
    setLocationAddress(String(fd[s.locationAddress] ?? ""));
    setLocationUrl(readLinkOrText(fd[s.locationUrl]));
    setShortDescription(String(fd[s.shortDescription] ?? ""));
    setBody(String(fd[s.body] ?? ""));
    setCommitteeId(readRefId(fd[s.committee]));
    setIsExternal(readSwitch(fd[s.isExternal]));
    setExternalEventUrl(readLinkOrText(fd[s.externalEventUrl]));
    setExternalOrgName(String(fd[s.externalOrgName] ?? ""));
    setExternalOrgUrl(readLinkOrText(fd[s.externalOrgUrl]));
    setFeaturedImageUrl(readImageUrl(fd[s.featuredImage]));
  }, [itemRow, itemId]);

  const runAutocomplete = useDebouncedCallback(async (q: string) => {
    if (!q.trim()) {
      setPlaceSuggestions([]);
      return;
    }
    try {
      const res = await fetch("/api/places/autocomplete", {
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
    runAutocomplete(placeQuery);
  }, [placeQuery, runAutocomplete]);

  const pickSuggestion = async (s: PlaceSuggest) => {
    try {
      const res = await fetch("/api/places/details", {
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
      toast.success("Location applied.");
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
      const res = await fetch("/api/events/webflow/upload-image", {
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

  const handleCompose = async () => {
    if (!name.trim() || !startsAtLocal) {
      toast.error("Add an event name and start time before generating copy.");
      return;
    }
    setComposeBusy(true);
    try {
      const res = await fetch("/api/marketing/events/compose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventName: name.trim(),
          startsAt: fromDatetimeLocalValue(startsAtLocal),
          endsAt:
            addEndTime && endsAtLocal
              ? fromDatetimeLocalValue(endsAtLocal)
              : undefined,
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
      if (json.body) setBody(json.body);
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
    if (!startsAtLocal) {
      toast.error("Start date and time are required.");
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
        addEndTime,
        locationName,
        locationPlaceId,
        locationAddress,
        locationUrl,
        shortDescription,
        body,
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
          `/api/events/webflow/${encodeURIComponent(itemId)}`,
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
        const res = await fetch("/api/events/webflow", {
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
        if (json.id) {
          router.push(`/events/edit/${encodeURIComponent(json.id)}`);
          return;
        }
      }
      await invalidate();
      router.push("/events");
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
          href="/events"
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

          <div className="flex flex-wrap gap-6">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Starts *
              </label>
              <input
                type="datetime-local"
                value={startsAtLocal}
                onChange={(e) => setStartsAtLocal(e.target.value)}
                className="dark:bg-dark-900 h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs dark:border-gray-700 dark:text-white/90"
              />
              <p className="mt-1 text-xs text-gray-500">{slugHint(slugs.startsAt)}</p>
            </div>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-400">
                <input
                  type="checkbox"
                  checked={addEndTime}
                  onChange={(e) => setAddEndTime(e.target.checked)}
                  className="rounded border-gray-300"
                />
                Add end time
              </label>
              {addEndTime ? (
                <>
                  <input
                    type="datetime-local"
                    value={endsAtLocal}
                    onChange={(e) => setEndsAtLocal(e.target.value)}
                    className="dark:bg-dark-900 h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs dark:border-gray-700 dark:text-white/90"
                  />
                  <p className="text-xs text-gray-500">{slugHint(slugs.endsAt)}</p>
                </>
              ) : null}
            </div>
          </div>

          <div className="relative max-w-xl">
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Location (Google Places)
            </label>
            <input
              type="text"
              value={placeQuery}
              onChange={(e) => setPlaceQuery(e.target.value)}
              onFocus={() => placeSuggestions.length && setPlaceOpen(true)}
              placeholder="Search for a venue or address…"
              autoComplete="off"
              className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs dark:border-gray-700 dark:text-white/90"
            />
            {placeOpen && placeSuggestions.length > 0 ? (
              <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-900">
                {placeSuggestions.map((s) => (
                  <li key={s.placeId}>
                    <button
                      type="button"
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                      onClick={() => void pickSuggestion(s)}
                    >
                      <span className="font-medium text-gray-900 dark:text-white">
                        {s.mainText}
                      </span>
                      {s.secondaryText ? (
                        <span className="block text-xs text-gray-500">
                          {s.secondaryText}
                        </span>
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
            <div className="mt-3 grid gap-2 text-sm">
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="Display name"
                className="dark:bg-dark-900 rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
              />
              <input
                type="text"
                value={locationAddress}
                onChange={(e) => setLocationAddress(e.target.value)}
                placeholder="Address"
                readOnly={false}
                className="dark:bg-dark-900 rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
              />
              <input
                type="url"
                value={locationUrl}
                onChange={(e) => setLocationUrl(e.target.value)}
                placeholder="Maps link"
                className="dark:bg-dark-900 rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
              />
              <input type="hidden" value={locationPlaceId} readOnly />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {slugHint(slugs.locationName)} Place ID stored in “{slugs.locationPlaceId}”.
            </p>
          </div>

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
              Long description (body)
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={10}
              className="dark:bg-dark-900 w-full max-w-3xl rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700"
            />
            <p className="mt-1 text-xs text-gray-500">{slugHint(slugs.body)}</p>
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
              href="/events"
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 dark:border-gray-600 dark:text-gray-300"
            >
              Cancel
            </Link>
          </div>
        </>
      ) : null}
    </div>
  );
}
