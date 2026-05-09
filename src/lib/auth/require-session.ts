import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

function displayNameFromUser(user: User): string {
  const meta = user.user_metadata as Record<string, unknown> | undefined;
  const full = meta?.full_name;
  const name = meta?.name;
  if (typeof full === "string" && full.trim()) return full.trim();
  if (typeof name === "string" && name.trim()) return name.trim();
  if (user.email?.trim()) return user.email.trim();
  return "Unknown";
}

export async function requireSession(): Promise<
  | {
      ok: true;
      user: { id: string; email?: string | null; displayName: string };
    }
  | { ok: false; response: NextResponse }
> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return {
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      displayName: displayNameFromUser(user),
    },
  };
}
