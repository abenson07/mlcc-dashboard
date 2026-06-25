import { NextResponse } from "next/server";
import { getSupabaseForLeafletRoutes } from "@/lib/leaflets/supabaseForLeafletRoutes";
import { WEBSITE_COMMITTEE_SLUG } from "schemas/committee_meetings";
import type { CommitteeSlug, StructuredMinutes } from "schemas/committee_meetings";

export async function GET() {
  const supabase = await getSupabaseForLeafletRoutes();

  const { data, error } = await supabase
    .from("committee_meetings")
    .select(
      `
      id, committee, website_slug, structured_minutes, submitted_at,
      events ( name, starts_at )
    `,
    )
    .eq("minutes_status", "ready")
    .not("website_slug", "is", null)
    .order("submitted_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const entries = (data ?? []).map((row) => {
    const eventsRaw = row.events as unknown;
    const event = (Array.isArray(eventsRaw) ? eventsRaw[0] : eventsRaw) as
      | { name: string; starts_at: string | null }
      | null
      | undefined;
    const committee = row.committee as CommitteeSlug;
    return {
      slug: row.website_slug,
      month: event?.starts_at
        ? new Date(event.starts_at).toLocaleDateString("en-US", { month: "long" })
        : "",
      committeeSlug: WEBSITE_COMMITTEE_SLUG[committee] ?? committee,
      dateIso: event?.starts_at ?? null,
      detail: row.structured_minutes as StructuredMinutes | null,
    };
  });

  return NextResponse.json({ meeting_minutes: entries });
}
