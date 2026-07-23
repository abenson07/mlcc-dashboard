import type { SupabaseClient } from "@supabase/supabase-js";
import { findShopProduct } from "@marketing/data/shop-products";
import type { ShopCartLine } from "@/lib/commerce/shopCart";
import type {
  PeopleInsert,
  ShirtPreorderItemStatus,
  ShirtPreorderItemsInsert,
  ShopLineItem,
} from "@/types/database";

export function shopCartToLineItems(cart: ShopCartLine[]): ShopLineItem[] {
  return cart.map((line) => {
    const product = findShopProduct(line.productSlug);
    return {
      product_slug: line.productSlug,
      product_name: product?.name ?? line.productSlug,
      variant: line.variant,
      quantity: line.quantity,
      unit_amount_cents: product?.priceCents ?? 0,
      fulfillment: product?.fulfillment ?? "in_stock",
    };
  });
}

export function formatShopAddressText(params: {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
}): string {
  const parts = [
    params.addressLine1,
    params.addressLine2,
    [params.city, params.state, params.postalCode].filter(Boolean).join(", "),
  ].filter((p) => !!p?.trim());
  return parts.join(", ");
}

export async function upsertPersonForShopOrder(
  supabase: SupabaseClient,
  params: {
    customerName: string;
    customerEmail: string;
    address?: string | null;
    phone?: string | null;
  }
): Promise<{ ok: true; personId: string } | { ok: false; error: string }> {
  const { data: existingPerson, error: lookupError } = await supabase
    .from("people")
    .select("id")
    .eq("email", params.customerEmail)
    .maybeSingle();

  if (lookupError) {
    return { ok: false, error: lookupError.message };
  }

  if (existingPerson) {
    const { error: updateError } = await supabase
      .from("people")
      .update({
        full_name: params.customerName,
        ...(params.address ? { address: params.address } : {}),
        ...(params.phone ? { phone: params.phone } : {}),
      })
      .eq("id", existingPerson.id);
    if (updateError) {
      return { ok: false, error: updateError.message };
    }
    return { ok: true, personId: existingPerson.id };
  }

  const personRow: PeopleInsert = {
    full_name: params.customerName,
    email: params.customerEmail,
    address: params.address ?? null,
    phone: params.phone ?? null,
    source: "shirt_preorder",
  };
  const { data: inserted, error: insertError } = await supabase
    .from("people")
    .insert(personRow)
    .select("id")
    .single();

  if (insertError || !inserted) {
    return { ok: false, error: insertError?.message ?? "Failed to create person" };
  }
  return { ok: true, personId: inserted.id };
}

export function explodeShirtPreorderRows(params: {
  personId: string;
  lineItems: ShopLineItem[];
  sessionId: string;
  paymentIntentId?: string | null;
  status: ShirtPreorderItemStatus;
}): ShirtPreorderItemsInsert[] {
  const rows: ShirtPreorderItemsInsert[] = [];
  for (const line of params.lineItems) {
    for (let i = 0; i < line.quantity; i++) {
      rows.push({
        person_id: params.personId,
        product_slug: line.product_slug,
        product_name: line.product_name,
        variant: line.variant,
        unit_amount_cents: line.unit_amount_cents,
        stripe_checkout_session_id: params.sessionId,
        stripe_payment_intent_id: params.paymentIntentId ?? null,
        status: params.status,
      });
    }
  }
  return rows;
}

/** Upsert person + insert one pending shirt row per unit before Stripe redirect. */
export async function recordPendingShopPreorder(params: {
  supabase: SupabaseClient;
  cart: ShopCartLine[];
  customer: {
    name: string;
    email: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    phone?: string;
  };
  stripeCheckoutSessionId: string;
}): Promise<{ ok: true; personId: string; itemCount: number } | { ok: false; error: string }> {
  const address = formatShopAddressText(params.customer);
  const personResult = await upsertPersonForShopOrder(params.supabase, {
    customerName: params.customer.name,
    customerEmail: params.customer.email,
    address,
    phone: params.customer.phone ?? null,
  });
  if (!personResult.ok) return personResult;

  const lineItems = shopCartToLineItems(params.cart);
  const rows = explodeShirtPreorderRows({
    personId: personResult.personId,
    lineItems,
    sessionId: params.stripeCheckoutSessionId,
    status: "pending",
  });

  if (rows.length === 0) {
    return { ok: false, error: "Cart produced no shirt rows" };
  }

  const { error } = await params.supabase.from("shirt_preorder_items").insert(rows);
  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, personId: personResult.personId, itemCount: rows.length };
}
