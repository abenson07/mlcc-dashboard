import { COMMITTEE_LABELS, type CommitteeSlug } from "schemas/committee_meetings";

export type CommitteeCard = {
  id: string;
  name: string;
  chair: string;
  memberCount: number;
  cadence: string;
  description: string;
};

const REAL_COMMITTEES: CommitteeSlug[] = [
  "events",
  "outreach",
  "hub",
  "leaflet",
  "communications",
  "steering",
  "executive_board",
  "businesses",
];

const DESCRIPTIONS: Partial<Record<CommitteeSlug, string>> = {
  events: "Plans the Summer Social, holiday gathering, and other community-wide events.",
  outreach: "Builds relationships with neighboring households and welcomes new residents.",
  hub: "Coordinates emergency preparedness and neighborhood hub operations.",
  leaflet: "Produces and distributes the Maple Leaf Leaflet newsletter.",
  communications: "Owns FAQ content, stories, and social media presence.",
  steering: "Guides council priorities and cross-committee coordination.",
  executive_board: "Executive board meetings for council governance.",
  businesses: "Partners with neighborhood businesses and sponsorships.",
};

/** Live committee cards keyed by real CommitteeSlug (admin-migrate). */
export const sampleCommittees: CommitteeCard[] = REAL_COMMITTEES.map((id) => ({
  id,
  name: `${COMMITTEE_LABELS[id]} Committee`,
  chair: "—",
  memberCount: 0,
  cadence: "Monthly",
  description: DESCRIPTIONS[id] ?? `${COMMITTEE_LABELS[id]} committee.`,
}));

export type CommitteeDetail = CommitteeCard & {
  meetingDay: string;
  location: string;
  founded: string;
};

export type CommitteeMemberRow = {
  id: string;
  name: string;
  role: "Chair" | "Vice Chair" | "Member";
  email: string;
};

export type CommitteeMeetingRow = {
  id: string;
  date: string;
  topic: string;
  status: "Upcoming" | "Completed";
};

export const sampleCommitteeDetail: CommitteeDetail = {
  ...sampleCommittees[0],
  meetingDay: "First Tuesday, 7:00 PM",
  location: "Community Center, Room 2",
  founded: "2018",
};

export const sampleCommitteeMembers: CommitteeMemberRow[] = [
  { id: "member-1", name: "Priya Anand", role: "Chair", email: "priya.anand@example.com" },
  { id: "member-2", name: "Marcus Ianelli", role: "Vice Chair", email: "marcus.ianelli@example.com" },
  { id: "member-3", name: "Dana Whitfield", role: "Member", email: "dana.whitfield@example.com" },
  { id: "member-4", name: "Ines Okafor", role: "Member", email: "ines.okafor@example.com" },
  { id: "member-5", name: "Tom Reyes", role: "Member", email: "tom.reyes@example.com" },
];

export const sampleCommitteeMeetings: CommitteeMeetingRow[] = [];
