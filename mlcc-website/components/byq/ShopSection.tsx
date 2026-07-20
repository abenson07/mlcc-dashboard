"use client";

import Link from "next/link";
import { SectionLabel } from "@marketing/components/SectionLabel";
import { formatShopPrice, shopProducts } from "@marketing/data/shop-products";

export function ShopSection() {
  return (
    <section
      className="bg-sparkles-cream"
      data-editable="true"
      data-editable-type="section"
      data-editable-id="shop.gallery"
      data-editable-label="Shop Gallery"
    >
      <div className="px-8 max-[767px]:px-4">
        <div className="mx-auto w-full max-w-[1800px]">
          <div className="py-40 max-[767px]:py-20">
            <div className="mb-20 flex flex-col items-center justify-start gap-6 text-center max-[767px]:mb-12">
              <SectionLabel>Shop</SectionLabel>
              <h1 className="m-0 font-display text-[3.75rem] leading-[4rem] font-bold tracking-[-0.125rem] text-puget-night max-[767px]:text-[2.5rem] max-[767px]:leading-[2.75rem] max-[767px]:tracking-[-0.03125rem]">
                Maple Leaf merch
              </h1>
              <p className="m-0 max-w-[36rem] font-body text-base leading-6 text-sparkles-muted">
                Every order supports Maple Leaf community events. Pre-order items are
                printed after the order window closes; in-stock items ship right away.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 max-[991px]:grid-cols-2 max-[767px]:grid-cols-1">
              {shopProducts.map((product) => (
                <Link
                  key={product.slug}
                  href={`/shop/${product.slug}`}
                  className="group flex flex-col gap-4 text-puget-night no-underline"
                >
                  <div className="relative flex h-[26rem] w-full items-center justify-center overflow-hidden rounded-[1.75rem] border-[3px] border-sparkles-navy bg-sparkles-warm px-8 py-16 max-[767px]:h-[20rem]">
                    {product.fulfillment === "preorder" && (
                      <span className="absolute top-4 left-4 rounded-2xl bg-sparkles-gold px-2 py-1 font-body text-xs leading-4 font-bold tracking-[0.047rem] text-puget-night uppercase">
                        Pre-Order
                      </span>
                    )}
                    <img
                      loading="lazy"
                      alt={product.name}
                      src={product.image}
                      className="h-full object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="font-display text-2xl leading-7 font-bold tracking-[-0.03125rem] text-puget-night">
                      {product.name}
                    </div>
                    <div className="font-body text-base leading-6 text-sparkles-muted">
                      {formatShopPrice(product.priceCents)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ShopSection;
