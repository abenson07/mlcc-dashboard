import CommunicationsHubContent from "@/components/communications/CommunicationsHubContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Communications",
  description: "Scheduled email broadcasts and Instagram/Facebook posts via Buffer",
};

export default function CommunicationsPage() {
  return <CommunicationsHubContent />;
}
