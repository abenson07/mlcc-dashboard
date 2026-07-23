import { NextRequest, NextResponse } from "next/server";
import { createShopCheckoutSession } from "@/lib/commerce/createShopCheckout";
import {
  explodeShirtPreorderRows,
  formatShopAddressText,
  shopCartToLineItems,
  upsertPersonForShopOrder,
} from "@/lib/commerce/recordShopPreorder";
import { parseShopCart } from "@/lib/commerce/shopCart";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { corsPreflightResponse, withCors } from "@/lib/stripe/cors";

export async function OPTIONS(request: NextRequest) {
  return corsPreflightResponse(request);
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return withCors(
      request,
      NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    );
  }

  const payload = body as Record<string, unknown>;
  // The shop lives same-origin with this API (unlike the cross-origin
  // maple-leaf-landings sites), so the redirect base comes from the
  // request itself rather than a client-supplied + allowlisted origin.
  const returnOrigin = request.nextUrl.origin;

  const cart = parseShopCart(payload.items ?? payload.cart);
  if (!cart) {
    return withCors(
      request,
      NextResponse.json({ error: "Invalid cart" }, { status: 400 })
    );
  }

  const customerRaw = payload.customer;
  if (!customerRaw || typeof customerRaw !== "object") {
    return withCors(
      request,
      NextResponse.json({ error: "Missing customer" }, { status: 400 })
    );
  }
  const c = customerRaw as Record<string, unknown>;
  const name = typeof c.name === "string" ? c.name.trim() : "";
  const email = typeof c.email === "string" ? c.email.trim() : "";
  const addressLine1 =
    typeof c.addressLine1 === "string"
      ? c.addressLine1.trim()
      : typeof c.address === "string"
        ? c.address.trim()
        : "";
  const city = typeof c.city === "string" ? c.city.trim() : "";
  const state = typeof c.state === "string" ? c.state.trim() : "";
  const postalCode =
    typeof c.postalCode === "string"
      ? c.postalCode.trim()
      : typeof c.zip === "string"
        ? c.zip.trim()
        : "";
  const phone = typeof c.phone === "string" ? c.phone.trim() : undefined;
  const addressLine2 =
    typeof c.addressLine2 === "string" ? c.addressLine2.trim() : undefined;

  if (!name || !email || !addressLine1 || !city || !state || !postalCode) {
    return withCors(
      request,
      NextResponse.json(
        { error: "Name, email, and full address are required" },
        { status: 400 }
      )
    );
  }

  const supabase = createAdminSupabaseClient();
  if (!supabase) {
    return withCors(
      request,
      NextResponse.json({ error: "Database is not configured" }, { status: 503 })
    );
  }

  const customer = {
    name,
    email,
    addressLine1,
    addressLine2,
    city,
    state,
    postalCode,
    phone,
  };

  // Save person + pending shirt rows before sending them to Stripe.
  const personResult = await upsertPersonForShopOrder(supabase, {
    customerName: name,
    customerEmail: email,
    address: formatShopAddressText(customer),
    phone: phone ?? null,
  });
  if (!personResult.ok) {
    return withCors(
      request,
      NextResponse.json(
        { error: `Could not save customer: ${personResult.error}` },
        { status: 500 }
      )
    );
  }

  try {
    const session = await createShopCheckoutSession({
      cart,
      returnOrigin,
      customer,
    });

    if (!session.url) {
      return withCors(
        request,
        NextResponse.json(
          { error: "Failed to create checkout session" },
          { status: 500 }
        )
      );
    }

    const shirtRows = explodeShirtPreorderRows({
      personId: personResult.personId,
      lineItems: shopCartToLineItems(cart),
      sessionId: session.id,
      status: "pending",
    });

    if (shirtRows.length === 0) {
      return withCors(
        request,
        NextResponse.json({ error: "Cart produced no shirt rows" }, { status: 400 })
      );
    }

    const { error: shirtError } = await supabase
      .from("shirt_preorder_items")
      .insert(shirtRows);

    if (shirtError) {
      console.error("[shop checkout] pending shirt rows failed:", shirtError.message);
      return withCors(
        request,
        NextResponse.json(
          { error: `Could not save preorder: ${shirtError.message}` },
          { status: 500 }
        )
      );
    }

    return withCors(
      request,
      NextResponse.json({
        url: session.url,
        sessionId: session.id,
        personId: personResult.personId,
        itemCount: shirtRows.length,
      })
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Checkout failed";
    return withCors(
      request,
      NextResponse.json({ error: message }, { status: 500 })
    );
  }
}
