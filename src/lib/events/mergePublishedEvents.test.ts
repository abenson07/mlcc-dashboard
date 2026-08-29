import { describe, expect, it } from "vitest";
import type { Event } from "../../../mlcc-website/data/events";
import {
  mapRowToMarketingEvent,
  mergeStaticWithPublished,
  type PublishedEventRow,
} from "../../../mlcc-website/data/mergePublishedEvents";

const staticEvent = (overrides: Partial<Event> = {}): Event => ({
  slug: "summer-social",
  title: "Static Summer Social",
  dateIso: "2026-07-16T00:30:00.000Z",
  date: "July 15, 2026",
  shortDescription: "Static blurb",
  locationName: "Maple Leaf Park",
  category: "Community",
  image: "/images/static.jpg",
  href: "https://maps.google.com/?cid=1",
  detail: { blocks: [{ kind: "paragraph", text: "Static long body" }] },
  ...overrides,
});

const publishedRow = (overrides: Partial<PublishedEventRow> = {}): PublishedEventRow => ({
  name: "Admin Summer Social",
  starts_at: "2026-07-20T00:30:00.000Z",
  slug: "summer-social",
  committee: "events",
  field_data: {
    location: "Reservoir Park",
    address: "1000 NE 80th St, Seattle",
    description: "Admin blurb",
    image_url: "/images/admin.jpg",
    category: "Festival",
  },
  ...overrides,
});

describe("mergeStaticWithPublished", () => {
  it("overlays admin fields onto a matching static slug and keeps static detail", () => {
    const merged = mergeStaticWithPublished([staticEvent()], [publishedRow()]);
    expect(merged).toHaveLength(1);
    expect(merged[0]).toMatchObject({
      slug: "summer-social",
      title: "Admin Summer Social",
      locationName: "Reservoir Park",
      shortDescription: "Admin blurb",
      image: "/images/admin.jpg",
      category: "Festival",
    });
    expect(merged[0].detail?.blocks).toEqual([{ kind: "paragraph", text: "Static long body" }]);
    expect(merged[0].href).toContain("1000%20NE%2080th");
  });

  it("replaces static detail when marketing.body is set", () => {
    const merged = mergeStaticWithPublished(
      [staticEvent()],
      [
        publishedRow({
          field_data: {
            description: "Admin blurb",
            marketing: { body: "Para one.\n\nPara two.", shortDescription: "Short" },
          },
        }),
      ],
    );
    expect(merged[0].shortDescription).toBe("Admin blurb");
    expect(merged[0].detail?.blocks).toEqual([
      { kind: "paragraph", text: "Para one." },
      { kind: "paragraph", text: "Para two." },
    ]);
  });

  it("hides a static slug listed as unpublished", () => {
    const merged = mergeStaticWithPublished(
      [staticEvent(), staticEvent({ slug: "night-out", title: "Night Out" })],
      [],
      ["summer-social"],
    );
    expect(merged.map((e) => e.slug)).toEqual(["night-out"]);
  });

  it("appends published rows that are not in the static catalog", () => {
    const merged = mergeStaticWithPublished(
      [staticEvent()],
      [
        publishedRow({
          slug: "new-movie-night",
          name: "Movie Night",
          field_data: { location: "The Tower", description: "Bring a blanket" },
        }),
      ],
    );
    expect(merged.map((e) => e.slug)).toEqual(["summer-social", "new-movie-night"]);
    expect(merged[1].title).toBe("Movie Night");
    expect(merged[1].shortDescription).toBe("Bring a blanket");
  });

  it("omits committee meetings from public output", () => {
    const merged = mergeStaticWithPublished(
      [staticEvent()],
      [
        publishedRow({
          slug: "board-meeting",
          name: "Board Meeting",
          field_data: { kind: "committee_meeting", location: "Library" },
        }),
      ],
    );
    expect(merged.map((e) => e.slug)).toEqual(["summer-social"]);
    expect(mapRowToMarketingEvent(publishedRow({ slug: "board-meeting", field_data: { kind: "committee_meeting" } }))).toBeNull();
  });
});
