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
