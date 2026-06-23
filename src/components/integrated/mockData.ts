export type PersonStatus = "Active" | "Pending" | "Inactive";

export type Business = {
  id: string;
  name: string;
  address: string;
  email: string;
  phone: string;
  category: string;
  status: string;
};

export type Person = {
  id: string;
  name: string;
  address: string;
  email: string;
  phone: string;
  status: PersonStatus;
  dotColor: string;
  role: string;
  memberSince: string;
  birthday: string;
  membershipType: string;
  renewed: string;
  donations: { amount: string; label: string; date: string }[];
};

export type EventItem = {
  id: string;
  title: string;
  date: string;
  day: number;
  month: string;
  monthLabel: string;
  status: string;
  location: string;
  daysUntil: number;
  distributionLabel: string;
  kind: "council" | "external";
};

export type VolunteerHub = {
  id: string;
  name: string;
  registered: number;
  minHours: number;
  target: number;
};

export type Volunteer = {
  id: string;
  name: string;
  hub: string;
  email: string;
  hours: number;
  status: "Confirmed" | "Pending" | "Declined";
};

export type Sponsor = {
  id: string;
  business: string;
  contact: string;
  level: string;
  amount: number;
  status: "Paid" | "Pledged" | "Pending";
};

export type Invoice = {
  id: string;
  number: string;
  sponsor: string;
  amount: number;
  dueDate: string;
  status: "Paid" | "Sent" | "Overdue" | "Draft";
};

export type ScheduleTask = {
  id: string;
  title: string;
  dueLabel: string;
  isComplete: boolean;
  isOverdue?: boolean;
};

export type ScheduleGroup = {
  label: string;
  overdue?: boolean;
  tasks: ScheduleTask[];
};

export type SiteComment = {
  id: string;
  author: string;
  body: string;
  date: string;
};

export const MOCK_PEOPLE: Person[] = [
  {
    id: "1",
    name: "Sarah Chen",
    address: "123 Oak St",
    email: "sarah.c@email.com",
    phone: "(555) 123-4567",
    status: "Active",
    dotColor: "#ef4444",
    role: "Neighbor",
    memberSince: "Mar 2023",
    birthday: "Mar 12, 1990",
    membershipType: "Household",
    renewed: "Mar 10, 2025",
    donations: [{ amount: "$25.00", label: "Spring Fundraiser", date: "Apr 2024" }],
  },
  {
    id: "2",
    name: "Marcus Johnson",
    address: "456 Elm Ave",
    email: "marcus.j@email.com",
    phone: "(555) 987-6543",
    status: "Active",
    dotColor: "#8b5cf6",
    role: "Neighbor",
    memberSince: "Jan 2024",
    birthday: "Jan 15, 1987",
    membershipType: "Household",
    renewed: "Jan 10, 2025",
    donations: [
      { amount: "$50.00", label: "Summer Fund", date: "Sep 2024" },
      { amount: "$25.00", label: "Neighborhood Clean-up", date: "Jun 2024" },
    ],
  },
  {
    id: "3",
    name: "Elena Rodriguez",
    address: "789 Maple Dr",
    email: "elena.r@email.com",
    phone: "(555) 234-5678",
    status: "Pending",
    dotColor: "#3b82f6",
    role: "Neighbor",
    memberSince: "Feb 2024",
    birthday: "Aug 3, 1992",
    membershipType: "Individual",
    renewed: "—",
    donations: [],
  },
  {
    id: "4",
    name: "Arthur P. Dill",
    address: "101 Pine Ln",
    email: "arthur.d@email.com",
    phone: "(555) 876-5432",
    status: "Active",
    dotColor: "#22c55e",
    role: "Member",
    memberSince: "Nov 2022",
    birthday: "Dec 1, 1978",
    membershipType: "Household",
    renewed: "Nov 1, 2024",
    donations: [{ amount: "$100.00", label: "Annual Fund", date: "Dec 2024" }],
  },
  {
    id: "5",
    name: "Priya Sharma",
    address: "202 Cedar Pkwy",
    email: "priya.s@email.com",
    phone: "(555) 345-6789",
    status: "Active",
    dotColor: "#eab308",
    role: "Volunteer",
    memberSince: "May 2023",
    birthday: "Jul 22, 1985",
    membershipType: "Household",
    renewed: "May 5, 2025",
    donations: [],
  },
  {
    id: "6",
    name: "David Kim",
    address: "303 Birch Ct",
    email: "david.d@email.com",
    phone: "(555) 765-4321",
    status: "Pending",
    dotColor: "#f97316",
    role: "Neighbor",
    memberSince: "Jan 2025",
    birthday: "Apr 9, 1995",
    membershipType: "Individual",
    renewed: "—",
    donations: [],
  },
  {
    id: "7",
    name: "Lisa Thompson",
    address: "404 Willow Rd",
    email: "lisa.t@email.com",
    phone: "(555) 456-7890",
    status: "Active",
    dotColor: "#06b6d4",
    role: "Donor",
    memberSince: "Sep 2021",
    birthday: "Oct 30, 1980",
    membershipType: "Household",
    renewed: "Sep 15, 2024",
    donations: [{ amount: "$200.00", label: "Block Party Sponsor", date: "Aug 2024" }],
  },
  {
    id: "8",
    name: "Michael Wilson",
    address: "505 Spruce St",
    email: "michael.w@email.com",
    phone: "(555) 654-3210",
    status: "Inactive",
    dotColor: "#a1a1aa",
    role: "Former member",
    memberSince: "Jun 2020",
    birthday: "Feb 14, 1975",
    membershipType: "Household",
    renewed: "Expired",
    donations: [],
  },
];

