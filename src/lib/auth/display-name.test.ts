import { describe, expect, it } from "vitest";
import type { User } from "@supabase/supabase-js";
import { displayNameFromAuthUser, resolveAccountDisplayName } from "./display-name";

function user(overrides: {
  email?: string | null;
  full_name?: string;
  name?: string;
}): User {
  return {
    id: "user-1",
    email: overrides.email ?? null,
    user_metadata: {
      ...(overrides.full_name != null ? { full_name: overrides.full_name } : {}),
      ...(overrides.name != null ? { name: overrides.name } : {}),
    },
  } as User;
}

describe("resolveAccountDisplayName", () => {
  it("prefers the people row name over auth metadata", () => {
    expect(
      resolveAccountDisplayName({
        personFullName: "Alex Benson",
        user: user({ email: "alex@example.com", full_name: "Wrong" }),
      }),
    ).toEqual({ name: "Alex Benson", source: "people" });
  });

  it("falls back to auth metadata, then email, never a demo placeholder", () => {
    expect(
      resolveAccountDisplayName({
        personFullName: null,
        user: user({ email: "pat@example.com", full_name: "Pat Neighbor" }),
      }),
    ).toEqual({ name: "Pat Neighbor", source: "auth_full_name" });

    expect(
      resolveAccountDisplayName({
        user: user({ email: "pat@example.com", name: "Pat" }),
      }),
    ).toEqual({ name: "Pat", source: "auth_name" });

    expect(
      resolveAccountDisplayName({
        personFullName: "  ",
        user: user({ email: "pat@example.com" }),
      }),
    ).toEqual({ name: "pat@example.com", source: "email" });
  });

  it("uses Account when nothing is available", () => {
    expect(displayNameFromAuthUser(null)).toEqual({
      name: "Account",
      source: "unknown",
    });
  });
});
