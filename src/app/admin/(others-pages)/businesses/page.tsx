import BusinessesHubContent from "@/components/businesses/BusinessesHubContent";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Businesses",
  description: "Businesses, members, and past sponsors",
};

export default function BusinessesPage() {
  return (
    <Suspense
      fallback={<div className="p-6 text-sm text-gray-500">Loading…</div>}
    >
      <BusinessesHubContent />
    </Suspense>
  );
}
