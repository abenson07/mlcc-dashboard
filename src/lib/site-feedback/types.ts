export const EDITABLE_TYPES = ["text", "button", "image", "section"] as const;

export type EditableType = (typeof EDITABLE_TYPES)[number];

export type SiteFeedbackScope = "element" | "page";

export type EditableAnchor = {
  editableId?: string;
  editableType?: EditableType;
  editableLabel?: string;
  textSnippet?: string;
};

export type SiteFeedbackComment = {
  id: string;
  pagePath: string;
  scope: SiteFeedbackScope;
  editableId?: string;
  editableType?: EditableType;
  editableLabel?: string;
  textSnippet?: string;
  body: string;
  createdAt: string;
};

export type SiteFeedbackBatchMeta = {
  linearIssueId?: string;
  linearUrl?: string;
  linearIdentifier?: string;
  submittedAt?: string;
};

export type SiteFeedbackSubmitPayload = {
  comments: SiteFeedbackComment[];
};

export type SiteFeedbackSubmitResponse = {
  success: boolean;
  issueId: string;
  url: string;
  identifier: string;
};
