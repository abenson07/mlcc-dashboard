export type SurplusVoteItem = {
  id: string;
  title: string;
  description: string;
  /** Optional estimated cost in whole dollars. Omitted when we don't have a figure. */
  priceDollars?: number;
};

export function formatSurplusPrice(dollars: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(dollars);
}

export const SURPLUS_VOTE_ITEMS: SurplusVoteItem[] = [
  {
    id: "cork-park-board",
    title: "Park notice board",
    description:
      "Cork the board, repair the lock, and install lights so flyers stay readable. Adding a finished back side is nice-to-have.",
    priceDollars: 350,
  },
  {
    id: "native-plant-restoration",
    title: "Native plant restoration",
    description:
      "A donation to Friends of Maple Leaf Park so they can do more native planting in Reservoir Park — swapping invasives for plants that hold soil and feed pollinators.",
  },
  {
    id: "emergency-hub",
    title: "Emergency Hub supplies",
    description:
      "Restock the Maple Leaf Hub box at the park playground so neighbors can gather, share information, and help each other after a disaster. Need is real — Jimmie to pull the inventory list.",
    priceDollars: 2000,
  },
  {
    id: "family-works-seattle",
    title: "FamilyWorks Seattle",
    description:
      "North Seattle school supplies through FamilyWorks’ Family Resource Center on NE 67th — backpacks and basics for local students.",
  },
  {
    id: "akin",
    title: "Akin (Children’s Home Society)",
    description:
      "A donation to Akin, the family-support nonprofit (formerly Children’s Home Society of Washington) with an office in Maple Leaf.",
  },
  {
    id: "mojito-foundation",
    title: "Mojito Community Foundation",
    description:
      "Partner with the Maple Leaf restaurant’s foundation to fund chef-made meals for North Seattle neighbors, food banks, and community events.",
  },
  {
    id: "electric-generator",
    title: "Generator batteries",
    description: "Two more batteries for the community electric generator.",
    priceDollars: 1000,
  },
  {
    id: "branded-crossing-flags",
    title: "Branded crossing flags",
    description:
      "Maple Leaf–branded flags at street crossings so drivers notice people in the crosswalk.",
  },
  {
    id: "tiny-home-village",
    title: "Tiny home village on LC Way",
    description:
      "Support residents at LIHI’s Maple Leaf Village (8531 Lake City Way NE) — 40 tiny houses with on-site staffing for neighbors exiting homelessness.",
  },
  {
    id: "bike-lane-sweeper",
    title: "Bike-lane sweeper",
    description:
      "A trailer pulled by a bike, with a powered brush, to clear glass, gravel, and leaves from neighborhood bike lanes.",
  },
  {
    id: "little-free-library",
    title: "Little Free Library",
    description:
      "Install a neighborhood Little Free Library — a small street-side box for sharing books.",
  },
  {
    id: "unpaid-lunch-fees",
    title: "Unpaid lunch fees",
    description:
      "Pay down leftover school lunch debt from before Seattle Public Schools made meals free.",
  },
];

export const SURPLUS_VOTE_ITEM_IDS = SURPLUS_VOTE_ITEMS.map((item) => item.id);

export const SURPLUS_VOTE_ITEM_COUNT = SURPLUS_VOTE_ITEMS.length;
