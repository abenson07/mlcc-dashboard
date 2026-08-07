export type EventCategory = "Community" | "Social" | "Recreation" | "Meeting";

export type EventSummary = {
  id: string;
  title: string;
  date: string;
  location: string;
  category: EventCategory;
  description: string;
};

/** Pulled from mapleleafcommunity.org/events. */
export const sampleEvents: EventSummary[] = [
  {
    id: "evt-night-out",
    title: "Night Out",
    date: "Aug 4, 2026",
    location: "Maple Leaf",
    category: "Community",
    description: "Annual neighborhood-wide gathering to connect with neighbors and local resources.",
  },
  {
    id: "evt-silent-book-club-park",
    title: "Silent Book Club in the Park",
    date: "Aug 4, 2026",
    location: "Maple Leaf Park",
    category: "Social",
    description: "Bring a book and read quietly alongside neighbors.",
  },
  {
    id: "evt-movies-tower",
    title: "2026 Movies by the Tower",
    date: "Aug 8, 2026",
    location: "Lower Baseball Fields, Maple Leaf Reservoir Park",
    category: "Recreation",
    description: "Free outdoor movie night for the neighborhood — bring a blanket and low chairs.",
  },
  {
    id: "evt-silent-book-club-aug",
    title: "August Silent Book Club",
    date: "Aug 16, 2026",
    location: "Watershed Pub",
    category: "Social",
    description: "Monthly silent reading meetup — come solo or bring a friend.",
  },
  {
    id: "evt-silent-book-club-sep",
    title: "September Silent Book Club",
    date: "Sep 20, 2026",
    location: "Watershed Pub",
    category: "Social",
    description: "Monthly silent reading meetup — come solo or bring a friend.",
  },
  {
    id: "evt-fall-community-meeting",
    title: "Fall Community Meeting",
    date: "Oct 14, 2026",
    location: "Olympic View Elementary",
    category: "Meeting",
    description: "Quarterly community council meeting open to all residents.",
  },
  {
    id: "evt-silent-book-club-oct",
    title: "October Silent Book Club",
    date: "Oct 18, 2026",
    location: "Watershed Pub",
    category: "Social",
    description: "Monthly silent reading meetup — come solo or bring a friend.",
  },
  {
    id: "evt-halloween-parade",
    title: "Halloween Parade",
    date: "Oct 25, 2026",
    location: "Maple Leaf",
    category: "Community",
    description: "Costumed neighborhood parade for kids and families.",
  },
  {
    id: "evt-silent-book-club-nov",
    title: "November Silent Book Club",
    date: "Nov 15, 2026",
    location: "Watershed Pub",
    category: "Social",
    description: "Monthly silent reading meetup — come solo or bring a friend.",
  },
  {
    id: "evt-silent-book-club-dec",
    title: "December Silent Book Club",
    date: "Dec 20, 2026",
    location: "Watershed Pub",
    category: "Social",
    description: "Monthly silent reading meetup — come solo or bring a friend.",
  },
];

export type EventDetail = {
  id: string;
  title: string;
  category: EventCategory;
  date: string;
  time: string;
  location: string;
  description: string;
  organizer: string;
};

export const sampleEventDetail: EventDetail = {
  id: "evt-movies-tower",
  title: "2026 Movies by the Tower",
  category: "Recreation",
  date: "Aug 8, 2026",
  time: "8:30 PM – 10:30 PM",
  location: "Lower Baseball Fields, Maple Leaf Reservoir Park",
  description:
    "Free outdoor movie night for the neighborhood — bring a blanket and low chairs. Concessions run by the Events Committee, with proceeds going toward the fall park cleanup.",
  organizer: "Events Committee",
};

export type EventVolunteerRow = {
  id: string;
  name: string;
  role: string;
  email: string;
  status: "Confirmed" | "Invited" | "Declined";
};

