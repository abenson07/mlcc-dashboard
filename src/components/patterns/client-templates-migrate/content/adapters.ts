import type { FaqWithPages } from "hooks";
import type { Stories, StoryStatus } from "@/types/database";
import type { ContentStatus, Faq, Story } from "./types";

export function toStory(row: Stories, authorNameById: Map<string, string>): Story {
  return {
    id: row.id,
    title: row.title,
    author: (row.author_id && authorNameById.get(row.author_id)) || "—",
    status: row.status === "published" ? "Published" : "Draft",
    body: row.body,
  };
}

export function contentStatusToStoryStatus(status: ContentStatus): StoryStatus {
  return status === "Published" ? "published" : "draft";
}

export function toFaq(row: FaqWithPages): Faq {
  return {
    id: row.id,
    question: row.question,
    answer: row.answer,
    pages: row.pages,
  };
}
