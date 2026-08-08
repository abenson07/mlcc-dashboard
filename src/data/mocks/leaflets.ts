export type LeafletStatus = "planned" | "active" | "closed";

export type LeafletSummary = {
  id: string;
  title: string;
  distributionDate: string;
  status: LeafletStatus;
};

/** Mirrors the shape of `sampleEvents` — pulled from the leaflet schedule. */
export const sampleLeaflets: LeafletSummary[] = [
  { id: "lf-jun-2026", title: "June 2026 Leaflet", distributionDate: "2026-06-05", status: "closed" },
  { id: "lf-jul-2026", title: "July 2026 Leaflet", distributionDate: "2026-07-03", status: "closed" },
  { id: "lf-aug-2026", title: "August 2026 Leaflet", distributionDate: "2026-08-07", status: "active" },
  { id: "5ef07578-cc30-42c6-b44a-812005a9e245", title: "September 2026 Leaflet", distributionDate: "2026-09-04", status: "planned" },
  { id: "lf-oct-2026", title: "October 2026 Leaflet", distributionDate: "2026-10-02", status: "planned" },
  { id: "lf-nov-2026", title: "November 2026 Leaflet", distributionDate: "2026-11-06", status: "planned" },
];

export type LeafletDetail = {
  id: string;
  title: string;
  distributionDate: string;
  status: LeafletStatus;
  countdownLabel: string;
};

export const sampleLeafletDetail: LeafletDetail = {
  id: "lf-aug-2026",
  title: "August 2026 Leaflet",
  distributionDate: "2026-08-07",
  status: "active",
  countdownLabel: "Distributing today",
};

export type LeafletTaskGroupLabel =
  | "Past due"
  | "60 days out"
  | "30 days out"
  | "2 weeks out"
  | "Week of distribution"
  | "Day of distribution";

export const LEAFLET_TASK_GROUP_ORDER: LeafletTaskGroupLabel[] = [
  "Past due",
  "60 days out",
  "30 days out",
  "2 weeks out",
  "Week of distribution",
  "Day of distribution",
];

export const SAMPLE_LEAFLET_DATE_ISO = "2026-08-07";

export function leafletTaskGroupForOffset(
  daysBeforeDistribution: number,
): Exclude<LeafletTaskGroupLabel, "Past due"> {
  if (daysBeforeDistribution <= 0) return "Day of distribution";
  if (daysBeforeDistribution <= 7) return "Week of distribution";
  if (daysBeforeDistribution <= 14) return "2 weeks out";
  if (daysBeforeDistribution <= 30) return "30 days out";
  return "60 days out";
}

