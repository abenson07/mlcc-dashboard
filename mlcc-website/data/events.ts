export type EventDetailBlock =
  | { kind: "heading"; text: string; size?: "h5" | "h6" }
  | { kind: "paragraph"; text: string }
  | { kind: "list"; items: string[] };

export type EventDetailContent = {
  blocks: EventDetailBlock[];
};

export type Event = {
  slug: string;
  title: string;
  dateIso: string;
  date: string;
  shortDescription: string;
  locationName: string;
  category: string;
  image: string;
  href: string;
  external?: boolean;
  detail?: EventDetailContent;
};

export type EventsByMonth = {
  monthKey: string;
  monthLabel: string;
  events: Event[];
};

const EVENT_IMAGES = {
  silentBookClub: "/images/events/silent-book-club-featured.png",
  summerSocial: "/images/events/summer-social.png",
  yardSale: "/images/events/maple-leaf-free-yard-sale.png",
  springMeeting: "/images/events/spring-community-meeting.png",
} as const;

const EVENT_TIMEZONE = "America/Los_Angeles";

function formatEventDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: EVENT_TIMEZONE,
  });
}

export function formatEventTime(isoDate: string): string {
  return new Date(isoDate).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: EVENT_TIMEZONE,
  });
}

export function getEventMapEmbedUrl(event: Event): string {
  const query = encodeURIComponent(`${event.locationName}, Seattle, WA`);
  return `https://maps.google.com/maps?q=${query}&z=15&output=embed`;
}

export function getEventDetailBlocks(event: Event): EventDetailBlock[] {
  if (event.detail) {
    return event.detail.blocks;
  }

  return [{ kind: "paragraph", text: event.shortDescription }];
}

const SILENT_BOOK_CLUB_DETAIL: EventDetailContent = {
  blocks: [
    {
      kind: "paragraph",
      text: "Silent Book Club is one of Maple Leaf’s easiest ways to meet neighbors. There’s no assigned reading, no discussion requirements, and no pressure to participate beyond showing up with a book and finding a place to sit.",
    },
    {
      kind: "heading",
      text: "What to expect",
      size: "h5",
    },
    {
      kind: "list",
      items: [
        "Arrive with whatever you’re reading — any genre, any format",
        "Read together in comfortable silence for about an hour",
        "Mingle before and after over drinks or snacks",
        "Meet on the third Sunday of each month",
      ],
    },
    {
      kind: "paragraph",
      text: "The Maple Leaf group meets at Watershed Pub & Kitchen through much of the year. It’s part of a broader network of Silent Book Clubs across Seattle, now firmly rooted here in the neighborhood.",
    },
  ],
};

const SUMMER_SOCIAL_DETAIL: EventDetailContent = {
  blocks: [
    {
      kind: "paragraph",
      text: "The Summer Social has been part of Maple Leaf since the 1990s. Organized by the Maple Leaf Community Council, it’s one of the most consistent ways we bring neighbors together — and in our recent community survey, it ranked as the most loved event we host.",
    },
    {
      kind: "heading",
      text: "What to expect",
      size: "h5",
    },
    {
      kind: "list",
      items: [
        "Food, music, and room to wander the park with neighbors",
        "Activities for kids and spaces to simply catch up",
        "Nonprofits and local partners welcome to participate",
        "A relaxed afternoon in Maple Leaf Park — all are welcome",
      ],
    },
    {
      kind: "paragraph",
      text: "Volunteers make the Summer Social happen each year. Whether you help with setup, outreach, or day-of logistics, it’s a great way to plug into the Events committee and meet people across the neighborhood.",
    },
  ],
};

function event(data: Omit<Event, "date">): Event {
  return { ...data, date: formatEventDate(data.dateIso) };
}

function getMonthKey(isoDate: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: EVENT_TIMEZONE,
    year: "numeric",
    month: "numeric",
  }).formatToParts(new Date(isoDate));

  const year = parts.find((part) => part.type === "year")?.value ?? "0";
  const month = parts.find((part) => part.type === "month")?.value ?? "0";
  return `${year}-${month.padStart(2, "0")}`;
}

export function groupEventsByMonth(eventList: Event[]): EventsByMonth[] {
  const sorted = [...eventList].sort(
    (a, b) => new Date(a.dateIso).getTime() - new Date(b.dateIso).getTime(),
  );

  const groups = new Map<string, Event[]>();
  for (const item of sorted) {
    const monthKey = getMonthKey(item.dateIso);
    const existing = groups.get(monthKey);
    if (existing) {
      existing.push(item);
    } else {
      groups.set(monthKey, [item]);
    }
  }

  return Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([monthKey, monthEvents]) => ({
      monthKey,
      monthLabel: new Date(monthEvents[0].dateIso)
        .toLocaleDateString("en-US", { month: "long", timeZone: EVENT_TIMEZONE })
        .toUpperCase(),
      events: monthEvents,
    }));
}

