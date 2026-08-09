import type { CommitteeSlug } from "schemas/committee_meetings";

/**
 * Maps internal CommitteeSlug → Slack channel display names used by
 * COMMITTEE_CHANNEL_ENV in src/lib/slack.ts.
 */
export const SLACK_COMMITTEE_NAME: Partial<Record<CommitteeSlug, string>> = {
  events: "Events",
  outreach: "Advocacy",
  hub: "Emergency Hub",
  leaflet: "Newsletter",
  communications: "Communications",
  businesses: "Business",
};

export function slackCommitteeName(committee: CommitteeSlug): string | undefined {
  return SLACK_COMMITTEE_NAME[committee];
}
