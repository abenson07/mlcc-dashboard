import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/require-session";
import { getSupabaseForLeafletRoutes } from "@/lib/leaflets/supabaseForLeafletRoutes";
import { isCommitteeSlug, type CommitteeSlug } from "schemas/committee_meetings";

const TITLES = new Set(["chair", "co_chair", "member"]);

function isMissingTable(error: { message?: string; code?: string } | null): boolean {
  if (!error) return false;
  const msg = (error.message ?? "").toLowerCase();
  return (
    error.code === "42P01" ||
    error.code === "PGRST205" ||
    msg.includes("committee_members") ||
    msg.includes("does not exist")
  );
}

export async function GET(request: NextRequest) {
  const session = await requireSession();
  if (!session.ok) return session.response;

  const committee = request.nextUrl.searchParams.get("committee");
  const personId = request.nextUrl.searchParams.get("person_id");

  if (!committee && !personId) {
    return NextResponse.json(
      { error: "committee or person_id query param is required" },
      { status: 400 },
    );
  }
  if (committee && !isCommitteeSlug(committee)) {
    return NextResponse.json({ error: "committee query param is required" }, { status: 400 });
  }

  const supabase = await getSupabaseForLeafletRoutes();
  let query = supabase
    .from("committee_members")
    .select(
      `
      id, committee, person_id, title, created_at, updated_at,
      people:person_id ( id, full_name, email )
    `,
    )
    .order("created_at", { ascending: true });

  if (committee) query = query.eq("committee", committee as CommitteeSlug);
  if (personId) query = query.eq("person_id", personId);

  const { data, error } = await query;

  if (error) {
    if (isMissingTable(error)) {
      return NextResponse.json({ members: [], unavailable: true });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const members = (data ?? []).map((row) => {
    const { people, ...rest } = row as unknown as Record<string, unknown> & {
      people: { id: string; full_name: string; email: string | null } | null;
    };
    return { ...rest, person: people ?? null };
  });

  return NextResponse.json({ members });
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
  const committee = typeof o.committee === "string" ? o.committee : "";
  const person_id = typeof o.person_id === "string" ? o.person_id : "";
  const title =
    typeof o.title === "string" && TITLES.has(o.title) ? o.title : "member";

  if (!isCommitteeSlug(committee)) {
    return NextResponse.json({ error: "valid committee is required" }, { status: 400 });
  }
  if (!person_id) {
    return NextResponse.json({ error: "person_id is required" }, { status: 400 });
  }

  const supabase = await getSupabaseForLeafletRoutes();
  const { data, error } = await supabase
    .from("committee_members")
    .insert({ committee, person_id, title })
    .select(
      `
      id, committee, person_id, title, created_at, updated_at,
      people:person_id ( id, full_name, email )
    `,
    )
    .single();

  if (error) {
    if (isMissingTable(error)) {
      return NextResponse.json(
        { error: "committee_members table is not available", unavailable: true },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { people, ...rest } = data as unknown as Record<string, unknown> & {
    people: { id: string; full_name: string; email: string | null } | null;
  };

  return NextResponse.json({ ok: true, member: { ...rest, person: people ?? null } });
}
