import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShopProductSection } from "@marketing/components/byq/ShopProductSection";
import { findShopProduct } from "@marketing/data/shop-products";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = findShopProduct(slug);

  if (!product) {
    return {};
  }

  return {
    title: `${product.name} | Shop`,
    description: product.description,
  };
}

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
