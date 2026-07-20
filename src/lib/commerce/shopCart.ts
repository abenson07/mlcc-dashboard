import { findShopProduct, shopProductVariants } from "@marketing/data/shop-products";

const MAX_QTY_PER_LINE = 20;
const MAX_TOTAL_QTY = 50;

export type ShopCartLine = {
  productSlug: string;
  variant: string;
  quantity: number;
};

function isValidVariant(productSlug: string, variant: string): boolean {
  const product = findShopProduct(productSlug);
  if (!product) return false;
  return shopProductVariants(product).includes(variant);
}

export function parseShopCart(raw: unknown): ShopCartLine[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;

  const lines: ShopCartLine[] = [];
  let totalQty = 0;

  for (const item of raw) {
    if (!item || typeof item !== "object") return null;
    const row = item as Record<string, unknown>;

    const productSlug =
      typeof row.productSlug === "string" ? row.productSlug.trim() : "";
    const variant = typeof row.variant === "string" ? row.variant.trim() : "";
    const quantity =
      typeof row.quantity === "number"
        ? row.quantity
        : Number.parseInt(String(row.quantity ?? ""), 10);

    if (!productSlug || !findShopProduct(productSlug)) return null;
    if (!isValidVariant(productSlug, variant)) return null;
    if (!Number.isInteger(quantity) || quantity < 1) continue;
    if (quantity > MAX_QTY_PER_LINE) return null;

    totalQty += quantity;
    if (totalQty > MAX_TOTAL_QTY) return null;

    lines.push({ productSlug, variant, quantity });
  }

  return lines.length > 0 ? lines : null;
}

export function formatLineItemsSummary(
  lines: { product_name: string; variant: string; quantity: number }[]
): string {
  return lines
    .map((l) => `${l.quantity}× ${l.product_name} (${l.variant})`)
    .join(", ");
}
