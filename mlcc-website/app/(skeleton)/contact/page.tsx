import { ContactSection } from "@marketing/components/byq/ContactSection";
import { CtaSection } from "@marketing/components/byq/CtaSection";
import { FaqSection } from "@marketing/components/byq/FaqSection";

export default function ContactPage() {
  return (
    <main>
      <ContactSection title="Contact" />
      <FaqSection />
      <CtaSection />
    </main>
  );
}
