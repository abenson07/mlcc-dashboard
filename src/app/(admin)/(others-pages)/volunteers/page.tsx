import VolunteersHubContent from "@/components/volunteers/VolunteersHubContent";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Volunteers",
  description: "Volunteer asks and event rosters",
};

export default function VolunteersPage() {
  return (
    <Suspense
      fallback={<div className="p-6 text-sm text-gray-500">Loading…</div>}
    >
      <VolunteersHubContent />
    </Suspense>
  );
}