export const sampleEventVolunteers: EventVolunteerRow[] = [
  {
    id: "vol-1",
    name: "Priya Anand",
    role: "Event Lead",
    email: "priya.anand@example.com",
    status: "Confirmed",
  },
  {
    id: "vol-2",
    name: "Marcus Ianelli",
    role: "Setup & Teardown",
    email: "marcus.ianelli@example.com",
    status: "Confirmed",
  },
  {
    id: "vol-3",
    name: "Dana Whitfield",
    role: "Concessions",
    email: "dana.whitfield@example.com",
    status: "Confirmed",
  },
  {
    id: "vol-4",
    name: "Sam Okafor",
    role: "Concessions",
    email: "sam.okafor@example.com",
    status: "Invited",
  },
  {
    id: "vol-5",
    name: "Lena Brandt",
    role: "Parking & Traffic",
    email: "lena.brandt@example.com",
    status: "Invited",
  },
  {
    id: "vol-6",
    name: "Owen Castillo",
    role: "Parking & Traffic",
    email: "owen.castillo@example.com",
    status: "Declined",
  },
];

export type EventBudgetSummary = {
  totalBudget: number;
  received: number;
  pending: number;
};

/** Derived from `sampleEventBudgetItems`: Paid → received, Pending + Overdue → pending. */
export const sampleEventBudgetSummary: EventBudgetSummary = {
  totalBudget: 2500,
  received: 1075,
  pending: 465,
};

export type EventBudgetRow = {
  id: string;
  invoiceNumber: string;
  item: string;
  vendor: string;
  amount: string;
  status: "Paid" | "Pending" | "Overdue";
  dueDate: string;
};

export const sampleEventBudgetItems: EventBudgetRow[] = [
  {
    id: "bud-1",
    invoiceNumber: "INV-2031",
    item: "Screen & projector rental",
    vendor: "Emerald City AV",
    amount: "$650.00",
    status: "Paid",
    dueDate: "Jul 15, 2026",
  },
  {
    id: "bud-2",
    invoiceNumber: "INV-2032",
    item: "Film licensing",
    vendor: "Swank Motion Pictures",
    amount: "$425.00",
    status: "Paid",
    dueDate: "Jul 20, 2026",
  },
  {
    id: "bud-3",
    invoiceNumber: "INV-2033",
    item: "Concessions supplies",
    vendor: "Costco Business Center",
    amount: "$180.00",
    status: "Pending",
    dueDate: "Aug 5, 2026",
  },
  {
    id: "bud-4",
    invoiceNumber: "INV-2034",
    item: "Park use permit",
    vendor: "Seattle Parks & Recreation",
    amount: "$75.00",
    status: "Pending",
    dueDate: "Aug 5, 2026",
  },
  {
    id: "bud-5",
    invoiceNumber: "INV-2035",
    item: "Portable restrooms",
    vendor: "Northwest Cascade",
    amount: "$210.00",
    status: "Overdue",
    dueDate: "Jul 25, 2026",
  },
];

export type EventSponsorshipInvoiceRow = {
  id: string;
  invoiceNumber: string;
  business: string;
  level: string;
  amount: string;
  dueDate: string;
  status: "Paid" | "Pending" | "Overdue";
};

/** Invoices billed to sponsoring businesses for their sponsorship level. */
export const sampleEventSponsorshipInvoices: EventSponsorshipInvoiceRow[] = [
  {
    id: "spon-inv-1",
    invoiceNumber: "INV-3001",
    business: "Third Place Books",
    level: "Presenting",
    amount: "$1,000.00",
    dueDate: "Jul 15, 2026",
    status: "Paid",
  },
  {
    id: "spon-inv-2",
    invoiceNumber: "INV-3002",
    business: "Watershed Pub",
    level: "Gold",
    amount: "$500.00",
    dueDate: "Jul 20, 2026",
    status: "Paid",
  },
  {
    id: "spon-inv-3",
    invoiceNumber: "INV-3003",
    business: "Maple Leaf Grocery",
    level: "Gold",
    amount: "$500.00",
    dueDate: "Aug 5, 2026",
    status: "Pending",
  },
  {
    id: "spon-inv-4",
    invoiceNumber: "INV-3004",
    business: "Elemental Pizza",
    level: "Community",
    amount: "$150.00",
    dueDate: "Jul 25, 2026",
    status: "Overdue",
  },
];

