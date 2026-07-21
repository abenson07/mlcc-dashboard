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
      "/images/leaflet/leaflet.webp",
  },
  {
    slug: "events",
    description:
      "Plan neighborhood traditions like the Summer Social, Movie Nights, and the Halloween Parade.",
    image:
      "/images/community-photos/summer-social-2024-62.webp",
  },
  {
    slug: "emergency-hub",
    description:
      "Help neighbors prepare for earthquakes and stay connected when emergencies strike.",
    image:
      "/images/community-photos/community-meeting-d.webp",
  },
  {
    slug: "communications",
    description:
      "Share council news through email, social media, and outreach across the neighborhood.",
    image:
      "/images/community-photos/community-meeting-a.webp",
  },
  {
    slug: "advocacy",
    description:
      "Give Maple Leaf a voice on city policy, zoning, and decisions that shape the neighborhood.",
    image:
      "/images/community-photos/maple-leaf.jpg",
  },
  {
    slug: "business-committee",
    description:
      "Build relationships between the council and Maple Leaf’s shops, restaurants, and local businesses.",
    image:
      "/images/community-photos/love-your-neighbor.webp",
  },
];

export type CommitteeFeatureCard = {
  title: string;
  text: string;
  image: string;
};

export type CommitteeTextImageSection = {
  label: string;
  headline: string;
  body: string;
  image?: string;
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
  aboutSection?: CommitteeTextImageSection;
  eventSection?: CommitteeTextImageSection;
  getInvolvedBody?: string;
  cta?: {
    title?: string;
    subhead?: string;
    primaryButton?: { label: string; href: string };
    secondaryButton?: { label: string; href: string };
  };
};

export const COMMITTEE_CONTENT: Record<CommitteeSlug, CommitteeContent> = {
  newsletter: {
    title: "Newsletter",
    headline: "The Leaflet reaches neighbors where they live",
    body: "The Newsletter committee writes, designs, and coordinates delivery of the Leaflet, Maple Leaf’s printed neighborhood newsletter and often a neighbor’s first introduction to the community council. More than 50 volunteers help distribute it door to door each issue, keeping the neighborhood informed about events, advocacy, and local news.",
  },
  events: {
    title: "Events",
    headline: "Gatherings that bring Maple Leaf together",
    body: "The Events committee plans and hosts the traditions neighbors look forward to year after year, from the Summer Social and Halloween Parade to Movie Nights, Silent Book Club, and community meetings. Volunteers handle logistics, promotion, and the small details that make each gathering feel welcoming.",
    featureSection: {
      label: "Made possible by this committee",
      headline: "Neighborhood traditions neighbors help make happen",
      cards: [
        {
          title: "Summer Social",
          text: "Maple Leaf’s flagship summer gathering: neighbors, music, food, and the faces that make this place feel like home.",
          image:
            "/images/community-photos/summer-social-2024-62.webp",
        },
        {
          title: "Movies by the Tower",
          text: "Outdoor movie nights at the park with food vendors, trivia, and partners like Scarecrow Video under the summer sky.",
          image:
            "/images/community-photos/movies-tower.webp",
        },
        {
          title: "Community Meeting",
          text: "Twice-yearly gatherings where neighbors learn what’s happening in Maple Leaf, ask questions, and hear from one another.",
          image:
            "/images/community-photos/community-meeting-a.webp",
        },
        {
          title: "Halloween Parade",
          text: "A fall favorite: families, dogs, and neighbors walk the route, visit local businesses, and celebrate together.",
          image:
            "/images/community-photos/img-6554.jpg",
        },
        {
          title: "Love your Neighbor Happy Hour",
          text: "A relaxed adults-only happy hour for neighbors to grab a drink, meet new people, and catch up with familiar faces.",
          image:
            "/images/community-photos/love-your-neighbor.webp",
        },
        {
          title: "Silent Book Club",
          text: "Read together in comfortable silence, then mingle over books and conversation on the third Sunday of each month.",
          image:
            "/images/community-photos/img-6862.jpg",
        },
      ],
    },
  },
  "emergency-hub": {
    title: "Emergency Hub",
    headline: "The Maple Leaf Emergency Hub is seeking volunteers!",
    body: "The Emergency Hub exists to help neighbors support each other in a disaster. We focus on planning, training, and connection—not stockpiling—so that when “The Big One” (or any emergency) hits, Maple Leaf is ready to respond together.",
    aboutSection: {
      label: "What is an Emergency Hub?",
      headline: "Neighbors helping neighbors, until help arrives",
      body: "When a major earthquake or disaster hits, professional responders will likely be overwhelmed. For the first hours and days, neighbors helping neighbors becomes the difference-maker. An Emergency Hub is a volunteer-run gathering point where the neighborhood comes together to share information, pool resources, and help one another until responders arrive. Maple Leaf already has a Hub, a supply box, and a place in Seattle’s citywide Hub network. Come join us and help shape the future of the Maple Leaf Emergency Hub!",
    },
    getInvolvedBody:
      "You don’t need special skills, training, or a lot of spare time. Every neighbor who raises a hand makes the whole neighborhood more resilient. You choose how involved you want to be — from greeting neighbors and spreading the word, to managing supplies, supporting radio operations, teaching prep skills, helping to lead the team year-round, or simply joining our mailing list to stay informed.",
    eventSection: {
      label: "This summer",
      headline: "Hub Meet & Greet + Inventory Day",
      body: "Saturday, August 1, 10 am–1 pm, Maple Leaf Reservoir Park. See what’s in the Hub supply box, meet the volunteers, and learn how it all works. Family-friendly — drop by anytime.",
      image: "/images/one-seattle/reservoir-park.jpg",
    },
    cta: {
      title: "Ready to help? Sign up in about a minute",
      subhead: "Questions? Email mapleleafhubs@gmail.com",
      primaryButton: { label: "Sign up to volunteer", href: "https://forms.gle/PcxKvxNARtQmVsyS7" },
      secondaryButton: { label: "Email us", href: "mailto:mapleleafhubs@gmail.com" },
    },
  },
  communications: {
    title: "Communications",
    headline: "Keeping the neighborhood in the loop",
    body: "The Communications committee shares what the council is working on through email, social media, and outreach. From promoting events to highlighting volunteer opportunities, this team makes sure neighbors can find clear, timely information about what’s happening in Maple Leaf.",
  },
  advocacy: {
    title: "Advocacy",
    headline: "A voice for Maple Leaf",
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
