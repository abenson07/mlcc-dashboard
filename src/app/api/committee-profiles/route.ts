import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/require-session";
import { getSupabaseForLeafletRoutes } from "@/lib/leaflets/supabaseForLeafletRoutes";
import { isCommitteeSlug, type CommitteeSlug } from "schemas/committee_meetings";

function isMissingTable(error: { message?: string; code?: string } | null): boolean {
  if (!error) return false;
  const msg = (error.message ?? "").toLowerCase();
  return (
    error.code === "42P01" ||
    error.code === "PGRST205" ||
    msg.includes("committee_profiles") ||
    msg.includes("does not exist")
  );
}

export async function GET(request: NextRequest) {
  const session = await requireSession();
  if (!session.ok) return session.response;

  const committee = request.nextUrl.searchParams.get("committee");
  if (!committee || !isCommitteeSlug(committee)) {
    return NextResponse.json({ error: "committee query param is required" }, { status: 400 });
  }

  const supabase = await getSupabaseForLeafletRoutes();
  const { data, error } = await supabase
    .from("committee_profiles")
    .select(
      "committee, name, description, cadence, meeting_day, location, website_slug, publish_status, created_at, updated_at",
    )
    .eq("committee", committee as CommitteeSlug)
    .maybeSingle();

  if (error) {
    if (isMissingTable(error)) {
      return NextResponse.json({ profile: null, unavailable: true });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ profile: data });
}

export async function PUT(request: NextRequest) {
  const session = await requireSession();
  if (!session.ok) return session.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const o = body as Record<string, unknown>;
  const committee = typeof o.committee === "string" ? o.committee : "";
  if (!isCommitteeSlug(committee)) {
    return NextResponse.json({ error: "valid committee is required" }, { status: 400 });
  }

  const name = typeof o.name === "string" ? o.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const row = {
    committee,
    name,
    description: typeof o.description === "string" ? o.description : null,
    cadence: typeof o.cadence === "string" ? o.cadence : null,
    meeting_day: typeof o.meeting_day === "string" ? o.meeting_day : null,
    location: typeof o.location === "string" ? o.location : null,
    website_slug: typeof o.website_slug === "string" ? o.website_slug.trim() || null : null,
    publish_status:
      o.publish_status === "published" || o.publish_status === "draft"
        ? o.publish_status
        : "draft",
    updated_at: new Date().toISOString(),
  };

  const supabase = await getSupabaseForLeafletRoutes();
  const { data, error } = await supabase
    .from("committee_profiles")
    .upsert(row, { onConflict: "committee" })
    .select(
      "committee, name, description, cadence, meeting_day, location, website_slug, publish_status, created_at, updated_at",
    )
    .single();

  if (error) {
    if (isMissingTable(error)) {
      return NextResponse.json(
        { error: "committee_profiles table is not available", unavailable: true },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, profile: data });
}
