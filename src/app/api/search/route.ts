import { requireSession } from "@/lib/auth/require-session";
import { runSearch } from "@/lib/search/runSearch";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const session = await requireSession();
  if (!session.ok) return session.response;

  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q") ?? "";
  const limitRaw = searchParams.get("limit");
  const limit = limitRaw ? Math.min(Math.max(parseInt(limitRaw, 10) || 5, 1), 20) : 5;

  try {
    const result = await runSearch(q, limit);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Search failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
