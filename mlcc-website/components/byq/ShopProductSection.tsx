"use client";

import * as React from "react";
import { SectionLabel } from "@marketing/components/SectionLabel";
import { useShopCart } from "@marketing/context/ShopCartContext";
import {
  formatShopPrice,
  formatVariantLabel,
  type ShopProduct,
} from "@marketing/data/shop-products";

export function ShopProductSection({ product }: { product: ShopProduct }) {
  const { addLine, totalQuantity, openCart } = useShopCart();
  const firstGroup = product.sizeGroups[0];
  const [selectedVariant, setSelectedVariant] = React.useState<string>(
    formatVariantLabel(product, firstGroup.label, firstGroup.sizes[0])
  );
  const [quantity, setQuantity] = React.useState(1);
  const [added, setAdded] = React.useState(false);

  function handleAddToCart() {
    addLine(product.slug, selectedVariant, quantity);
    setAdded(true);
    openCart();
    window.setTimeout(() => setAdded(false), 2000);
  }

  return (
    <section
      className="bg-sparkles-cream"
      data-editable="true"
      data-editable-type="section"
      data-editable-id="shop.product-detail"
      data-editable-label="Shop Product Detail"
    >
      <div className="px-8 max-[767px]:px-4">
        <div className="mx-auto w-full max-w-[1800px] py-40 max-[767px]:py-20">
          <div className="grid grid-cols-2 gap-16 max-[991px]:grid-cols-1 max-[991px]:gap-10">
            <div className="relative w-full">
              {product.fulfillment === "preorder" && (
                <span className="absolute top-4 left-4 z-[1] rounded-2xl bg-sparkles-gold px-2 py-1 font-body text-xs leading-4 font-bold tracking-[0.047rem] text-puget-night uppercase">
                  Pre-Order
                </span>
              )}
              <img
                loading="lazy"
                alt={product.name}
                src={product.image}
                className="block h-auto w-full"
              />
            </div>

            <div className="flex flex-col items-start gap-6">
              <div className="flex flex-col gap-2">
                <SectionLabel>{product.tagline}</SectionLabel>
                <h1 className="m-0 font-display text-[3rem] leading-[3.25rem] font-bold tracking-[-0.125rem] text-puget-night max-[767px]:text-[2rem] max-[767px]:leading-7">
                  {product.name}
                </h1>
              </div>

              <div className="font-display text-2xl leading-7 font-bold text-puget-night">
                {formatShopPrice(product.priceCents)}
              </div>

              <p className="m-0 font-body text-base leading-6 text-sparkles-muted">
                {product.description}
              </p>

              <div className="flex w-full flex-col gap-4">
                {product.sizeGroups.map((group) => (
                  <div key={group.label} className="flex flex-col gap-2">
                    <div className="font-body text-xs leading-4 font-bold tracking-[0.0625rem] text-sparkles-muted uppercase">
                      {group.label}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {group.sizes.map((size) => {
                        const value = formatVariantLabel(product, group.label, size);
                        const isSelected = value === selectedVariant;
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setSelectedVariant(value)}
                            className={`rounded-2xl border px-4 py-2 font-body text-sm font-bold transition-all duration-200 ${
                              isSelected
                                ? "border-sparkles-navy bg-sparkles-navy text-sparkles-cream"
                                : "border-sparkles-navy/30 bg-white/50 text-puget-night hover:border-sparkles-navy/60"
                            }`}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4">
                <div className="font-body text-xs leading-4 font-bold tracking-[0.0625rem] text-sparkles-muted uppercase">
                  Quantity
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-sparkles-navy/30 px-3 py-2">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="font-display text-lg font-bold text-puget-night"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="w-6 text-center font-body text-sm font-bold text-puget-night">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                    className="font-display text-lg font-bold text-puget-night"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="inline-flex items-center justify-center rounded-[2rem] border border-sparkles-navy bg-sparkles-navy px-6 py-3 font-display text-sm leading-5 font-bold text-sparkles-cream uppercase transition-all duration-300 hover:border-sparkles-navy/90 hover:bg-sparkles-navy/90"
                >
                  {added ? "Added to cart" : "Add to cart"}
                </button>
                {totalQuantity > 0 && (
                  <button
                    type="button"
                    onClick={openCart}
                    className="font-body text-sm font-bold text-sparkles-navy underline underline-offset-2"
                  >
                    View cart ({totalQuantity})
                  </button>
                )}
              </div>

              {product.fulfillment === "preorder" && (
                <p className="m-0 font-body text-sm leading-5 text-sparkles-muted">
                  Local pickup only. Movie Night is the main handoff. Can&apos;t make
                  it? We&apos;ll set up a backup pickup with you.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ShopProductSection;
