/**
 * What the Edit website screen may change. One definition drives both the side form
 * (labels, inputs) and server-side validation, so the API only ever writes allowed fields.
 * Keep in step with the Sanity schemas in /sanity/schemas.
 */

export type FieldKind = "text" | "textarea" | "datetime" | "url" | "number" | "select" | "boolean" | "image" | "richtext";

export type FieldDef = {
  name: string;
  label: string;
  kind: FieldKind;
  help?: string;
  options?: string[];
  min?: number;
  max?: number;
  required?: boolean;
};

export type DocTypeDef = { label: string; titleField: string; fields: FieldDef[] };

export const DOC_TYPES: Record<string, DocTypeDef> = {
  event: {
    label: "Event",
    titleField: "title",
    fields: [
      { name: "title", label: "Title", kind: "text", required: true },
      { name: "startsAt", label: "Starts", kind: "datetime", required: true },
      { name: "endsAt", label: "Ends", kind: "datetime" },
      { name: "category", label: "Category", kind: "text" },
      { name: "locationName", label: "Location", kind: "text" },
      { name: "mapQuery", label: "Map search text", kind: "text", help: "Defaults to the location plus Seattle, WA." },
      { name: "mapZoom", label: "Map zoom", kind: "number", min: 1, max: 21 },
      { name: "shortDescription", label: "Short description", kind: "textarea" },
      { name: "image", label: "Cover image", kind: "image" },
      { name: "imageAspect", label: "Image shape", kind: "select", options: ["landscape", "portrait"] },
      { name: "imagePosition", label: "Image side (portrait only)", kind: "select", options: ["left", "right"] },
      { name: "externalUrl", label: "External link", kind: "url", help: "If set, the event button links here instead of directions." },
      { name: "body", label: "Page content", kind: "richtext" },
    ],
  },
  bannerItem: {
    label: "Banner item",
    titleField: "headline",
    fields: [
      { name: "headline", label: "Headline", kind: "text", required: true },
      { name: "linkText", label: "Link text", kind: "text", required: true },
      { name: "linkPath", label: "Link", kind: "text", required: true, help: "A site path like /community-meeting, or a full URL." },
      { name: "pinned", label: "Pin to the front", kind: "boolean" },
      { name: "expiresAt", label: "Hide after", kind: "datetime" },
    ],
  },
  livestream: {
    label: "Live stream",
    titleField: "title",
    fields: [
      { name: "title", label: "Title", kind: "text", required: true },
      { name: "dateLabel", label: "Date line", kind: "text", help: "Shown as written." },
      { name: "youtubeId", label: "YouTube ID", kind: "text", required: true },
      { name: "heroImage", label: "Hero image", kind: "image" },
      { name: "heroBlurb", label: "Hero blurb", kind: "textarea" },
      { name: "featuredUntil", label: "Feature until", kind: "datetime" },
      { name: "body", label: "Page content", kind: "richtext" },
    ],
  },
};

const TEXT_MAX = 500;
const TEXTAREA_MAX = 5000;
const BLOCK_TYPES = new Set(["block", "image", "youtube"]);

/** Strips the drafts. prefix and rejects ids that aren't plain document ids. */
export function normalizeDocId(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const id = raw.replace(/^drafts\./, "");
  return /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(id) ? id : null;
}

export type ValidatedChanges = { set: Record<string, unknown>; unset: string[] };
export type ValidationResult = { ok: true; changes: ValidatedChanges } | { ok: false; error: string };

function isImageValue(v: unknown): boolean {
  if (!v || typeof v !== "object") return false;
  const img = v as { asset?: { _type?: unknown; _ref?: unknown }; alt?: unknown };
  const ref = img.asset?._ref;
  return img.asset?._type === "reference" && typeof ref === "string" && /^image-[A-Za-z0-9]+-\d+x\d+-[a-z0-9]+$/.test(ref) && (img.alt === undefined || typeof img.alt === "string");
}

function isRichText(v: unknown): boolean {
  if (!Array.isArray(v) || v.length > 500) return false;
  return v.every((b) => b && typeof b === "object" && BLOCK_TYPES.has((b as { _type?: string })._type ?? "") && typeof (b as { _key?: unknown })._key === "string");
}

/** Checks `changes` against the allowlist for `docType`. Empty values clear optional fields. */
export function validateChanges(docType: string, changes: unknown): ValidationResult {
  const def = DOC_TYPES[docType];
  if (!def) return { ok: false, error: `Documents of type "${docType}" can't be edited here` };
  if (!changes || typeof changes !== "object" || Array.isArray(changes)) return { ok: false, error: "changes must be an object" };

  const set: Record<string, unknown> = {};
  const unset: string[] = [];

  for (const [name, value] of Object.entries(changes as Record<string, unknown>)) {
    const field = def.fields.find((f) => f.name === name);
    if (!field) return { ok: false, error: `"${name}" can't be edited` };

    const empty = value === null || value === "" || (Array.isArray(value) && value.length === 0 && field.kind === "richtext");
    if (empty) {
      if (field.required) return { ok: false, error: `${field.label} is required` };
      unset.push(name);
      continue;
    }

    switch (field.kind) {
      case "text":
      case "url":
        if (typeof value !== "string" || value.length > TEXT_MAX) return { ok: false, error: `${field.label} must be text under ${TEXT_MAX} characters` };
        if (field.kind === "url" && !/^https?:\/\//i.test(value)) return { ok: false, error: `${field.label} must start with http:// or https://` };
        set[name] = value.trim();
        break;
      case "textarea":
        if (typeof value !== "string" || value.length > TEXTAREA_MAX) return { ok: false, error: `${field.label} must be text under ${TEXTAREA_MAX} characters` };
        set[name] = value.trim();
        break;
      case "datetime": {
        const t = typeof value === "string" ? Date.parse(value) : NaN;
        if (Number.isNaN(t)) return { ok: false, error: `${field.label} must be a valid date and time` };
        set[name] = new Date(t).toISOString();
        break;
      }
      case "number":
        if (typeof value !== "number" || !Number.isFinite(value) || value < (field.min ?? -Infinity) || value > (field.max ?? Infinity)) return { ok: false, error: `${field.label} must be a number${field.min != null ? ` between ${field.min} and ${field.max}` : ""}` };
        set[name] = value;
        break;
      case "select":
        if (typeof value !== "string" || !field.options?.includes(value)) return { ok: false, error: `${field.label} must be one of ${field.options?.join(", ")}` };
        set[name] = value;
        break;
      case "boolean":
        if (typeof value !== "boolean") return { ok: false, error: `${field.label} must be true or false` };
        set[name] = value;
        break;
      case "image":
        if (!isImageValue(value)) return { ok: false, error: `${field.label} must be an uploaded image` };
        set[name] = value;
        break;
      case "richtext":
        if (!isRichText(value)) return { ok: false, error: `${field.label} isn't valid page content` };
        set[name] = value;
        break;
    }
  }

  if (Object.keys(set).length === 0 && unset.length === 0) return { ok: false, error: "Nothing to save" };
  return { ok: true, changes: { set, unset } };
}
