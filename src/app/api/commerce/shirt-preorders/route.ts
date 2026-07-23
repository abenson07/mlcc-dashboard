import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/require-session";
import { createClient } from "@/lib/supabase/server";
import type { ShirtPreorderItemRow } from "@/hooks/useShirtPreorderItems";

export async function GET() {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shirt_preorder_items")
    .select(
      `
      id,
      person_id,
      product_slug,
      product_name,
      variant,
      unit_amount_cents,
      stripe_checkout_session_id,
      stripe_payment_intent_id,
      status,
      created_at,
      updated_at,
      people:person_id (
        id,
        full_name,
        email,
        phone,
        address
      )
    `
    )
    .order("created_at", { ascending: false })
    .limit(2000);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ items: (data ?? []) as ShirtPreorderItemRow[] });
}
