/**
 * Server-only Google Places API (New). Requires GOOGLE_PLACES_API_KEY.
 * @see https://developers.google.com/maps/documentation/places/web-service/place-autocomplete
 */

const AUTOCOMPLETE_URL = "https://places.googleapis.com/v1/places:autocomplete";
const SEARCH_NEARBY_URL = "https://places.googleapis.com/v1/places:searchNearby";
const SEARCH_TEXT_URL = "https://places.googleapis.com/v1/places:searchText";
const PLACE_BASE = "https://places.googleapis.com/v1/places/";

export type PlaceAutocompleteSuggestion = {
  placeId: string;
  mainText: string;
  secondaryText: string;
};

export type PlaceDetailsResult = {
  placeId: string;
  displayName: string;
  formattedAddress: string;
  googleMapsUri: string;
};

/** Fields commonly used when seeding CRM rows from Places (Enterprise SKU: phone + website). */
export const PLACE_SEED_FIELD_MASK =
  "places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.websiteUri";

export type PlaceSeedRow = {
  /** Canonical Place resource id (no `places/` prefix). */
  googlePlaceId: string;
  businessName: string;
  formattedAddress: string;
  nationalPhoneNumber: string;
  websiteUri: string;
};

export type LatLng = { latitude: number; longitude: number };

export type CircleRegion = {
  center: LatLng;
  /** Meters; Places API allows 0–50000. */
  radiusMeters: number;
};

function normalizePlaceResourceId(id: string): string {
  const t = id.trim();
  if (t.startsWith("places/")) return t.slice("places/".length);
  return t;
}

function readGooglePlacesErrorMessage(raw: Record<string, unknown>, fallback: string): string {
  const err = raw.error;
  if (typeof err === "object" && err && "message" in err && typeof (err as { message: unknown }).message === "string") {
    return (err as { message: string }).message;
  }
  return fallback;
}

function parseDisplayNameText(raw: Record<string, unknown>): string {
  const dn = raw.displayName;
  if (typeof dn === "object" && dn && "text" in dn && typeof (dn as { text: unknown }).text === "string") {
    return (dn as { text: string }).text;
  }
  return "";
}

export function parsePlaceSeedRow(place: Record<string, unknown>): PlaceSeedRow | null {
  const rawId = typeof place.id === "string" ? place.id : "";
  const googlePlaceId = normalizePlaceResourceId(rawId);
  if (!googlePlaceId) return null;
  const businessName = parseDisplayNameText(place).trim();
  return {
    googlePlaceId,
    businessName: businessName || "(unnamed place)",
    formattedAddress: typeof place.formattedAddress === "string" ? place.formattedAddress : "",
    nationalPhoneNumber: typeof place.nationalPhoneNumber === "string" ? place.nationalPhoneNumber : "",
    websiteUri: typeof place.websiteUri === "string" ? place.websiteUri : "",
  };
}

/** Bounding rectangle that covers a circle (for Text Search `locationRestriction`). */
export function circleToViewportRectangle(center: LatLng, radiusMeters: number): {
  low: LatLng;
  high: LatLng;
} {
  const latRad = (center.latitude * Math.PI) / 180;
  const dLat = radiusMeters / 111320;
  const dLng = radiusMeters / (111320 * Math.cos(latRad || 1e-6));
  return {
    low: { latitude: center.latitude - dLat, longitude: center.longitude - dLng },
    high: { latitude: center.latitude + dLat, longitude: center.longitude + dLng },
  };
}

/**
 * Nearby Search (New): max 20 results per request; no next-page token.
 * Omit `includedTypes` / primary-type filters to receive all place types in the circle.
 */
