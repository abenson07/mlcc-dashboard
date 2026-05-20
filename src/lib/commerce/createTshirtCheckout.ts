import type Stripe from "stripe";
import {
  COMMERCE_FLOW,
  COMMERCE_METADATA_KEYS,
} from "@/lib/stripe/commerceMetadata";
import { type TshirtCartLine } from "@/lib/commerce/tshirtCart";
import { getStripe } from "@/lib/stripe/server";

export type TshirtCustomerInfo = {
  name: string;
  email: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  phone?: string;
};

function getTshirtProductId(): string | null {
  return process.env.STRIPE_TSHIRT_PRODUCT_ID?.trim() || null;
}

function getTshirtUnitAmountCents(): number | null {
  const priceId = process.env.STRIPE_TSHIRT_PRICE_ID?.trim();
  if (priceId) return null;

  const raw = process.env.STRIPE_TSHIRT_PRICE_CENTS?.trim();
  if (!raw) return null;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function getTshirtPriceId(): string | null {
  return process.env.STRIPE_TSHIRT_PRICE_ID?.trim() || null;
}

export function buildTshirtLineItems(
  cart: TshirtCartLine[]
): Stripe.Checkout.SessionCreateParams.LineItem[] {
  const totalQty = cart.reduce((sum, line) => sum + line.quantity, 0);
  if (totalQty < 1) {
    throw new Error("Cart is empty");
  }

  const priceId = getTshirtPriceId();
  if (priceId) {
    return [{ price: priceId, quantity: totalQty }];
  }

  const productId = getTshirtProductId();
  const unitAmount = getTshirtUnitAmountCents();
  if (!productId || unitAmount == null) {
    throw new Error("T-shirt Stripe product/price is not configured");
  }

  return [
    {
      quantity: totalQty,
      price_data: {
        currency: "usd",
        unit_amount: unitAmount,
        product: productId,
      },
    },
  ];
}

export async function createTshirtCheckoutSession(params: {
  cart: TshirtCartLine[];
  customer: TshirtCustomerInfo;
  returnOrigin: string;
}): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();
  if (!stripe) throw new Error("Stripe is not configured");

  const lineItems = buildTshirtLineItems(params.cart);
  const base = params.returnOrigin.replace(/\/$/, "");

  const metadata: Stripe.MetadataParam = {
    [COMMERCE_METADATA_KEYS.flow]: COMMERCE_FLOW.TSHIRT,
    [COMMERCE_METADATA_KEYS.lineItems]: JSON.stringify(params.cart),
    [COMMERCE_METADATA_KEYS.customerName]: params.customer.name.slice(0, 200),
    [COMMERCE_METADATA_KEYS.customerEmail]: params.customer.email.slice(
      0,
      200
    ),
    [COMMERCE_METADATA_KEYS.shippingLine1]: params.customer.addressLine1.slice(
      0,
      200
    ),
    [COMMERCE_METADATA_KEYS.shippingLine2]: (
      params.customer.addressLine2 ?? ""
    ).slice(0, 200),
    [COMMERCE_METADATA_KEYS.shippingCity]: params.customer.city.slice(0, 100),
    [COMMERCE_METADATA_KEYS.shippingState]: params.customer.state.slice(0, 50),
    [COMMERCE_METADATA_KEYS.shippingPostalCode]:
      params.customer.postalCode.slice(0, 20),
  };

  return stripe.checkout.sessions.create({
    mode: "payment",
    line_items: lineItems,
    customer_email: params.customer.email,
    shipping_address_collection: { allowed_countries: ["US"] },
    metadata,
    success_url: `${base}/tshirt/success.html?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/tshirt/cancelled.html`,
  });
}
