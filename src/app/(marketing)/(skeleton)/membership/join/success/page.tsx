import type { Metadata } from "next";
import { MembershipJoinSuccessSection } from "@marketing/components/sections/MembershipJoinSuccessSection";

export const metadata: Metadata = {
  title: "Welcome | Maple Leaf Community Council",
  description: "Your Maple Leaf Community Council membership is confirmed.",
};

export default function MembershipJoinSuccessPage() {
  return (
    <main>
      <MembershipJoinSuccessSection />
    </main>
  );
}
