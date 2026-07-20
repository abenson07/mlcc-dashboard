export type VolunteerFilter =
  | "single-day-events"
  | "planning"
  | "communication"
  | "online";

export type VolunteerDetailBlock =
  | { kind: "heading"; text: string; size?: "h5" | "h6" }
  | { kind: "paragraph"; text: string }
  | { kind: "list"; items: string[] };

export type VolunteerDetailContent = {
  backLabel: string;
  blocks: VolunteerDetailBlock[];
};

export type VolunteerOpportunity = {
  slug: string;
  title: string;
  description: string;
  volunteersNeeded: number;
  timeCommitment: string;
  filters: VolunteerFilter[];
  image: string;
  detail?: VolunteerDetailContent;
};

export const VOLUNTEER_FILTERS: { id: VolunteerFilter; label: string }[] = [
  { id: "single-day-events", label: "Single-day events" },
  { id: "planning", label: "Planning" },
  { id: "communication", label: "Communication" },
  { id: "online", label: "Online" },
];

export const volunteerOpportunities: VolunteerOpportunity[] = [
  {
    slug: "board-secretary",
    title: "Board Secretary",
    description:
      "Join the Maple Leaf Community Council as Board Secretary; help lead meetings and keep our community organized!",
    volunteersNeeded: 1,
    timeCommitment: "2 hours per month",
    filters: ["communication", "online"],
    image:
      "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/695313c6b976b35d22bb2d6d_community-meeting.webp",
    detail: {
      backLabel: "All volunteer opportunities",
      blocks: [
        {
          kind: "heading",
          text: "What you'd be doing",
          size: "h5",
        },
        {
          kind: "list",
          items: [
            "Taking and maintaining official minutes for Board and Steering Committee meetings",
            "Coordinating meeting schedules and follow-up communications",
            "Keeping membership records accurate and up to date",
            "Helping the council stay organized, accountable, and transparent",
          ],
        },
        {
          kind: "heading",
          text: "We're looking for a neighbor who likes keeping things clear, written down, and on track, not someone who needs to be the loudest voice in the room.",
          size: "h6",
        },
        {
          kind: "heading",
          text: "Who this is for",
          size: "h5",
        },
        {
          kind: "paragraph",
          text: "Maybe you're the person friends ask to send the recap email after a gathering. Maybe you like agendas, shared notes, and knowing what was decided and what happens next. Maybe you want to serve Maple Leaf in a steady, behind-the-scenes way that actually keeps the council running.",
        },
        {
          kind: "paragraph",
          text: "The Secretary sits on the Steering Committee and works closely with board members, committee leads, and volunteers across the neighborhood. It's a leadership role, but the heart of it is reliability: making sure meetings have a record, neighbors can follow what's happening, and the organization's memory doesn't depend on whoever happened to be in the room.",
        },
        {
          kind: "heading",
          text: "What it takes",
          size: "h5",
        },
        {
          kind: "list",
          items: [
            "Clear, careful writing: minutes don't need to be fancy, but they do need to be accurate",
            "Comfort coordinating schedules and gentle follow-ups by email",
            "A bias toward organization without needing everything to be perfect on day one",
            "Interest in how a neighborhood council works, and willingness to learn as you go",
            "About two hours a month, with a bit more around meeting weeks",
          ],
        },
        {
          kind: "paragraph",
          text: "You don't need nonprofit experience or a professional admin background. If you're organized, thoughtful, and ready to help Maple Leaf stay connected to the neighbors it serves, we'd love to hear from you.",
        },
      ],
    },
  },
  {
    slug: "help-organize-silent-book-club",
    title: "Help organize Silent Book Club",
    description: "Help neighbors gather for a quiet hour of reading together at Watershed.",
    volunteersNeeded: 3,
    timeCommitment: "2 hours per month",
    filters: ["planning"],
    image: "/images/events/silent-book-club-featured.png",
  },
  {
    slug: "email-coordinator",
    title: "Email Coordinator",
    description:
      "Volunteer to keep neighbors connected by responding to messages and shaping the voice of our community.",
    volunteersNeeded: 2,
    timeCommitment: "2 hours per month",
    filters: ["communication", "online"],
    image:
      "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/6877bff9b59839fa1fd6792c_Photo-Jun-11-2025.jpg",
  },
];

export function getVolunteerOpportunity(slug: string): VolunteerOpportunity | undefined {
  return volunteerOpportunities.find((opportunity) => opportunity.slug === slug);
}

export function getRelatedVolunteerOpportunities(
  currentSlug?: string,
  limit = 3,
): VolunteerOpportunity[] {
  return volunteerOpportunities.filter((opportunity) => opportunity.slug !== currentSlug).slice(0, limit);
}

export function getVolunteerFilterLabel(filter: VolunteerFilter): string {
  return VOLUNTEER_FILTERS.find((item) => item.id === filter)?.label ?? filter;
}

export function formatVolunteersNeeded(count: number): string {
  return count === 1 ? "1 person needed" : `${count} people needed`;
}

export function formatOpportunityMeta(opportunity: VolunteerOpportunity): string {
  return `${formatVolunteersNeeded(opportunity.volunteersNeeded)} · ${opportunity.timeCommitment}`;
}

export function filterVolunteerOpportunities(
  opportunities: VolunteerOpportunity[],
  activeFilter: VolunteerFilter | null,
): VolunteerOpportunity[] {
  if (!activeFilter) {
    return opportunities;
  }

  return opportunities.filter((opportunity) => opportunity.filters.includes(activeFilter));
}
