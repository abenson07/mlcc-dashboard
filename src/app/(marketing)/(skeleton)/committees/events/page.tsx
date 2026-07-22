import type { Metadata } from "next";
import { CommitteeDetailPage } from "@marketing/components/byq/CommitteeDetailPage";

export const metadata: Metadata = {
  title: "Events Committee | Maple Leaf Community Council",
  description:
    "The Events committee plans and hosts Maple Leaf traditions like the Summer Social, Halloween Parade, Movie Nights, and Silent Book Club.",
};

export default function EventsCommitteePage() {
  return <CommitteeDetailPage slug="events" />;
}
