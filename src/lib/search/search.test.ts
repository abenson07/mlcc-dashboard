import { describe, expect, it } from "vitest";
import { searchPages } from "@/lib/search/pageIndex";
import { searchStories } from "@/lib/search/storyIndex";
import { isIntegratedShellPath } from "@/lib/search/isIntegratedShellPath";

describe("global search helpers", () => {
  it("filters integrated pages by label", () => {
    const results = searchPages("finance", 5);
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((page) => page.label.toLowerCase().includes("finance"))).toBe(true);
  });

  it("filters mock stories by title", () => {
    const results = searchStories("chang", 5);
    expect(results).toHaveLength(1);
    expect(results[0]?.title).toContain("Chang");
  });

  it("detects integrated shell paths", () => {
    expect(isIntegratedShellPath("/old-admin/people")).toBe(true);
    expect(isIntegratedShellPath("/old-admin/neighbors")).toBe(false);
    expect(isIntegratedShellPath("/old-admin/events-hub/abc/overview")).toBe(true);
  });
});
