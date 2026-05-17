import { BufferApiError } from "@/lib/buffer/client";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function requireBufferApiUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return {
      user: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { user, error: null };
}

export function bufferErrorResponse(e: unknown): NextResponse {
  const message = e instanceof Error ? e.message : "Buffer request failed.";
  let status = 400;
  if (e instanceof BufferApiError) {
    status = e.statusCode;
  } else if (message.includes("not configured")) {
    status = 503;
  }
  if (message.includes("already has") && message.includes("scheduled")) {
    return NextResponse.json({ error: message }, { status: 409 });
  }
  return NextResponse.json({ error: message }, { status });
}
