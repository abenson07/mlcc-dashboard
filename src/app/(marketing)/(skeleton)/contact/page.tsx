import type { Metadata } from "next";
import { ContactSection } from "@marketing/components/byq/ContactSection";
import { CtaSection } from "@marketing/components/byq/CtaSection";
import { ContactFaqSection } from "@marketing/components/sections/ContactFaqSection";

export const metadata: Metadata = {
  title: "Contact | Maple Leaf Community Council",
  description:
    "Get in touch with the Maple Leaf Community Council. Reach out with questions, ideas, or ways you'd like to get involved in the neighborhood.",
};

export default function ContactPage() {
  return (
    <main>
      <ContactSection title="Contact" />
      <ContactFaqSection />
      <CtaSection />
    </main>
  );
}
