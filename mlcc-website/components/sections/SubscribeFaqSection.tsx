import { FaqSection } from "@marketing/components/byq/FaqSection";
import { getFaqsForPage } from "@marketing/data/faqs";

export async function SubscribeFaqSection() {
  const faqs = await getFaqsForPage("subscribe");
  if (faqs.length === 0) return null;

  return (
    <section
      data-editable="true"
      data-editable-type="section"
      data-editable-id="subscribe.faq"
      data-editable-label="Subscribe FAQ"
    >
      <FaqSection label="Questions" headline="Before you sign up" faqs={faqs} />
    </section>
  );
}

export default SubscribeFaqSection;
