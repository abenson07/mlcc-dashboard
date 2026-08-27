import { beforeEach, describe, expect, it, vi } from "vitest";
import type { User } from "@supabase/supabase-js";

const { getSession, onAuthStateChange } = vi.hoisted(() => ({
  getSession: vi.fn(),
  onAuthStateChange: vi.fn(() => ({
    data: { subscription: { unsubscribe: vi.fn() } },
  })),
}));

vi.mock("@/lib/supabaseClient", () => ({
  supabaseClient: {
    auth: {
      getSession,
      onAuthStateChange,
    },
  },
}));

vi.mock("./findPersonByEmail", () => ({
  findPersonByEmail: vi.fn(),
}));

import { findPersonByEmail } from "./findPersonByEmail";
import {
  getCurrentPersonId,
  getCurrentPersonSnapshot,
  loadCurrentPerson,
  resetCurrentPersonCacheForTests,
} from "./currentPerson";

function sessionUser(email: string, fullName: string): User {
  return {
    id: "user-1",
    email,
    user_metadata: { full_name: fullName },
  } as User;
}

describe("loadCurrentPerson", () => {
  beforeEach(() => {
    resetCurrentPersonCacheForTests();
    getSession.mockReset();
    vi.mocked(findPersonByEmail).mockReset();
  });

  it("fetches once and reuses the session cache", async () => {
    getSession.mockResolvedValue({
      data: { session: { user: sessionUser("alex@example.com", "Alex Benson") } },
      error: null,
    });
    vi.mocked(findPersonByEmail).mockResolvedValue({
      person: {
        id: "p1",
        full_name: "Alex Benson",
        email: "alex@example.com",
        phone: null,
      },
      matchCount: 1,
      error: null,
    });

    await loadCurrentPerson();
    await loadCurrentPerson();
    const id = await getCurrentPersonId();

    expect(getSession).toHaveBeenCalledTimes(1);
    expect(findPersonByEmail).toHaveBeenCalledTimes(1);
    expect(id).toBe("p1");
    expect(getCurrentPersonSnapshot().authDisplayName).toBe("Alex Benson");
  });

  it("keeps the last known identity when a later session read fails", async () => {
    getSession.mockResolvedValueOnce({
      data: { session: { user: sessionUser("alex@example.com", "Alex Benson") } },
      error: null,
    });
    vi.mocked(findPersonByEmail).mockResolvedValue({
      person: {
        id: "p1",
        full_name: "Alex Benson",
        email: "alex@example.com",
        phone: null,
      },
      matchCount: 1,
      error: null,
    });
    await loadCurrentPerson();

    getSession.mockResolvedValueOnce({
      data: { session: null },
      error: { message: "timeout" },
    });
    await loadCurrentPerson({ force: true });

    expect(getCurrentPersonSnapshot()).toMatchObject({
      person: { id: "p1", full_name: "Alex Benson" },
      authDisplayName: "Alex Benson",
      loading: false,
    });
  });

  it("clears the cache on SIGNED_OUT so the next load can fetch again", async () => {
    getSession.mockResolvedValue({
      data: { session: { user: sessionUser("alex@example.com", "Alex Benson") } },
      error: null,
    });
    vi.mocked(findPersonByEmail).mockResolvedValue({
      person: {
        id: "p1",
        full_name: "Alex Benson",
        email: "alex@example.com",
        phone: null,
      },
      matchCount: 1,
      error: null,
    });
    await loadCurrentPerson();

    const handler = onAuthStateChange.mock.calls[0]?.[0] as (event: string) => void;
    handler("SIGNED_OUT");
    expect(getCurrentPersonSnapshot().person).toBeNull();
    expect(getCurrentPersonSnapshot().authDisplayName).toBe("");

    await loadCurrentPerson();
    expect(getSession).toHaveBeenCalledTimes(2);
    expect(getCurrentPersonSnapshot().person?.id).toBe("p1");
  });
});
