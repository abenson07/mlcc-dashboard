import { describe, expect, it } from "vitest";
import { buildElementLabel, extractEditableAnchor, inferEditableType } from "./commentMode";

function mockEl(
  tag: string,
  attrs: Record<string, string> = {},
  text = "",
): HTMLElement {
  return {
    tagName: tag.toUpperCase(),
    textContent: text,
    getAttribute(name: string) {
      return attrs[name] ?? null;
    },
    getBoundingClientRect() {
      return { width: 100, height: 20, x: 0, y: 0, top: 0, left: 0, right: 100, bottom: 20, toJSON: () => ({}) };
    },
  } as unknown as HTMLElement;
}

describe("commentMode", () => {
  it("infers types from tag names when data attributes are absent", () => {
    expect(inferEditableType(mockEl("h1"))).toBe("text");
    expect(inferEditableType(mockEl("a"))).toBe("button");
    expect(inferEditableType(mockEl("img"))).toBe("image");
    expect(inferEditableType(mockEl("svg"))).toBe("image");
    expect(inferEditableType(mockEl("div"))).toBe("section");
  });

  it("prefers data-editable-type when present", () => {
    expect(
      inferEditableType(mockEl("div", { "data-editable-type": "text" })),
    ).toBe("text");
  });

  it("extracts anchor from any element and keeps data-editable metadata", () => {
    const node = mockEl(
      "h1",
      {
        "data-editable": "true",
        "data-editable-type": "text",
        "data-editable-id": "home.hero.title",
        "data-editable-label": "Hero headline",
      },
      "Welcome home",
    );

    expect(extractEditableAnchor(node)).toEqual({
      editableId: "home.hero.title",
      editableType: "text",
      editableLabel: "Hero headline",
      textSnippet: "Welcome home",
    });
  });

  it("builds a readable label for unmarked elements", () => {
    const node = mockEl("p", {}, "Neighbors building together");
    expect(buildElementLabel(node)).toBe("Neighbors building together");
  });

  it("labels an unmarked svg as the selectable graphic target", () => {
    const node = mockEl("svg", { "aria-label": "Search icon" });
    expect(buildElementLabel(node)).toBe("Image: Search icon");
  });
});