export async function placesSearchNearbyNew(options: {
  circle: CircleRegion;
  includedTypes?: string[];
  includedPrimaryTypes?: string[];
  maxResultCount?: number;
  rankPreference?: "POPULARITY" | "DISTANCE";
  languageCode?: string;
  regionCode?: string;
}): Promise<PlaceSeedRow[]> {
  const key = getKey();
  const body: Record<string, unknown> = {
    locationRestriction: {
      circle: {
        center: options.circle.center,
        radius: options.circle.radiusMeters,
      },
    },
    maxResultCount: Math.min(20, Math.max(1, options.maxResultCount ?? 20)),
    rankPreference: options.rankPreference ?? "POPULARITY",
    languageCode: options.languageCode ?? "en",
  };
  if (options.regionCode) body.regionCode = options.regionCode;
  if (options.includedTypes?.length) body.includedTypes = options.includedTypes;
  if (options.includedPrimaryTypes?.length) body.includedPrimaryTypes = options.includedPrimaryTypes;

  const res = await fetch(SEARCH_NEARBY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask": PLACE_SEED_FIELD_MASK,
    },
    body: JSON.stringify(body),
  });

  const raw = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    throw new Error(readGooglePlacesErrorMessage(raw, `Places searchNearby failed (${res.status})`));
  }

  const places = raw.places;
  if (!Array.isArray(places)) return [];

  const out: PlaceSeedRow[] = [];
  for (const p of places) {
    if (!p || typeof p !== "object") continue;
    const row = parsePlaceSeedRow(p as Record<string, unknown>);
    if (row) out.push(row);
  }
  return out;
}

export type TextSearchPageResult = {
  places: PlaceSeedRow[];
  nextPageToken: string | null;
};

/**
 * Text Search (New): paginate with `pageToken`; Google caps total results per query (often ~60 across pages).
 */
export async function placesSearchTextPage(options: {
  textQuery: string;
  pageSize?: number;
  pageToken?: string;
  /** Hard boundary — rectangle low/high (preferred with textQuery for Maple Leaf–style boxes). */
  locationRestriction?: { rectangle: { low: LatLng; high: LatLng } };
  /** Soft bias — rectangle or circle (optional alternative to restriction). */
  locationBias?: Record<string, unknown>;
  languageCode?: string;
  regionCode?: string;
  includedType?: string;
  strictTypeFiltering?: boolean;
}): Promise<TextSearchPageResult> {
  const key = getKey();
  const body: Record<string, unknown> = {
    textQuery: options.textQuery.trim(),
    pageSize: Math.min(20, Math.max(1, options.pageSize ?? 20)),
    languageCode: options.languageCode ?? "en",
  };
  if (options.regionCode) body.regionCode = options.regionCode;
  if (options.pageToken?.trim()) body.pageToken = options.pageToken.trim();
  if (options.locationRestriction) body.locationRestriction = options.locationRestriction;
  if (options.locationBias) body.locationBias = options.locationBias;
  if (options.includedType) body.includedType = options.includedType;
  if (options.strictTypeFiltering !== undefined) body.strictTypeFiltering = options.strictTypeFiltering;

  const res = await fetch(SEARCH_TEXT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask": `${PLACE_SEED_FIELD_MASK},nextPageToken`,
    },
    body: JSON.stringify(body),
  });

  const raw = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    throw new Error(readGooglePlacesErrorMessage(raw, `Places searchText failed (${res.status})`));
  }

  const placesRaw = raw.places;
  const places: PlaceSeedRow[] = [];
  if (Array.isArray(placesRaw)) {
    for (const p of placesRaw) {
      if (!p || typeof p !== "object") continue;
      const row = parsePlaceSeedRow(p as Record<string, unknown>);
      if (row) places.push(row);
    }
  }

  const token =
    typeof raw.nextPageToken === "string" && raw.nextPageToken.trim() ? raw.nextPageToken.trim() : null;

  return { places, nextPageToken: token };
}

