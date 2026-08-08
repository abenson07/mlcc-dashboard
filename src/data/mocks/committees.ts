export type CommitteeCard = {
  id: string;
  name: string;
  chair: string;
  memberCount: number;
  cadence: string;
  description: string;
};

export const sampleCommittees: CommitteeCard[] = [
  {
    id: "events",
    name: "Events Committee",
    chair: "Priya Anand",
    memberCount: 8,
    cadence: "Monthly",
    description: "Plans the Summer Social, holiday gathering, and other community-wide events.",
  },
  {
    id: "finance",
    name: "Finance Committee",
    chair: "Dana Whitfield",
    memberCount: 5,
    cadence: "Monthly",
    description: "Reviews the budget, membership dues, and business sponsorship agreements.",
  },
  {
    id: "volunteer",
    name: "Volunteer Committee",
    chair: "Marcus Ianelli",
    memberCount: 6,
    cadence: "Bi-weekly",
    description: "Recruits and coordinates volunteers across leaflet distribution and events.",
  },
  {
    id: "communications",
    name: "Communications Committee",
    chair: "Priya Anand",
    memberCount: 4,
    cadence: "Monthly",
    description: "Owns the newsletter, FAQ content, and social media presence.",
  },
  {
    id: "outreach",
    name: "Neighbor Outreach Committee",
    chair: "Ines Okafor",
    memberCount: 7,
    cadence: "Quarterly",
    description: "Builds relationships with neighboring households and welcomes new residents.",
  },
];

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

export const sampleCommitteeMeetings: CommitteeMeetingRow[] = [
  { id: "meeting-1", date: "Aug 12, 2026", topic: "Summer Social planning", status: "Upcoming" },
  { id: "meeting-2", date: "Jul 8, 2026", topic: "Vendor selection review", status: "Completed" },
  { id: "meeting-3", date: "Jun 10, 2026", topic: "Budget check-in", status: "Completed" },
  { id: "meeting-4", date: "May 13, 2026", topic: "Volunteer sign-up kickoff", status: "Completed" },
];
