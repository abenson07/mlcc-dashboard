import { describe, expect, it } from "vitest";
import {
  formatLinearBatchDescription,
  formatLinearBatchTitle,
} from "./formatLinearBatch";
import type { SiteFeedbackComment } from "./types";

const sampleComments: SiteFeedbackComment[] = [
  {
    id: "1",
    pagePath: "/membership",
    scope: "page",
    body: "Overall this page feels too long.",
    createdAt: "2026-06-24T00:00:00.000Z",
  },
  {
    id: "2",
    pagePath: "/membership",
    scope: "element",
    editableId: "membership.hero.title",
    editableType: "text",
    editableLabel: "Membership headline",
    body: "Shorten to one line.",
    createdAt: "2026-06-24T01:00:00.000Z",
  },
];

describe("formatLinearBatch", () => {
  it("builds a title with page and comment count", () => {
    expect(formatLinearBatchTitle(sampleComments)).toBe(
      "[Site feedback] /membership — 2 comments",
    );
  });

  it("includes page and element comments in description", () => {
    const description = formatLinearBatchDescription(sampleComments, "Alex");
    expect(description).toContain("**Submitted by:** Alex");
    expect(description).toContain("**Page comment:** Overall this page feels too long.");
    expect(description).toContain("Membership headline (text)");
    expect(description).toContain("Shorten to one line.");
  });
});
