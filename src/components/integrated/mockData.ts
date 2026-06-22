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

export const MOCK_EVENTS: EventItem[] = [
  {
    id: "summer-block-party",
    title: "Summer Block Party 2026",
    date: "2026-08-31",
    day: 31,
    month: "AUG",
    monthLabel: "August 2026",
    status: "Upcoming",
    location: "Maple Leaf Park · Community festival",
    daysUntil: 27,
    distributionLabel: "Sunday, Aug 31, 2026",
    kind: "council",
  },
  {
    id: "neighborhood-cleanup",
    title: "Neighborhood Cleanup Day",
    date: "2026-09-15",
    day: 15,
    month: "SEP",
    monthLabel: "September 2026",
    status: "Published",
    location: "Community Center · Volunteer event",
    daysUntil: 42,
    distributionLabel: "Tuesday, Sep 15, 2026",
    kind: "council",
  },
  {
    id: "fall-festival",
    title: "Fall Festival 2026",
    date: "2026-10-18",
    day: 18,
    month: "OCT",
    monthLabel: "October 2026",
    status: "Planning",
    location: "Main Street · Festival",
    daysUntil: 75,
    distributionLabel: "Saturday, Oct 18, 2026",
    kind: "council",
  },
  {
    id: "winter-gala",
    title: "Winter Gala 2026",
    date: "2026-12-05",
    day: 5,
    month: "DEC",
    monthLabel: "December 2026",
    status: "Draft",
    location: "Community Center · Fundraiser",
    daysUntil: 123,
    distributionLabel: "Saturday, Dec 5, 2026",
    kind: "council",
  },
  {
    id: "harvest-festival",
    title: "Harvest Festival",
    date: "2026-10-22",
    day: 22,
    month: "OCT",
    monthLabel: "October 2026",
    status: "Published",
    location: "Oak Street Plaza · Food and music",
    daysUntil: 79,
    distributionLabel: "Thursday, Oct 22, 2026",
    kind: "external",
  },
  {
    id: "holiday-market",
    title: "Holiday Market",
    date: "2026-11-08",
    day: 8,
    month: "NOV",
    monthLabel: "November 2026",
    status: "Draft",
    location: "Maple Leaf Park · Local vendors",
    daysUntil: 96,
    distributionLabel: "Sunday, Nov 8, 2026",
    kind: "external",
  },
  {
    id: "maple-leaf-farmers-market",
    title: "Maple Leaf Farmers Market",
    date: "2026-06-14",
    day: 14,
    month: "JUN",
    monthLabel: "June 2026",
    status: "Published",
    location: "Community Center · Weekly market",
    daysUntil: -8,
    distributionLabel: "Sunday, Jun 14, 2026",
    kind: "external",
  },
  {
    id: "oak-street-art-fair",
    title: "Oak Street Art Fair",
    date: "2026-07-19",
    day: 19,
    month: "JUL",
    monthLabel: "July 2026",
    status: "Published",
    location: "Oak Street · Local artists",
    daysUntil: 15,
    distributionLabel: "Sunday, Jul 19, 2026",
    kind: "external",
  },
  {
    id: "spring-cleanup",
    title: "Spring Neighborhood Cleanup",
    date: "2026-04-12",
    day: 12,
    month: "APR",
    monthLabel: "April 2026",
    status: "Completed",
    location: "Various routes · Volunteer",
    daysUntil: -71,
    distributionLabel: "Sunday, Apr 12, 2026",
    kind: "council",
  },
];

export const MOCK_VOLUNTEER_HUBS: VolunteerHub[] = [
  { id: "setup", name: "Setup crew", registered: 4, minHours: 2, target: 8 },
  { id: "registration", name: "Registration", registered: 2, minHours: 1, target: 5 },
  { id: "food", name: "Food & drinks", registered: 3, minHours: 3, target: 6 },
];

export const MOCK_VOLUNTEERS: Volunteer[] = [
  { id: "v1", name: "Sarah Chen", hub: "Setup crew", email: "sarah.chen@email.com", hours: 4, status: "Confirmed" },
  { id: "v2", name: "Marcus Johnson", hub: "Registration", email: "marcus.johns@email.com", hours: 2, status: "Confirmed" },
  { id: "v3", name: "Elena Rodriguez", hub: "Food & drinks", email: "elena.ruiz@email.com", hours: 3, status: "Pending" },
  { id: "v4", name: "James Park", hub: "Cleanup", email: "james.park@email.com", hours: 2, status: "Confirmed" },
];

export const MOCK_EVENT_SPONSORS: Sponsor[] = [
  { id: "s1", business: "Main Street Bakery", contact: "email@mainstreet.com", level: "Gold", amount: 2500, status: "Paid" },
  { id: "s2", business: "Downtown Hardware", contact: "info@downtown.com", level: "Silver", amount: 1000, status: "Paid" },
  { id: "s3", business: "Green Valley Cafe", contact: "hello@greenvalley.com", level: "Platinum", amount: 5000, status: "Pledged" },
  { id: "s4", business: "Riverfront Printing", contact: "sales@riverfront.com", level: "Bronze", amount: 500, status: "Pending" },
];

