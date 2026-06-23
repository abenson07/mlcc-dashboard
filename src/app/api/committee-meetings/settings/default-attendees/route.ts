import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/require-session";
import {
  fetchDefaultAttendeesWithPeople,
  replaceDefaultAttendees,
} from "@/lib/committee-meetings/defaultAttendees";
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

function parseCommittee(value: string | null): CommitteeSlug | null {
  if (!value) return null;
  return COMMITTEES.includes(value as CommitteeSlug) ? (value as CommitteeSlug) : null;
}

export async function GET(request: NextRequest) {
  const session = await requireSession();
  if (!session.ok) return session.response;

  const committee = parseCommittee(request.nextUrl.searchParams.get("committee"));
  if (!committee) {
    return NextResponse.json({ error: "Valid committee query param is required" }, { status: 400 });
  }

  try {
    const supabase = await getSupabaseForLeafletRoutes();
    const attendees = await fetchDefaultAttendeesWithPeople(supabase, committee);
    return NextResponse.json({ committee, attendees });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load default attendees";
    return NextResponse.json({ error: message }, { status: 500 });
  }
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
  const committee = typeof o.committee === "string" ? parseCommittee(o.committee) : null;
  const personIds = Array.isArray(o.person_ids)
    ? o.person_ids.filter((p): p is string => typeof p === "string" && p.trim().length > 0)
    : null;

  if (!committee) {
    return NextResponse.json({ error: "Valid committee is required" }, { status: 400 });
  }
  if (!personIds) {
    return NextResponse.json({ error: "person_ids array is required" }, { status: 400 });
  }

  try {
    const supabase = await getSupabaseForLeafletRoutes();
    await replaceDefaultAttendees(supabase, committee, personIds);
    const attendees = await fetchDefaultAttendeesWithPeople(supabase, committee);
    return NextResponse.json({ ok: true, committee, attendees });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save default attendees";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
