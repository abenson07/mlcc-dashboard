import type { Metadata } from "next";
import { ShopCancelledSection } from "@marketing/components/byq/ShopCancelledSection";

export const metadata: Metadata = {
  title: "Order Cancelled | Maple Leaf Community Council",
  description: "Your Maple Leaf Community Council shop checkout was cancelled.",
};

export default function ShopCancelledPage() {
  return (
    <main>
      <ShopCancelledSection />
    </main>
  );
}
