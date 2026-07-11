import { FaqSection } from "@marketing/components/byq/FaqSection";
import { getFaqsForPage } from "@marketing/data/faqs";

export async function ContactFaqSection() {
  const faqs = await getFaqsForPage("contact");
  if (faqs.length === 0) return null;

  return (
    <FaqSection
      label="FAQ"
      headline="Frequently asked questions"
      faqs={faqs}
      data-editable="true"
      data-editable-type="section"
      data-editable-id="contact.faq"
      data-editable-label="Contact FAQ"
    />
  );
}

export default ContactFaqSection;
