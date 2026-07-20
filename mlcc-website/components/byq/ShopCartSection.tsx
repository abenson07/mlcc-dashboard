"use client";

import * as React from "react";
import Link from "next/link";
import { SectionLabel } from "@marketing/components/SectionLabel";
import { useShopCart } from "@marketing/context/ShopCartContext";
import { findShopProduct, formatShopPrice } from "@marketing/data/shop-products";

type FormState = {
  name: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  email: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
};

function inputClassName() {
  return "w-full min-h-12 rounded-2xl border border-sparkles-navy/30 bg-white/60 px-4 py-2 font-body text-sm leading-5 text-puget-night placeholder:text-sparkles-muted focus:border-sparkles-navy focus:outline-none";
}

export function ShopCartSection() {
  const { lines, updateQuantity, removeLine, totalQuantity, totalCents } = useShopCart();
  const [form, setForm] = React.useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/public/checkout/shop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: lines,
          customer: form,
        }),
      });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) {
        throw new Error(json.error ?? "Checkout failed");
      }
      window.location.href = json.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
      setSubmitting(false);
    }
  }

  return (
    <section
      className="bg-sparkles-cream"
      data-editable="true"
      data-editable-type="section"
      data-editable-id="shop.cart"
      data-editable-label="Shop Cart"
    >
      <div className="px-8 max-[767px]:px-4">
        <div className="mx-auto w-full max-w-[1800px] py-40 max-[767px]:py-20">
          <div className="mb-12 flex flex-col items-start gap-2">
            <SectionLabel>Your cart</SectionLabel>
            <h1 className="m-0 font-display text-[3rem] leading-[3.25rem] font-bold tracking-[-0.125rem] text-puget-night max-[767px]:text-[2rem] max-[767px]:leading-7">
              Checkout
            </h1>
          </div>

          {lines.length === 0 ? (
            <div className="flex flex-col items-start gap-4">
              <p className="m-0 font-body text-base leading-6 text-sparkles-muted">
                Your cart is empty.
              </p>
              <Link
                href="/shop"
                className="font-body text-sm font-bold text-sparkles-navy underline underline-offset-2"
              >
                Browse the shop
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-[1.5fr_1fr] gap-16 max-[991px]:grid-cols-1 max-[991px]:gap-10">
              <div className="flex flex-col gap-6">
                <div className="w-full border-t border-sparkles-navy/16">
                  {lines.map((line) => {
                    const product = findShopProduct(line.productSlug);
                    if (!product) return null;
                    return (
                      <div
                        key={`${line.productSlug}::${line.variant}`}
                        className="flex items-center justify-between gap-4 border-b border-sparkles-navy/16 py-6 max-[479px]:flex-wrap"
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-16 w-16 shrink-0 rounded-xl bg-sparkles-warm object-contain p-2"
                          />
                          <div className="flex flex-col gap-1">
                            <div className="font-display text-lg leading-6 font-bold text-puget-night">
                              {product.name}
                            </div>
                            <div className="font-body text-sm leading-5 text-sparkles-muted">
                              {line.variant} · {formatShopPrice(product.priceCents)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-3 rounded-2xl border border-sparkles-navy/30 px-3 py-2">
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(line.productSlug, line.variant, line.quantity - 1)
                              }
                              className="font-display text-lg font-bold text-puget-night"
                              aria-label="Decrease quantity"
                            >
                              −
                            </button>
                            <span className="w-6 text-center font-body text-sm font-bold text-puget-night">
                              {line.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(line.productSlug, line.variant, line.quantity + 1)
                              }
                              className="font-display text-lg font-bold text-puget-night"
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeLine(line.productSlug, line.variant)}
                            className="font-body text-sm font-bold text-sparkles-muted underline underline-offset-2 hover:text-puget-night"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between font-display text-xl font-bold text-puget-night">
                  <span>Total ({totalQuantity} items)</span>
                  <span>{formatShopPrice(totalCents)}</span>
                </div>
              </div>

              <form
                onSubmit={handleCheckout}
                className="flex flex-col gap-4 rounded-[1.75rem] border-[3px] border-sparkles-navy bg-sparkles-cream p-7"
              >
                <div className="font-display text-xl leading-6 font-bold text-puget-night">
                  Shipping details
                </div>

                <input
                  required
                  placeholder="Full name"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className={inputClassName()}
                />
                <input
                  required
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className={inputClassName()}
                />
                <input
                  type="tel"
                  placeholder="Phone (optional)"
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  className={inputClassName()}
                />
                <input
                  required
                  placeholder="Address line 1"
                  value={form.addressLine1}
                  onChange={(e) => updateField("addressLine1", e.target.value)}
                  className={inputClassName()}
                />
                <input
                  placeholder="Address line 2 (optional)"
                  value={form.addressLine2}
                  onChange={(e) => updateField("addressLine2", e.target.value)}
                  className={inputClassName()}
                />
                <div className="flex gap-3 max-[479px]:flex-col">
                  <input
                    required
                    placeholder="City"
                    value={form.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    className={inputClassName()}
                  />
                  <input
                    required
                    placeholder="State"
                    value={form.state}
                    onChange={(e) => updateField("state", e.target.value)}
                    className={inputClassName()}
                  />
                  <input
                    required
                    placeholder="ZIP"
                    value={form.postalCode}
                    onChange={(e) => updateField("postalCode", e.target.value)}
                    className={inputClassName()}
                  />
                </div>

                {error && (
                  <p className="m-0 font-body text-sm leading-5 text-red-600">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-2 inline-flex items-center justify-center rounded-[2rem] border border-sparkles-navy bg-sparkles-navy px-6 py-3 font-display text-sm leading-5 font-bold text-sparkles-cream uppercase transition-all duration-300 hover:border-sparkles-navy/90 hover:bg-sparkles-navy/90 disabled:opacity-60"
                >
                  {submitting ? "Redirecting…" : `Checkout: ${formatShopPrice(totalCents)}`}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default ShopCartSection;
