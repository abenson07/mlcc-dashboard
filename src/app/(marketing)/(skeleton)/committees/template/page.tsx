import type { Metadata } from "next";
import { CommitteeDetailPage } from "@marketing/components/byq/CommitteeDetailPage";

export const metadata: Metadata = {
  title: "Committee Template | Maple Leaf Community Council",
  robots: { index: false, follow: true },
};

export default function CommitteesTemplatePage() {
  return <CommitteeDetailPage slug="template" />;
}
