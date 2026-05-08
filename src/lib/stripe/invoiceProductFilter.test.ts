import { describe, expect, it } from "vitest";
import {
  catalogProductIdFromInvoiceLine,
  invoiceMatchesProductFilter,
  parseStripeIdSet,
} from "./invoiceProductFilter";
import type Stripe from "stripe";

function lineWithProduct(prod: string | null): Stripe.InvoiceLineItem {
  return {
    pricing: prod
      ? {
          type: "price_details",
          unit_amount_decimal: "1000",
          price_details: { price: "price_x", product: prod },
        }
      : null,
    // minimal fields Vitest ignores
  } as unknown as Stripe.InvoiceLineItem;
}

function invoiceWithLines(lines: Stripe.InvoiceLineItem[]): Stripe.Invoice {
  return {
    lines: { data: lines, object: "list", has_more: false, url: "/v1/..." },
  } as Stripe.Invoice;
}

describe("parseStripeIdSet", () => {
  it("parses commas and trims", () => {
    expect([...parseStripeIdSet(" prod_a , prod_b ")].sort()).toEqual([
      "prod_a",
      "prod_b",
    ]);
  });
});

describe("invoiceMatchesProductFilter", () => {
  it("hides invoices that touch excluded products", () => {
    const inv = invoiceWithLines([
      lineWithProduct("prod_good"),
      lineWithProduct("prod_membership"),
    ]);
    expect(
      invoiceMatchesProductFilter(inv, {
        excludeProducts: new Set(["prod_membership"]),
        includeProducts: new Set(),
      })
    ).toBe(false);
  });

  it("shows one-offs when include allowlist is set", () => {
    const inv = invoiceWithLines([
      lineWithProduct(null),
      lineWithProduct(null),
    ]);
    expect(
      invoiceMatchesProductFilter(inv, {
        excludeProducts: new Set(),
        includeProducts: new Set(["prod_evt"]),
      })
    ).toBe(true);
  });

  it("allows catalog lines only from include set when allowlist active", () => {
    expect(
      invoiceMatchesProductFilter(
        invoiceWithLines([lineWithProduct("prod_evt")]),
        {
          excludeProducts: new Set(),
          includeProducts: new Set(["prod_evt"]),
        }
      )
    ).toBe(true);

    expect(
      invoiceMatchesProductFilter(
        invoiceWithLines([lineWithProduct("prod_other")]),
        {
          excludeProducts: new Set(),
          includeProducts: new Set(["prod_evt"]),
        }
      )
    ).toBe(false);
  });

  it("drops membership even when membership is mixed with allowed product", () => {
    expect(
      invoiceMatchesProductFilter(
        invoiceWithLines([
          lineWithProduct("prod_evt"),
          lineWithProduct("prod_membership"),
        ]),
        {
          excludeProducts: new Set(["prod_membership"]),
          includeProducts: new Set(["prod_evt"]),
        }
      )
    ).toBe(false);
  });
});

describe("catalogProductIdFromInvoiceLine", () => {
  it("reads pricing.price_details.product", () => {
    expect(catalogProductIdFromInvoiceLine(lineWithProduct("prod_x"))).toBe(
      "prod_x"
    );
    expect(catalogProductIdFromInvoiceLine(lineWithProduct(null))).toBe(null);
  });

  it("reads expanded product object on price_details", () => {
    const line = {
      pricing: {
        type: "price_details",
        unit_amount_decimal: "4000",
        price_details: {
          price: "price_test",
          product: {
            id: "prod_expanded",
            object: "product",
          } satisfies Partial<Stripe.Product> as Stripe.Product,
        },
      },
    } as unknown as Stripe.InvoiceLineItem;
    expect(catalogProductIdFromInvoiceLine(line)).toBe("prod_expanded");
  });

  it("reads product from expanded Price when details.product is absent", () => {
    const line = {
      pricing: {
        type: "price_details",
        unit_amount_decimal: "4000",
        price_details: {
          price: {
            id: "price_x",
            object: "price",
            product: "prod_from_price",
          } satisfies Partial<Stripe.Price> as Stripe.Price,
        },
      },
    } as unknown as Stripe.InvoiceLineItem;
    expect(catalogProductIdFromInvoiceLine(line)).toBe("prod_from_price");
  });

  it("reads expanded legacy plan.product on line", () => {
    const line = {
      plan: {
        id: "plan_x",
        object: "plan",
        product: "prod_from_plan",
      } satisfies Partial<Stripe.Plan> as Stripe.Plan,
    } as unknown as Stripe.InvoiceLineItem;
    expect(catalogProductIdFromInvoiceLine(line)).toBe("prod_from_plan");
  });
});
