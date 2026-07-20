import { FaqSection } from "@marketing/components/byq/FaqSection";
import { getFaqsForPage } from "@marketing/data/faqs";

export async function CommitteesFaqSection() {
  const faqs = await getFaqsForPage("committees");
  if (faqs.length === 0) return null;

  return (
    <FaqSection
      label="FAQ"
      headline="Common questions about getting involved"
      faqs={faqs.slice(0, 5)}
      data-editable="true"
      data-editable-type="section"
      data-editable-id="committees.faq"
      data-editable-label="Committees FAQ"
    />
  );
}

export default CommitteesFaqSection;
