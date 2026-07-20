import { FaqSection } from "@marketing/components/byq/FaqSection";
import { getAllFaqs } from "@marketing/data/faqs";

export async function AllFaqSection() {
  const faqs = await getAllFaqs();
  if (faqs.length === 0) return null;

  return (
    <FaqSection
      label="FAQ"
      headline="Frequently asked questions"
      faqs={faqs}
      data-editable="true"
      data-editable-type="section"
      data-editable-id="faq.all"
      data-editable-label="All FAQs"
    />
  );
}

export default AllFaqSection;
