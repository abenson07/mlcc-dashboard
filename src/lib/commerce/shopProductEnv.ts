import { shopProducts } from "@marketing/data/shop-products";

type ShopProductEnvKeys = {
  productIdEnv: string;
  priceIdEnv: string;
  priceCentsEnv: string;
};

const SHOP_PRODUCT_ENV_KEYS: Record<string, ShopProductEnvKeys> = {
  "2026-summer-social-shirt": {
    productIdEnv: "STRIPE_SHOP_PRODUCT_ID_2026_SHIRT",
    priceIdEnv: "STRIPE_SHOP_PRICE_ID_2026_SHIRT",
    priceCentsEnv: "STRIPE_SHOP_PRICE_CENTS_2026_SHIRT",
  },
  "summer-social-hat": {
    productIdEnv: "STRIPE_SHOP_PRODUCT_ID_HAT",
    priceIdEnv: "STRIPE_SHOP_PRICE_ID_HAT",
    priceCentsEnv: "STRIPE_SHOP_PRICE_CENTS_HAT",
  },
  "2025-summer-social-shirt": {
    productIdEnv: "STRIPE_SHOP_PRODUCT_ID_2025_SHIRT",
    priceIdEnv: "STRIPE_SHOP_PRICE_ID_2025_SHIRT",
    priceCentsEnv: "STRIPE_SHOP_PRICE_CENTS_2025_SHIRT",
  },
};

// Sanity check: every catalog product must have an env-key mapping.
shopProducts.forEach((product) => {
  if (!SHOP_PRODUCT_ENV_KEYS[product.slug]) {
    throw new Error(`Missing Stripe env key mapping for shop product "${product.slug}"`);
  }
});

export function getShopProductPriceId(slug: string): string | null {
  const keys = SHOP_PRODUCT_ENV_KEYS[slug];
  if (!keys) return null;
  return process.env[keys.priceIdEnv]?.trim() || null;
}

export function getShopProductId(slug: string): string | null {
  const keys = SHOP_PRODUCT_ENV_KEYS[slug];
  if (!keys) return null;
  return process.env[keys.productIdEnv]?.trim() || null;
}

export function getShopProductUnitAmountCents(slug: string): number | null {
  const keys = SHOP_PRODUCT_ENV_KEYS[slug];
  if (!keys) return null;
  if (getShopProductPriceId(slug)) return null;

  const raw = process.env[keys.priceCentsEnv]?.trim();
  if (!raw) return null;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}
