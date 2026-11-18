import { createClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import { activateLeaflet, LeafletActivationConflictError } from "./activateLeaflet";

function client(response: unknown, status = 200) {
  const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify(response), {
    status,
    headers: { "Content-Type": "application/json" },
  }));
  const supabase = createClient("http://127.0.0.1:1", "test-key", {
    global: { fetch },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  return { supabase, fetch };
}

describe("atomic leaflet activation", () => {
  it("sends the target and confirmed current issue to a single database operation", async () => {
    const row = { id: "target", status: "active", closed_at: null };
    const { supabase, fetch } = client(row);
    expect(await activateLeaflet(supabase, "target", { expectedActiveId: "current" })).toEqual(row);
    expect(fetch).toHaveBeenCalledOnce();
    const [url, options] = fetch.mock.calls[0];
    expect(String(url)).toContain("/rest/v1/rpc/activate_leaflet_issue");
    expect(JSON.parse(options.body)).toEqual({
      target_leaflet_id: "target",
      expected_active_leaflet_id: "current",
    });
  });

  it.each(["40001", "23505"])("reports a changed-active conflict (%s) without retrying writes", async (code) => {
    const { supabase, fetch } = client({ code, message: "Conflict" }, 409);
    await expect(activateLeaflet(supabase, "target", { expectedActiveId: null }))
      .rejects.toBeInstanceOf(LeafletActivationConflictError);
    expect(fetch).toHaveBeenCalledOnce();
  });

  it("reports the migration prerequisite rather than falling back to separate writes", async () => {
    const { supabase, fetch } = client({ code: "PGRST202", message: "Function not found" }, 404);
    await expect(activateLeaflet(supabase, "target", { expectedActiveId: null }))
      .rejects.toThrow("database migration");
    expect(fetch).toHaveBeenCalledOnce();
  });

  it("preserves database errors for the caller", async () => {
    const { supabase } = client({ code: "42501", message: "Permission denied" }, 403);
    await expect(activateLeaflet(supabase, "target", { expectedActiveId: null }))
      .rejects.toThrow("Permission denied");
  });
});
