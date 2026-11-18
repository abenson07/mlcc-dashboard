import type { PlanChannel, PlanTouch } from "@/lib/marketing/planSchedule";

export type SocialPlatform = "facebook" | "instagram";

export type UploadedImage = {
  url: string;
  width: number;
  height: number;
  name: string;
};

export type WhenChoice = { mode: "now" } | { mode: "at"; at: string };

export type EmailAudienceChoice = "all" | "donors" | "volunteers";

export type PersonHit = { id: string; fullName: string; email: string };

/** A plan touch plus its (editable) copy and image. */
export type TouchDraft = PlanTouch & {
  text?: string;
  subject?: string;
  html?: string;
  image?: UploadedImage | null;
  audience: EmailAudienceChoice;
};

export type OutreachFlowProps = {
  demo: boolean;
  onClose: () => void;
  onBackToPicker: () => void;
};

export type { PlanChannel, PlanTouch };

export const PLATFORM_LABEL: Record<PlanChannel, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  email: "Email",
};

export const AUDIENCE_LABEL: Record<EmailAudienceChoice, string> = {
  all: "All members",
  donors: "Donors",
  volunteers: "Volunteers",
};
