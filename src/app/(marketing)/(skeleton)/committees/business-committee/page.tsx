import type { Metadata } from "next";
import { CommitteeDetailPage } from "@marketing/components/byq/CommitteeDetailPage";

export const metadata: Metadata = {
  title: "Business Committee | Maple Leaf Community Council",
  description:
    "The Business committee builds relationships between the community council and Maple Leaf's shops, restaurants, and service providers.",
};

export default function BusinessCommitteePage() {
  return <CommitteeDetailPage slug="business-committee" />;
}
