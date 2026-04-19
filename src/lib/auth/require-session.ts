import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function requireSession(): Promise<
  | { ok: true; user: { id: string; email?: string | null } }
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
  return { ok: true, user: { id: user.id, email: user.email } };
}
