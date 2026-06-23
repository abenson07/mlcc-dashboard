import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/require-session";
import { getSupabaseForLeafletRoutes } from "@/lib/leaflets/supabaseForLeafletRoutes";

type BulkRow = {
  title: string;
  assignee_email?: string | null;
  due_at?: string | null;
};

function parseBulkLines(text: string): BulkRow[] {
  const rows: BulkRow[] = [];
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const parts = trimmed.split("|").map((p) => p.trim());
    const title = parts[0];
    if (!title) continue;
    rows.push({
      title,
      assignee_email: parts[1] || null,
      due_at: parts[2] || null,
    });
  }
  return rows;
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
  const committee_meeting_id =
    typeof o.committee_meeting_id === "string" ? o.committee_meeting_id.trim() : null;
  const text = typeof o.text === "string" ? o.text : "";
  const items = Array.isArray(o.items) ? (o.items as BulkRow[]) : parseBulkLines(text);

  if (items.length === 0) {
    return NextResponse.json({ error: "No items to import" }, { status: 400 });
  }

  const supabase = await getSupabaseForLeafletRoutes();

  const emailToPersonId = new Map<string, string>();
  const emails = items
    .map((i) => i.assignee_email?.trim().toLowerCase())
    .filter((e): e is string => Boolean(e));

  if (emails.length > 0) {
    const { data: people, error: peopleError } = await supabase
      .from("people")
      .select("id, email")
      .in("email", [...new Set(emails)]);

    if (peopleError) {
      return NextResponse.json({ error: peopleError.message }, { status: 500 });
    }

    for (const p of people ?? []) {
      if (p.email) emailToPersonId.set(p.email.toLowerCase(), p.id);
    }
  }

  const inserts = items.map((item, index) => ({
    title: item.title,
    assignee_person_id: item.assignee_email
      ? emailToPersonId.get(item.assignee_email.trim().toLowerCase()) ?? null
      : null,
    committee_meeting_id,
    status: "open" as const,
    due_at: item.due_at?.slice(0, 10) ?? null,
    source: "bulk" as const,
    sort_order: index,
  }));

  const { data, error } = await supabase.from("action_items").insert(inserts).select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, action_items: data ?? [], count: data?.length ?? 0 });
}
