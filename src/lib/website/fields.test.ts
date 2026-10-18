import { describe, expect, it } from "vitest";
import { normalizeDocId, validateChanges } from "./fields";

describe("normalizeDocId", () => {
  it("strips the drafts prefix and rejects odd ids", () => {
    expect(normalizeDocId("drafts.event-silent-book-club")).toBe("event-silent-book-club");
    expect(normalizeDocId("a/b")).toBeNull();
    expect(normalizeDocId("")).toBeNull();
    expect(normalizeDocId(42)).toBeNull();
  });
});

describe("validateChanges", () => {
  it("accepts allowed text and clears optional fields", () => {
    const r = validateChanges("event", { title: "  Summer Social ", category: "" });
    expect(r).toEqual({ ok: true, changes: { set: { title: "Summer Social" }, unset: ["category"] } });
  });

  it("rejects fields outside the allowlist and unknown types", () => {
    expect(validateChanges("event", { slug: "x" })).toMatchObject({ ok: false });
    expect(validateChanges("event", { supabaseEventId: "x" })).toMatchObject({ ok: false });
    expect(validateChanges("siteSettings", { title: "x" })).toMatchObject({ ok: false });
  });

  it("won't clear required fields", () => {
    expect(validateChanges("event", { title: "" })).toMatchObject({ ok: false });
  });

  it("normalizes dates and validates numbers/selects/urls", () => {
    const r = validateChanges("event", { startsAt: "2026-10-20T19:00:00-07:00", mapZoom: 15, imageAspect: "portrait", externalUrl: "https://example.org/x" });
    expect(r.ok && r.changes.set.startsAt).toBe("2026-10-21T02:00:00.000Z");
    expect(validateChanges("event", { startsAt: "nope" })).toMatchObject({ ok: false });
    expect(validateChanges("event", { mapZoom: 99 })).toMatchObject({ ok: false });
    expect(validateChanges("event", { imageAspect: "square" })).toMatchObject({ ok: false });
    expect(validateChanges("event", { externalUrl: "javascript:alert(1)" })).toMatchObject({ ok: false });
  });

  it("only accepts uploaded image references and known block types", () => {
    const img = { _type: "image", asset: { _type: "reference", _ref: "image-abc123-800x600-jpg" }, alt: "Park" };
    expect(validateChanges("event", { image: img }).ok).toBe(true);
    expect(validateChanges("event", { image: { asset: { _type: "reference", _ref: "file-abc-pdf" } } }).ok).toBe(false);
    expect(validateChanges("event", { body: [{ _type: "block", _key: "a", children: [] }] }).ok).toBe(true);
    expect(validateChanges("event", { body: [{ _type: "script", _key: "a" }] }).ok).toBe(false);
  });
});
