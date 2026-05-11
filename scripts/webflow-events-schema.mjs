/**
 * Shared field specs for MLCC dashboard ↔ Webflow Events CMS (must match
 * src/lib/webflow/event-field-slugs.ts defaults unless env overrides).
 */

/** Default Webflow collection identity for a fresh Events CMS. */
export const EVENT_COLLECTION_DEFAULTS = {
  displayName: "Events",
  singularName: "Event",
  /** URL segment for this collection (lowercase; must be unique per site). */
  slug: "events",
};

export const EVENT_FIELD_SPECS_BASE = [
  {
    slugKey: "startsAt",
    type: "DateTime",
    displayName: "Starts at",
    isRequired: true,
    helpText: "When the event begins (dashboard + calendar).",
  },
  {
    slugKey: "endsAt",
    type: "DateTime",
    displayName: "Ends at",
    isRequired: false,
    helpText: "When the event ends (optional).",
  },
  {
    slugKey: "locationName",
    type: "PlainText",
    displayName: "Location name",
    isRequired: false,
    helpText: "Venue or place name from Places.",
  },
  {
    slugKey: "locationPlaceId",
    type: "PlainText",
    displayName: "Location place id",
    isRequired: false,
    helpText: "Google Places place_id for this location.",
  },
  {
    slugKey: "locationAddress",
    type: "PlainText",
    displayName: "Location address",
    isRequired: false,
    helpText: "Formatted address from Places.",
  },
  {
    slugKey: "locationUrl",
    type: "Link",
    displayName: "Location url",
    isRequired: false,
    helpText: "Maps / directions link.",
  },
  {
    slugKey: "shortDescription",
    type: "PlainText",
    displayName: "Short description",
    isRequired: false,
    helpText: "Teaser for listings and cards.",
  },
  {
    slugKey: "body",
    type: "PlainText",
    displayName: "Body",
    isRequired: false,
    helpText: "Long description (plain text).",
  },
  {
    slugKey: "isExternal",
    type: "Switch",
    displayName: "Is external",
    isRequired: false,
    helpText: "Third-party / shared event when on.",
  },
  {
    slugKey: "externalEventUrl",
    type: "Link",
    displayName: "External event url",
    isRequired: false,
    helpText: "Link to organizer’s event / RSVP if external.",
  },
  {
    slugKey: "externalOrgName",
    type: "PlainText",
    displayName: "External org name",
    isRequired: false,
    helpText: "Organizer name when external.",
  },
  {
    slugKey: "externalOrgUrl",
    type: "Link",
    displayName: "External org url",
    isRequired: false,
    helpText: "Organizer website when external.",
  },
  {
    slugKey: "featuredImage",
    type: "Image",
    displayName: "Featured image",
    isRequired: false,
    helpText: "Hero / card image from dashboard upload.",
  },
];

export function committeeFieldSpec(committeesCollectionId) {
  return {
    slugKey: "committee",
    type: "Reference",
    displayName: "Committee",
    isRequired: false,
    helpText: "Reference to a committee CMS item.",
    metadata: { collectionId: committeesCollectionId },
  };
}

