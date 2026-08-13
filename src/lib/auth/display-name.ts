import type { User } from "@supabase/supabase-js";

export type DisplayNameSource =
  | "people"
  | "auth_full_name"
  | "auth_name"
  | "email"
  | "unknown";

const UNKNOWN_DISPLAY_NAME = "Account";

function metaString(meta: Record<string, unknown> | undefined, key: string): string | null {
  const value = meta?.[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function authMetadataName(user: User | null | undefined): {
  fullName: string | null;
  name: string | null;
} {
  const meta = user?.user_metadata as Record<string, unknown> | undefined;
  return {
    fullName: metaString(meta, "full_name"),
    name: metaString(meta, "name"),
  };
}

/** Name from the Supabase auth user (metadata, then email). Never a demo placeholder. */
export function displayNameFromAuthUser(user: User | null | undefined): {
  name: string;
  source: Exclude<DisplayNameSource, "people">;
} {
  const { fullName, name } = authMetadataName(user);
  if (fullName) return { name: fullName, source: "auth_full_name" };
  if (name) return { name, source: "auth_name" };
  const email = user?.email?.trim();
  if (email) return { name: email, source: "email" };
  return { name: UNKNOWN_DISPLAY_NAME, source: "unknown" };
}

export function resolveAccountDisplayName(params: {
  personFullName?: string | null;
  user?: User | null;
}): { name: string; source: DisplayNameSource } {
  const personName = params.personFullName?.trim();
  if (personName) return { name: personName, source: "people" };
  return displayNameFromAuthUser(params.user);
}
