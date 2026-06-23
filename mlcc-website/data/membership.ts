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
    "More than 4,500 people attend MLCC events each year — roughly everyone who lives here. Growing from 5% to 10% financial support lets us sustain what neighbors love and say yes to more ideas.",
};

export const membershipMilestones: MembershipMilestone[] = [
  {
    percent: 5,
    label: "Where we are today",
    unlock: "Sustain the printed Leaflet, core events, and emergency hub operations.",
  },
  {
    percent: 6,
    label: "6% — stronger outreach",
    unlock: "Fund an additional Community Meeting each year and expand hybrid streaming support.",
  },
  {
    percent: 8,
    label: "8% — deeper advocacy",
    unlock: "Grow zoning workshops and neighborhood advocacy capacity for street safety and civic issues.",
  },
  {
    percent: 10,
    label: "10% — our 2026 goal",
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
      "The Maple Leaf Community Council doesn't exist apart from the neighborhood. It exists because of it — built by neighbors, sustained by neighbors.",
    name: "From the Leaflet",
    attribution: "Built by neighbors, sustained by neighbors",
    image:
      "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/6877bff9b59839fa1fd6792c_Photo-Jun-11-2025.jpg",
  },
  {
    quote:
      "For just $3 a month, you help ensure gatherings like Silent Book Club can continue and that neighbors with new ideas have the support they need to bring them to life.",
    name: "Maple Leaf neighbor",
    attribution: "Supporting neighbor-led events",
    image:
      "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/695b30685a1f306acdc73283_IMG_6862.jpg",
  },
  {
    quote:
      "Most of our board members and volunteers first learned about the council through the Leaflet. It reaches the neighborhood in a way that feels personal.",
    name: "From the Leaflet",
    attribution: "Connecting Maple Leaf through the decades",
    image:
      "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/695312357b037d99bca1b7e9_leaflet.webp",
  },
  {
    quote:
      "Our events reach more than 4,500 people across Maple Leaf, yet only about 5% of neighbors financially support the council. Membership closes that gap.",
    name: "MLCC",
    attribution: "Community survey & event attendance",
    image:
      "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/69530f1e1da163ec47328051_summer_social_2024-39.webp",
  },
  {
    quote:
      "Our goal is to grow membership to 10% by the end of 2026 — so we can keep traditions like the Halloween Parade going and make room for what's next.",
    name: "From the Leaflet",
    attribution: "Carrying the Halloween Parade forward",
    image:
      "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/695b2c3441277b54461fac94_IMG_6554.jpg",
  },
  {
    quote:
      "Whether you have time to volunteer, ideas to bring forward, or the ability to support financially — each form of involvement helps Maple Leaf stay connected.",
    name: "Maple Leaf neighbor",
    attribution: "Why membership matters",
    image:
      "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/695313c6b976b35d6d_community-meeting.webp",
  },
];

export const membershipPrograms = [
  {
    title: "The Leaflet",
    image:
      "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/695312357b037d99bca1b7e9_leaflet.webp",
  },
  {
    title: "Summer Social",
    image:
      "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/69530f1e1da163ec47328051_summer_social_2024-39.webp",
  },
  {
    title: "Halloween Parade",
    image:
      "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/695b2c3441277b54461fac94_IMG_6554.jpg",
  },
  {
    title: "Movies by the Tower",
    image:
      "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/695b2928eb2f48f58fa2aef8_movies-tower.webp",
  },
  {
    title: "Community Meetings",
    image:
      "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/695313c6b976b35d6d_community-meeting.webp",
  },
  {
    title: "Advocacy",
    image:
      "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/68c82d9a55f62655acb2e46c_IMG_9152.jpg",
  },
  {
    title: "Emergency Hub",
    image: "https://byqsupply-components.netlify.app/sparkles/images/ServicesImage4.jpg",
  },
  {
    title: "Love Your Neighbor",
    image:
      "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/695b2ef4da00327d5e0c5403_love-your-neighbor.webp",
  },
  {
    title: "Silent Book Club",
    image:
      "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/695b30685a1f306acdc73283_IMG_6862.jpg",
  },
  {
    title: "Volunteer Day",
    image: "https://byqsupply-components.netlify.app/sparkles/images/ServicesImage1.jpg",
  },
];
