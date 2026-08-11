import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/require-session";
import { createEvent } from "@/lib/events/createEvent";
import { getSupabaseForLeafletRoutes } from "@/lib/leaflets/supabaseForLeafletRoutes";
import { isCommitteeSlug } from "schemas/committee_meetings";

const EVENTS_SELECT =
  "id, name, starts_at, ends_at, field_data, event_template_id, slug, date, committee, publish_status, created_at, updated_at";

export async function GET() {
  const session = await requireSession();
  if (!session.ok) return session.response;

  const supabase = await getSupabaseForLeafletRoutes();
  const { data, error } = await supabase
    .from("events")
    .select(EVENTS_SELECT)
    .order("starts_at", { ascending: true, nullsFirst: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ events: data ?? [] });
}

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
  const name = typeof o.name === "string" ? o.name.trim() : "";
  const starts_at = typeof o.starts_at === "string" ? o.starts_at.trim() : "";
  const ends_at = typeof o.ends_at === "string" ? o.ends_at.trim() : null;
  const event_template_id =
    typeof o.event_template_id === "string" ? o.event_template_id.trim() : null;
  const committeeRaw = typeof o.committee === "string" ? o.committee.trim() : null;
  const committee = committeeRaw && isCommitteeSlug(committeeRaw) ? committeeRaw : null;
  const field_data =
    o.field_data && typeof o.field_data === "object" && !Array.isArray(o.field_data)
      ? (o.field_data as Record<string, unknown>)
      : undefined;

  if (!name || !starts_at) {
    return NextResponse.json({ error: "name and starts_at are required" }, { status: 400 });
  }

  try {
    const supabase = await getSupabaseForLeafletRoutes();
    const event = await createEvent(supabase, {
      name,
      starts_at,
      ends_at: ends_at || null,
      event_template_id: event_template_id || null,
      committee,
      field_data,
    });
    return NextResponse.json({ ok: true, event });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create event";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
