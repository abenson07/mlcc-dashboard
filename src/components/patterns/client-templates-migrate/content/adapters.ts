import type { FaqWithPages } from "hooks";
import type { Stories, StoryStatus } from "@/types/database";
import type { ContentStatus, Faq, Story } from "./types";

function formatDate(isoDate: string | null): string | null {
  if (!isoDate) return null;
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function toStory(row: Stories, authorNameById: Map<string, string>): Story {
  return {
    id: row.id,
    title: row.title,
    author: (row.author_id && authorNameById.get(row.author_id)) || "—",
    authorId: row.author_id,
    status: row.status === "published" ? "Published" : "Draft",
    publishedAt: formatDate(row.publish_date),
    body: row.body,
  };
}

export function contentStatusToStoryStatus(status: ContentStatus): StoryStatus {
  return status === "Published" ? "published" : "draft";
}

/** Today's date as `YYYY-MM-DD`, for stamping `publish_date` when a story is marked Published. */
export function todayISODate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function toFaq(row: FaqWithPages): Faq {
  return {
    id: row.id,
    question: row.question,
    answer: row.answer,
    pages: row.pages,
  };
}
