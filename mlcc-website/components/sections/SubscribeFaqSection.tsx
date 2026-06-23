"use client";

import { FaqSection, type FaqItem } from "@marketing/components/byq/FaqSection";

const subscribeFaqs: FaqItem[] = [
  {
    question: "How often will I hear from you?",
    answer:
      "Usually a few times a month — when there is something worth sharing, like an upcoming event, a new Leaflet issue, or an advocacy update. We do not send daily emails.",
  },
  {
    question: "Is this the same as the printed Leaflet?",
    answer:
      "The email list complements the Leaflet. You will get digital highlights and reminders, while the printed newsletter still goes door to door across Maple Leaf thanks to volunteer deliverers.",
  },
  {
    question: "Can I unsubscribe?",
    answer:
      "Yes. Every email includes an unsubscribe link, and you can opt out at any time with one click.",
  },
  {
    question: "Do I need to be a member to subscribe?",
    answer:
      "No. The newsletter is free and open to anyone who wants to stay connected to Maple Leaf, whether you live here, work here, or just care about the neighborhood.",
  },
  {
    question: "Who runs the newsletter?",
    answer:
      "The Maple Leaf Community Council Newsletter committee — neighbors who write, design, and coordinate delivery of the Leaflet. Learn more on the Newsletter committee page.",
  },
];

export function SubscribeFaqSection() {
  return (
    <FaqSection
      label="Questions"
      headline="Before you sign up"
      faqs={subscribeFaqs}
    />
  );
}

export default SubscribeFaqSection;
