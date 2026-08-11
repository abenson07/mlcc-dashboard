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
    msg.includes("committee_initiatives") ||
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
    .from("committee_initiatives")
    .select("id, committee, title, description, created_at, updated_at")
    .eq("committee", committee as CommitteeSlug)
    .order("created_at", { ascending: false });

  if (error) {
    if (isMissingTable(error)) {
      return NextResponse.json({ initiatives: [], unavailable: true });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ initiatives: data ?? [] });
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
  const committee = typeof o.committee === "string" ? o.committee : "";
  if (!title) return NextResponse.json({ error: "title is required" }, { status: 400 });
  if (!isCommitteeSlug(committee)) {
    return NextResponse.json({ error: "valid committee is required" }, { status: 400 });
  }

  const supabase = await getSupabaseForLeafletRoutes();
  const { data, error } = await supabase
    .from("committee_initiatives")
    .insert({
      title,
      committee,
      description: typeof o.description === "string" ? o.description : null,
    })
    .select("id, committee, title, description, created_at, updated_at")
    .single();

  if (error) {
    if (isMissingTable(error)) {
      return NextResponse.json(
        { error: "committee_initiatives table is not available", unavailable: true },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, initiative: data });
}
