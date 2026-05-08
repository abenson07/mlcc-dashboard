import Stripe from "stripe";

/**
 * Comma-separated Stripe Price or Product ids (`prod_…` / `price_…`).
 * Prices are resolved to their parent product id when matching.
 */
export function parseStripeIdSet(raw: string | undefined): Set<string> {
  const s = new Set<string>();
  if (!raw?.trim()) return s;
  for (const part of raw.split(",")) {
    const id = part.trim();
    if (id) s.add(id);
  }
  return s;
}

function productIdFromStripeProduct(
  prod: string | Stripe.Product | Stripe.DeletedProduct | null | undefined
): string | null {
  if (prod == null) return null;
  if (typeof prod === "string") {
    return prod.startsWith("prod_") ? prod : null;
  }
  if ("deleted" in prod && prod.deleted) return null;
  const id = (prod as Stripe.Product).id;
  return id?.startsWith("prod_") ? id : null;
}

function productIdFromPrice(
  price: Stripe.Price | Stripe.DeletedPrice | null | undefined
): string | null {
  if (!price || ("deleted" in price && price.deleted)) return null;
  return productIdFromStripeProduct(
    (price as Stripe.Price).product as string | Stripe.Product | Stripe.DeletedProduct
  );
}

async function priceToProductId(
  stripe: Stripe,
  priceId: string
): Promise<string | null> {
  try {
    const price = await stripe.prices.retrieve(priceId);
    return productIdFromPrice(price);
  } catch {
    return null;
  }
}

/**
 * When EXCLUDE/INCLUDE env lists contain `price_…` ids, resolve each to `prod_…` once per request.
 */
export async function expandIdSetToProductIds(
  stripe: Stripe,
  ids: Set<string>
): Promise<Set<string>> {
  const products = new Set<string>();
  for (const id of ids) {
    if (id.startsWith("prod_")) {
      products.add(id);
      continue;
    }
    if (id.startsWith("price_")) {
      const pid = await priceToProductId(stripe, id);
      if (pid) products.add(pid);
      continue;
    }
  }
  return products;
}

async function planToProductId(
  stripe: Stripe,
  planId: string
): Promise<string | null> {
  try {
    const plan = await stripe.plans.retrieve(planId);
    return productIdFromStripeProduct(plan.product);
  } catch {
    return null;
  }
}

/** Dedupe Stripe lookups when resolving many invoices in one request */
export type InvoiceLineResolutionCaches = {
  prices: Map<string, string | null>;
  plans: Map<string, string | null>;
};

function legacyPlanFromLine(line: Stripe.InvoiceLineItem):
  | { kind: "none" }
  | { kind: "id"; id: string }
  | { kind: "resolved"; productId: string } {
  const raw = (line as unknown as { plan?: string | Stripe.Plan | null })
    .plan;
  if (!raw) return { kind: "none" };
  if (typeof raw === "string" && raw.startsWith("plan_")) {
    return { kind: "id", id: raw };
  }
  if (typeof raw === "object") {
    if ("deleted" in raw && raw.deleted) return { kind: "none" };
    const pid = productIdFromStripeProduct(
      (raw as Stripe.Plan).product as string | Stripe.Product | Stripe.DeletedProduct
    );
    if (pid) return { kind: "resolved", productId: pid };
  }
  return { kind: "none" };
}

export type InvoiceProductFilterConfig = {
  /** Hide invoices that touch any of these catalog products (e.g. membership). */
  excludeProducts: Set<string>;
  /**
   * When non-empty, hide invoices that reference any catalog product outside this set.
   * Lines with no catalog product (typical one-offs) still pass.
   */
  includeProducts: Set<string>;
};

/**
 * Catalog product for a line (`prod_…`) using only fields present on the object
 * (synchronous). For `price_…` / `plan_…` id strings, use
 * `catalogProductIdFromInvoiceLineResolved`.
 */
export function catalogProductIdFromInvoiceLine(
  line: Stripe.InvoiceLineItem
): string | null {
  const details = line.pricing?.price_details;
  if (details) {
    const fromProduct = productIdFromStripeProduct(
      details.product as string | Stripe.Product | Stripe.DeletedProduct
    );
    if (fromProduct) return fromProduct;

    const price = details.price;
    if (typeof price === "object" && price !== null) {
      const fromPrice = productIdFromPrice(price as Stripe.Price);
      if (fromPrice) return fromPrice;
    }
  }

  const plan = legacyPlanFromLine(line);
  if (plan.kind === "resolved") return plan.productId;

  return null;
}

export async function catalogProductIdFromInvoiceLineResolved(
  stripe: Stripe,
  line: Stripe.InvoiceLineItem,
  caches: InvoiceLineResolutionCaches
): Promise<string | null> {
  const sync = catalogProductIdFromInvoiceLine(line);
  if (sync) return sync;

  const details = line.pricing?.price_details;
  if (
    details &&
    typeof details.price === "string" &&
    details.price.startsWith("price_")
  ) {
    const priceId = details.price;
    let resolved = caches.prices.get(priceId);
    if (resolved === undefined) {
      resolved = await priceToProductId(stripe, priceId);
      caches.prices.set(priceId, resolved);
    }
    return resolved;
  }

  const plan = legacyPlanFromLine(line);
  if (plan.kind === "id") {
    let resolved = caches.plans.get(plan.id);
    if (resolved === undefined) {
      resolved = await planToProductId(stripe, plan.id);
      caches.plans.set(plan.id, resolved);
    }
    return resolved;
  }

  return null;
}

export async function catalogProductIdsForInvoice(
  stripe: Stripe,
  inv: Stripe.Invoice,
  caches: InvoiceLineResolutionCaches
): Promise<string[]> {
  const lines = inv.lines?.data ?? [];
  const ids = new Set<string>();
  for (const line of lines) {
    const pid = await catalogProductIdFromInvoiceLineResolved(
      stripe,
      line,
      caches
    );
    if (pid) ids.add(pid);
  }
  return Array.from(ids).sort();
}

export async function invoiceMatchesProductFilterAsync(
  stripe: Stripe,
  inv: Stripe.Invoice,
  cfg: InvoiceProductFilterConfig,
  caches: InvoiceLineResolutionCaches
): Promise<boolean> {
  const lines = inv.lines?.data ?? [];
  if (lines.length === 0) return true;

  const pids = await Promise.all(
    lines.map((line) =>
      catalogProductIdFromInvoiceLineResolved(stripe, line, caches)
    )
  );

  for (const pid of pids) {
    if (pid && cfg.excludeProducts.has(pid)) return false;
  }

  if (cfg.includeProducts.size === 0) return true;

  return pids.every((pid) => !pid || cfg.includeProducts.has(pid));
}

/**
 * - If any line maps to a product in `excludeProducts` → hide (membership noise).
 * - If `includeProducts` non-empty: keep only if every line either has no catalog product or its product is in `includeProducts`.
 */
export function invoiceMatchesProductFilter(
  inv: Stripe.Invoice,
  cfg: InvoiceProductFilterConfig
): boolean {
  const lines = inv.lines?.data ?? [];
  if (lines.length === 0) return true;

  for (const line of lines) {
    const pid = catalogProductIdFromInvoiceLine(line);
    if (pid && cfg.excludeProducts.has(pid)) return false;
  }

  if (cfg.includeProducts.size === 0) return true;

  return lines.every((line) => {
    const pid = catalogProductIdFromInvoiceLine(line);
    return !pid || cfg.includeProducts.has(pid);
  });
}
