export type EventDetailBlock =
  | { kind: "heading"; text: string; size?: "h5" | "h6" }
  | { kind: "paragraph"; text: string; linkText?: string; href?: string }
  | { kind: "list"; items: string[] }
  | { kind: "video"; youtubeId: string; title: string };

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
  mapHref?: string;
  mapQuery?: string;
  mapZoom?: number;
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
  moviesByTheTower: "/images/events/movie-by-tower.png",
  halloweenParade: "/images/events/halloween-parade.svg",
  fallMeeting: "/images/events/fall-community-meeting.svg",
  nightOut: "/images/events/night-out.jpeg",
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
  const query = encodeURIComponent(event.mapQuery ?? `${event.locationName}, Seattle, WA`);
  const zoom = event.mapZoom ?? 15;
  return `https://maps.google.com/maps?q=${query}&z=${zoom}&output=embed`;
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
        "Arrive with whatever you’re reading, any genre, any format",
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
      text: "The Summer Social has been part of Maple Leaf since the 1990s. Organized by the Maple Leaf Community Council, it’s one of the most consistent ways we bring neighbors together, and in our recent community survey, it ranked as the most loved event we host.",
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
        "A relaxed afternoon in Maple Leaf Park, all are welcome",
      ],
    },
    {
      kind: "paragraph",
      text: "Volunteers make the Summer Social happen each year. Whether you help with setup, outreach, or day-of logistics, it’s a great way to plug into the Events committee and meet people across the neighborhood.",
    },
  ],
};

const MOVIES_BY_THE_TOWER_DETAIL: EventDetailContent = {
  blocks: [
    {
      kind: "paragraph",
      text: "Movies by the Tower brings a free outdoor movie night to the Lower Baseball Fields at Maple Leaf Reservoir Park, in view of the neighborhood's iconic water tower. It's presented by Seattle Credit Union and hosted by Scarecrow Video alongside the MLCC Events Committee, with additional support from Aegis Living Ravenna and other neighborhood businesses.",
    },
    {
      kind: "heading",
      text: "What to expect",
      size: "h5",
    },
    {
      kind: "list",
      items: [
        "Gates open at 5pm with a beer garden, food trucks, and free admission",
        "Live sets from The Low Lonesome Sound, Dog Mom, and The Chase Rabideau Band",
        "Superman (2025) screens at dusk; bring a low-back chair or blanket",
        "Free and open to everyone in the neighborhood",
      ],
    },
    {
      kind: "heading",
      text: "Tonight's movie: Superman (2025)",
      size: "h5",
    },
    {
      kind: "paragraph",
      text: "This year's screening, curated by Scarecrow Video, is James Gunn's Superman, the film that kicks off the new DC Universe. David Corenswet stars as Clark Kent alongside Rachel Brosnahan as Lois Lane and Nicholas Hoult as Lex Luthor, with Edi Gathegi, Anthony Carrigan, Nathan Fillion, and Isabela Merced rounding out the cast. Rated PG-13, runtime 2h 9m.",
    },
    {
      kind: "video",
      youtubeId: "Ox8ZLF6cGM0",
      title: "Superman | Official Trailer | DC",
    },
    {
      kind: "heading",
      text: "The lineup",
      size: "h5",
    },
    {
      kind: "paragraph",
      text: "Music starts as soon as the gates open, with sets from The Low Lonesome Sound, Dog Mom, and The Chase Rabideau Band carrying the evening through the beer garden and food trucks until the sky's dark enough to roll the movie.",
    },
    {
      kind: "paragraph",
      text: "Like the Summer Social, this one runs on volunteers, from setup to the projection booth. If you'd like to help out, the Events Committee is always glad for another set of hands.",
    },
    {
      kind: "heading",
      text: "Thanks to our sponsors",
      size: "h6",
    },
    {
      kind: "paragraph",
      text: "In partnership with Scarecrow Video and the Maple Leaf Community Council, with additional support from Fresh & Clean Garment Care, the Stefan Marian Team at Windermere Real Estate, Aegis Living Ravenna, Moonlight Tattoo Seattle, Rain City Dentistry, Billings Middle School, RUG Little League, The Watershed Pub & Kitchen, Project 9, ReAnimated Music, Cafe Javasti, Math 'n' Stuff, and Attuned.",
    },
  ],
};