export type EventSponsorStatus = "Confirmed" | "Pending" | "Declined";

export type EventSponsorRow = {
  id: string;
  name: string;
  tier: string;
  status: EventSponsorStatus;
};

export const sampleEventSponsors: EventSponsorRow[] = [
  { id: "spon-1", name: "Third Place Books", tier: "Presenting", status: "Confirmed" },
  { id: "spon-2", name: "Watershed Pub", tier: "Gold", status: "Confirmed" },
  { id: "spon-3", name: "Maple Leaf Grocery", tier: "Gold", status: "Confirmed" },
  { id: "spon-4", name: "Elemental Pizza", tier: "Community", status: "Pending" },
  { id: "spon-5", name: "Byrek Bakery", tier: "Community", status: "Declined" },
];

export type EventSponsorshipLevel = {
  id: string;
  name: string;
  price: string;
  quantityAvailable: number;
  quantityFilled: number;
};

/** Filled counts reflect Confirmed + Pending rows in `sampleEventSponsors`, grouped by tier. */
export const sampleEventSponsorshipLevels: EventSponsorshipLevel[] = [
  { id: "level-presenting", name: "Presenting", price: "$1,000", quantityAvailable: 1, quantityFilled: 1 },
  { id: "level-gold", name: "Gold", price: "$500", quantityAvailable: 4, quantityFilled: 2 },
  { id: "level-community", name: "Community", price: "$150", quantityAvailable: 10, quantityFilled: 1 },
];

/** ISO date for `sampleEventDetail` — used to bucket tasks into "days out" groups. */
export const SAMPLE_EVENT_DATE_ISO = "2026-08-08";

export type EventTaskGroupLabel =
  | "Past due"
  | "6 months out"
  | "90 days out"
  | "60 days out"
  | "30 days out"
  | "2 weeks out"
  | "Week of event"
  | "Day of event";

export const EVENT_TASK_GROUP_ORDER: EventTaskGroupLabel[] = [
  "Past due",
  "6 months out",
  "90 days out",
  "60 days out",
  "30 days out",
  "2 weeks out",
  "Week of event",
  "Day of event",
];

/** Buckets a due date against the event date — same offsets as the leaflet schedule. */
export function eventTaskGroupForOffset(daysBeforeEvent: number): Exclude<EventTaskGroupLabel, "Past due"> {
  if (daysBeforeEvent <= 0) return "Day of event";
  if (daysBeforeEvent <= 7) return "Week of event";
  if (daysBeforeEvent <= 14) return "2 weeks out";
  if (daysBeforeEvent <= 30) return "30 days out";
  if (daysBeforeEvent <= 60) return "60 days out";
  if (daysBeforeEvent <= 90) return "90 days out";
  return "6 months out";
}

