import type { TshirtLineItem } from "@/types/database";

export const ADULT_SIZES = ["XS", "S", "M", "L", "XL"] as const;
export const CHILD_SIZES = ["XS", "S", "M", "L", "XL"] as const;

const MAX_QTY_PER_LINE = 20;
const MAX_TOTAL_QTY = 50;

export type TshirtCartLine = TshirtLineItem;

export function parseTshirtCart(raw: unknown): TshirtCartLine[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;

  const lines: TshirtCartLine[] = [];
  let totalQty = 0;

  for (const item of raw) {
    if (!item || typeof item !== "object") return null;
    const row = item as Record<string, unknown>;
    const category = row.category;
    const size = typeof row.size === "string" ? row.size.trim().toUpperCase() : "";
    const quantity =
      typeof row.quantity === "number"
        ? row.quantity
        : Number.parseInt(String(row.quantity ?? ""), 10);

    if (category !== "adult" && category !== "child") return null;
    const allowed =
      category === "adult" ? ADULT_SIZES : CHILD_SIZES;
    if (!allowed.includes(size as (typeof allowed)[number])) return null;
    if (!Number.isInteger(quantity) || quantity < 1) continue;
    if (quantity > MAX_QTY_PER_LINE) return null;

    totalQty += quantity;
    if (totalQty > MAX_TOTAL_QTY) return null;

    lines.push({ category, size, quantity });
  }

  return lines.length > 0 ? lines : null;
}

export function formatLineItemsSummary(lines: TshirtCartLine[]): string {
  return lines
    .map(
      (l) =>
        `${l.quantity}× ${l.category === "adult" ? "Adult" : "Kids"} ${l.size}`
    )
    .join(", ");
}

export function lineItemLabel(line: TshirtCartLine): string {
  const group = line.category === "adult" ? "Adult" : "Kids";
  return `T-Shirt — ${group} ${line.size}`;
}
