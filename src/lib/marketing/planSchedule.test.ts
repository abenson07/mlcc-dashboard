import { describe, expect, it } from "vitest";
import {
  buildPlan,
  daysBetween,
  pacificNineAmIso,
  toPacificDay,
} from "./planSchedule";

describe("buildPlan", () => {
  it("announces right away when the next slot would leave a gap", () => {
    const plan = buildPlan({
      eventDay: "2026-10-09",
      today: "2026-09-30",
      intensity: "standard",
      channels: ["facebook"],
    });
    expect(plan.daysOut).toBe(9);
    expect(plan.touches.map((t) => [t.date, t.kind])).toEqual([
      ["2026-09-30", "announcement"],
      ["2026-10-02", "reminder"],
      ["2026-10-06", "reminder"],
      ["2026-10-08", "day-before"],
      ["2026-10-09", "day-of"],
    ]);
  });

  it("only emails on announcement, day-before and week/3-day reminders", () => {
    const plan = buildPlan({
      eventDay: "2026-10-09",
      today: "2026-09-18",
      intensity: "standard",
      channels: ["email", "instagram"],
    });
    const email = plan.touches.filter((t) => t.channel === "email");
    // 21 days out: announcement, then 7 and 3 day reminders, then day-before (14-day reminder is social-only).
    expect(email.map((t) => [t.daysBefore, t.kind])).toEqual([
      [21, "announcement"],
      [7, "reminder"],
      [3, "reminder"],
      [1, "day-before"],
    ]);
    expect(plan.touches.some((t) => t.channel === "instagram" && t.kind === "day-of")).toBe(true);
    expect(email.some((t) => t.kind === "day-of")).toBe(false);
  });

  it("returns no touches for a past event or no channels", () => {
    expect(
      buildPlan({ eventDay: "2026-09-01", today: "2026-09-30", intensity: "light", channels: ["email"] }).touches,
    ).toEqual([]);
    expect(
      buildPlan({ eventDay: "2026-10-09", today: "2026-09-30", intensity: "light", channels: [] }).touches,
    ).toEqual([]);
  });

  it("gives an event-day plan a single announcement", () => {
    const plan = buildPlan({
      eventDay: "2026-09-30",
      today: "2026-09-30",
      intensity: "heavy",
      channels: ["facebook"],
    });
    expect(plan.touches).toHaveLength(1);
    expect(plan.touches[0].kind).toBe("announcement");
  });

  it("scales touch count with intensity", () => {
    const base = { eventDay: "2026-10-30", today: "2026-09-30", channels: ["facebook" as const] };
    const light = buildPlan({ ...base, intensity: "light" }).touches.length;
    const heavy = buildPlan({ ...base, intensity: "heavy" }).touches.length;
    expect(heavy).toBeGreaterThan(light);
  });
});

describe("date helpers", () => {
  it("counts days between Pacific days", () => {
    expect(daysBetween("2026-09-30", "2026-10-09")).toBe(9);
  });

  it("converts instants to Pacific days", () => {
    expect(toPacificDay("2026-10-10T03:00:00.000Z")).toBe("2026-10-09");
  });

  it("returns 9am Pacific in both DST and standard time", () => {
    expect(pacificNineAmIso("2026-10-09")).toBe("2026-10-09T16:00:00.000Z");
    expect(pacificNineAmIso("2026-12-09")).toBe("2026-12-09T17:00:00.000Z");
  });
});
