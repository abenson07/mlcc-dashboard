import { Suspense } from "react";
import { CtaSection } from "@marketing/components/byq/CtaSection";
import { StructuredData4Section } from "@marketing/components/byq/StructuredData4Section";

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
