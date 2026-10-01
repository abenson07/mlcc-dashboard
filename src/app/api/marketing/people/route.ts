import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/require-session";
import { getSupabaseForLeafletRoutes } from "@/lib/leaflets/supabaseForLeafletRoutes";

export const runtime = "nodejs";

/** Name search for the email "find people" picker. Only people with an email are returned. */
export async function GET(request: NextRequest) {
  const session = await requireSession();
  if (!session.ok) return session.response;

  const q = (request.nextUrl.searchParams.get("q") ?? "").trim();
  if (q.length < 2) return NextResponse.json({ people: [] });

  const escaped = q.replace(/[%_\\,()]/g, "\\$&");
  const supabase = await getSupabaseForLeafletRoutes();
  const { data, error } = await supabase
    .from("people")
    .select("id, full_name, email")
    .not("email", "is", null)
    .or(`full_name.ilike.%${escaped}%,email.ilike.%${escaped}%`)
    .order("full_name", { ascending: true })
    .limit(10);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    people: (data ?? []).map((p) => ({ id: p.id, fullName: p.full_name, email: p.email })),
  });
}
