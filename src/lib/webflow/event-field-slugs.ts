/**
 * Default slugs for the Webflow Events CMS collection (see .env.example).
 * Override schedule fields with WEBFLOW_EVENT_CALENDAR_FIELD_SLUG / WEBFLOW_EVENT_END_FIELD_SLUG.
 */

export type EventFieldSlugs = {
  name: string;
  slug: string;
  startsAt: string;
  endsAt: string;
  locationName: string;
  locationPlaceId: string;
  locationAddress: string;
  locationUrl: string;
  shortDescription: string;
  body: string;
  committee: string;
  isExternal: string;
  externalEventUrl: string;
  externalOrgName: string;
  externalOrgUrl: string;
  featuredImage: string;
};

/** Defaults when env overrides are unset (also used as client fallback if API omits `eventFieldSlugs`). */
export const DEFAULT_EVENT_FIELD_SLUGS: EventFieldSlugs = {
  name: "name",
  slug: "slug",
  startsAt: "starts-at",
  endsAt: "ends-at",
  locationName: "location-name",
  locationPlaceId: "location-place-id",
  locationAddress: "location-address",
  locationUrl: "location-url",
  shortDescription: "short-description",
  body: "body",
  committee: "committee",
  isExternal: "is-external",
  externalEventUrl: "external-event-url",
  externalOrgName: "external-org-name",
  externalOrgUrl: "external-org-url",
  featuredImage: "featured-image",
};

export function getEventFieldSlugs(): EventFieldSlugs {
  return {
    name: process.env.WEBFLOW_EVENT_FIELD_NAME_SLUG?.trim() || DEFAULT_EVENT_FIELD_SLUGS.name,
    slug: process.env.WEBFLOW_EVENT_FIELD_SLUG_SLUG?.trim() || DEFAULT_EVENT_FIELD_SLUGS.slug,
    startsAt:
      process.env.WEBFLOW_EVENT_CALENDAR_FIELD_SLUG?.trim() || DEFAULT_EVENT_FIELD_SLUGS.startsAt,
    endsAt: process.env.WEBFLOW_EVENT_END_FIELD_SLUG?.trim() || DEFAULT_EVENT_FIELD_SLUGS.endsAt,
    locationName:
      process.env.WEBFLOW_EVENT_LOCATION_NAME_SLUG?.trim() || DEFAULT_EVENT_FIELD_SLUGS.locationName,
    locationPlaceId:
      process.env.WEBFLOW_EVENT_LOCATION_PLACE_ID_SLUG?.trim() ||
      DEFAULT_EVENT_FIELD_SLUGS.locationPlaceId,
    locationAddress:
      process.env.WEBFLOW_EVENT_LOCATION_ADDRESS_SLUG?.trim() ||
      DEFAULT_EVENT_FIELD_SLUGS.locationAddress,
    locationUrl:
      process.env.WEBFLOW_EVENT_LOCATION_URL_SLUG?.trim() || DEFAULT_EVENT_FIELD_SLUGS.locationUrl,
    shortDescription:
      process.env.WEBFLOW_EVENT_SHORT_DESCRIPTION_SLUG?.trim() ||
      DEFAULT_EVENT_FIELD_SLUGS.shortDescription,
    body: process.env.WEBFLOW_EVENT_BODY_SLUG?.trim() || DEFAULT_EVENT_FIELD_SLUGS.body,
    committee:
      process.env.WEBFLOW_EVENT_COMMITTEE_FIELD_SLUG?.trim() || DEFAULT_EVENT_FIELD_SLUGS.committee,
    isExternal:
      process.env.WEBFLOW_EVENT_IS_EXTERNAL_SLUG?.trim() || DEFAULT_EVENT_FIELD_SLUGS.isExternal,
    externalEventUrl:
      process.env.WEBFLOW_EVENT_EXTERNAL_EVENT_URL_SLUG?.trim() ||
      DEFAULT_EVENT_FIELD_SLUGS.externalEventUrl,
    externalOrgName:
      process.env.WEBFLOW_EVENT_EXTERNAL_ORG_NAME_SLUG?.trim() ||
      DEFAULT_EVENT_FIELD_SLUGS.externalOrgName,
    externalOrgUrl:
      process.env.WEBFLOW_EVENT_EXTERNAL_ORG_URL_SLUG?.trim() ||
      DEFAULT_EVENT_FIELD_SLUGS.externalOrgUrl,
    featuredImage:
      process.env.WEBFLOW_EVENT_FEATURED_IMAGE_SLUG?.trim() ||
      DEFAULT_EVENT_FIELD_SLUGS.featuredImage,
  };
}
