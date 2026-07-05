import SponsorshipHubContent from "@/components/sponsorship/SponsorshipHubContent";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Sponsorship",
  description: "Event sponsorships and Stripe invoices",
};

export default function SponsorshipPage() {
  return (
    <Suspense
      fallback={<div className="p-6 text-sm text-gray-500">Loading…</div>}
    >
      <SponsorshipHubContent />
    </Suspense>
  );
}
