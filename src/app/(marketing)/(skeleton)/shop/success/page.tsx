import type { Metadata } from "next";
import { ShopSuccessSection } from "@marketing/components/byq/ShopSuccessSection";

export const metadata: Metadata = {
  title: "Order Confirmed | Maple Leaf Community Council",
  description: "Your Maple Leaf Community Council shop order has been confirmed.",
};

export default function ShopSuccessPage() {
  return (
    <main>
      <ShopSuccessSection />
    </main>
  );
}
