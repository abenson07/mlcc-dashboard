import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/require-session";
import { createLeaflet } from "@/lib/leaflets/createLeaflet";
import { DuplicateLeafletTitleError } from "@/lib/leaflets/leafletTitle";
import { getSupabaseForLeafletRoutes } from "@/lib/leaflets/supabaseForLeafletRoutes";

export async function GET() {
  const session = await requireSession();
  if (!session.ok) return session.response;

  const supabase = await getSupabaseForLeafletRoutes();
  const { data, error } = await supabase
    .from("leaflets")
    .select("*")
    .order("distribution_date", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ leaflets: data ?? [] });
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
  const title = typeof o.title === "string" ? o.title.trim() : "";
  const distribution_date =
    typeof o.distribution_date === "string" ? o.distribution_date.trim() : "";
  const distribution_date_2 =
    typeof o.distribution_date_2 === "string" && o.distribution_date_2.trim()
      ? o.distribution_date_2.trim()
      : null;
  const sponsorship_due_date =
    typeof o.sponsorship_due_date === "string" && o.sponsorship_due_date.trim()
      ? o.sponsorship_due_date.trim()
      : null;
  const delivery_date =
    typeof o.delivery_date === "string" && o.delivery_date.trim() ? o.delivery_date.trim() : null;
  const sponsorship_goal_cents =
    typeof o.sponsorship_goal_cents === "number" ? o.sponsorship_goal_cents : null;
  const tierOverrides = Array.isArray(o.tierOverrides)
    ? (o.tierOverrides as { name: string; amount: number; quantity: number }[])
    : undefined;

  if (!title || !distribution_date) {
    return NextResponse.json(
      { error: "title and distribution_date are required" },
      { status: 400 },
    );
  }

  try {
    const supabase = await getSupabaseForLeafletRoutes();
    const leaflet = await createLeaflet(supabase, {
      title,
      distribution_date,
      distribution_date_2,
      sponsorship_due_date,
      delivery_date,
      sponsorship_goal_cents,
      tierOverrides,
    });
    return NextResponse.json({ ok: true, leaflet });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create leaflet";
    if (err instanceof DuplicateLeafletTitleError) {
      return NextResponse.json({ error: message }, { status: 409 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
