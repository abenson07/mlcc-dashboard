import type { BannerItem } from "./banner";

export type LivestreamListItem = string | { text: string; href: string };

export type LivestreamBodyBlock =
  | { kind: "heading"; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "list"; items: LivestreamListItem[] };

export const communityMeetingLivestream = {
  title: "Fall Community Meeting",
  dateLabel: "Wednesday, October 14, 2026 · 6:00 PM",
  href: "/community-meeting",
  youtubeId: "NB1U8akiWXg",
  youtubeUrl: "https://youtube.com/live/NB1U8akiWXg",
  heroBlurb:
    "Hear District 5 City Council candidates Nilu Jenks and Julie Kang answer Maple Leaf's top questions at our Fall Community Meeting.",
  body: [
    {
      kind: "paragraph",
      text: "Missed the meeting, or want to catch something again? The full recording of our Fall Community Meeting at Olympic View Elementary is above, including the District 5 City Council candidate forum.",
    },
    { kind: "heading", text: "Agenda" },
    {
      kind: "list",
      items: [
        "6:00 PM — Cookies & conversations",
        "6:10 PM — Welcome from the MLCC Board President",
        "6:20 PM — Events Committee recap and what's ahead",
        "6:25 PM — Silent Book Club update",
        "6:30 PM — Maple Leaf Emergency Hub",
        "6:40 PM — District 5 candidate introductions",
        "6:50 PM — Facilitated responses from District 5 candidates + most-asked questions from the community",
        "7:25 PM — Wrap up and continue conversations",
      ],
    },
    { kind: "heading", text: "District 5 candidate forum" },
    {
      kind: "paragraph",
      text: "District 5 is holding a special election for a one-year City Council term. The district covers most of northern Maple Leaf and is one of seven districts, alongside two at-large council members. Candidates gave introductory statements, then answered moderated questions drawn from our neighborhood survey.",
    },
    {
      kind: "list",
      items: [
        { text: "Nilu Jenks — neighborsfornilu.org", href: "https://neighborsfornilu.org" },
        { text: "Julie Kang — julieforseattle.com", href: "https://julieforseattle.com" },
      ],
    },
    { kind: "paragraph", text: "Questions covered:" },
    {
      kind: "list",
      items: [
        "Housing, density & neighborhood livability",
        "Environmental sustainability, including green spaces, tree canopy, and Thornton Creek",
        "Public safety, policing & accountability",
        "Homelessness, mental health & addiction",
        "Local business growth, transportation & infrastructure",
        "Maple Leaf Visioning Survey results",
      ],
    },
    { kind: "heading", text: "Maple Leaf Emergency Hub" },
    {
      kind: "paragraph",
      text: "When the power, phones, and water are out, neighbors gather at Maple Leaf Reservoir Park, by the playground, to share news and help each other. We have the gathering spot and most of the gear. What the Hub needs now is trained neighbors.",
    },
    {
      kind: "list",
      items: [
        {
          text: "Hub 101 training — Saturday, Oct 24, 10:30 AM at Greenwood Library",
          href: "https://signup.com/go/GQkWajC",
        },
        { text: "Maple Leaf Hub volunteer sign-up", href: "https://forms.gle/PcxKvxNARtQmVsyS7" },
        { text: "Mailing list & questions: mapleleafhubs@gmail.com", href: "mailto:mapleleafhubs@gmail.com" },
      ],
    },
    { kind: "heading", text: "Get involved" },
    {
      kind: "list",
      items: [
        { text: "Join a committee", href: "/committees" },
        { text: "Claim an open Leaflet delivery route", href: "/open-routes" },
        { text: "Find a volunteer opportunity", href: "/volunteer" },
      ],
    },
  ] satisfies LivestreamBodyBlock[],
};

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
};