/** Same resolution as `getEventFieldSlugs()` in `src/lib/webflow/event-field-slugs.ts`. */
export function eventSlugsFromEnv() {
  return {
    name: process.env.WEBFLOW_EVENT_FIELD_NAME_SLUG?.trim() || "name",
    slug: process.env.WEBFLOW_EVENT_FIELD_SLUG_SLUG?.trim() || "slug",
    startsAt:
      process.env.WEBFLOW_EVENT_CALENDAR_FIELD_SLUG?.trim() || "starts-at",
    endsAt: process.env.WEBFLOW_EVENT_END_FIELD_SLUG?.trim() || "ends-at",
    locationName:
      process.env.WEBFLOW_EVENT_LOCATION_NAME_SLUG?.trim() || "location-name",
    locationPlaceId:
      process.env.WEBFLOW_EVENT_LOCATION_PLACE_ID_SLUG?.trim() ||
      "location-place-id",
    locationAddress:
      process.env.WEBFLOW_EVENT_LOCATION_ADDRESS_SLUG?.trim() ||
      "location-address",
    locationUrl:
      process.env.WEBFLOW_EVENT_LOCATION_URL_SLUG?.trim() || "location-url",
    shortDescription:
      process.env.WEBFLOW_EVENT_SHORT_DESCRIPTION_SLUG?.trim() ||
      "short-description",
    body: process.env.WEBFLOW_EVENT_BODY_SLUG?.trim() || "body",
    longDescription:
      process.env.WEBFLOW_EVENT_LONG_DESCRIPTION_SLUG?.trim() || "long-description",
    committee:
      process.env.WEBFLOW_EVENT_COMMITTEE_FIELD_SLUG?.trim() || "committee",
    isExternal:
      process.env.WEBFLOW_EVENT_IS_EXTERNAL_SLUG?.trim() || "is-external",
    externalEventUrl:
      process.env.WEBFLOW_EVENT_EXTERNAL_EVENT_URL_SLUG?.trim() ||
      "external-event-url",
    externalOrgName:
      process.env.WEBFLOW_EVENT_EXTERNAL_ORG_NAME_SLUG?.trim() ||
      "external-org-name",
    externalOrgUrl:
      process.env.WEBFLOW_EVENT_EXTERNAL_ORG_URL_SLUG?.trim() ||
      "external-org-url",
    featuredImage:
      process.env.WEBFLOW_EVENT_FEATURED_IMAGE_SLUG?.trim() ||
      "featured-image",
  };
}

export const LOGICAL_TYPES = {
  startsAt: ["DateTime"],
  endsAt: ["DateTime"],
  locationName: ["PlainText"],
  locationPlaceId: ["PlainText"],
  locationAddress: ["PlainText"],
  locationUrl: ["Link"],
  shortDescription: ["PlainText"],
  body: ["PlainText", "RichText"],
  longDescription: ["RichText"],
  committee: ["Reference"],
  isExternal: ["Switch"],
  externalEventUrl: ["Link"],
  externalOrgName: ["PlainText"],
  externalOrgUrl: ["Link"],
  featuredImage: ["Image"],
};

export function slugifyFieldDisplayName(displayName) {
  const s = String(displayName || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s || "field";
}

export function normalizeFields(fields) {
  return (fields ?? []).map((f) => ({
    ...f,
    slug:
      typeof f.slug === "string" && f.slug.trim()
        ? f.slug.trim()
        : slugifyFieldDisplayName(f.displayName),
  }));
}

export function expandBlueprint(slugs, committeesId) {
  const out = [...EVENT_FIELD_SPECS_BASE];
  if (committeesId) {
    out.push(committeeFieldSpec(committeesId));
  }
  return out.map((spec) => ({
    ...spec,
    expectedSlug: slugs[spec.slugKey],
  }));
}

/** Payload for POST /sites/:siteId/collections `fields` array. */
export function fieldsForCollectionCreate(committeesId) {
  const slugs = eventSlugsFromEnv();
  return expandBlueprint(slugs, committeesId).map((spec) => ({
    type: spec.type,
    displayName: spec.displayName,
    isRequired: spec.isRequired ?? false,
    ...(spec.helpText ? { helpText: spec.helpText } : {}),
    ...(spec.metadata ? { metadata: spec.metadata } : {}),
  }));
}

export function verifyMapping(collection, specs) {
  const fields = normalizeFields(collection.fields ?? []);
  const issues = [];
  for (const spec of specs) {
    const slug = spec.expectedSlug;
    const allow = LOGICAL_TYPES[spec.slugKey];
    const f = fields.find((x) => x.slug === slug);
    if (!f) {
      issues.push(`Missing field "${spec.slugKey}": no Webflow field with slug "${slug}".`);
      continue;
    }
    if (!allow?.includes(f.type)) {
      issues.push(
        `"${slug}" (${spec.slugKey}) has type "${f.type}"; expected ${allow?.join(" or ") ?? "?"}.`
      );
    }
  }
  return issues;
}
