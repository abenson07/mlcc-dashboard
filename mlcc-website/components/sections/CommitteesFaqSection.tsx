import { FaqSection, type FaqItem } from "@marketing/components/byq/FaqSection";

const committeesFaqs: FaqItem[] = [
  {
    question: "Do I need experience to join a committee?",
    answer:
      "No. Committees welcome neighbors at every experience level. Whether you want to help plan one event or take on ongoing work, experienced volunteers are happy to show you the ropes.",
  },
  {
    question: "How much time does volunteering take?",
    answer:
      "It depends on the role. Some volunteers help for a single day — delivering Leaflets or supporting an event setup. Others meet monthly or seasonally. You can choose a level of involvement that fits your schedule.",
  },
  {
    question: "Can I join more than one committee?",
    answer:
      "Yes. Many volunteers contribute to multiple areas, especially when interests overlap — for example, helping with both Events and Communications. Start with one team and expand from there if you'd like.",
  },
  {
    question: "What if I'm not sure which committee fits me?",
    answer:
      "Reach out through our volunteer page or attend a community event. We'll help you find a team that matches your interests — whether that's organizing gatherings, writing for the Leaflet, advocacy, or something else entirely.",
  },
  {
    question: "Are committee meetings open to the public?",
    answer:
      "Most committee work happens in small volunteer groups, but community meetings and open houses are public ways to learn what's happening and meet the people involved. Check our events page for upcoming gatherings.",
  },
  {
    question: "How do I get started?",
    answer:
      "Browse the committees above, visit our volunteer page to see current opportunities, or email hello@mapleleafcommunity.org. There's no formal application — just a conversation about what you'd like to help with.",
  },
];

export function CommitteesFaqSection() {
  return (
    <FaqSection
      label="FAQ"
      headline="Common questions about getting involved"
      faqs={committeesFaqs}
    />
  );
}

export default CommitteesFaqSection;
