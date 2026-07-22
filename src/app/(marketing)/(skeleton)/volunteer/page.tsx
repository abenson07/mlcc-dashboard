import { Suspense } from "react";
import type { Metadata } from "next";
import { CtaSection } from "@marketing/components/byq/CtaSection";
import { StructuredData4Section } from "@marketing/components/byq/StructuredData4Section";

export const metadata: Metadata = {
  title: "Volunteer | Maple Leaf Community Council",
  description:
    "Browse volunteer opportunities with the Maple Leaf Community Council, from committee roles to one-time event help.",
};

export default function VolunteerPage() {
  return (
    <main>
      <Suspense>
        <StructuredData4Section title="Volunteer" />
      </Suspense>
      <CtaSection />
    </main>
  );
}
