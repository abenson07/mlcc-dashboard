import type { Metadata } from "next";
import { CommitteeDetailPage } from "@marketing/components/byq/CommitteeDetailPage";

export const metadata: Metadata = {
  title: "Advocacy Committee | Maple Leaf Community Council",
  description:
    "The Advocacy committee creates spaces for neighbors to learn about policy changes, including zoning workshops connected to the One Seattle Plan.",
};

export default function AdvocacyCommitteePage() {
  return <CommitteeDetailPage slug="advocacy" />;
}