const NIGHT_OUT_DETAIL: EventDetailContent = {
  blocks: [
    {
      kind: "paragraph",
      text: "Night Out started in 1984 as a national community-building campaign from the National Association of Town Watch, and it's grown into one of the country's largest crime-prevention events, with tens of thousands of communities and tens of millions of neighbors taking part each year. In Seattle, it's promoted locally by SPD's Crime Prevention team on the first Tuesday of August as a low-key way to meet the people who live around you.",
    },
    {
      kind: "heading",
      text: "What to expect",
      size: "h5",
    },
    {
      kind: "list",
      items: [
        "Block-by-block gatherings across Maple Leaf, porch lights on, neighbors out",
        "A relaxed evening to swap names, numbers, and get to know your street",
        "Presented locally by SPD's Crime Prevention team, free to attend",
      ],
    },
    {
      kind: "heading",
      text: "Organizing your own block",
      size: "h5",
    },
    {
      kind: "paragraph",
      text: "Want to host a gathering on your own block? Register with SPD by July 27, 2026 for this year's event. Once registered, your gathering shows up on the city's public Night Out map so neighbors up and down the street know where to find you, and SPD provides a starter kit: street closure signs, waste station labels, the Night Out logo, and invitation templates in eight languages, including Spanish, Vietnamese, and Tagalog.",
    },
    {
      kind: "paragraph",
      text: "Check seattle.gov/police/crime-prevention/night-out for the city's registration form and materials if you're organizing a gathering on your own block.",
      linkText: "seattle.gov/police/crime-prevention/night-out",
      href: "https://www.seattle.gov/police/crime-prevention/night-out",
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

export function getUpcomingEvents(eventList: Event[] = events): Event[] {
  const now = Date.now();
  return eventList.filter((event) => new Date(event.dateIso).getTime() >= now);
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
      "Neighbors setting out free stuff yard-sale style, in driveways and along roads, at no cost.",
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
    slug: "night-out",
    title: "Night Out",
    dateIso: "2026-08-05T00:00:00.000Z",
    shortDescription: "Meet your block, swap stories, celebrate neighborhood safety together.",
    locationName: "Maple Leaf",
    category: "Community",
    image: EVENT_IMAGES.nightOut,
    href: "https://www.seattle.gov/police/crime-prevention/night-out",
    external: true,
    detail: NIGHT_OUT_DETAIL,
  }),
  event({
    slug: "2026-movies-by-the-tower",
    title: "2026 Movies by the Tower",
    dateIso: "2026-08-09T00:00:00.000Z",
    shortDescription: "Free outdoor movie at the tower: beer garden, food trucks, live music, dusk screening.",
    locationName: "Lower Baseball Fields, Maple Leaf Reservoir Park",
    category: "Movie Night",
    image: EVENT_IMAGES.moviesByTheTower,
    href: "https://www.facebook.com/MLTowerMovies/",
    external: true,
    detail: MOVIES_BY_THE_TOWER_DETAIL,
    mapHref: "https://maps.app.goo.gl/nmZ8fJnKHcM6YZ8y5",
    mapQuery: "47.6891713,-122.3160804",
    mapZoom: 17,
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
    slug: "fall-community-meeting",
    title: "Fall Community Meeting",
    dateIso: "2026-10-15T01:00:00.000Z",
    shortDescription: "Our fall check-in on what's happening in Maple Leaf. All welcome.",
    locationName: "Olympic View Elementary",
    category: "Community",
    image: EVENT_IMAGES.fallMeeting,
    href: "https://www.google.com/maps/search/?api=1&query=Olympic%20View%20Elementary%20Seattle",
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
    slug: "halloween-parade",
    title: "Halloween Parade",
    dateIso: "2026-10-25T21:00:00.000Z",
    shortDescription: "Costumes, candy, and neighbors marching together before Halloween.",
    locationName: "Maple Leaf",
    category: "Community",
    image: EVENT_IMAGES.halloweenParade,
    href: "https://www.google.com/maps/search/?api=1&query=Maple%20Leaf%20Seattle",
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
  return getUpcomingEvents(events)
    .filter((item) => item.slug !== currentSlug)
    .slice(0, limit);
}

export const eventRoutes = events.map((item) => ({
  path: getEventPageHref(item),
  label: item.title,
  layout: "not-started" as const,
  content: "not-started" as const,
  polish: "not-started" as const,
}));
