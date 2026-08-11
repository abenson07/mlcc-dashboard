import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/require-session";
import { createClient } from "@/lib/supabase/server";
import { isCommitteeSlug } from "@/lib/committees/committeeSlug";

/** List committee interests (optionally filter by committee + status). */
export async function GET(request: NextRequest) {
  const session = await requireSession();
  if (!session.ok) return session.response;

  const committee = request.nextUrl.searchParams.get("committee");
  const status = request.nextUrl.searchParams.get("status");
  const eventId = request.nextUrl.searchParams.get("event_id");

  const supabase = await createClient();
  let query = supabase
    .from("committee_interests")
    .select("*")
    .order("created_at", { ascending: false });

  if (committee) {
    if (!isCommitteeSlug(committee)) {
      return NextResponse.json({ error: "Invalid committee" }, { status: 400 });
    }
    query = query.eq("committee", committee);
  }

  if (status === "pending" || status === "handled" || status === "auto_accepted") {
    query = query.eq("status", status);
  }

  if (eventId?.trim()) {
    query = query.eq("event_id", eventId.trim());
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ interests: data ?? [] });
}
