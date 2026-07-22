import { Suspense } from "react";
import type { Metadata } from "next";
import { MembershipJoinSection } from "@marketing/components/sections/MembershipJoinSection";

export const metadata: Metadata = {
  title: "Join | Maple Leaf Community Council",
  description: "Complete your Maple Leaf Community Council membership sign-up.",
};

export default function MembershipJoinPage() {
  return (
    <main>
      <Suspense>
        <MembershipJoinSection />
      </Suspense>
    </main>
  );
}
