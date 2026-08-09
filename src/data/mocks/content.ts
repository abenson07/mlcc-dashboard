export type ContentStatus = "Published" | "Draft";

export type Story = {
  id: string;
  title: string;
  author: string;
  topic: string;
  status: ContentStatus;
  publishedAt: string;
  body: string;
};

export type Faq = {
  id: string;
  question: string;
  answer: string;
  pages: string[];
};

export const CURRENT_USER_NAME = "Kyle Brower";

export const availableTopics: string[] = [
  "Community",
  "Events",
  "Volunteering",
  "Announcements",
];

export const availablePages: string[] = [
  "Homepage",
  "About",
  "Events",
  "Committees",
  "Membership",
  "Contact",
];

export const sampleStories: Story[] = [
  {
    id: "story-1",
    title: "Summer Social recap: a record turnout",
    author: "Priya Anand",
    topic: "Events",
    status: "Published",
    publishedAt: "Aug 3, 2026",
    body: "<p>Over 200 neighbors joined us for this year's Summer Social, making it the best-attended event the neighborhood has hosted in years.</p>",
  },
  {
    id: "story-2",
    title: "Meet the new Volunteer Committee chair",
    author: "Marcus Ianelli",
    topic: "Volunteering",
    status: "Published",
    publishedAt: "Jul 22, 2026",
    body: "<p>We're excited to welcome Marcus Ianelli as the new chair of the Volunteer Committee.</p>",
  },
  {
    id: "story-3",
    title: "Fall leaflet drive: what to expect",
    author: "Dana Whitfield",
    topic: "Announcements",
    status: "Draft",
    publishedAt: "Aug 8, 2026",
    body: "<p>Volunteers will begin distributing leaflets the first week of October, covering every block in the neighborhood.</p>",
  },
];

export const sampleFaqs: Faq[] = [
  {
    id: "faq-1",
    question: "How do I renew my membership?",
    answer: "Renewals open every January and can be completed online from your account page.",
    pages: ["Membership", "Homepage"],
  },
  {
    id: "faq-2",
    question: "Who do I contact about a committee?",
    answer: "Each committee page lists its chair's contact information under the Committees section.",
    pages: ["Committees", "Contact"],
  },
  {
    id: "faq-3",
    question: "Where can I find upcoming events?",
    answer: "All upcoming events are listed on the Events page, with sign-up links where applicable.",
    pages: ["Events", "Homepage"],
  },
];
