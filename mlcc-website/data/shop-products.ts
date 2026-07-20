// Shop catalog. Framework-agnostic (no supabase-js/package deps) so it works
// unmodified in both the mlcc-website preview app and the root Next.js app.
//
// NOTE: priceCents and copy below are placeholders — confirm final pricing
// and swap /images/shop/*.svg for real product photography before launch.

export type ShopFulfillment = "preorder" | "in_stock";

export type ShopSizeGroup = {
  label: string;
  sizes: string[];
};

export type ShopProduct = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  fulfillment: ShopFulfillment;
  priceCents: number;
  sizeGroups: ShopSizeGroup[];
};

export const shopProducts: ShopProduct[] = [
  {
    slug: "2026-summer-social-shirt",
    name: "2026 Summer Social Shirt",
    tagline: "Pre-order for this year's Summer Social",
    description:
      "This year's Summer Social tee, available in adult and kids sizes. Pre-orders are printed after the order window closes, then mailed to your address; plan on a few weeks after ordering before it ships.",
    image: "/images/shop/2026-summer-social-shirt.svg",
    fulfillment: "preorder",
    priceCents: 2800,
    sizeGroups: [
      { label: "Adult", sizes: ["XS", "S", "M", "L", "XL", "XXL"] },
      { label: "Kids", sizes: ["XS", "S", "M", "L", "XL"] },
    ],
  },
  {
    slug: "summer-social-hat",
    name: "Summer Social Hat",
    tagline: "In stock, ships now",
    description:
      "A one-size-fits-most hat celebrating the Maple Leaf Summer Social. In stock and ready to mail, no wait for printing.",
    image: "/images/shop/summer-social-hat.svg",
    fulfillment: "in_stock",
    priceCents: 2200,
    sizeGroups: [{ label: "Size", sizes: ["One Size"] }],
  },
  {
    slug: "2025-summer-social-shirt",
    name: "2025 Summer Social Shirt",
    tagline: "In stock, select sizes",
    description:
      "Last year's Summer Social tee in standard adult sizes, while supplies last. In stock and ready to mail.",
    image: "/images/shop/2025-summer-social-shirt.svg",
    fulfillment: "in_stock",
    priceCents: 2200,
    sizeGroups: [{ label: "Adult", sizes: ["S", "M", "L", "XL"] }],
  },
];

export function findShopProduct(slug: string): ShopProduct | undefined {
  return shopProducts.find((product) => product.slug === slug);
}

export function formatShopPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

// A product's sizes are only qualified by group label when it has more than
// one group (e.g. the 2026 shirt's Adult vs. Kids "M" would otherwise collide).
export function formatVariantLabel(
  product: ShopProduct,
  groupLabel: string,
  size: string
): string {
  return product.sizeGroups.length > 1 ? `${groupLabel} ${size}` : size;
}

export function shopProductVariants(product: ShopProduct): string[] {
  return product.sizeGroups.flatMap((group) =>
    group.sizes.map((size) => formatVariantLabel(product, group.label, size))
  );
}
