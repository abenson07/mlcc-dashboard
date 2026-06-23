export type CommitteeSlug =
  | "newsletter"
  | "events"
  | "emergency-hub"
  | "communications"
  | "advocacy"
  | "business-committee"
  | "template";

export type CommitteeListingSlug = Exclude<CommitteeSlug, "template">;

export type CommitteeListing = {
  slug: CommitteeListingSlug;
  description: string;
  image: string;
};

export const COMMITTEE_LISTINGS: CommitteeListing[] = [
  {
    slug: "newsletter",
    description:
      "Write, design, and coordinate door-to-door delivery of the Leaflet across Maple Leaf.",
    image:
      "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/695312357b037d99bca1b7e9_leaflet.webp",
  },
  {
    slug: "events",
    description:
      "Plan neighborhood traditions like the Summer Social, Movie Nights, and the Halloween Parade.",
    image:
      "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/69530e8b1aadf47968a6eb09_summer_social_2024-62%20(1).webp",
  },
  {
    slug: "emergency-hub",
    description:
      "Help neighbors prepare for earthquakes and stay connected when emergencies strike.",
    image:
      "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/69531455684e18c663a2a6b7_community-meeting3.webp",
  },
  {
    slug: "communications",
    description:
      "Share council news through email, social media, and outreach across the neighborhood.",
    image:
      "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/695313c6b976b35d22bb2d6d_community-meeting.webp",
  },
  {
    slug: "advocacy",
    description:
      "Give Maple Leaf a voice on city policy, zoning, and decisions that shape the neighborhood.",
    image:
      "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/6913dbb252ed363168221ae6_Maple_Leaf.jpg",
  },
  {
    slug: "business-committee",
    description:
      "Build relationships between the council and Maple Leaf’s shops, restaurants, and local businesses.",
    image:
      "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/695b2ef4da00327d5e0c5403_love-your-neighbor.webp",
  },
];

export type CommitteeFeatureCard = {
  title: string;
  text: string;
  image: string;
};

export type CommitteeContent = {
  title: string;
  headline: string;
  body: string;
  featureSection?: {
    label: string;
    headline: string;
    cards: CommitteeFeatureCard[];
  };
};

export const COMMITTEE_CONTENT: Record<CommitteeSlug, CommitteeContent> = {
  newsletter: {
    title: "Newsletter",
    headline: "The Leaflet reaches neighbors where they live",
    body: "The Newsletter committee writes, designs, and coordinates delivery of the Leaflet — Maple Leaf’s printed neighborhood newsletter and often a neighbor’s first introduction to the community council. More than 50 volunteers help distribute it door to door each issue, keeping the neighborhood informed about events, advocacy, and local news.",
  },
  events: {
    title: "Events",
    headline: "Gatherings that bring Maple Leaf together",
    body: "The Events committee plans and hosts the traditions neighbors look forward to year after year — from the Summer Social and Halloween Parade to Movie Nights, Silent Book Club, and community meetings. Volunteers handle logistics, promotion, and the small details that make each gathering feel welcoming.",
    featureSection: {
      label: "What we host",
      headline: "Neighborhood traditions neighbors help make happen",
      cards: [
        {
          title: "Summer Social",
          text: "Maple Leaf’s flagship summer gathering — neighbors, music, food, and the faces that make this place feel like home.",
          image:
            "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/69530e8b1aadf47968a6eb09_summer_social_2024-62%20(1).webp",
        },
        {
          title: "Movies by the Tower",
          text: "Outdoor movie nights at the park with food vendors, trivia, and partners like Scarecrow Video under the summer sky.",
          image:
            "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/695b2928eb2f48f58fa2aef8_movies-tower.webp",
        },
        {
          title: "Community Meeting",
          text: "Twice-yearly gatherings where neighbors learn what’s happening in Maple Leaf, ask questions, and hear from one another.",
          image:
            "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/695313c6b976b35d22bb2d6d_community-meeting.webp",
        },
        {
          title: "Halloween Parade",
          text: "A fall favorite — families, dogs, and neighbors walk the route, visit local businesses, and celebrate together.",
          image:
            "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/695b2c3441277b54461fac94_IMG_6554.jpg",
        },
        {
          title: "Love your Neighbor Happy Hour",
          text: "A relaxed adults-only happy hour for neighbors to grab a drink, meet new people, and catch up with familiar faces.",
          image:
            "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/695b2ef4da00327d5e0c5403_love-your-neighbor.webp",
        },
        {
          title: "Silent Book Club",
          text: "Read together in comfortable silence, then mingle over books and conversation on the third Sunday of each month.",
          image:
            "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/695b30685a1f306acdc73283_IMG_6862.jpg",
        },
      ],
    },
  },
  "emergency-hub": {
    title: "Emergency Hub",
    headline: "Prepared neighbors, stronger together",
    body: "The Emergency Hub committee helps Maple Leaf get ready for earthquakes and other emergencies. Volunteers organize hub sites, share preparedness resources, and build the neighbor-to-neighbor connections that matter most when normal systems are disrupted.",
  },
  communications: {
    title: "Communications",
    headline: "Keeping the neighborhood in the loop",
    body: "The Communications committee shares what the council is working on through email, social media, and outreach. From promoting events to highlighting volunteer opportunities, this team makes sure neighbors can find clear, timely information about what’s happening in Maple Leaf.",
  },
  advocacy: {
    title: "Advocacy",
    headline: "A voice for Maple Leaf at the city level",
    body: "The Advocacy committee creates spaces where neighbors can learn about policy changes, talk through what they mean for Maple Leaf, and decide what to do next. Recent work has included zoning workshops connected to the One Seattle Plan and encouraging meaningful community involvement as the city grows.",
  },
  "business-committee": {
    title: "Business",
    headline: "Strengthening ties with local businesses",
    body: "The Business committee builds relationships between the community council and Maple Leaf’s shops, restaurants, and service providers. Volunteers help connect neighborhood events with local venues, support small businesses, and keep the commercial heart of the community thriving.",
  },
  template: {
    title: "Committee Template",
    headline: "A volunteer team working for Maple Leaf",
    body: "MLCC committees are made up of neighbors who give their time to keep traditions going, share information, and represent the neighborhood. Each committee has its own focus, but they all share the same goal: making Maple Leaf a place where people know each other and feel they belong.",
  },
};
