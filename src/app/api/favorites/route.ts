import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/require-session";
import { normalizeRoute } from "@/lib/favorites/normalizeRoute";
import { createClient } from "@/lib/supabase/server";
import type { UserFavorites } from "@/types/database";

export async function GET() {
  const session = await requireSession();
  if (!session.ok) return session.response;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_favorites")
    .select("id, user_id, name, route, created_at")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ favorites: (data ?? []) as UserFavorites[] });
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
  const route = typeof o.route === "string" ? normalizeRoute(o.route) : "";

  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  if (!route) {
    return NextResponse.json({ error: "route is required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_favorites")
    .upsert(
      { user_id: session.user.id, name, route },
      { onConflict: "user_id,route" },
    )
    .select("id, user_id, name, route, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ favorite: data as UserFavorites });
}

export async function DELETE(request: NextRequest) {
  const session = await requireSession();
  if (!session.ok) return session.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const o = body as Record<string, unknown>;
  const route = typeof o.route === "string" ? normalizeRoute(o.route) : "";

  if (!route) {
    return NextResponse.json({ error: "route is required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("user_favorites")
    .delete()
    .eq("user_id", session.user.id)
    .eq("route", route);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