export const MOCK_EVENT_INVOICES: Invoice[] = [
  { id: "i1", number: "INV-1042", sponsor: "Main Street Bakery", amount: 2500, dueDate: "Jan 15, 2026", status: "Paid" },
  { id: "i2", number: "INV-1043", sponsor: "Downtown Hardware", amount: 1000, dueDate: "Jan 20, 2026", status: "Sent" },
  { id: "i3", number: "INV-1044", sponsor: "Green Valley Cafe", amount: 5000, dueDate: "May 25, 2025", status: "Overdue" },
  { id: "i4", number: "INV-1045", sponsor: "Riverfront Printing", amount: 500, dueDate: "Jan 10, 2026", status: "Draft" },
];

export const MOCK_EVENT_SCHEDULE: ScheduleGroup[] = [
  {
    label: "Overdue",
    overdue: true,
    tasks: [
      { id: "t1", title: "Confirm entertainment", dueLabel: "Due 4 days ago", isComplete: false, isOverdue: true },
      { id: "t2", title: "Book transportation", dueLabel: "Due 3 days ago", isComplete: true },
    ],
  },
  {
    label: "45 days out",
    tasks: [
      { id: "t3", title: "Book entertainment", dueLabel: "Due Oct 1", isComplete: false },
      { id: "t4", title: "Book catering and venue", dueLabel: "Due Oct 1", isComplete: false },
    ],
  },
  {
    label: "30 days out",
    tasks: [
      { id: "t5", title: "Register with local council", dueLabel: "Due Oct 16", isComplete: false },
      { id: "t6", title: "Send invitations to guest list", dueLabel: "Due Oct 16", isComplete: false },
    ],
  },
  {
    label: "Week of event",
    tasks: [
      { id: "t7", title: "Confirm details with venue", dueLabel: "Due Nov 8", isComplete: false },
      { id: "t8", title: "Finalize guest list with caterers", dueLabel: "Due Nov 8", isComplete: false },
    ],
  },
];

export const MOCK_COMPLETED_SCHEDULE: ScheduleGroup[] = [
  {
    label: "30 days out",
    tasks: [
      { id: "c1", title: "Create guest list", dueLabel: "Completed Oct 16", isComplete: true },
      { id: "c2", title: "Draft event budget", dueLabel: "Completed Oct 16", isComplete: true },
    ],
  },
];

export const MOCK_SITE_COMMENTS: SiteComment[] = [
  { id: "c1", author: "Alex", body: "Can we update the hero image on the homepage? The current one feels a bit dated.", date: "Jun 10" },
  { id: "c2", author: "Ben", body: "Footer links need to point to the new membership page.", date: "Jun 10" },
  { id: "c3", author: "Fraser", body: "Love the new layout — just needs mobile padding tweaks on the events section.", date: "Jun 8" },
  { id: "c4", author: "Victoria", body: "Should we add a CTA for volunteer signups above the fold?", date: "Jun 8" },
  { id: "c5", author: "Sarah", body: "Resolved: updated the contact form copy per last meeting.", date: "Jun 5" },
];

export const EVENT_BUDGET = {
  goal: 15000,
  raised: 11400,
  pledged: 3700,
  progressPct: 76,
};

export const EVENT_SPONSORSHIP_TIERS = [
  { name: "Platinum", amount: 5000, remaining: "1 left" },
  { name: "Gold", amount: 2500, remaining: "3 left" },
  { name: "Silver", amount: 1000, remaining: "4 left" },
  { name: "Bronze", amount: 500, remaining: "Sold out" },
];

export function getEventById(id: string) {
  return MOCK_EVENTS.find((e) => e.id === id) ?? MOCK_EVENTS[0];
}

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

export const MOCK_EVENT_TASKS_PREVIEW = [
  { id: "et1", title: "Book entertainment", due: "Jun 28", complete: true },
  { id: "et2", title: "Open sponsor applications", due: "Aug 1", complete: false },
  { id: "et3", title: "Confirm food vendors", due: "Aug 15", complete: false },
];

export const MOCK_EVENT_VOLUNTEERS_PREVIEW = [
  { id: "ev1", name: "Erica Chao", role: "Safety Lead", status: "green" as const },
  { id: "ev2", name: "Marcus Aurelio", role: "Registration", status: "green" as const },
  { id: "ev3", name: "Steve Blair", role: "Food & Beverage", status: "amber" as const },
  { id: "ev4", name: "James Pratt", role: "Security", status: "green" as const },
];

export const MOCK_MARKETING_ITEMS = [
  { date: "Jun 20", title: "Sponsor thank you email", channel: "Email", color: "#dbeafe" },
  { date: "Jun 21", title: "Instagram save-the-date", channel: "Instagram", color: "#fce7f3" },
  { date: "Jul 1", title: "Volunteer recruitment post", channel: "Email", color: "#dbeafe" },
  { date: "Jul 15", title: "Facebook event reminder", channel: "Facebook", color: "#dbeafe" },
];