export function eventTaskGroupForDueDate(
  dueDateIso: string,
  eventDateIso: string = SAMPLE_EVENT_DATE_ISO,
): EventTaskGroupLabel {
  const due = new Date(`${dueDateIso}T00:00:00`);
  const event = new Date(`${eventDateIso}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (due.getTime() < today.getTime()) return "Past due";

  const daysBeforeEvent = Math.round((event.getTime() - due.getTime()) / 86_400_000);
  return eventTaskGroupForOffset(daysBeforeEvent);
}

export function formatEventTaskDueLabel(dueDateIso: string, isOverdue: boolean): string {
  const due = new Date(`${dueDateIso}T00:00:00`);
  const dueStr = due.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return isOverdue ? `Due ${dueStr} — overdue` : `Due ${dueStr}`;
}

export type EventTaskRow = {
  id: string;
  title: string;
  group: EventTaskGroupLabel;
  dueLabel: string;
  isComplete: boolean;
  isOverdue: boolean;
};

export const sampleEventTasks: EventTaskRow[] = [
  {
    id: "task-1",
    title: "Reserve park use permit",
    group: "60 days out",
    dueLabel: "Completed Jun 9",
    isComplete: true,
    isOverdue: false,
  },
  {
    id: "task-2",
    title: "Confirm film licensing",
    group: "30 days out",
    dueLabel: "Completed Jul 9",
    isComplete: true,
    isOverdue: false,
  },
  {
    id: "task-3",
    title: "Book screen & projector rental",
    group: "2 weeks out",
    dueLabel: "Completed Jul 25",
    isComplete: true,
    isOverdue: false,
  },
  {
    id: "task-4",
    title: "Confirm volunteer shifts",
    group: "Week of event",
    dueLabel: "Completed Aug 4",
    isComplete: true,
    isOverdue: false,
  },
  {
    id: "task-5",
    title: "Order concessions supplies",
    group: "Past due",
    dueLabel: "Due Aug 5 — overdue",
    isComplete: false,
    isOverdue: true,
  },
  {
    id: "task-6",
    title: "Pick up portable restrooms",
    group: "Day of event",
    dueLabel: "Due Aug 8",
    isComplete: false,
    isOverdue: false,
  },
  {
    id: "task-7",
    title: "Set up screen & seating area",
    group: "Day of event",
    dueLabel: "Due Aug 8",
    isComplete: false,
    isOverdue: false,
  },
  {
    id: "task-8",
    title: "Post day-of reminder on social",
    group: "Day of event",
    dueLabel: "Due Aug 8",
    isComplete: false,
    isOverdue: false,
  },
];

export type EventPromotionType = "email" | "social";
export type EventPromotionStatus = "Sent" | "Scheduled" | "Draft";

export type EventPromotionItem = {
  id: string;
  type: EventPromotionType;
  channel: string;
  title: string;
  description: string;
  sendDate: string;
  status: EventPromotionStatus;
};

/** Ordered chronologically — the promotion timeline leading up to the event. */
export const sampleEventPromotionItems: EventPromotionItem[] = [
  {
    id: "promo-1",
    type: "email",
    channel: "Newsletter",
    title: "Save the date — Movies by the Tower",
    description: "Blurb in the July newsletter announcing the date and location.",
    sendDate: "Jul 18, 2026",
    status: "Sent",
  },
  {
    id: "promo-2",
    type: "social",
    channel: "Instagram",
    title: "Announcement post",
    description: "Feed post with the movie title, date, and a link to RSVP.",
    sendDate: "Jul 25, 2026",
    status: "Sent",
  },
  {
    id: "promo-3",
    type: "email",
    channel: "Newsletter",
    title: "One week away reminder",
    description: "Reminder email with parking, seating, and concessions details.",
    sendDate: "Aug 1, 2026",
    status: "Scheduled",
  },
  {
    id: "promo-4",
    type: "social",
    channel: "Facebook",
    title: "Event reminder",
    description: "Boost the Facebook event page and tag local business sponsors.",
    sendDate: "Aug 4, 2026",
    status: "Scheduled",
  },
  {
    id: "promo-5",
    type: "social",
    channel: "Instagram",
    title: "Countdown story",
    description: "Story countdown sticker with a swipe-up link to the event page.",
    sendDate: "Aug 7, 2026",
    status: "Draft",
  },
  {
    id: "promo-6",
    type: "email",
    channel: "Newsletter",
    title: "Day-of reminder",
    description: "Final reminder with the day's schedule and what to bring.",
    sendDate: "Aug 8, 2026",
    status: "Draft",
  },
];
