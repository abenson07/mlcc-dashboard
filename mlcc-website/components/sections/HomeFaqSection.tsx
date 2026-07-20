import { FaqSection } from "@marketing/components/byq/FaqSection";
import { getFaqsForPage } from "@marketing/data/faqs";

export async function HomeFaqSection() {
  const faqs = await getFaqsForPage("home");
  if (faqs.length === 0) return null;

  return (
    <FaqSection
      label="FAQ"
      headline="Frequently asked questions"
      faqs={faqs.slice(0, 5)}
      data-editable="true"
      data-editable-type="section"
      data-editable-id="home.faq"
      data-editable-label="Home FAQ"
    />
  );
}

export default HomeFaqSection;
