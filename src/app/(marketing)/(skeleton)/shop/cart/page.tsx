import type { Metadata } from "next";
import { ShopCartSection } from "@marketing/components/byq/ShopCartSection";

export const metadata: Metadata = {
  title: "Cart | Maple Leaf Community Council",
  description: "Review your Maple Leaf Community Council shop cart before checkout.",
};

export default function ShopCartPage() {
  return (
    <main>
      <ShopCartSection />
    </main>
  );
}
