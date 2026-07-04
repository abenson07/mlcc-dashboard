import TshirtPreordersContent from "@/components/commerce/TshirtPreordersContent";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "T-shirt preorders",
  description: "Summer social t-shirt preorders from public landing",
};

export default function TshirtPreordersPage() {
  return (
    <Suspense
      fallback={<div className="p-6 text-sm text-gray-500">Loading…</div>}
    >
      <TshirtPreordersContent />
    </Suspense>
  );
}
