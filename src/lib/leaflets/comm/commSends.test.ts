import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  isMissingTableError,
  latestSendPerStep,
  summarizePersonSends,
  type CommSend,
} from "./commSends";
import { logCommSends } from "./sendLeafletComm";

const LABELS = { initial_confirmation: "Initial reminder", confirmation_followup: "Follow-up" };

const sends: CommSend[] = [
  { person_id: "a", step_key: "initial_confirmation", sent_at: "2026-11-08T18:00:00.000Z" },
  { person_id: "a", step_key: "initial_confirmation", sent_at: "2026-11-09T18:00:00.000Z" },
  { person_id: "a", step_key: "confirmation_followup", sent_at: "2026-11-21T18:00:00.000Z" },
  { person_id: "b", step_key: "initial_confirmation", sent_at: "2026-11-08T18:00:00.000Z" },
];

describe("latestSendPerStep", () => {
  it("keeps the newest send per template for one person only", () => {
    expect(latestSendPerStep(sends, "a")).toEqual({
      initial_confirmation: "2026-11-09T18:00:00.000Z",
      confirmation_followup: "2026-11-21T18:00:00.000Z",
    });
    expect(latestSendPerStep(sends, "nobody")).toEqual({});
  });
});

describe("summarizePersonSends", () => {
  it("shows the newest template, how many others, and all of them in the title", () => {
    const s = summarizePersonSends(sends, "a", LABELS)!;
    expect(s.text).toBe("Nov 21 · Follow-up +1");
    expect(s.title).toBe("Follow-up — Nov 21\nInitial reminder — Nov 9");
  });

  it("shows a single template without a +N", () => {
    expect(summarizePersonSends(sends, "b", LABELS)!.text).toBe("Nov 8 · Initial reminder");
  });

  it("returns null when the person was never emailed", () => {
    expect(summarizePersonSends(sends, "nobody", LABELS)).toBeNull();
  });
});

describe("isMissingTableError", () => {
  it("recognises the missing-table codes", () => {
    expect(isMissingTableError({ code: "42P01" })).toBe(true);
    expect(isMissingTableError({ code: "PGRST205" })).toBe(true);
    expect(isMissingTableError({ code: "23505" })).toBe(false);
    expect(isMissingTableError(null)).toBe(false);
  });
});

function fakeSupabase(result: { error: { code?: string; message: string } | null }) {
  const insert = vi.fn().mockResolvedValue(result);
  const from = vi.fn().mockReturnValue({ insert });
  return { client: { from } as unknown as SupabaseClient, from, insert };
}

describe("logCommSends", () => {
  const rows = [{ leaflet_id: "l", person_id: "a", step_key: "initial_confirmation", sent_at: "2026-11-08T18:00:00.000Z" }];

  it("inserts the rows into leaflet_comm_sends", async () => {
    const { client, from, insert } = fakeSupabase({ error: null });
    await logCommSends(client, rows);
    expect(from).toHaveBeenCalledWith("leaflet_comm_sends");
    expect(insert).toHaveBeenCalledWith(rows);
  });

  it("does nothing for an empty list", async () => {
    const { client, from } = fakeSupabase({ error: null });
    await logCommSends(client, []);
    expect(from).not.toHaveBeenCalled();
  });

  it("never throws, and stays quiet when the table does not exist yet", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { client } = fakeSupabase({ error: { code: "PGRST205", message: "no table" } });
    await expect(logCommSends(client, rows)).resolves.toBeUndefined();
    expect(spy).not.toHaveBeenCalled();

    const failing = fakeSupabase({ error: { code: "XX000", message: "boom" } });
    await expect(logCommSends(failing.client, rows)).resolves.toBeUndefined();
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });
});
