import type { BannerItem } from "./banner";

export type LivestreamListItem = string | { text: string; href: string };

export type LivestreamBodyBlock =
  | { kind: "heading"; text: string }
  | { kind: "subheading"; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "list"; items: LivestreamListItem[] };

export const communityMeetingLivestream = {
  title: "Fall Community Meeting",
  dateLabel: "Wednesday, October 14, 2026 · 6:00 PM",
  href: "/community-meeting",
  youtubeId: "NB1U8akiWXg",
  youtubeUrl: "https://youtube.com/live/NB1U8akiWXg",
  heroImage: "/images/events/fall-community-meeting-2026.webp",
  heroImageAlt: "Neighbors gathered in the Olympic View Elementary cafeteria for the Fall Community Meeting",
  heroBlurb:
    "Hear District 5 City Council candidates Nilu Jenks and Julie Kang answer Maple Leaf's top questions at our Fall Community Meeting.",
  body: [
    {
      kind: "paragraph",
      text: "Missed the meeting, or want to catch something again? The full recording of our Fall Community Meeting at Olympic View Elementary is above. Here is the agenda, with the details and links from each part of the night. Watch the video for the full conversation.",
    },
    { kind: "heading", text: "Agenda" },

    { kind: "subheading", text: "6:00 PM — Cookies & conversations" },
    {
      kind: "paragraph",
      text: "Neighbors settled in with snacks and refreshments and connected before the program began.",
    },

    { kind: "subheading", text: "6:10 PM — Welcome from the MLCC Board President" },
    {
      kind: "paragraph",
      text: "Ethan Delavan, MLCC Board President, welcomed everyone, walked through the agenda, and explained who MLCC is: your neighbors, a 501(c)(3), and an all-volunteer organization. Volunteer sign-up sheets were on the table at the meeting, and he walked through the committees you can join:",
    },
    {
      kind: "list",
      items: [
        "Events & Outreach: the Summer Social, Silent Book Club, Movies by the Tower, and the Halloween Parade.",
        "Newsletter: writing, art, and delivery for the Leaflet. Many delivery routes are still unclaimed.",
        "Advocacy: meets monthly on a Tuesday to focus on what Maple Leaf needs, from traffic to understanding Seattle's laws. New members have just joined.",
        "Business: staying in touch with local businesses and building relationships with them.",
        "Communications: the Leaflet, plus a need for more regular digital communications.",
        "Volunteer: a new committee. A board member has offered to be volunteer coordinator, focused on calling, recruiting, and matching people's talents to the organization.",
      ],
    },
    {
      kind: "paragraph",
      text: "Other ways to help: communications, intermittent support (the Leaflet, email campaigns, and event prep), high school students, and friends who weren't there to say no.",
    },

    { kind: "subheading", text: "6:20 PM — Events Committee recap and what's ahead" },
    {
      kind: "paragraph",
      text: "Stephan, an Events Committee co-chair, recapped the year's events and what each one needs.",
    },
    {
      kind: "list",
      items: [
        "Summer Social: 42 organizations took part this year. The last two have been run by about five people, so a few more would help.",
        "Movies by the Tower: associated with MLCC, and always looking for volunteers.",
        "Community meetings: always need help.",
        "Halloween Parade: Saturday, October 24. The pet parade steps off at 3:00 PM and the full parade starts at 3:30 PM. Volunteers are needed at crosswalks and along the route.",
        "Love Your Neighbor Happy Hour: held around Valentine's Day at Project 9.",
        "Silent Book Club: see below.",
      ],
    },

    { kind: "subheading", text: "6:25 PM — Silent Book Club update" },
    {
      kind: "paragraph",
      text: "Michelle, who leads Maple Leaf's Silent Book Club, explained that it is a chapter of a larger global effort to get like-minded readers together at local venues and parks. It is all ages, and young readers are welcome.",
    },
    {
      kind: "list",
      items: [
        "Monthly meetups: the third Sunday of each month, 3–5 PM at The Watershed Pub, upstairs in the mezzanine. Next: Sunday, Oct 18. Then Nov 15 and Dec 20.",
        "Audiobook walks: 10 AM at Maple Leaf Park. Next: Nov 27 and Dec 12. (The first was Oct 10.)",
        "Instagram: @silentbookclubmapleleaf",
      ],
    },

    { kind: "subheading", text: "6:30 PM — Maple Leaf Emergency Hub" },
    {
      kind: "paragraph",
      text: "Jimmie Lundie, Hub Captain, explained that when the power, phones, and water are out, neighbors gather at Maple Leaf Reservoir Park, by the playground, to share news and help each other. A Hub needs three things:",
    },
    {
      kind: "list",
      items: [
        "A gathering spot: we have it, Maple Leaf Reservoir Park.",
        "Gear to organize: we have most of it. The Hub box is by the park restrooms near the playground.",
        "Trained neighbors: this is where you come in.",
      ],
    },
    {
      kind: "paragraph",
      text: "At a Hub: information (what's open and closed, message boards, a radio link to the City), education (purifying water, shutting off gas, staying safe), resources (matching what neighbors have with what they need), and volunteers (matching skills to needs). A Hub is not a shelter, food bank, or City office. It is neighbors, organized. If there's a disaster tomorrow: check on your household, check on your neighbors, then come to the park.",
    },
    {
      kind: "list",
      items: [
        {
          text: "Hub 101 training — Saturday, Oct 24, 10:30 AM at Greenwood Library",
          href: "https://signup.com/go/GQkWajC",
        },
        {
          text: "Volunteer: a co-captain, team leads for outreach, writing, and event planning, or help on the day (no experience needed)",
          href: "https://forms.gle/PcxKvxNARtQmVsyS7",
        },
        { text: "Mailing list & questions: mapleleafhubs@gmail.com", href: "mailto:mapleleafhubs@gmail.com" },
        "Great ShakeOut earthquake drill: Thursday, Oct 15, 10:15 AM. Drop, cover, and hold on.",
      ],
    },

    { kind: "subheading", text: "6:40 PM — District 5 candidate introductions" },
    {
      kind: "paragraph",
      text: "District 5 is holding a special election for a one-year City Council term. It covers most of northern Maple Leaf and is one of seven districts, alongside two at-large council members, for a nine-member council. The format: an opening statement from each candidate, moderated questions, final comments as time allowed, and contact information.",
    },
    {
      kind: "list",
      items: [
        { text: "Nilu Jenks — neighborsfornilu.org", href: "https://neighborsfornilu.org" },
        { text: "Julie Kang — julieforseattle.com", href: "https://julieforseattle.com" },
      ],
    },

    {
      kind: "subheading",
      text: "6:50 PM — Facilitated responses from District 5 candidates + most-asked questions from the community",
    },
    {
      kind: "paragraph",
      text: "Close to 30 questions came in from a neighborhood survey and were narrowed to six core topics:",
    },
    {
      kind: "list",
      items: [
        "Housing, density & neighborhood livability",
        "Environmental sustainability, including green spaces, tree canopy, and Thornton Creek",
        "Public safety, policing & accountability",
        "Homelessness, mental health & addiction",
        "Local business growth, transportation & infrastructure",
        "Maple Leaf visioning survey results",
      ],
    },
    {
      kind: "paragraph",
      text: "Each candidate also gave closing remarks. Watch the video to hear their answers.",
    },

    { kind: "subheading", text: "7:25 PM — Wrap up and continue conversations" },
    {
      kind: "paragraph",
      text: "Thank you to our MLCC business members and to the sponsors of the Leaflet, the Summer Social, and Movies by the Tower. Their support makes our gatherings possible.",
    },
    {
      kind: "list",
      items: [
        { text: "Claim an open Leaflet delivery route", href: "/open-routes" },
        { text: "Join a committee", href: "/committees" },
        { text: "Find a volunteer opportunity", href: "/volunteer" },
      ],
    },
  ] satisfies LivestreamBodyBlock[],
};

/** The hero features the live stream until midnight, Seattle time, on Oct 20, 2026. Then it returns to the normal slide rotation. */
export const LIVESTREAM_HERO_ENDS_AT = "2026-10-20T07:00:00.000Z";

export function isLivestreamHeroActive(now: Date = new Date()) {
  return now.getTime() < Date.parse(LIVESTREAM_HERO_ENDS_AT);
}

export function getLivestreamEmbedUrl(youtubeId: string) {
  return `https://www.youtube-nocookie.com/embed/${youtubeId}`;
}

export function getLivestreamThumbnailUrl(youtubeId: string) {
  return `https://i.ytimg.com/vi/${youtubeId}/maxresdefault.jpg`;
}

/** Temporary: pinned to the front of the site banner while the recording is featured. */
export const livestreamBannerItem: BannerItem = {
  headline: `${communityMeetingLivestream.title} live stream`,
  linkText: "Watch now",
  linkPath: communityMeetingLivestream.href,
  expiresAt: LIVESTREAM_HERO_ENDS_AT,
};
