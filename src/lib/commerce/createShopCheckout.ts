import type Stripe from "stripe";
import { COMMERCE_FLOW, COMMERCE_METADATA_KEYS } from "@/lib/stripe/commerceMetadata";
import { getStripe } from "@/lib/stripe/server";
import { type ShopCartLine } from "@/lib/commerce/shopCart";
import {
  getShopProductId,
  getShopProductPriceId,
  getShopProductUnitAmountCents,
} from "@/lib/commerce/shopProductEnv";
import { findShopProduct } from "@marketing/data/shop-products";

export type ShopCustomerInfo = {
  name: string;
  email: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  phone?: string;
};

export function buildShopLineItems(
  cart: ShopCartLine[]
): Stripe.Checkout.SessionCreateParams.LineItem[] {
  const qtyBySlug = new Map<string, number>();
  for (const line of cart) {
    qtyBySlug.set(line.productSlug, (qtyBySlug.get(line.productSlug) ?? 0) + line.quantity);
  }
  if (qtyBySlug.size === 0) {
    throw new Error("Cart is empty");
  }

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  for (const [slug, quantity] of qtyBySlug) {
    const product = findShopProduct(slug);
    if (!product) throw new Error(`Unknown shop product "${slug}"`);

    const priceId = getShopProductPriceId(slug);
    if (priceId) {
      lineItems.push({ price: priceId, quantity });
      continue;
    }

    const productId = getShopProductId(slug);
    const unitAmount = getShopProductUnitAmountCents(slug);
    if (!productId || unitAmount == null) {
      throw new Error(`Stripe product/price is not configured for "${slug}"`);
    }

    lineItems.push({
      quantity,
      price_data: {
        currency: "usd",
        unit_amount: unitAmount,
        product: productId,
      },
    });
  }

  return lineItems;
}

function buildLineItemsMetadata(cart: ShopCartLine[]) {
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

export async function createShopCheckoutSession(params: {
  cart: ShopCartLine[];
  customer: ShopCustomerInfo;
  returnOrigin: string;
}): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();
  if (!stripe) throw new Error("Stripe is not configured");

  const lineItems = buildShopLineItems(params.cart);
  const base = params.returnOrigin.replace(/\/$/, "");

  const metadata: Stripe.MetadataParam = {
    [COMMERCE_METADATA_KEYS.flow]: COMMERCE_FLOW.SHOP,
    [COMMERCE_METADATA_KEYS.lineItems]: JSON.stringify(buildLineItemsMetadata(params.cart)),
    [COMMERCE_METADATA_KEYS.customerName]: params.customer.name.slice(0, 200),
    [COMMERCE_METADATA_KEYS.customerEmail]: params.customer.email.slice(0, 200),
    [COMMERCE_METADATA_KEYS.shippingLine1]: params.customer.addressLine1.slice(0, 200),
    [COMMERCE_METADATA_KEYS.shippingLine2]: (params.customer.addressLine2 ?? "").slice(0, 200),
    [COMMERCE_METADATA_KEYS.shippingCity]: params.customer.city.slice(0, 100),
    [COMMERCE_METADATA_KEYS.shippingState]: params.customer.state.slice(0, 50),
    [COMMERCE_METADATA_KEYS.shippingPostalCode]: params.customer.postalCode.slice(0, 20),
  };

  return stripe.checkout.sessions.create({
    mode: "payment",
    line_items: lineItems,
    customer_email: params.customer.email,
    shipping_address_collection: { allowed_countries: ["US"] },
    metadata,
    success_url: `${base}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/shop/cancelled`,
  });
}
