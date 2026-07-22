"use client";

import * as React from "react";
import Link from "next/link";
import { useShopCart } from "@marketing/context/ShopCartContext";
import { findShopProduct, formatShopPrice } from "@marketing/data/shop-products";

export function ShopCartDrawer() {
  const {
    lines,
    updateQuantity,
    removeLine,
    totalQuantity,
    totalCents,
    isCartOpen,
    closeCart,
  } = useShopCart();
  const panelRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!isCartOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeCart();
    }
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isCartOpen, closeCart]);

  React.useEffect(() => {
    if (!isCartOpen) return;
    panelRef.current?.focus();
  }, [isCartOpen]);

  return (
    <div
      className={`fixed inset-0 z-[1000] ${isCartOpen ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-hidden={!isCartOpen}
    >
      <button
        type="button"
        aria-label="Close cart"
        onClick={closeCart}
        className={`absolute inset-0 bg-puget-night/40 transition-opacity duration-300 ${
          isCartOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Your cart"
        tabIndex={-1}
        className={`absolute top-0 right-0 flex h-full w-full max-w-[28rem] flex-col border-l-[3px] border-sparkles-navy bg-sparkles-cream shadow-[-12px_0_40px_rgba(0,0,0,0.12)] transition-transform duration-300 ease-out outline-none ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between gap-4 border-b border-sparkles-navy/16 px-6 py-5">
          <div className="flex flex-col gap-1">
            <div className="font-body text-xs leading-4 font-bold tracking-[0.0625rem] text-sparkles-muted uppercase">
              Your cart
            </div>
            <div className="font-display text-xl leading-6 font-bold text-puget-night">
              {totalQuantity === 0
                ? "Empty"
                : `${totalQuantity} ${totalQuantity === 1 ? "item" : "items"}`}
            </div>
          </div>
          <button
            type="button"
            onClick={closeCart}
            className="font-display text-sm font-bold text-sparkles-navy uppercase"
            aria-label="Close cart"
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6">
          {lines.length === 0 ? (
            <div className="flex flex-col items-start gap-4 py-10">
              <p className="m-0 font-body text-base leading-6 text-sparkles-muted">
                Your cart is empty. Add a size you like and we&apos;ll hold it here.
              </p>
              <button
                type="button"
                onClick={closeCart}
                className="font-body text-sm font-bold text-sparkles-navy underline underline-offset-2"
              >
                Keep shopping
              </button>
            </div>
          ) : (
            <div className="border-t border-sparkles-navy/16">
              {lines.map((line) => {
                const product = findShopProduct(line.productSlug);
                if (!product) return null;
                return (
                  <div
                    key={`${line.productSlug}::${line.variant}`}
                    className="flex flex-col gap-4 border-b border-sparkles-navy/16 py-5"
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-16 w-16 shrink-0 rounded-xl bg-sparkles-warm object-contain p-2"
                      />
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <div className="font-display text-base leading-5 font-bold text-puget-night">
                          {product.name}
                        </div>
                        <div className="font-body text-sm leading-5 text-sparkles-muted">
                          {line.variant} · {formatShopPrice(product.priceCents)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 rounded-2xl border border-sparkles-navy/30 px-3 py-2">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              line.productSlug,
                              line.variant,
                              line.quantity - 1
                            )
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
                            updateQuantity(
                              line.productSlug,
                              line.variant,
                              line.quantity + 1
                            )
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
          )}
        </div>

        {lines.length > 0 && (
          <div className="flex flex-col gap-4 border-t border-sparkles-navy/16 px-6 py-5">
            <div className="flex items-center justify-between font-display text-lg font-bold text-puget-night">
              <span>Total</span>
              <span>{formatShopPrice(totalCents)}</span>
            </div>
            <Link
              href="/shop/cart"
              onClick={closeCart}
              className="inline-flex items-center justify-center rounded-[2rem] border border-sparkles-navy bg-sparkles-navy px-6 py-3 font-display text-sm leading-5 font-bold text-sparkles-cream uppercase no-underline transition-all duration-300 hover:border-sparkles-navy/90 hover:bg-sparkles-navy/90"
            >
              Checkout
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default ShopCartDrawer;
