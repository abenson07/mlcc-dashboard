/**
 * Server-only Google Places API (New). Requires GOOGLE_PLACES_API_KEY.
 * @see https://developers.google.com/maps/documentation/places/web-service/place-autocomplete
 */

const AUTOCOMPLETE_URL = "https://places.googleapis.com/v1/places:autocomplete";
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
