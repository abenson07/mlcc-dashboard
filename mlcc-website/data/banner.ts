import { events, getEventPageHref, getUpcomingEvents, type Event } from "./events";
import { getPublishedLeafletStories } from "./leaflet-stories";
import { volunteerOpportunities } from "./volunteers";

export type BannerItem = {
  headline: string;
  linkText: string;
  linkPath: string;
};

function eventBannerItems(upcomingEvents: Event[]): BannerItem[] {
  return upcomingEvents
    .slice()
    .sort((a, b) => new Date(a.dateIso).getTime() - new Date(b.dateIso).getTime())
    .slice(0, 4)
    .map((event) => ({
      headline: `${event.title} — ${event.date}`,
      linkText: "See event details",
      linkPath: getEventPageHref(event),
    }));
}

function storyAndVolunteerBannerItems(): BannerItem[] {
  const recentStories = getPublishedLeafletStories()
    .sort((a, b) => b.publishDate.localeCompare(a.publishDate))
    .slice(0, 2)
    .map((story) => ({
      headline: story.title,
      linkText: "Read the Leaflet story",
      linkPath: `/leaflet/template/${story.slug}`,
    }));

  const volunteerAsks = volunteerOpportunities.slice(0, 3).map((opportunity) => ({
    headline: opportunity.title,
    linkText: "Volunteer to help",
    linkPath: `/volunteer/${opportunity.slug}`,
  }));

  return [...recentStories, ...volunteerAsks];
}

export function getBannerItemsFromEvents(upcomingEvents: Event[]): BannerItem[] {
  return [...eventBannerItems(upcomingEvents), ...storyAndVolunteerBannerItems()];
}

export function getBannerItems(): BannerItem[] {
  return getBannerItemsFromEvents(getUpcomingEvents(events));
}