export const MOCK_BUSINESSES: Business[] = [
  {
    id: "b1",
    name: "Main Street Bakery",
    address: "120 Main St",
    email: "hello@mainstreetbakery.com",
    phone: "(555) 201-4400",
    category: "Food & drink",
    status: "Active",
  },
  {
    id: "b2",
    name: "Downtown Hardware",
    address: "88 Oak Ave",
    email: "info@downtownhardware.com",
    phone: "(555) 201-4401",
    category: "Retail",
    status: "Active",
  },
  {
    id: "b3",
    name: "Green Valley Cafe",
    address: "15 Park Ln",
    email: "contact@greenvalleycafe.com",
    phone: "(555) 201-4402",
    category: "Food & drink",
    status: "Member",
  },
  {
    id: "b4",
    name: "Riverfront Printing",
    address: "402 River Rd",
    email: "sales@riverfrontprinting.com",
    phone: "(555) 201-4403",
    category: "Services",
    status: "Sponsor",
  },
  {
    id: "b5",
    name: "Maple Leaf Books",
    address: "77 Cedar St",
    email: "shop@mapleleafbooks.com",
    phone: "(555) 201-4404",
    category: "Retail",
    status: "Active",
  },
  {
    id: "b6",
    name: "Northside Fitness",
    address: "210 Birch Ct",
    email: "frontdesk@northsidefitness.com",
    phone: "(555) 201-4405",
    category: "Health",
    status: "Outreach",
  },
];

export const MOCK_SITE_COMMENTS: SiteComment[] = [
  { id: "c1", author: "Alex", body: "Can we update the hero image on the homepage? The current one feels a bit dated.", date: "Jun 10" },
  { id: "c2", author: "Ben", body: "Footer links need to point to the new membership page.", date: "Jun 10" },
  { id: "c3", author: "Fraser", body: "Love the new layout — just needs mobile padding tweaks on the events section.", date: "Jun 8" },
  { id: "c4", author: "Victoria", body: "Should we add a CTA for volunteer signups above the fold?", date: "Jun 8" },
  { id: "c5", author: "Sarah", body: "Resolved: updated the contact form copy per last meeting.", date: "Jun 5" },
];

export function getPersonById(id: string) {
  return MOCK_PEOPLE.find((p) => p.id === id) ?? MOCK_PEOPLE[0];
}

export type StoryItem = {
  id: string;
  title: string;
  date: string;
  group: string;
  body: string;
};

export const MOCK_STORIES: StoryItem[] = [
  {
    id: "1",
    title: "Meet the Chang Family",
    date: "January 14, 2024",
    group: "Last few days",
    body: "When the Chang family moved to Maple Leaf in 2018, they brought more than furniture and moving boxes — they brought a vision for what a neighborhood could feel like when people actually know each other.\n\nWithin their first month, they started hosting monthly potlucks in their front yard. What began as a handful of neighbors sharing a meal has grown into one of the most anticipated gatherings on the block.\n\n\"We didn't move here to be with strangers,\" Ben says. \"We moved here to build something together.\"\n\nToday, the Changs also coordinate the neighborhood garden, mentor new families, and keep the community bulletin board packed with local events.",
  },
  {
    id: "2",
    title: "Our Community Garden",
    date: "January 12, 2024",
    group: "Last few days",
    body: "The Maple Leaf community garden has become a gathering place for neighbors of all ages.",
  },
  {
    id: "3",
    title: "Summer Block Party Recap",
    date: "September 8, 2023",
    group: "Last week",
    body: "Hundreds of neighbors came together for music, food, and games at the park.",
  },
  {
    id: "4",
    title: "Welcome to Maple Leaf",
    date: "May 3, 2023",
    group: "May 2023",
    body: "An introduction to the neighborhood and what makes Maple Leaf special.",
  },
];
