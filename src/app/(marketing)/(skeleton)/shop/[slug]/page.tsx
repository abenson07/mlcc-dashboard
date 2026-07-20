import { notFound } from "next/navigation";
import { ShopProductSection } from "@marketing/components/byq/ShopProductSection";
import { findShopProduct } from "@marketing/data/shop-products";

export default async function ShopProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = findShopProduct(slug);
  if (!product) notFound();

  return (
    <main>
      <ShopProductSection product={product} />
    </main>
  );
}
