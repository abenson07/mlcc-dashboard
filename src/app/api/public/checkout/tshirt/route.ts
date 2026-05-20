import { NextRequest, NextResponse } from "next/server";
import { createTshirtCheckoutSession } from "@/lib/commerce/createTshirtCheckout";
import { parseTshirtCart } from "@/lib/commerce/tshirtCart";
import {
  corsPreflightResponse,
  validateReturnOrigin,
  withCors,
} from "@/lib/stripe/cors";

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
  const returnOrigin = validateReturnOrigin(
    typeof payload.returnOrigin === "string" ? payload.returnOrigin : undefined
  );
  if (!returnOrigin) {
    return withCors(
      request,
      NextResponse.json({ error: "Invalid return origin" }, { status: 400 })
    );
  }

  const cart = parseTshirtCart(payload.items ?? payload.cart);
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

  if (!name || !email || !addressLine1 || !city || !state || !postalCode) {
    return withCors(
      request,
      NextResponse.json(
        { error: "Name, email, and full address are required" },
        { status: 400 }
      )
    );
  }

  try {
    const session = await createTshirtCheckoutSession({
      cart,
      returnOrigin,
      customer: {
        name,
        email,
        addressLine1,
        addressLine2:
          typeof c.addressLine2 === "string" ? c.addressLine2.trim() : undefined,
        city,
        state,
        postalCode,
        phone: typeof c.phone === "string" ? c.phone.trim() : undefined,
      },
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

    return withCors(
      request,
      NextResponse.json({ url: session.url, sessionId: session.id })
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Checkout failed";
    return withCors(
      request,
      NextResponse.json({ error: message }, { status: 500 })
    );
  }
}
