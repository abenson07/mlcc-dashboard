import type { CommitteeListingSlug } from "@marketing/data/committees";
import { COMMITTEE_CONTENT } from "@marketing/data/committees";

const MEETING_TIMEZONE = "America/Los_Angeles";

export type MeetingMinutesDetailBlock =
  | { kind: "heading"; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "list"; items: string[] };

export type MeetingMinutesDetailContent = {
  blocks: MeetingMinutesDetailBlock[];
};

export type MeetingMinutesEntry = {
  slug: string;
  month: string;
  committeeSlug: CommitteeListingSlug;
  dateIso: string;
  href?: string;
  detail?: MeetingMinutesDetailContent;
};

const ADVOCACY_JANUARY_DETAIL: MeetingMinutesDetailContent = {
  blocks: [
    {
      kind: "paragraph",
      text: "The Advocacy Committee met to review neighborhood priorities for the coming quarter, including traffic calming requests along Roosevelt Way and outreach to city council on the Northgate Link station area plan.",
    },
    {
      kind: "heading",
      text: "Attendance",
    },
    {
      kind: "list",
      items: [
        "12 neighbors in attendance",
        "2 city staff guests (SDOT)",
        "Quorum met for committee business",
      ],
    },
    {
      kind: "heading",
      text: "Discussion highlights",
    },
    {
      kind: "paragraph",
      text: "Members discussed the timeline for the 92nd Street crossing improvements and agreed to draft a letter of support for the project. The committee also reviewed two new resident petitions and assigned follow-up owners for each.",
    },
    {
      kind: "heading",
      text: "Action items",
    },
    {
      kind: "list",
      items: [
        "Publish summary to the MLCC website by end of month",
        "Schedule follow-up with SDOT on crossing signage",
        "Collect additional feedback at the February community meeting",
      ],
    },
  ],
};

export const meetingMinutes: MeetingMinutesEntry[] = [
  {
    slug: "january-2026-advocacy-notes",
    month: "January",
    committeeSlug: "advocacy",
    dateIso: "2026-01-14T19:00:00-08:00",
    detail: ADVOCACY_JANUARY_DETAIL,
  },
  {
    slug: "january-2026-events-notes",
    month: "January",
    committeeSlug: "events",
    dateIso: "2026-01-21T18:30:00-08:00",
  },
  {
    slug: "december-2025-communications-notes",
    month: "December",
    committeeSlug: "communications",
    dateIso: "2025-12-10T19:00:00-08:00",
  },
  {
    slug: "november-2025-business-notes",
    month: "November",
    committeeSlug: "business-committee",
    dateIso: "2025-11-12T18:00:00-08:00",
  },
  {
    slug: "november-2025-emergency-hub-notes",
    month: "November",
    committeeSlug: "emergency-hub",
    dateIso: "2025-11-05T19:30:00-08:00",
  },
  {
    slug: "october-2025-newsletter-notes",
    month: "October",
    committeeSlug: "newsletter",
    dateIso: "2025-10-08T18:30:00-07:00",
  },
];

export function getCommitteeLabel(slug: CommitteeListingSlug): string {
  return COMMITTEE_CONTENT[slug].title;
}

export function formatMeetingMinutesTitle(entry: MeetingMinutesEntry): string {
  return `${entry.month} ${getCommitteeLabel(entry.committeeSlug)} Notes`;
}

export function formatMeetingDateTime(isoDate: string): string {
  const date = new Date(isoDate).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: MEETING_TIMEZONE,
  });
  const time = new Date(isoDate).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: MEETING_TIMEZONE,
  });

  return `${date} · ${time}`;
}

export function getMeetingMinutesHref(entry: MeetingMinutesEntry): string {
  return entry.href ?? `/meeting-minutes/${entry.slug}`;
}

export function getMeetingMinutesEntry(slug: string): MeetingMinutesEntry | undefined {
  return meetingMinutes.find((entry) => entry.slug === slug);
}

export function getMeetingMinutesDetailBlocks(entry: MeetingMinutesEntry): MeetingMinutesDetailBlock[] {
  if (entry.detail) {
    return entry.detail.blocks;
  }

  return [
    {
      kind: "paragraph",
      text: `Minutes from the ${getCommitteeLabel(entry.committeeSlug)} committee meeting on ${formatMeetingDateTime(entry.dateIso)}.`,
    },
  ];
}

export function getRelatedMeetingMinutes(currentSlug: string, limit = 2): MeetingMinutesEntry[] {
  return [...meetingMinutes]
    .filter((entry) => entry.slug !== currentSlug)
    .sort((a, b) => new Date(b.dateIso).getTime() - new Date(a.dateIso).getTime())
    .slice(0, limit);
}