/** Collect all pages for one text query (stops when token absent or `maxPages` reached). */
export async function placesSearchTextAllPages(
  options: Parameters<typeof placesSearchTextPage>[0] & { maxPages?: number }
): Promise<PlaceSeedRow[]> {
  const { maxPages: maxPagesOpt, pageToken: _ignored, ...pageOpts } = options;
  const maxPages = maxPagesOpt ?? 8;
  const merged: PlaceSeedRow[] = [];
  let pageToken: string | undefined;

  for (let i = 0; i < maxPages; i++) {
    const { places, nextPageToken } = await placesSearchTextPage({
      ...pageOpts,
      pageToken,
    });
    merged.push(...places);
    if (!nextPageToken) break;
    pageToken = nextPageToken;
  }

  return merged;
}

function getKey(): string {
  const key = process.env.GOOGLE_PLACES_API_KEY?.trim();
  if (!key) throw new Error("GOOGLE_PLACES_API_KEY is not set");
  return key;
}

export async function placesAutocompleteNew(
  input: string,
  sessionToken?: string
): Promise<PlaceAutocompleteSuggestion[]> {
  if (!input.trim()) return [];
  const key = getKey();
  const body: Record<string, unknown> = {
    input: input.trim().slice(0, 200),
    languageCode: "en",
  };
  if (sessionToken?.trim()) body.sessionToken = sessionToken.trim();

  const res = await fetch(AUTOCOMPLETE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask":
        "suggestions.placePrediction.placeId,suggestions.placePrediction.text,suggestions.placePrediction.structuredFormat",
    },
    body: JSON.stringify(body),
  });

  const raw = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    const msg =
      typeof raw.error === "object" &&
      raw.error &&
      "message" in raw.error &&
      typeof (raw.error as { message: unknown }).message === "string"
        ? (raw.error as { message: string }).message
        : `Places autocomplete failed (${res.status})`;
    throw new Error(msg);
  }

  const suggestions = raw.suggestions;
  if (!Array.isArray(suggestions)) return [];

  const out: PlaceAutocompleteSuggestion[] = [];
  for (const s of suggestions) {
    if (!s || typeof s !== "object") continue;
    const pred = (s as { placePrediction?: unknown }).placePrediction;
    if (!pred || typeof pred !== "object") continue;
    const p = pred as Record<string, unknown>;
    let placeId = typeof p.placeId === "string" ? p.placeId : "";
    if (!placeId && typeof p.place === "string" && p.place.startsWith("places/")) {
      placeId = p.place.slice("places/".length);
    }
    if (!placeId) continue;
    const text = p.text as { text?: string } | undefined;
    const main = text?.text ?? "";
    const struct = p.structuredFormat as
      | { mainText?: { text?: string }; secondaryText?: { text?: string } }
      | undefined;
    const mainText = struct?.mainText?.text ?? main;
    const secondaryText = struct?.secondaryText?.text ?? "";
    out.push({ placeId, mainText, secondaryText });
  }
  return out;
}

export async function placeDetailsNew(
  placeId: string,
  sessionToken?: string
): Promise<PlaceDetailsResult> {
  const key = getKey();
  const id = encodeURIComponent(placeId);
  const url = new URL(`${PLACE_BASE}${id}`);
  if (sessionToken?.trim()) url.searchParams.set("sessionToken", sessionToken.trim());

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask": "id,displayName,formattedAddress,googleMapsUri",
    },
  });

  const raw = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    const msg =
      typeof raw.error === "object" &&
      raw.error &&
      "message" in raw.error &&
      typeof (raw.error as { message: unknown }).message === "string"
        ? (raw.error as { message: string }).message
        : `Place details failed (${res.status})`;
    throw new Error(msg);
  }

  const displayName =
    typeof raw.displayName === "object" &&
    raw.displayName &&
    "text" in raw.displayName &&
    typeof (raw.displayName as { text: unknown }).text === "string"
      ? (raw.displayName as { text: string }).text
      : "";

  return {
    placeId: typeof raw.id === "string" ? raw.id : placeId,
    displayName,
    formattedAddress: typeof raw.formattedAddress === "string" ? raw.formattedAddress : "",
    googleMapsUri: typeof raw.googleMapsUri === "string" ? raw.googleMapsUri : "",
  };
}
