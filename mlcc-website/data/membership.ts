export type MembershipMilestone = {
  percent: number;
  label: string;
  unlock: string;
};

export const MEMBERSHIP_GOAL = {
  currentPercent: 5,
  targetPercent: 10,
  targetDate: "December 2026",
  headline: "10% of Maple Leaf neighbors supporting MLCC by end of 2026",
  summary:
    "More than 4,500 people attend MLCC events each year, roughly everyone who lives here. Growing from 5% to 10% financial support lets us sustain what neighbors love and say yes to more ideas.",
};

export const membershipMilestones: MembershipMilestone[] = [
  {
    percent: 5,
    label: "Where we are today",
    unlock: "Sustain the printed Leaflet, core events, and emergency hub operations.",
  },
  {
    percent: 6,
    label: "6%: stronger outreach",
    unlock: "Fund an additional Community Meeting each year and expand hybrid streaming support.",
  },
  {
    percent: 8,
    label: "8%: deeper advocacy",
    unlock: "Grow zoning workshops and neighborhood advocacy capacity for street safety and civic issues.",
  },
  {
    percent: 10,
    label: "10%: our 2026 goal",
    unlock: "Seed new neighbor-led traditions, expand event support, and keep saying yes to ideas like yours.",
  },
];

export type MembershipStory = {
  quote: string;
  name: string;
  attribution: string;
  image?: string;
};

export const membershipStories: MembershipStory[] = [
  {
    quote:
      "The Maple Leaf Community Council doesn't exist apart from the neighborhood. It exists because of it, built by neighbors, sustained by neighbors.",
    name: "From the Leaflet",
    attribution: "Built by neighbors, sustained by neighbors",
    image:
      "/images/community-photos/photo-jun-11-2025.jpg",
  },
  {
    quote:
      "For just $3 a month, you help ensure gatherings like Silent Book Club can continue and that neighbors with new ideas have the support they need to bring them to life.",
    name: "Maple Leaf neighbor",
    attribution: "Supporting neighbor-led events",
    image:
      "/images/community-photos/img-6862.jpg",
  },
  {
    quote:
      "Most of our board members and volunteers first learned about the council through the Leaflet. It reaches the neighborhood in a way that feels personal.",
    name: "From the Leaflet",
    attribution: "Connecting Maple Leaf through the decades",
    image:
      "/images/leaflet/leaflet.webp",
  },
  {
    quote:
      "Our events reach more than 4,500 people across Maple Leaf, yet only about 5% of neighbors financially support the council. Membership closes that gap.",
    name: "MLCC",
    attribution: "Community survey & event attendance",
    image:
      "/images/community-photos/summer-social-2024-39.webp",
  },
  {
    quote:
      "Our goal is to grow membership to 10% by the end of 2026, so we can keep traditions like the Halloween Parade going and make room for what's next.",
    name: "From the Leaflet",
    attribution: "Carrying the Halloween Parade forward",
    image:
      "/images/community-photos/img-6554.jpg",
  },
  {
    quote:
      "Whether you have time to volunteer, ideas to bring forward, or the ability to support financially, each form of involvement helps Maple Leaf stay connected.",
    name: "Maple Leaf neighbor",
    attribution: "Why membership matters",
    image:
      "/images/community-photos/community-meeting-a.webp",
  },
];

export const membershipPrograms = [
  {
    title: "The Leaflet",
    image:
      "/images/leaflet/leaflet.webp",
  },
  {
    title: "Summer Social",
    image:
      "/images/community-photos/summer-social-2024-39.webp",
  },
  {
    title: "Halloween Parade",
    image:
      "/images/community-photos/img-6554.jpg",
  },
  {
    title: "Movies by the Tower",
    image:
      "/images/community-photos/movies-tower.webp",
  },
  {
    title: "Community Meetings",
    image:
      "/images/community-photos/community-meeting-a.webp",
  },
  {
    title: "Advocacy",
    image:
      "/images/community-photos/img-9152.jpg",
  },
  {
    title: "Emergency Hub",
    image: "/images/community-photos/community-meeting-d.webp",
  },
  {
    title: "Love Your Neighbor",
    image:
      "/images/community-photos/love-your-neighbor.webp",
  },
  {
    title: "Silent Book Club",
    image:
      "/images/community-photos/img-6862.jpg",
  },
  {
    title: "Volunteer Day",
    image: "/images/community-photos/summer-social-2024-39.webp",
  },
];
