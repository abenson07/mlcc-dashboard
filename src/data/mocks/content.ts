export type ContentStatus = "Published" | "Draft";

export type Story = {
  id: string;
  title: string;
  author: string;
  status: ContentStatus;
  body: string;
};

export type Faq = {
  id: string;
  question: string;
  answer: string;
  pages: string[];
};

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
    status: "Published",
    body: "<p>Over 200 neighbors joined us for this year's Summer Social...</p>",
  },
  {
    id: "story-2",
    title: "Meet the new Volunteer Committee chair",
    author: "Marcus Ianelli",
    status: "Published",
    body: "<p>We're excited to welcome Marcus Ianelli as the new chair...</p>",
  },
  {
    id: "story-3",
    title: "Fall leaflet drive: what to expect",
    author: "Dana Whitfield",
    status: "Draft",
    body: "<p>Volunteers will begin distributing leaflets the first week of October...</p>",
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
