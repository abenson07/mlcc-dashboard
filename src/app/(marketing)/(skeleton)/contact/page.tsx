import { ContactSection } from "@marketing/components/byq/ContactSection";
import { CtaSection } from "@marketing/components/byq/CtaSection";
import { ContactFaqSection } from "@marketing/components/sections/ContactFaqSection";

export default function ContactPage() {
  return (
    <main>
      <ContactSection title="Contact" />
      <ContactFaqSection />
      <CtaSection />
    </main>
  );
}
