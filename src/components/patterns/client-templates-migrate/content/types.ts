export type ContentStatus = "Published" | "Draft";

export type Story = {
  id: string;
  title: string;
  author: string;
  authorId: string | null;
  status: ContentStatus;
  /** Formatted for display (e.g. "Aug 8, 2026"); null when unset. */
  publishedAt: string | null;
  body: string;
  /** Demo-only fields — real `Stories` rows have no image/description column yet. */
  imageUrl?: string;
  description?: string;
};

/** `pages` holds real `faq_page_assignments.page_slug` values — see `FAQ_PAGE_OPTIONS` in schemas/faqs.ts for slug→label. */
export type Faq = {
  id: string;
  question: string;
  answer: string;
  pages: string[];
};
