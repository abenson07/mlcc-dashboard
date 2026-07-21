import type { CommitteeListingSlug } from "./committees";

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
  committee?: CommitteeListingSlug;
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
      "/images/community-photos/community-meeting-a.webp",
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
    committee: "events",
    detail: {
      backLabel: "All volunteer opportunities",
      blocks: [
        { kind: "heading", text: "What you'd be doing", size: "h5" },
        {
          kind: "list",
          items: [
            "Reserving space at Watershed and confirming the date each month",
            "Greeting neighbors as they arrive and helping newcomers feel welcome",
            "Keeping the room quiet and comfortable during the reading hour",
            "Prompting a bit of casual mingling and conversation once reading time wraps up",
          ],
        },
        {
          kind: "heading",
          text: "Who this is for",
          size: "h5",
        },
        {
          kind: "paragraph",
          text: "Silent Book Club is one of Maple Leaf's simplest traditions: neighbors read together in comfortable silence, then talk books and life afterward. This role is for someone who loves that low-key vibe and wants to help it keep happening smoothly every third Sunday.",
        },
        {
          kind: "paragraph",
          text: "You don't need to run a formal program. Mostly it's about showing up early, making sure the space feels ready, and being a friendly face for neighbors who might be coming for the first time.",
        },
        {
          kind: "heading",
          text: "What it takes",
          size: "h5",
        },
        {
          kind: "list",
          items: [
            "Comfort coordinating a simple monthly booking with Watershed",
            "A warm, welcoming presence for neighbors arriving solo",
            "About two hours a month, mostly the day of each gathering",
          ],
        },
      ],
    },
  },
  {
    slug: "email-coordinator",
    title: "Email Coordinator",
    description:
      "Volunteer to keep neighbors connected by responding to emails and social media messages, and shaping the voice of our community.",
    volunteersNeeded: 2,
    timeCommitment: "2 hours per month",
    filters: ["communication", "online"],
    image:
      "/images/community-photos/photo-jun-11-2025.jpg",
    committee: "communications",
    detail: {
      backLabel: "All volunteer opportunities",
      blocks: [
        { kind: "heading", text: "What you'd be doing", size: "h5" },
        {
          kind: "list",
          items: [
            "Checking the council's shared inbox and responding to neighbor questions",
            "Replying to comments and messages on the council's social media accounts",
            "Routing questions to the right committee or board member when needed",
            "Helping keep the council's voice warm, clear, and consistent across channels",
          ],
        },
        {
          kind: "heading",
          text: "Who this is for",
          size: "h5",
        },
        {
          kind: "paragraph",
          text: "If you're the friend who always replies first, or you like being the one who makes sure nobody's message falls through the cracks, this role is a good fit. It's a steady, behind-the-scenes way to be neighbors' first point of contact with the council.",
        },
        {
          kind: "paragraph",
          text: "Most weeks it's a handful of emails and a few social media replies. It picks up around events, when more neighbors are asking questions or looking for details.",
        },
        {
          kind: "heading",
          text: "What it takes",
          size: "h5",
        },
        {
          kind: "list",
          items: [
            "Comfortable, friendly writing in email and on social media",
            "Reliability about checking in a few times a week",
            "About two hours a month, with more during busy event seasons",
          ],
        },
      ],
    },
  },
  {
    slug: "vice-president",
    title: "Vice President / Communications Officer",
    description:
      "Step into a leadership role on the Executive Board, supporting the President and helping the council speak with one clear voice.",
    volunteersNeeded: 1,
    timeCommitment: "3 hours per month",
    filters: ["planning", "communication"],
    image: "/images/community-photos/community-meeting-d.webp",
    detail: {
      backLabel: "All volunteer opportunities",
      blocks: [
        { kind: "heading", text: "What you'd be doing", size: "h5" },
        {
          kind: "list",
          items: [
            "Supporting the President and stepping in to lead Board and Steering Committee meetings when needed",
            "Helping shape and coordinate the council's public communications across email, social media, and the website",
            "Working with committee chairs to make sure priorities and messaging stay aligned across the organization",
            "Representing the council at community meetings and events when the President can't attend",
          ],
        },
        {
          kind: "heading",
          text: "Who this is for",
          size: "h5",
        },
        {
          kind: "paragraph",
          text: "This is a good fit for a neighbor who's comfortable leading a room, wants a bird's-eye view of everything the council is working on, and cares about how Maple Leaf hears from us. You don't need prior board experience, just steady judgment and a willingness to help keep things moving.",
        },
        {
          kind: "heading",
          text: "What it takes",
          size: "h5",
        },
        {
          kind: "list",
          items: [
            "Comfort running meetings and making decisions alongside other board members",
            "Interest in communications: knowing what should be said, and when",
            "About three hours a month, with more during major events or votes",
            "A one to two year commitment to give the role some continuity",
          ],
        },
      ],
    },
  },
  {
    slug: "business-committee-chair",
    title: "Business Committee Chair",
    description:
      "Lead the Business Committee: build relationships with local shops and restaurants, and connect neighbors to the businesses that make Maple Leaf special.",
    volunteersNeeded: 1,
    timeCommitment: "3 hours per month",
    filters: ["planning", "communication"],
    image: "/images/community-photos/love-your-neighbor.webp",
    detail: {
      backLabel: "All volunteer opportunities",
      blocks: [
        { kind: "heading", text: "What you'd be doing", size: "h5" },
        {
          kind: "list",
          items: [
            "Reaching out to local businesses to introduce them to the council and hear what they need",
            "Promoting business opportunities and events to neighbors, and neighbors to businesses",
            "Building awareness of ways neighbors can support local shops and restaurants",
            "Chairing Business Committee meetings and coordinating volunteers on the team",
          ],
        },
        {
          kind: "heading",
          text: "Who this is for",
          size: "h5",
        },
        {
          kind: "paragraph",
          text: "If you love popping into local shops, know half the business owners on the avenue by name, or just want an excuse to get to know them, this role is for you. It's a relationship-building job more than a paperwork one.",
        },
        {
          kind: "heading",
          text: "What it takes",
          size: "h5",
        },
        {
          kind: "list",
          items: [
            "Comfort introducing yourself to business owners and following up over time",
            "Basic organizing skills to run a small committee",
            "About three hours a month, with more around events like the Halloween Parade",
          ],
        },
      ],
    },
    committee: "business-committee",
  },
  {
    slug: "summer-social-planner",
    title: "Summer Social Planner",
    description:
      "Help plan Maple Leaf's flagship summer gathering, from booking vendors to lining up music and making sure the day runs smoothly.",
    volunteersNeeded: 2,
    timeCommitment: "Seasonal, ramps up April through July",
    filters: ["planning", "single-day-events"],
    image: "/images/events/summer-social.png",
    detail: {
      backLabel: "All volunteer opportunities",
      blocks: [
        { kind: "heading", text: "What you'd be doing", size: "h5" },
        {
          kind: "list",
          items: [
            "Helping choose the date, venue logistics, and overall shape of the day",
            "Reaching out to vendors, performers, and local businesses to take part",
            "Coordinating volunteers and supplies for the event itself",
            "Working alongside the Events Committee in the weeks leading up to the Social",
          ],
        },
        {
          kind: "paragraph",
          text: "This is Maple Leaf's biggest event of the year, so the planning starts months out but picks up in intensity as summer approaches. You'll be working closely with one other planner and the Events Committee, not doing it alone.",
        },
        {
          kind: "heading",
          text: "What it takes",
          size: "h5",
        },
        {
          kind: "list",
          items: [
            "Comfort juggling a few moving pieces at once: vendors, volunteers, logistics",
            "Availability to help staff the event itself on the day",
            "A few hours a month starting in spring, more in the final weeks before July",
          ],
        },
      ],
    },
    committee: "events",
  },
  {
    slug: "halloween-parade-crossing-guard",
    title: "Halloween Parade Crossing Guard",
    description:
      "Help keep families and dogs safe as the neighborhood walks the Halloween Parade route past local businesses.",
    volunteersNeeded: 4,
    timeCommitment: "2 hours, one October afternoon",
    filters: ["single-day-events"],
    image: "/images/events/halloween-parade.svg",
    detail: {
      backLabel: "All volunteer opportunities",
      blocks: [
        { kind: "heading", text: "What you'd be doing", size: "h5" },
        {
          kind: "list",
          items: [
            "Standing at an assigned intersection along the parade route to help families cross safely",
            "Keeping an eye out for cars and helping the parade move along smoothly",
            "Being a friendly, visible presence for neighbors walking the route",
          ],
        },
        {
          kind: "paragraph",
          text: "No experience needed, just a costume (optional) and a couple of hours on parade day. This is one of the easiest ways to help make a favorite neighborhood tradition happen safely.",
        },
        {
          kind: "heading",
          text: "What it takes",
          size: "h5",
        },
        {
          kind: "list",
          items: [
            "Willingness to stand at one spot and pay attention for about two hours",
            "Comfort speaking up if a car needs to stop or slow down",
          ],
        },
      ],
    },
    committee: "events",
  },
  {
    slug: "movies-in-the-park-crew",
    title: "Movies in the Park Setup & Teardown Crew",
    description:
      "Help set up and break down the screen, seating, and vendor areas for Movies by the Tower nights at the park.",
    volunteersNeeded: 4,
    timeCommitment: "2 hours per movie night",
    filters: ["single-day-events"],
    image: "/images/events/movies-by-the-tower.svg",
    detail: {
      backLabel: "All volunteer opportunities",
      blocks: [
        { kind: "heading", text: "What you'd be doing", size: "h5" },
        {
          kind: "list",
          items: [
            "Helping set up the screen, seating areas, and vendor space before the movie starts",
            "Assisting food vendors and other partners get situated",
            "Breaking everything down and making sure the park is left clean afterward",
          ],
        },
        {
          kind: "paragraph",
          text: "This is hands-on, physical help rather than planning, great for a neighbor who wants to pitch in for an evening without a long-term commitment. You'll usually get to stick around and enjoy the movie once setup is done.",
        },
        {
          kind: "heading",
          text: "What it takes",
          size: "h5",
        },
        {
          kind: "list",
          items: [
            "Ability to help carry and set up equipment",
            "Arriving a couple hours before showtime and staying to help break down afterward",
          ],
        },
      ],
    },
    committee: "events",
  },
  {
    slug: "community-meeting-planner",
    title: "Community Meeting Planner",
    description:
      "Help plan Maple Leaf's twice-yearly community meetings, where neighbors learn what's happening and ask questions.",
    volunteersNeeded: 2,
    timeCommitment: "Seasonal, twice a year",
    filters: ["planning"],
    image: "/images/events/fall-community-meeting.svg",
    detail: {
      backLabel: "All volunteer opportunities",
      blocks: [
        { kind: "heading", text: "What you'd be doing", size: "h5" },
        {
          kind: "list",
          items: [
            "Helping choose the date, venue, and agenda for each community meeting",
            "Coordinating speakers and topics with the Board and other committees",
            "Promoting the meeting so neighbors know when and where to show up",
            "Helping the meeting run smoothly on the day, from setup to Q&A",
          ],
        },
        {
          kind: "paragraph",
          text: "Community meetings are one of the main ways Maple Leaf residents connect with the council directly, so this role is about making sure those two gatherings a year go well.",
        },
        {
          kind: "heading",
          text: "What it takes",
          size: "h5",
        },
        {
          kind: "list",
          items: [
            "Comfort coordinating logistics and communicating with speakers",
            "A few hours in the weeks leading up to each meeting, spring and fall",
          ],
        },
      ],
    },
    committee: "events",
  },
  {
    slug: "communications-designer",
    title: "Communications Designer",
    description:
      "Design graphics, flyers, and social posts that help the Communications Committee share council news with the neighborhood.",
    volunteersNeeded: 2,
    timeCommitment: "2 hours per month, as-needed",
    filters: ["communication", "online"],
    image: "/images/community-photos/community-meeting-a.webp",
    detail: {
      backLabel: "All volunteer opportunities",
      blocks: [
        { kind: "heading", text: "What you'd be doing", size: "h5" },
        {
          kind: "list",
          items: [
            "Designing graphics and flyers for events, meetings, and announcements",
            "Creating social media assets that match the council's look and voice",
            "Working with the Communications Committee to turn ideas into visuals",
          ],
        },
        {
          kind: "paragraph",
          text: "If you enjoy design, even casually, this is a flexible way to help. Work comes in as-needed around events and announcements rather than on a fixed schedule.",
        },
        {
          kind: "heading",
          text: "What it takes",
          size: "h5",
        },
        {
          kind: "list",
          items: [
            "Comfort with a design tool (Canva, Figma, or similar)",
            "About two hours a month, more around big events",
          ],
        },
      ],
    },
    committee: "communications",
  },
  {
    slug: "newsletter-layout-apprentice",
    title: "Newsletter Layout Apprentice",
    description:
      "Learn the ropes of laying out the Leaflet alongside our longtime designer, Laurie, with an eye toward taking on more over time.",
    volunteersNeeded: 1,
    timeCommitment: "3 hours per month",
    filters: ["communication", "online"],
    image: "/images/leaflet/leaflet.webp",
    detail: {
      backLabel: "All volunteer opportunities",
      blocks: [
        { kind: "heading", text: "What you'd be doing", size: "h5" },
        {
          kind: "list",
          items: [
            "Working alongside Laurie to lay out each issue of the Leaflet",
            "Learning the templates, fonts, and style the newsletter uses",
            "Gradually taking on more of the layout work as you get comfortable",
          ],
        },
        {
          kind: "paragraph",
          text: "This is an apprenticeship, not a solo role. Laurie has laid out the Leaflet for years and is looking for someone to learn alongside her so the newsletter has backup and, eventually, a succession plan.",
        },
        {
          kind: "heading",
          text: "What it takes",
          size: "h5",
        },
        {
          kind: "list",
          items: [
            "Basic comfort with layout or design software, or eagerness to learn",
            "About three hours a month around each issue's deadline",
            "Patience for a gradual, hands-on learning process",
          ],
        },
      ],
    },
    committee: "newsletter",
  },
  {
    slug: "poster-and-sign-distributor",
    title: "Poster & Sign Distributor",
    description:
      "Put up fresh signs and posters around your neighborhood block each month, and take down the old ones.",
    volunteersNeeded: 6,
    timeCommitment: "1 hour per month",
    filters: ["communication", "single-day-events"],
    image: "/images/community-photos/photo-jun-11-2025.jpg",
    detail: {
      backLabel: "All volunteer opportunities",
      blocks: [
        { kind: "heading", text: "What you'd be doing", size: "h5" },
        {
          kind: "list",
          items: [
            "Picking up new signs or posters roughly once a month",
            "Putting them up at community boards and approved spots in your area",
            "Taking down outdated signs so boards stay current",
          ],
        },
        {
          kind: "paragraph",
          text: "This is a light, low-commitment way to help spread the word about events and news, perfect if you're already walking your neighborhood regularly.",
        },
        {
          kind: "heading",
          text: "What it takes",
          size: "h5",
        },
        {
          kind: "list",
          items: [
            "A specific area of the neighborhood you're willing to cover",
            "About an hour a month",
          ],
        },
      ],
    },
    committee: "communications",
  },
  {
    slug: "leaflet-logistics-coordinator",
    title: "Leaflet Logistics Coordinator",
    description:
      "Help coordinate the logistics of getting each issue of the Leaflet delivered door to door across Maple Leaf.",
    volunteersNeeded: 2,
    timeCommitment: "2 hours per distribution cycle",
    filters: ["planning", "communication"],
    image: "/images/leaflet/leaflet.webp",
    detail: {
      backLabel: "All volunteer opportunities",
      blocks: [
        { kind: "heading", text: "What you'd be doing", size: "h5" },
        {
          kind: "list",
          items: [
            "Helping organize routes and route captains for each Leaflet distribution",
            "Tracking which routes are covered and which still need a volunteer",
            "Coordinating pickup and drop-off logistics for printed issues",
            "Troubleshooting on distribution day when something needs adjusting",
          ],
        },
        {
          kind: "paragraph",
          text: "More than 50 volunteers help deliver the Leaflet each issue, and this role is about keeping that whole operation organized behind the scenes.",
        },
        {
          kind: "heading",
          text: "What it takes",
          size: "h5",
        },
        {
          kind: "list",
          items: [
            "Comfort coordinating a list of volunteers and routes",
            "About two hours around each distribution cycle",
          ],
        },
      ],
    },
    committee: "newsletter",
  },
  {
    slug: "website-and-tech-volunteer",
    title: "Website & Tech Volunteer",
    description:
      "Help maintain the council's website and admin dashboard, and keep our various API integrations running smoothly.",
    volunteersNeeded: 2,
    timeCommitment: "2 hours per month, as-needed",
    filters: ["online"],
    image: "/images/community-photos/maple-leaf.jpg",
    detail: {
      backLabel: "All volunteer opportunities",
      blocks: [
        { kind: "heading", text: "What you'd be doing", size: "h5" },
        {
          kind: "list",
          items: [
            "Helping maintain and update the council's public website",
            "Making small updates to the internal admin dashboard as needs come up",
            "Keeping an eye on integrations with the tools and APIs the council relies on",
          ],
        },
        {
          kind: "paragraph",
          text: "This is a great fit for a neighbor comfortable with code or 'vibe coding' with modern AI tools, who wants to help keep the council's digital tools working well without needing to be online full time.",
        },
        {
          kind: "heading",
          text: "What it takes",
          size: "h5",
        },
        {
          kind: "list",
          items: [
            "Basic web or software familiarity, comfort picking things up with AI-assisted tools",
            "About two hours a month, more if something breaks",
          ],
        },
      ],
    },
    committee: "communications",
  },
  {
    slug: "north-gate-park-bulletin-board-keeper",
    title: "North Gate Park Bulletin Board Keeper",
    description:
      "Stop by the community bulletin board at North Gate Park once a week to clear out old flyers and post new ones.",
    volunteersNeeded: 1,
    timeCommitment: "30 minutes per week",
    filters: ["communication", "single-day-events"],
    image: "/images/community-photos/img-9152.jpg",
    detail: {
      backLabel: "All volunteer opportunities",
      blocks: [
        { kind: "heading", text: "What you'd be doing", size: "h5" },
        {
          kind: "list",
          items: [
            "Visiting the North Gate Park bulletin board about once a week",
            "Removing outdated or expired flyers",
            "Making sure new event and council flyers get posted",
          ],
        },
        {
          kind: "paragraph",
          text: "A quick, simple way to help if you're already near North Gate Park regularly. Keeping the board fresh helps neighbors trust it as a reliable source of what's happening.",
        },
        {
          kind: "heading",
          text: "What it takes",
          size: "h5",
        },
        {
          kind: "list",
          items: ["A short weekly walk by the board", "About 30 minutes a week"],
        },
      ],
    },
    committee: "communications",
  },
  {
    slug: "newsletter-co-chair",
    title: "Newsletter Co-Chair",
    description:
      "Apprentice alongside the Newsletter Committee lead, helping write, design, and coordinate delivery of the Leaflet with an eye toward eventually stepping up.",
    volunteersNeeded: 1,
    timeCommitment: "2 hours per month, 1-2 year commitment",
    filters: ["planning", "communication"],
    image: "/images/leaflet/leaflet.webp",
    detail: {
      backLabel: "All volunteer opportunities",
      blocks: [
        { kind: "heading", text: "What you'd be doing", size: "h5" },
        {
          kind: "list",
          items: [
            "Working alongside the Newsletter Committee chair on each issue of the Leaflet",
            "Learning how content, design, and distribution come together for the newsletter",
            "Taking on more responsibility over time, so the committee always has continuity",
          ],
        },
        {
          kind: "paragraph",
          text: "Every MLCC committee needs a co-chair: someone apprenticing alongside the current lead so committees don't depend on any one person indefinitely. This role lets longtime volunteers eventually roll off while the work keeps going.",
        },
        {
          kind: "heading",
          text: "What it takes",
          size: "h5",
        },
        {
          kind: "list",
          items: [
            "Interest in newsletters, writing, or layout",
            "About two hours a month, and a willingness to commit for a year or two",
          ],
        },
      ],
    },
    committee: "newsletter",
  },
  {
    slug: "events-co-chair",
    title: "Events Co-Chair",
    description:
      "Apprentice alongside the Events Committee lead, helping plan neighborhood traditions with an eye toward eventually stepping up.",
    volunteersNeeded: 1,
    timeCommitment: "2 hours per month, 1-2 year commitment",
    filters: ["planning"],
    image: "/images/community-photos/summer-social-2024-1.webp",
    detail: {
      backLabel: "All volunteer opportunities",
      blocks: [
        { kind: "heading", text: "What you'd be doing", size: "h5" },
        {
          kind: "list",
          items: [
            "Working alongside the Events Committee chair across the year's events",
            "Learning the logistics behind the Summer Social, Halloween Parade, and more",
            "Taking on more responsibility over time, so the committee always has continuity",
          ],
        },
        {
          kind: "paragraph",
          text: "Every MLCC committee needs a co-chair: someone apprenticing alongside the current lead so committees don't depend on any one person indefinitely. This role lets longtime volunteers eventually roll off while the work keeps going.",
        },
        {
          kind: "heading",
          text: "What it takes",
          size: "h5",
        },
        {
          kind: "list",
          items: [
            "Interest in event planning and logistics",
            "About two hours a month, and a willingness to commit for a year or two",
          ],
        },
      ],
    },
    committee: "events",
  },
  {
    slug: "emergency-hub-response-volunteer",
    title: "Help on the Day",
    description:
      "Get some basic training and show up to help neighbors when disaster strikes, no prior experience needed.",
    volunteersNeeded: 10,
    timeCommitment: "Basic training, then on-call",
    filters: ["single-day-events"],
    image: "/images/community-photos/img-9152.jpg",
    committee: "emergency-hub",
    detail: {
      backLabel: "All volunteer opportunities",
      blocks: [
        { kind: "heading", text: "What you'd be doing", size: "h5" },
        {
          kind: "list",
          items: [
            "Attending a short, basic training session on how the Hub activates and operates",
            "Showing up to help staff the Hub if a major earthquake or other emergency hits",
            "Helping neighbors share information, find resources, and stay calm in the first hours and days",
          ],
        },
        {
          kind: "heading",
          text: "Who this is for",
          size: "h5",
        },
        {
          kind: "paragraph",
          text: "This is the easiest way to be ready to help when it matters most. You don't need special skills or a lot of spare time, just a willingness to learn the basics now so you're ready to show up later.",
        },
        {
          kind: "heading",
          text: "What it takes",
          size: "h5",
        },
        {
          kind: "list",
          items: [
            "A couple hours for an initial training",
            "Willingness to be on-call and show up if an emergency happens",
          ],
        },
      ],
    },
  },
  {
    slug: "emergency-hub-volunteer",
    title: "Take on a Hub Role",
    description:
      "Keep the Emergency Hub running year-round: outreach, supplies, radio operations, teaching prep skills, events, and more.",
    volunteersNeeded: 6,
    timeCommitment: "A few hours a month, flexible",
    filters: ["planning"],
    image: "/images/community-photos/community-meeting-c.webp",
    committee: "emergency-hub",
    detail: {
      backLabel: "All volunteer opportunities",
      blocks: [
        { kind: "heading", text: "What you'd be doing", size: "h5" },
        {
          kind: "list",
          items: [
            "Picking an area that fits you: outreach, managing supplies, radio operations, teaching prep skills, or helping run events",
            "Keeping the Hub and its supply box organized and ready year-round",
            "Working alongside other Hub volunteers to build Maple Leaf's neighbor-to-neighbor network",
          ],
        },
        {
          kind: "heading",
          text: "Who this is for",
          size: "h5",
        },
        {
          kind: "paragraph",
          text: "You don't need special skills or training to start. Whether you like meeting neighbors, organizing supplies, or teaching a preparedness skill, there's a role that fits how you want to help.",
        },
        {
          kind: "heading",
          text: "What it takes",
          size: "h5",
        },
        {
          kind: "list",
          items: [
            "Interest in one or more areas: outreach, supplies, radio, teaching, or events",
            "A few hours a month, with flexibility on when and how",
          ],
        },
      ],
    },
  },
  {
    slug: "emergency-hub-co-chair",
    title: "Emergency Hub Co-Chair",
    description:
      "Apprentice alongside the Emergency Hub Committee lead, helping Maple Leaf prepare for emergencies with an eye toward eventually stepping up.",
    volunteersNeeded: 1,
    timeCommitment: "2 hours per month, 1-2 year commitment",
    filters: ["planning"],
    image: "/images/community-photos/community-meeting-d.webp",
    detail: {
      backLabel: "All volunteer opportunities",
      blocks: [
        { kind: "heading", text: "What you'd be doing", size: "h5" },
        {
          kind: "list",
          items: [
            "Working alongside the Emergency Hub Committee chair on preparedness efforts",
            "Learning how hub sites and neighbor-to-neighbor networks are organized",
            "Taking on more responsibility over time, so the committee always has continuity",
          ],
        },
        {
          kind: "paragraph",
          text: "Every MLCC committee needs a co-chair: someone apprenticing alongside the current lead so committees don't depend on any one person indefinitely. This role lets longtime volunteers eventually roll off while the work keeps going.",
        },
        {
          kind: "heading",
          text: "What it takes",
          size: "h5",
        },
        {
          kind: "list",
          items: [
            "Interest in emergency preparedness",
            "About two hours a month, and a willingness to commit for a year or two",
          ],
        },
      ],
    },
    committee: "emergency-hub",
  },
  {
    slug: "communications-co-chair",
    title: "Communications Co-Chair",
    description:
      "Apprentice alongside the Communications Committee lead, helping share council news with an eye toward eventually stepping up.",
    volunteersNeeded: 1,
    timeCommitment: "2 hours per month, 1-2 year commitment",
    filters: ["planning", "communication"],
    image: "/images/community-photos/community-meeting-a.webp",
    detail: {
      backLabel: "All volunteer opportunities",
      blocks: [
        { kind: "heading", text: "What you'd be doing", size: "h5" },
        {
          kind: "list",
          items: [
            "Working alongside the Communications Committee chair on email, social, and outreach",
            "Learning how the council shapes and shares its public voice",
            "Taking on more responsibility over time, so the committee always has continuity",
          ],
        },
        {
          kind: "paragraph",
          text: "Every MLCC committee needs a co-chair: someone apprenticing alongside the current lead so committees don't depend on any one person indefinitely. This role lets longtime volunteers eventually roll off while the work keeps going.",
        },
        {
          kind: "heading",
          text: "What it takes",
          size: "h5",
        },
        {
          kind: "list",
          items: [
            "Interest in writing and community communications",
            "About two hours a month, and a willingness to commit for a year or two",
          ],
        },
      ],
    },
    committee: "communications",
  },
  {
    slug: "advocacy-co-chair",
    title: "Advocacy Co-Chair",
    description:
      "Apprentice alongside the Advocacy Committee lead, helping give Maple Leaf a voice on city policy with an eye toward eventually stepping up.",
    volunteersNeeded: 1,
    timeCommitment: "2 hours per month, 1-2 year commitment",
    filters: ["planning"],
    image: "/images/community-photos/maple-leaf.jpg",
    detail: {
      backLabel: "All volunteer opportunities",
      blocks: [
        { kind: "heading", text: "What you'd be doing", size: "h5" },
        {
          kind: "list",
          items: [
            "Working alongside the Advocacy Committee chair on policy and zoning issues",
            "Learning how the council engages with the city and organizes community input",
            "Taking on more responsibility over time, so the committee always has continuity",
          ],
        },
        {
          kind: "paragraph",
          text: "Every MLCC committee needs a co-chair: someone apprenticing alongside the current lead so committees don't depend on any one person indefinitely. This role lets longtime volunteers eventually roll off while the work keeps going.",
        },
        {
          kind: "heading",
          text: "What it takes",
          size: "h5",
        },
        {
          kind: "list",
          items: [
            "Interest in local policy and civic engagement",
            "About two hours a month, and a willingness to commit for a year or two",
          ],
        },
      ],
    },
    committee: "advocacy",
  },
  {
    slug: "business-committee-co-chair",
    title: "Business Committee Co-Chair",
    description:
      "Apprentice alongside the Business Committee lead, helping build ties with local businesses with an eye toward eventually stepping up.",
    volunteersNeeded: 1,
    timeCommitment: "2 hours per month, 1-2 year commitment",
    filters: ["planning"],
    image: "/images/community-photos/love-your-neighbor.webp",
    detail: {
      backLabel: "All volunteer opportunities",
      blocks: [
        { kind: "heading", text: "What you'd be doing", size: "h5" },
        {
          kind: "list",
          items: [
            "Working alongside the Business Committee chair to build relationships with local businesses",
            "Learning how the council connects events and neighbors with the business community",
            "Taking on more responsibility over time, so the committee always has continuity",
          ],
        },
        {
          kind: "paragraph",
          text: "Every MLCC committee needs a co-chair: someone apprenticing alongside the current lead so committees don't depend on any one person indefinitely. This role lets longtime volunteers eventually roll off while the work keeps going.",
        },
        {
          kind: "heading",
          text: "What it takes",
          size: "h5",
        },
        {
          kind: "list",
          items: [
            "Interest in local business and community relationships",
            "About two hours a month, and a willingness to commit for a year or two",
          ],
        },
      ],
    },
    committee: "business-committee",
  },
];

export function getVolunteerOpportunity(slug: string): VolunteerOpportunity | undefined {
  return volunteerOpportunities.find((opportunity) => opportunity.slug === slug);
}

export function getVolunteerOpportunitiesByCommittee(
  committee: CommitteeListingSlug,
): VolunteerOpportunity[] {
  return volunteerOpportunities.filter((opportunity) => opportunity.committee === committee);
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
