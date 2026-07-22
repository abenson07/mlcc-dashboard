import type { Metadata } from "next";
import { CommitteeDetailPage } from "@marketing/components/byq/CommitteeDetailPage";

export const metadata: Metadata = {
  title: "Emergency Hub Committee | Maple Leaf Community Council",
  description:
    "The Emergency Hub helps neighbors plan, train, and connect so Maple Leaf is ready to respond together when a disaster hits.",
};

export default function EmergencyHubCommitteePage() {
  return <CommitteeDetailPage slug="emergency-hub" />;
}
