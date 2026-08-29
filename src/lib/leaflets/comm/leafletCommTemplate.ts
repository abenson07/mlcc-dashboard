export type LeafletCommVariableKey =
  | "firstName"
  | "leafletTitle"
  | "distributionDate"
  | "routes"
  | "actionUrl";

export type LeafletCommSegment =
  | { type: "text"; text: string }
  | { type: "var"; key: LeafletCommVariableKey; label: string };

export type LeafletCommCopy = {
  heading: string;
  actionLabel: string;
  greeting: LeafletCommSegment[];
  intro: LeafletCommSegment[];
  routesHeading: string;
  pasteLinkLead: string;
};

const FIRST_NAME: LeafletCommSegment = { type: "var", key: "firstName", label: "First name" };
const TITLE: LeafletCommSegment = { type: "var", key: "leafletTitle", label: "Leaflet title" };
const DATE: LeafletCommSegment = { type: "var", key: "distributionDate", label: "Distribution date" };

const PASTE_LINK = "If the button doesn’t work, copy and paste this link:";

export function leafletCommCopy(stepKey: string): LeafletCommCopy {
  const greeting: LeafletCommSegment[] = [
    { type: "text", text: "Hi " },
    FIRST_NAME,
    { type: "text", text: "," },
  ];

  if (stepKey === "confirmation_followup") {
    return {
      heading: "We still need you to confirm",
      actionLabel: "Confirm or respond",
      greeting,
      intro: [
        { type: "text", text: "We haven’t heard back yet. Please confirm your routes for the " },
        TITLE,
        { type: "text", text: " leaflet on " },
        DATE,
        { type: "text", text: "." },
      ],
      routesHeading: "Your routes",
      pasteLinkLead: PASTE_LINK,
    };
  }

  if (stepKey === "pre_distribution_reminder") {
    return {
      heading: "Distribution is coming up",
      actionLabel: "View your routes",
      greeting,
      intro: [
        { type: "text", text: "The " },
        TITLE,
        { type: "text", text: " leaflet goes out on " },
        DATE,
        {
          type: "text",
          text: ". You can pick up your packets at Project9 Brewing. Here are the routes you’re covering.",
        },
      ],
      routesHeading: "Your routes",
      pasteLinkLead: PASTE_LINK,
    };
  }

  if (stepKey === "delivery_complete_prompt" || stepKey === "completion_followup") {
    return {
      heading: "Report delivery complete",
      actionLabel: "Mark delivered",
      greeting,
      intro: [
        { type: "text", text: "Thanks for helping deliver the " },
        TITLE,
        { type: "text", text: " leaflet on " },
        DATE,
        { type: "text", text: ". When you’re finished, let us know using the link below." },
      ],
      routesHeading: "Your routes",
      pasteLinkLead: PASTE_LINK,
    };
  }

  return {
    heading: "Confirm your delivery routes",
    actionLabel: "Confirm or respond",
    greeting,
    intro: [
      { type: "text", text: "You’re scheduled to help deliver the " },
      TITLE,
      { type: "text", text: " leaflet on " },
      DATE,
      { type: "text", text: "." },
    ],
    routesHeading: "Your routes",
    pasteLinkLead: PASTE_LINK,
  };
}

export function firstNameFromFullName(fullName: string): string {
  const first = fullName.trim().split(/\s+/)[0];
  return first || fullName;
}

export function formatLeafletCommDate(iso: string): string {
  if (!iso) return "";
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function actionUrlTooltip(personName: string): string {
  const first = firstNameFromFullName(personName);
  return `Unique confirm link for ${first}`;
}
