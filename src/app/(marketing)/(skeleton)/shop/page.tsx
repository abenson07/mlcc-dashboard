import type { Metadata } from "next";
import { ShopSection } from "@marketing/components/byq/ShopSection";

export const metadata: Metadata = {
  title: "Shop | Maple Leaf Community Council",
  description:
    "Shop Maple Leaf Community Council merch, including Summer Social shirts and hats, with proceeds supporting neighborhood events.",
};

export default function ShopPage() {
  return (
    <main>
      <ShopSection />
    </main>
  );
}
