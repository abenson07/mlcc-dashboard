import {
  mergeStaticWithPublished,
  type PublishedEventRow,
} from "./mergePublishedEvents";

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
  silentBookClubParkEvening: "/images/events/maple-leaf-park3.jpg",
  silentBookClubParkPicnic: "/images/events/maple-leaf-park4.jpg",
  summerSocial: "/images/events/summer-social.png",
  yardSale: "/images/events/maple-leaf-free-yard-sale.png",
  springMeeting: "/images/events/spring-community-meeting.png",
  moviesByTheTower: "/images/events/movie-by-tower.png",
  halloweenParade: "/images/community-photos/img-6554.jpg",
  fallMeeting: "/images/community-photos/community-meeting-a.webp",
  nightOut: "/images/events/night-out.jpeg",
  emergencyHub: "/images/one-seattle/reservoir-park.jpg",
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

const SILENT_BOOK_CLUB_IN_THE_PARK_DETAIL: EventDetailContent = {
  blocks: [
    {
      kind: "paragraph",
      text: "A midweek pop-up version of Silent Book Club, out in the summer air at Maple Leaf Park. Same easy format as the monthly meetup at Watershed, just outdoors and on a weeknight, an excuse to get outside and read with neighbors instead of alone at home.",
    },
    {
      kind: "paragraph",
      text: "The regular Silent Book Club at Watershed Pub has become one of the most reliable ways neighbors meet each other, and this summer we wanted a version that didn't require staying in on a weekend evening. Maple Leaf Park gives us the room to spread out on the grass, catch the last of the daylight, and still be home before it's fully dark.",
    },
    {
      kind: "heading",
      text: "What to expect",
      size: "h5",
    },
    {
      kind: "list",
      items: [
        "Bring a book, a blanket or camp chair, and yourself",
        "No assigned reading and no discussion required",
        "Read together in comfortable quiet, then chat before or after",
        "Free, casual, and open to everyone in the neighborhood",
        "Kids and dogs welcome, as long as the quiet-reading vibe holds",
      ],
    },
    {
      kind: "heading",
      text: "What to bring",
      size: "h5",
    },
    {
      kind: "list",
      items: [
        "Whatever you're currently reading, any genre, any format",
        "A blanket, towel, or low camp chair to sit on",
        "A layer for once the sun dips, evenings cool off fast near the water tower",
        "A drink or snack to share if you're up for it, though it's not required",
      ],
    },
    {
      kind: "heading",
      text: "Where to find us",
      size: "h5",
    },
    {
      kind: "paragraph",
      text: "Look for the reading blankets on the open lawn near the water tower and the picnic shelter. If you get turned around, the community info kiosk on the park's main path is a good landmark, we'll be within sight of it.",
    },
    {
      kind: "heading",
      text: "Rain or shine",
      size: "h5",
    },
    {
      kind: "paragraph",
      text: "Weather permitting, we'll be out on the grass at Maple Leaf Park. Light drizzle won't stop us, Seattle readers are used to it, but if the forecast turns to real rain we'll call it and try again the following month. Keep an eye on the neighborhood channels in case of a last-minute weather call.",
    },
    {
      kind: "heading",
      text: "Why we started this",
      size: "h5",
    },
    {
      kind: "paragraph",
      text: "It's easy to let summer slip by without actually spending time outside with neighbors. This is a low-effort way to fix that: no planning, no cooking, no RSVP, just show up with a book and sit down. If it goes well, we'd like to make it a regular midweek fixture alongside the monthly Watershed meetup.",
    },
    {
      kind: "paragraph",
      text: "Want to help organize future sessions, or have a favorite spot in the park you think we should use instead? Reach out through the Events committee, we're always glad for another set of hands or a better picnic spot.",
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

const EMERGENCY_HUB_MEET_AND_GREET_DETAIL: EventDetailContent = {
  blocks: [
    {
      kind: "paragraph",
      text: "The Maple Leaf Emergency Hub is seeking volunteers! Come meet the team, see what's in the Hub supply box, and learn how it all works. Drop by anytime between 10am and 1pm, no RSVP needed, and bring the kids.",
    },
    {
      kind: "heading",
      text: "What is an Emergency Hub?",
      size: "h5",
    },
    {
      kind: "paragraph",
      text: "When a major earthquake or disaster hits, professional responders will likely be overwhelmed. For the first hours and days, neighbors helping neighbors becomes the difference-maker. An Emergency Hub is a volunteer-run gathering point where the neighborhood comes together to share information, pool resources, and help one another until responders arrive. Maple Leaf already has a Hub, a supply box, and a place in Seattle's citywide Hub network, this event is a chance to see it firsthand and help shape what comes next.",
    },
    {
      kind: "heading",
      text: "What to expect",
      size: "h5",
    },
    {
      kind: "list",
      items: [
        "A first look inside the Hub supply box and how it's organized",
        "Meet the volunteers already involved and hear how the Hub works",
        "Casual, family-friendly, drop by anytime during the window",
        "No experience or preparedness background required",
      ],
    },
    {
      kind: "heading",
      text: "Get involved",
      size: "h5",
    },
    {
      kind: "paragraph",
      text: "You don't need special skills, training, or a lot of spare time. Every neighbor who raises a hand makes the whole neighborhood more resilient. You choose how involved you want to be, from greeting neighbors and spreading the word, to managing supplies, supporting radio operations, teaching prep skills, helping lead the team year-round, or simply joining the mailing list to stay informed.",
    },
    {
      kind: "paragraph",
      text: "Sign up to volunteer, or email mapleleafhubs@gmail.com with questions.",
      linkText: "Sign up to volunteer",
      href: "https://forms.gle/PcxKvxNARtQmVsyS7",
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

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

async function fetchJson<T>(pathAndQuery: string, method: "GET" | "POST" = "GET"): Promise<T | null> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  try {
    const response = await fetch(`${SUPABASE_URL}${pathAndQuery}`, {
      method,
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        ...(method === "POST" ? { "Content-Type": "application/json" } : {}),
      },
      body: method === "POST" ? "{}" : undefined,
      next: { revalidate: 60 },
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function fetchPublishedEventRows(): Promise<PublishedEventRow[]> {
  const params = new URLSearchParams({
    select: "name,starts_at,slug,committee,field_data",
    publish_status: "eq.published",
    slug: "not.is.null",
  });
  const rows = await fetchJson<PublishedEventRow[]>(`/rest/v1/events?${params.toString()}`);
  return rows ?? [];
}

export async function fetchUnpublishedEventSlugs(): Promise<string[]> {
  const rows = await fetchJson<{ slug: string | null }[]>(
    `/rest/v1/rpc/unpublished_event_slugs`,
    "POST",
  );
  if (!rows) return [];
  return rows.map((row) => row.slug).filter((slug): slug is string => Boolean(slug));
}

export async function getMergedEvents(): Promise<Event[]> {
  const [published, unpublishedSlugs] = await Promise.all([
    fetchPublishedEventRows(),
    fetchUnpublishedEventSlugs(),
  ]);
  return mergeStaticWithPublished(events, published, unpublishedSlugs);
}

export async function getMergedUpcomingEvents(): Promise<Event[]> {
  return getUpcomingEvents(await getMergedEvents());
}

export async function getMergedEvent(slug: string): Promise<Event | undefined> {
  const merged = await getMergedEvents();
  return merged.find((item) => item.slug === slug);
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
    slug: "silent-book-club-in-the-park-july",
    title: "Silent Book Club in the Park",
    dateIso: "2026-07-24T01:00:00.000Z",
    shortDescription: "A midweek reading hour outdoors at Maple Leaf Park. Bring a book, enjoy the summer evening.",
    locationName: "Maple Leaf Park",
    category: "Book Club",
    image: EVENT_IMAGES.silentBookClubParkPicnic,
    href: "https://www.google.com/maps/search/?api=1&query=Maple%20Leaf%20Park%20Seattle",
    detail: SILENT_BOOK_CLUB_IN_THE_PARK_DETAIL,
  }),
  event({
    slug: "emergency-hub-meet-and-greet",
    title: "Hub Meet & Greet + Inventory Day",
    dateIso: "2026-08-01T17:00:00.000Z",
    shortDescription: "See what's in the Hub supply box, meet the volunteers, and learn how it all works. Family-friendly.",
    locationName: "Maple Leaf Reservoir Park",
    category: "Community",
    image: EVENT_IMAGES.emergencyHub,
    href: "https://www.google.com/maps/search/?api=1&query=Maple%20Leaf%20Reservoir%20Park%20Seattle",
    detail: EMERGENCY_HUB_MEET_AND_GREET_DETAIL,
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
    slug: "silent-book-club-in-the-park-august",
    title: "Silent Book Club in the Park",
    dateIso: "2026-08-05T01:00:00.000Z",
    shortDescription: "A midweek reading hour outdoors at Maple Leaf Park. Bring a book, enjoy the summer evening.",
    locationName: "Maple Leaf Park",
    category: "Book Club",
    image: EVENT_IMAGES.silentBookClubParkEvening,
    href: "https://www.google.com/maps/search/?api=1&query=Maple%20Leaf%20Park%20Seattle",
    detail: SILENT_BOOK_CLUB_IN_THE_PARK_DETAIL,
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

export function getRelatedEvents(
  currentSlug?: string,
  limit = 2,
  eventList: Event[] = events,
): Event[] {
  return getUpcomingEvents(eventList)
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
