import type { Metadata } from "next";
import { CommitteeDetailPage } from "@marketing/components/byq/CommitteeDetailPage";

export const metadata: Metadata = {
  title: "Communications Committee | Maple Leaf Community Council",
  description:
    "The Communications committee shares what the council is working on through email, social media, and outreach to Maple Leaf neighbors.",
};

export default function CommunicationsCommitteePage() {
  return <CommitteeDetailPage slug="communications" />;
}
