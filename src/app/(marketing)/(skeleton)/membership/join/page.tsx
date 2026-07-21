import { Suspense } from "react";
import { MembershipJoinSection } from "@marketing/components/sections/MembershipJoinSection";

export default function MembershipJoinPage() {
  return (
    <main>
      <Suspense>
        <MembershipJoinSection />
      </Suspense>
    </main>
  );
}
