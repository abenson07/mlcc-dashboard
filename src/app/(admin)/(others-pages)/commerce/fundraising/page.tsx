import FundraisingContent from "@/components/commerce/FundraisingContent";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Fundraising",
  description: "Summer recovery fundraiser donations",
};

export default function FundraisingPage() {
  return (
    <Suspense
      fallback={<div className="p-6 text-sm text-gray-500">Loading…</div>}
    >
      <FundraisingContent />
    </Suspense>
  );
}
