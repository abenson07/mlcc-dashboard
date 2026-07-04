import NeighborsHubContent from "@/components/neighbors/NeighborsHubContent";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Neighbors",
  description: "Neighbors and members",
};

export default function NeighborsPage() {
  return (
    <Suspense
      fallback={<div className="p-6 text-sm text-gray-500">Loading…</div>}
    >
      <NeighborsHubContent />
    </Suspense>
  );
}
