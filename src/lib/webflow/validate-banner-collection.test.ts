import { describe, expect, it } from "vitest";
import { validateBannerCollectionFields } from "./validate-banner-collection";

const slugs = {
  message: "message",
  linkUrl: "link-url",
  active: "active",
  expiresAt: "expires-at",
  urgent: "urgent",
  urgentUntil: "urgent-until",
  editorNotes: "editor-notes",
};

describe("validateBannerCollectionFields", () => {
  it("passes for a matching collection", () => {
    const fields = [
      { slug: "name", type: "PlainText" },
      { slug: "slug", type: "PlainText" },
      { slug: "message", type: "PlainText" },
      { slug: "link-url", type: "PlainText" },
      { slug: "active", type: "Switch" },
      { slug: "expires-at", type: "DateTime" },
      { slug: "urgent", type: "Switch" },
      { slug: "urgent-until", type: "DateTime" },
      { slug: "editor-notes", type: "PlainText" },
    ];
    expect(validateBannerCollectionFields(fields, slugs)).toEqual({ ok: true });
  });

  it("allows Link for link URL slug", () => {
    const fields = [
      { slug: "message", type: "PlainText" },
      { slug: "link-url", type: "Link" },
      { slug: "active", type: "Switch" },
      { slug: "expires-at", type: "DateTime" },
      { slug: "urgent", type: "Switch" },
      { slug: "urgent-until", type: "DateTime" },
      { slug: "editor-notes", type: "PlainText" },
    ];
    expect(validateBannerCollectionFields(fields, slugs)).toEqual({ ok: true });
  });

  it("fails when a slug is missing", () => {
    const fields = [{ slug: "message", type: "PlainText" }];
    const r = validateBannerCollectionFields(fields, slugs);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.issues.some((i) => i.includes("link-url"))).toBe(true);
  });

  it("fails on wrong type", () => {
    const fields = [
      { slug: "message", type: "RichText" },
      { slug: "link-url", type: "PlainText" },
      { slug: "active", type: "Switch" },
      { slug: "expires-at", type: "DateTime" },
      { slug: "urgent", type: "Switch" },
      { slug: "urgent-until", type: "DateTime" },
      { slug: "editor-notes", type: "PlainText" },
    ];
    const r = validateBannerCollectionFields(fields, slugs);
    expect(r.ok).toBe(false);
  });
});
