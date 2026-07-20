export const DONATION_GOAL = {
  raised: 18400,
  target: 50000,
  label: "2026 Community Fund",
  headline: "Help us reach our 2026 community fund goal",
  summary:
    "One-time gifts go directly toward programs neighbors rely on: the Leaflet, events, advocacy, and emergency preparedness. Every contribution moves the bar forward.",
};

export type DonationAmount = {
  value: number;
  label: string;
  description: string;
};

export const donationAmounts: DonationAmount[] = [
  { value: 25, label: "$25", description: "Support one Leaflet delivery route" },
  { value: 50, label: "$50", description: "Help host a community meeting" },
  { value: 100, label: "$100", description: "Fund neighborhood event supplies" },
  { value: 250, label: "$250", description: "Sponsor a tradition like Movie Night" },
];

export const donationImpacts = [
  {
    label: "Leaflet printing & delivery",
    detail: "Keeps Seattle's last printed neighborhood newsletter on every doorstep.",
    amount: "$25+",
  },
  {
    label: "Community meetings",
    detail: "Hybrid streaming, speakers, and space for neighbors to learn and be heard.",
    amount: "$50+",
  },
  {
    label: "Neighborhood events",
    detail: "Summer Social, Halloween Parade, Movies by the Tower, and neighbor-led gatherings.",
    amount: "$100+",
  },
  {
    label: "Advocacy & outreach",
    detail: "Zoning workshops, street safety conversations, and civic engagement in Maple Leaf.",
    amount: "$150+",
  },
  {
    label: "Emergency preparedness",
    detail: "Hub supplies, training, and resources neighbors count on before they need them.",
    amount: "$200+",
  },
];

export type DonateStory = {
  quote: string;
  name: string;
  attribution: string;
  image?: string;
};

export const donateStories: DonateStory[] = [
  {
    quote:
      "Sometimes it’s quieter still, becoming a member or making a donation so the work can continue even when volunteer capacity ebbs and flows.",
    name: "From the Leaflet",
    attribution: "Built by neighbors, sustained by neighbors",
    image:
      "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/6877bff9b59839fa1fd6792c_Photo-Jun-11-2025.jpg",
  },
  {
    quote:
      "If you are able to give over and above your annual membership, we appreciate that deeply, and so will your neighbors.",
    name: "MLCC Board",
    attribution: "Supporting the neighborhood",
    image:
      "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/695313c6b976b35d6d_community-meeting.webp",
  },
  {
    quote:
      "Events like the Halloween Parade only continue because neighbors value them enough to support the work behind the scenes.",
    name: "From the Leaflet",
    attribution: "Carrying the Halloween Parade forward",
    image:
      "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/695b2c3441277b54461fac94_IMG_6554.jpg",
  },
  {
    quote:
      "We know you appreciate the shared community the MLCC helps engender, and now is the time we need your help to ensure that work can continue.",
    name: "Maple Leaf neighbor",
    attribution: "Why giving matters",
    image:
      "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/69530f1e1da163ec47328051_summer_social_2024-39.webp",
  },
  {
    quote:
      "Whether you have time to volunteer or the ability to give financially, each form of involvement helps ensure traditions are preserved and new ideas take root.",
    name: "From the Leaflet",
    attribution: "Built by neighbors, sustained by neighbors",
    image:
      "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/695312357b037d99bca1b7e9_leaflet.webp",
  },
];
