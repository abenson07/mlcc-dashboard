import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/require-session";
import { getSupabaseForLeafletRoutes } from "@/lib/leaflets/supabaseForLeafletRoutes";
import { isCommitteeSlug } from "schemas/committee_meetings";
import type { EventsUpdate } from "@/types/database";

const EVENTS_SELECT =
  "id, name, starts_at, ends_at, field_data, event_template_id, slug, date, committee, publish_status, created_at, updated_at";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const session = await requireSession();
  if (!session.ok) return session.response;

  const { id } = await context.params;
  const supabase = await getSupabaseForLeafletRoutes();
  const { data, error } = await supabase
    .from("events")
    .select(EVENTS_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  return NextResponse.json({ event: data });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const session = await requireSession();
  if (!session.ok) return session.response;

  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const o = body as Record<string, unknown>;
  const patch: EventsUpdate = {};

  if (typeof o.name === "string") patch.name = o.name.trim();
  if (typeof o.starts_at === "string") {
    patch.starts_at = o.starts_at.trim();
    patch.date = o.starts_at.trim().slice(0, 10);
  }
  if (typeof o.ends_at === "string") patch.ends_at = o.ends_at.trim();
  if (o.committee === null) {
    patch.committee = null;
  } else if (typeof o.committee === "string") {
    const trimmed = o.committee.trim();
    if (isCommitteeSlug(trimmed)) patch.committee = trimmed;
  }
  if (o.field_data && typeof o.field_data === "object" && !Array.isArray(o.field_data)) {
    const supabase = await getSupabaseForLeafletRoutes();
    const { data: existing } = await supabase
      .from("events")
      .select("field_data")
      .eq("id", id)
      .maybeSingle();

    const prev =
      existing?.field_data && typeof existing.field_data === "object"
        ? (existing.field_data as Record<string, unknown>)
        : {};
    const nextField = { ...prev, ...(o.field_data as Record<string, unknown>) };
    if (patch.committee) nextField.committee = patch.committee;
    else if (patch.committee === null) delete nextField.committee;
    patch.field_data = nextField;
  } else if (patch.committee !== undefined) {
    const supabase = await getSupabaseForLeafletRoutes();
    const { data: existing } = await supabase
      .from("events")
      .select("field_data")
      .eq("id", id)
      .maybeSingle();

    const prev =
      existing?.field_data && typeof existing.field_data === "object"
        ? (existing.field_data as Record<string, unknown>)
        : {};
    const nextField = { ...prev };
    if (patch.committee) nextField.committee = patch.committee;
    else delete nextField.committee;
    patch.field_data = nextField;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  try {
    const supabase = await getSupabaseForLeafletRoutes();
    const { data, error } = await supabase
      .from("events")
      .update(patch)
      .eq("id", id)
      .select(EVENTS_SELECT)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, event: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update event";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
