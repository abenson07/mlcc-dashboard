export type PeopleFilter =
  | "members"
  | "volunteers"
  | "businesses"
  | "business-members"
  | "sponsors"
  | "business-outreach";

const PEOPLE_FILTERS = new Set<string>(["members", "volunteers"]);
const BUSINESS_FILTERS = new Set<string>([
  "businesses",
  "business-members",
  "sponsors",
  "business-outreach",
]);

export function parsePeopleFilter(raw: string | null): PeopleFilter | null {
  if (!raw || (!PEOPLE_FILTERS.has(raw) && !BUSINESS_FILTERS.has(raw))) {
    return null;
  }
  return raw as PeopleFilter;
}

export function isBusinessFilter(filter: PeopleFilter | null): boolean {
  return filter !== null && BUSINESS_FILTERS.has(filter);
}

export function isPeopleSubFilter(filter: PeopleFilter | null): boolean {
  return filter !== null && PEOPLE_FILTERS.has(filter);
}

const PAGE_TITLES: Record<PeopleFilter | "all-neighbors" | "all-businesses", string> = {
  "all-neighbors": "All neighbors",
  members: "Members",
  volunteers: "Volunteers",
  "all-businesses": "All businesses",
  businesses: "All businesses",
  "business-members": "Business members",
  sponsors: "Sponsors",
  "business-outreach": "Business outreach",
};

export function pageTitle(filter: PeopleFilter | null): string {
  if (filter === null) return PAGE_TITLES["all-neighbors"];
  if (filter === "businesses") return PAGE_TITLES["all-businesses"];
  return PAGE_TITLES[filter];
}

export function peopleHookFilters(filter: PeopleFilter | null) {
  if (filter === "members") {
    return { hasMembership: true as const, membershipStatus: "active" };
  }
  if (filter === "volunteers") {
    return { role: "volunteer" };
  }
  return {};
}

export function businessHookFilters(filter: PeopleFilter | null) {
  if (filter === "business-members") {
    return { isMember: true as const };
  }
  if (filter === "sponsors") {
    return { isPastSponsor: true as const };
  }
  if (filter === "business-outreach") {
    return { isMember: false as const };
  }
  return {};
}

export function businessStatusLabel(business: {
  is_member?: boolean;
  is_past_sponsor?: boolean;
  membership?: { status?: string | null } | null;
}): string {
  if (business.is_member) {
    return business.membership?.status ?? "Member";
  }
  if (business.is_past_sponsor) return "Past sponsor";
  return "Non-member";
}

export function personStatusLabel(person: {
  membership?: { status?: string | null } | null;
}): string {
  return person.membership?.status ?? "Non-member";
}

export function formatDisplayDate(dateString: string | null | undefined): string {
  if (!dateString) return "—";
  try {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}
