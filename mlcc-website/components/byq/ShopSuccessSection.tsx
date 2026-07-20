"use client";

import * as React from "react";
import Link from "next/link";
import { useShopCart } from "@marketing/context/ShopCartContext";

export function ShopSuccessSection() {
  const { clear } = useShopCart();

  React.useEffect(() => {
    clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="bg-sparkles-cream">
      <div className="px-8 max-[767px]:px-4">
        <div className="mx-auto w-full max-w-[1800px] py-40 max-[767px]:py-20">
          <div className="mx-auto flex max-w-[36rem] flex-col items-center gap-6 text-center">
            <h1 className="m-0 font-display text-[3rem] leading-[3.25rem] font-bold tracking-[-0.125rem] text-puget-night max-[767px]:text-[2rem] max-[767px]:leading-7">
              Order confirmed
            </h1>
            <p className="m-0 font-body text-base leading-6 text-sparkles-muted">
              Thank you for your order! A confirmation email is on its way. Pre-order
              items ship after printing; in-stock items ship soon.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center rounded-[2rem] border border-sparkles-navy bg-sparkles-navy px-6 py-3 font-display text-sm leading-5 font-bold text-sparkles-cream uppercase transition-all duration-300 hover:border-sparkles-navy/90 hover:bg-sparkles-navy/90"
            >
              Back to shop
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ShopSuccessSection;
