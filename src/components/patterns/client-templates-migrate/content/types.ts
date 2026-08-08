export type ContentStatus = "Published" | "Draft";

export type Story = {
  id: string;
  title: string;
  author: string;
  status: ContentStatus;
  body: string;
};

/** `pages` holds real `faq_page_assignments.page_slug` values — see `FAQ_PAGE_OPTIONS` in schemas/faqs.ts for slug→label. */
export type Faq = {
  id: string;
  question: string;
  answer: string;
  pages: string[];
};
