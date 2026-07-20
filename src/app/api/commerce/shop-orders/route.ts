import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/require-session";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shop_orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ items: data ?? [] });
}
