import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/require-session";
import { getSupabaseForLeafletRoutes } from "@/lib/leaflets/supabaseForLeafletRoutes";

export async function GET() {
  const session = await requireSession();
  if (!session.ok) return session.response;

  const email = session.user.email?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ action_items: [], open_count: 0 });
  }

  const supabase = await getSupabaseForLeafletRoutes();

  const { data: person, error: personError } = await supabase
    .from("people")
    .select("id")
    .ilike("email", email)
    .maybeSingle();

  if (personError) {
    return NextResponse.json({ error: personError.message }, { status: 500 });
  }
  if (!person) {
    return NextResponse.json({ action_items: [], open_count: 0 });
  }

  const { data, error } = await supabase
    .from("action_items")
    .select(
      `
      id, title, description, status, due_at, sort_order, committee_meeting_id,
      committee_meetings (
        id, committee, event_id,
        events ( name, starts_at )
      )
    `,
    )
    .eq("assignee_person_id", person.id)
    .eq("status", "open")
    .order("due_at", { ascending: true, nullsFirst: false })
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    action_items: data ?? [],
    open_count: data?.length ?? 0,
  });
}