export function leafletTaskGroupForDueDate(
  dueDateIso: string,
  distributionDateIso: string = SAMPLE_LEAFLET_DATE_ISO,
): LeafletTaskGroupLabel {
  const due = new Date(`${dueDateIso}T00:00:00`);
  const distribution = new Date(`${distributionDateIso}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (due.getTime() < today.getTime()) return "Past due";

  const daysBeforeDistribution = Math.round(
    (distribution.getTime() - due.getTime()) / 86_400_000,
  );
  return leafletTaskGroupForOffset(daysBeforeDistribution);
}

export function formatLeafletTaskDueLabel(dueDateIso: string, isOverdue: boolean): string {
  const due = new Date(`${dueDateIso}T00:00:00`);
  const dueStr = due.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return isOverdue ? `Due ${dueStr} — overdue` : `Due ${dueStr}`;
}

export type LeafletTaskRow = {
  id: string;
  title: string;
  group: LeafletTaskGroupLabel;
  dueLabel: string;
  isComplete: boolean;
  isOverdue: boolean;
};

export const sampleLeafletTasks: LeafletTaskRow[] = [
  {
    id: "lf-task-1",
    title: "Finalize article lineup",
    group: "30 days out",
    dueLabel: "Completed Jul 8",
    isComplete: true,
    isOverdue: false,
  },
  {
    id: "lf-task-2",
    title: "Send print files to printer",
    group: "2 weeks out",
    dueLabel: "Completed Jul 24",
    isComplete: true,
    isOverdue: false,
  },
  {
    id: "lf-task-3",
    title: "Confirm sponsor ad placements",
    group: "2 weeks out",
    dueLabel: "Completed Jul 25",
    isComplete: true,
    isOverdue: false,
  },
  {
    id: "lf-task-4",
    title: "Assign remaining open routes",
    group: "Past due",
    dueLabel: "Due Aug 3 — overdue",
    isComplete: false,
    isOverdue: true,
  },
  {
    id: "lf-task-5",
    title: "Pick up leaflets from printer",
    group: "Week of distribution",
    dueLabel: "Due Aug 6",
    isComplete: false,
    isOverdue: false,
  },
  {
    id: "lf-task-6",
    title: "Text deliverers distribution reminder",
    group: "Day of distribution",
    dueLabel: "Due Aug 7",
    isComplete: false,
    isOverdue: false,
  },
];

export type LeafletRouteStatus = "unassigned" | "in-progress" | "skipped";

export type LeafletRouteRow = {
  id: string;
  name: string;
  initials: string;
  detail: string;
  status: LeafletRouteStatus;
};

/** Modeled on `openRoutePreviews` from the live leaflet overview. */
export const sampleOpenRoutes: LeafletRouteRow[] = [
  { id: "route-12", name: "Route 12 — Maple Leaf Reservoir", initials: "R12", detail: "48 addresses", status: "unassigned" },
  { id: "route-19", name: "Route 19 — Corliss Ave", initials: "R19", detail: "36 addresses", status: "unassigned" },
  { id: "route-24", name: "Route 24 — Meridian Park", initials: "R24", detail: "52 addresses", status: "in-progress" },
  { id: "route-31", name: "Route 31 — 92nd St", initials: "R31", detail: "40 addresses", status: "unassigned" },
];

/** Routes a deliverer dropped that need a substitute. */
export const sampleSkippedRoutes: LeafletRouteRow[] = [
  { id: "route-7", name: "Route 7 — Roosevelt Way", initials: "R7", detail: "Skipped by Dana W.", status: "skipped" },
  { id: "route-15", name: "Route 15 — 1st Ave NE", initials: "R15", detail: "Skipped by Owen C.", status: "skipped" },
];

export type LeafletDelivererRow = {
  id: string;
  name: string;
  routeCount: number;
  status: "Confirmed" | "Invited" | "Declined";
};

export const sampleDeliverers: LeafletDelivererRow[] = [
  { id: "del-1", name: "Priya Anand", routeCount: 2, status: "Confirmed" },
  { id: "del-2", name: "Marcus Ianelli", routeCount: 1, status: "Confirmed" },
  { id: "del-3", name: "Dana Whitfield", routeCount: 1, status: "Declined" },
  { id: "del-4", name: "Sam Okafor", routeCount: 3, status: "Confirmed" },
  { id: "del-5", name: "Lena Brandt", routeCount: 1, status: "Invited" },
];

export type LeafletBudgetSummary = {
  totalBudget: number;
  received: number;
  pending: number;
};

/** Derived from `sampleLeafletSponsorshipInvoices`: Paid → received, Pending + Overdue → pending. */
export const sampleLeafletBudgetSummary: LeafletBudgetSummary = {
  totalBudget: 3200,
  received: 1650,
  pending: 700,
};

export type LeafletSponsorshipInvoiceRow = {
  id: string;
  invoiceNumber: string;
  business: string;
  level: string;
  amount: string;
  dueDate: string;
  status: "Paid" | "Pending" | "Overdue";
};

export const sampleLeafletSponsorshipInvoices: LeafletSponsorshipInvoiceRow[] = [
  { id: "lf-inv-1", invoiceNumber: "INV-4001", business: "Third Place Books", level: "Full Page", amount: "$650.00", dueDate: "Jul 15, 2026", status: "Paid" },
  { id: "lf-inv-2", invoiceNumber: "INV-4002", business: "Watershed Pub", level: "Half Page", amount: "$400.00", dueDate: "Jul 18, 2026", status: "Paid" },
  { id: "lf-inv-3", invoiceNumber: "INV-4003", business: "Maple Leaf Grocery", level: "Half Page", amount: "$400.00", dueDate: "Jul 20, 2026", status: "Paid" },
  { id: "lf-inv-4", invoiceNumber: "INV-4004", business: "Elemental Pizza", level: "Quarter Page", amount: "$200.00", dueDate: "Aug 5, 2026", status: "Pending" },
  { id: "lf-inv-5", invoiceNumber: "INV-4005", business: "Byrek Bakery", level: "Quarter Page", amount: "$200.00", dueDate: "Aug 5, 2026", status: "Pending" },
  { id: "lf-inv-6", invoiceNumber: "INV-4006", business: "Corliss Coffee", level: "Business Card", amount: "$100.00", dueDate: "Jul 25, 2026", status: "Overdue" },
];

export type LeafletSponsorRow = {
  id: string;
  name: string;
  tier: string;
  status: "Confirmed" | "Pending" | "Declined";
};

export const sampleLeafletSponsors: LeafletSponsorRow[] = [
  { id: "lf-spon-1", name: "Third Place Books", tier: "Full Page", status: "Confirmed" },
  { id: "lf-spon-2", name: "Watershed Pub", tier: "Half Page", status: "Confirmed" },
  { id: "lf-spon-3", name: "Maple Leaf Grocery", tier: "Half Page", status: "Confirmed" },
  { id: "lf-spon-4", name: "Elemental Pizza", tier: "Quarter Page", status: "Pending" },
  { id: "lf-spon-5", name: "Corliss Coffee", tier: "Business Card", status: "Declined" },
];

export type LeafletSponsorshipLevel = {
  id: string;
  name: string;
  price: string;
  quantityAvailable: number;
  quantityFilled: number;
};

export const sampleLeafletSponsorshipLevels: LeafletSponsorshipLevel[] = [
  { id: "lf-level-full", name: "Full Page", price: "$650", quantityAvailable: 2, quantityFilled: 1 },
  { id: "lf-level-half", name: "Half Page", price: "$400", quantityAvailable: 4, quantityFilled: 2 },
  { id: "lf-level-quarter", name: "Quarter Page", price: "$200", quantityAvailable: 6, quantityFilled: 2 },
  { id: "lf-level-card", name: "Business Card", price: "$100", quantityAvailable: 10, quantityFilled: 1 },
];

export type LeafletStoryStatus = "Draft" | "In review" | "Scheduled" | "Published";

export type LeafletStoryRow = {
  id: string;
  title: string;
  author: string;
  type: string;
  date: string;
  time: string;
  status: LeafletStoryStatus;
};

/** Modeled on the `stories` list in the live leaflet overview (`lf-story-row`). */
export const sampleLeafletStories: LeafletStoryRow[] = [
  { id: "story-1", title: "Meet the new Community Council reps", author: "Priya Anand", type: "Feature", date: "Aug 1", time: "9:00 AM", status: "Published" },
  { id: "story-2", title: "Maple Leaf Reservoir Park cleanup recap", author: "Marcus Ianelli", type: "Update", date: "Aug 3", time: "11:30 AM", status: "In review" },
  { id: "story-3", title: "Local business spotlight: Corliss Coffee", author: "Dana Whitfield", type: "Spotlight", date: "Aug 5", time: "2:00 PM", status: "Draft" },
  { id: "story-4", title: "September events preview", author: "Sam Okafor", type: "Events", date: "Aug 6", time: "4:15 PM", status: "Scheduled" },
];

export type LeafletQrCode = {
  id: string;
  label: string;
  subtitle?: string;
  url: string;
};

/** Modeled on `QrCodesWidget` — Membership + Leaflet Routes QR codes. */
export const sampleLeafletQrCodes: LeafletQrCode[] = [
  {
    id: "qr-membership",
    label: "Membership QR Code",
    subtitle: "Place in leaflet",
    url: "https://mapleleafcommunity.org/join",
  },
  {
    id: "qr-open-routes",
    label: "Leaflet Routes QR Code",
    url: "https://mapleleafcommunity.org/open-routes",
  },
];

export type LeafletListView = "members" | "events";

export type LeafletListEventItem = {
  id: string;
  title: string;
  date: string;
};

/** Modeled on `ListsForLeafletWidget` — Business List + Upcoming Events segments. */
export const sampleLeafletBusinessList: string[] = [
  "Third Place Books",
  "Watershed Pub",
  "Maple Leaf Grocery",
  "Elemental Pizza",
  "Byrek Bakery",
  "Corliss Coffee",
  "Maple Leaf Grill",
  "Zoka Coffee",
  "Alfa Pizzeria",
];

export const sampleLeafletUpcomingEvents: LeafletListEventItem[] = [
  { id: "evt-night-out", title: "Night Out", date: "2026-08-04" },
  { id: "evt-movies-tower", title: "2026 Movies by the Tower", date: "2026-08-08" },
  { id: "evt-silent-book-club-aug", title: "August Silent Book Club", date: "2026-08-16" },
  { id: "evt-fall-community-meeting", title: "Fall Community Meeting", date: "2026-10-14" },
];
