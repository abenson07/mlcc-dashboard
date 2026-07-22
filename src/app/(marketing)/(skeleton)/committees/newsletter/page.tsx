import type { Metadata } from "next";
import { CommitteeDetailPage } from "@marketing/components/byq/CommitteeDetailPage";

export const metadata: Metadata = {
  title: "Newsletter Committee | Maple Leaf Community Council",
  description:
    "The Newsletter committee writes, designs, and coordinates delivery of the Leaflet, Maple Leaf's printed neighborhood newsletter.",
};

export default function NewsletterCommitteePage() {
  return <CommitteeDetailPage slug="newsletter" />;
}
