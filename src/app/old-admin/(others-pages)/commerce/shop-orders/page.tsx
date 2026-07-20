import ShopOrdersContent from "@/components/commerce/ShopOrdersContent";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Shop orders",
  description: "Merch shop orders from the public shop",
};

export default function ShopOrdersPage() {
  return (
    <Suspense
      fallback={<div className="p-6 text-sm text-gray-500">Loading…</div>}
    >
      <ShopOrdersContent />
    </Suspense>
  );
}
