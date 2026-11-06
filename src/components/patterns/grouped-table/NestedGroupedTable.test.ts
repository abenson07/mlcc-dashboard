import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { NestedGroupedTable } from "./NestedGroupedTable";

function render(handlers: { onAddClick?: () => void; onFilterClick?: () => void }) {
  return renderToStaticMarkup(
    createElement(NestedGroupedTable<{ id: string }>, {
      title: "Sponsors",
      data: [],
      columns: [],
      getRowKey: (row: { id: string }) => row.id,
      ...handlers,
    }),
  );
}

describe("NestedGroupedTable header actions", () => {
  it("hides Add and Filter when the page gives them nothing to do", () => {
    const html = render({});
    expect(html).not.toContain('aria-label="Add"');
    expect(html).not.toContain('aria-label="Filter"');
  });

  it("shows each action when the page provides a handler", () => {
    const html = render({ onAddClick: () => {}, onFilterClick: () => {} });
    expect(html).toContain('aria-label="Add"');
    expect(html).toContain('aria-label="Filter"');
  });
});