export const events: Event[] = [
  event({
    slug: "silent-book-club-at-watershed-pub",
    title: "May Silent Book Club",
    dateIso: "2026-05-17T22:00:00.000Z",
    shortDescription: "Bring what you're reading. Quiet hour, good neighbors. Third Sunday.",
    locationName: "Watershed Pub & Kitchen",
    category: "Book Club",
    image: EVENT_IMAGES.silentBookClub,
    href: "https://maps.google.com/?cid=15529902946554199916",
    detail: SILENT_BOOK_CLUB_DETAIL,
  }),
  event({
    slug: "june-silent-book-club",
    title: "June Silent Book Club",
    dateIso: "2026-06-21T22:00:00.000Z",
    shortDescription: "Longer evenings, good book, neighbors at Watershed. Third Sunday.",
    locationName: "Watershed Pub & Kitchen",
    category: "Book Club",
    image: EVENT_IMAGES.silentBookClub,
    href: "https://maps.google.com/?cid=15529902946554199916",
    detail: SILENT_BOOK_CLUB_DETAIL,
  }),
  event({
    slug: "maple-leaf-free-yard-sale-day",
    title: "Maple Leaf Free Yard Sale Day",
    dateIso: "2026-07-12T17:00:00.000Z",
    shortDescription:
      "Neighbors setting out free stuff yard-sale style — in driveways and along roads, at no cost.",
    locationName: "Maple Leaf",
    category: "Community",
    image: EVENT_IMAGES.yardSale,
    href: "https://www.facebook.com/events/967367092776193/",
    external: true,
  }),
  event({
    slug: "2026-summer-social",
    title: "2026 Summer Social",
    dateIso: "2026-07-16T00:30:00.000Z",
    shortDescription: "Maple Leaf Park gathering, good company, fresh air, all welcome.",
    locationName: "Maple Leaf Park Playground",
    category: "Community",
    image: EVENT_IMAGES.summerSocial,
    href: "https://maps.google.com/?cid=18316883148481642978",
    detail: SUMMER_SOCIAL_DETAIL,
  }),
  event({
    slug: "july-silent-book-club",
    title: "July Silent Book Club",
    dateIso: "2026-07-19T22:00:00.000Z",
    shortDescription: "Midsummer reading hour, no homework, just neighbors. Third Sunday.",
    locationName: "Watershed Pub",
    category: "Book Club",
    image: EVENT_IMAGES.silentBookClub,
    href: "https://www.google.com/maps/search/?api=1&query=Watershed%20Pub%20Seattle",
    detail: SILENT_BOOK_CLUB_DETAIL,
  }),
  event({
    slug: "august-silent-book-club",
    title: "August Silent Book Club",
    dateIso: "2026-08-16T22:00:00.000Z",
    shortDescription: "Cool off with a quiet read and friendly neighbors. Third Sunday.",
    locationName: "Watershed Pub",
    category: "Book Club",
    image: EVENT_IMAGES.silentBookClub,
    href: "https://www.google.com/maps/search/?api=1&query=Watershed%20Pub%20Seattle",
    detail: SILENT_BOOK_CLUB_DETAIL,
  }),
  event({
    slug: "september-silent-book-club",
    title: "September Silent Book Club",
    dateIso: "2026-09-20T22:00:00.000Z",
    shortDescription: "Ease into fall rhythms with a calm reading hour. Third Sunday.",
    locationName: "Watershed Pub",
    category: "Book Club",
    image: EVENT_IMAGES.silentBookClub,
    href: "https://www.google.com/maps/search/?api=1&query=Watershed%20Pub%20Seattle",
    detail: SILENT_BOOK_CLUB_DETAIL,
  }),
  event({
    slug: "october-silent-book-club",
    title: "October Silent Book Club",
    dateIso: "2026-10-18T22:00:00.000Z",
    shortDescription: "Crisp fall Sunday, good book, good neighbors. Third Sunday at Watershed.",
    locationName: "Watershed Pub",
    category: "Book Club",
    image: EVENT_IMAGES.silentBookClub,
    href: "https://www.google.com/maps/search/?api=1&query=Watershed%20Pub%20Seattle",
    detail: SILENT_BOOK_CLUB_DETAIL,
  }),
  event({
    slug: "november-silent-book-club",
    title: "November Silent Book Club",
    dateIso: "2026-11-15T23:00:00.000Z",
    shortDescription: "Cozy rainy-season reading with neighbors. Third Sunday at Watershed.",
    locationName: "Watershed Pub",
    category: "Book Club",
    image: EVENT_IMAGES.silentBookClub,
    href: "https://www.google.com/maps/search/?api=1&query=Watershed%20Pub%20Seattle",
    detail: SILENT_BOOK_CLUB_DETAIL,
  }),
  event({
    slug: "december-silent-book-club",
    title: "December Silent Book Club",
    dateIso: "2026-12-20T23:00:00.000Z",
    shortDescription: "A quiet read with neighbors before the holiday rush. Third Sunday.",
    locationName: "Watershed Pub",
    category: "Book Club",
    image: EVENT_IMAGES.silentBookClub,
    href: "https://www.google.com/maps/search/?api=1&query=Watershed%20Pub%20Seattle",
    detail: SILENT_BOOK_CLUB_DETAIL,
  }),
];

export function getEvent(slug: string): Event | undefined {
  return events.find((item) => item.slug === slug);
}

export function getEventPageHref(event: Event): string {
  return `/events/${event.slug}`;
}

export function getRelatedEvents(currentSlug?: string, limit = 2): Event[] {
  return events.filter((item) => item.slug !== currentSlug).slice(0, limit);
}

export const eventRoutes = events.map((item) => ({
  path: getEventPageHref(item),
  label: item.title,
  layout: "not-started" as const,
  content: "not-started" as const,
  polish: "not-started" as const,
}));
