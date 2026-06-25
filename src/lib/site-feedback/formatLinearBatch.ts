import type { SiteFeedbackComment } from "./types";

function formatCommentHeading(comment: SiteFeedbackComment, index: number): string {
  if (comment.scope === "page") {
    return `Page comment (${comment.pagePath})`;
  }
  const label = comment.editableLabel ?? comment.editableId ?? "Element";
  const type = comment.editableType ?? "element";
  return `${index}. ${label} (${type})`;
}

export function formatLinearBatchDescription(
  comments: SiteFeedbackComment[],
  submittedBy?: string,
): string {
  const pages = [...new Set(comments.map((c) => c.pagePath))].sort();
  const lines: string[] = [
    "## Site feedback batch",
    "",
    "**Submitted from:** /admin/site",
  ];

  if (submittedBy) {
    lines.push(`**Submitted by:** ${submittedBy}`);
  }

  lines.push(`**Pages reviewed:** ${pages.join(", ") || "(none)"}`, "");

  for (const pagePath of pages) {
    const pageComments = comments.filter((c) => c.pagePath === pagePath);
    lines.push(`### Page: ${pagePath}`, "");

    const pageScoped = pageComments.filter((c) => c.scope === "page");
    for (const comment of pageScoped) {
      lines.push(`**Page comment:** ${comment.body}`, "");
    }

    const elementComments = pageComments.filter((c) => c.scope === "element");
    elementComments.forEach((comment, i) => {
      lines.push(`#### ${formatCommentHeading(comment, i + 1)}`);
      if (comment.editableId) lines.push(`ID: ${comment.editableId}`);
      if (comment.textSnippet) lines.push(`Snippet: ${comment.textSnippet}`);
      lines.push("", comment.body, "");
    });
  }

  return lines.join("\n").trim();
}

export function formatLinearBatchTitle(comments: SiteFeedbackComment[]): string {
  const pages = [...new Set(comments.map((c) => c.pagePath))];
  const pagePart =
    pages.length === 1
      ? pages[0] === "/"
        ? "Home"
        : pages[0]
      : `${pages.length} pages`;
  return `[Site feedback] ${pagePart} — ${comments.length} comment${comments.length === 1 ? "" : "s"}`;
}
