import { describe, expect, it } from "vitest";
import { computePopoverPosition } from "./popoverPosition";

const viewport = { width: 1000, height: 700 };
const surface = { width: 174, height: 120 };
const trigger = (top: number, left = 400) => ({ left, right: left + 24, top, bottom: top + 24, width: 24 });

describe("computePopoverPosition", () => {
  it("opens below the trigger when there is room", () => {
    const p = computePopoverPosition({ trigger: trigger(100), surface, viewport, placement: "below", alignment: "start" });
    expect(p).toEqual({ top: 128, left: 400, placement: "below" });
  });

  it("flips above when the bottom of the window would cut it off", () => {
    const p = computePopoverPosition({ trigger: trigger(650), surface, viewport, placement: "below", alignment: "start" });
    expect(p.placement).toBe("above");
    expect(p.top).toBe(650 - 4 - 120);
  });

  it("stays below when neither side fits but below has more room", () => {
    const p = computePopoverPosition({
      trigger: trigger(100),
      surface: { width: 174, height: 900 },
      viewport,
      placement: "below",
      alignment: "start",
    });
    expect(p.placement).toBe("below");
  });

  it("aligns to the trigger's right edge for alignment=end", () => {
    const p = computePopoverPosition({ trigger: trigger(100, 600), surface, viewport, placement: "below", alignment: "end" });
    expect(p.left).toBe(624 - 174);
  });

  it("keeps the menu inside the window on both sides", () => {
    const nearRight = computePopoverPosition({ trigger: trigger(100, 960), surface, viewport, placement: "below", alignment: "start" });
    expect(nearRight.left).toBe(1000 - 174 - 8);
    const nearLeft = computePopoverPosition({ trigger: trigger(100, 2), surface, viewport, placement: "below", alignment: "end" });
    expect(nearLeft.left).toBe(8);
  });
});
