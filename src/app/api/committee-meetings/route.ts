import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/require-session";
import { createCommitteeMeeting } from "@/lib/committee-meetings/createCommitteeMeeting";
import { getSupabaseForLeafletRoutes } from "@/lib/leaflets/supabaseForLeafletRoutes";
import type { CommitteeSlug } from "schemas/committee_meetings";

const COMMITTEES: CommitteeSlug[] = [
  "events",
  "outreach",
  "hub",
  "leaflet",
  "communications",
  "steering",
  "executive_board",
  "businesses",
];

const LOCATION_TYPES = ["in_person", "remote", "hybrid"] as const;

export async function POST(request: NextRequest) {
  const session = await requireSession();
  if (!session.ok) return session.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const o = body as Record<string, unknown>;
  const committee = typeof o.committee === "string" ? o.committee.trim() : "";
  const starts_at = typeof o.starts_at === "string" ? o.starts_at.trim() : "";
  const ends_at = typeof o.ends_at === "string" ? o.ends_at.trim() : null;
  const location_type =
    typeof o.location_type === "string" ? o.location_type.trim() : "in_person";
  const location = typeof o.location === "string" ? o.location.trim() : null;
  const google_calendar_url =
    typeof o.google_calendar_url === "string" ? o.google_calendar_url.trim() : null;

  if (!committee || !COMMITTEES.includes(committee as CommitteeSlug)) {
    return NextResponse.json({ error: "Valid committee is required" }, { status: 400 });
  }
  if (!starts_at) {
    return NextResponse.json({ error: "starts_at is required" }, { status: 400 });
  }
  if (!LOCATION_TYPES.includes(location_type as (typeof LOCATION_TYPES)[number])) {
    return NextResponse.json({ error: "Invalid location_type" }, { status: 400 });
  }

  try {
    const supabase = await getSupabaseForLeafletRoutes();
    const result = await createCommitteeMeeting(supabase, {
      committee: committee as CommitteeSlug,
      starts_at,
      ends_at: ends_at || null,
      location_type: location_type as (typeof LOCATION_TYPES)[number],
      location: location || null,
      google_calendar_url: google_calendar_url || null,
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create committee meeting";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
