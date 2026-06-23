import RoutesHubContent from "@/components/routes/RoutesHubContent";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Routes",
  description: "Claimed routes, deliverers, and open routes",
};

export default function RoutesPage() {
  return (
    <Suspense
      fallback={<div className="p-6 text-sm text-gray-500">Loading…</div>}
    >
      <RoutesHubContent />
    </Suspense>
  );
}
