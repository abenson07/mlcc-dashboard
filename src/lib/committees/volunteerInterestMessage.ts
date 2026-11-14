/**
 * Builds the Slack message for public committee / volunteer signups.
 *
 * Every signup lands in one shared channel, so the message itself has to say
 * (a) what kind of signup it is and (b) which committee / role it is for.
 */

export type VolunteerInterestKind =
  | "committee-join"
  | "volunteer-role"
  | "volunteer-general"
  | "meeting-rsvp"
  | "zoning-workshop";

export type VolunteerInterestInput = {
  source: unknown;
  name: string;
  contact: string;
  committeeName?: string | null;
  opportunityTitle?: string | null;
};

/** Escape the characters Slack treats as control sequences (&, <, >). */
export function escapeSlack(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function classifyVolunteerInterest(
  source: unknown,
  opportunityTitle?: string | null,
): VolunteerInterestKind {
  switch (source) {
    case "volunteer-opportunity":
      return opportunityTitle?.trim() ? "volunteer-role" : "volunteer-general";
    case "meeting-signup":
      return "meeting-rsvp";
    case "zoning-workshop":
      return "zoning-workshop";
    default:
      // "join-card" and anything unrecognised: someone asking to join a committee.
      return "committee-join";
  }
}

export function buildVolunteerInterestMessage(input: VolunteerInterestInput): string {
  const committee = input.committeeName?.trim() || "";
  const role = input.opportunityTitle?.trim() || "";
  const kind = classifyVolunteerInterest(input.source, role);

  const committeeLabel = committee ? escapeSlack(committee) : "";
  const committeeValue = committeeLabel || "Not tied to a specific committee";
  const roleLabel = escapeSlack(role);

  let headline: string;
  const details: string[] = [];

  switch (kind) {
    case "committee-join":
      headline = committeeLabel
        ? `:busts_in_silhouette: *Wants to JOIN a committee:* ${committeeLabel}`
        : `:busts_in_silhouette: *Wants to JOIN a committee* (committee not specified)`;
      details.push(`*Committee:* ${committeeValue}`);
      break;
    case "volunteer-role":
      headline = `:raising_hand: *Signed up for a specific volunteer role:* ${roleLabel}`;
      details.push(`*Role:* ${roleLabel}`);
      details.push(`*Committee:* ${committeeValue}`);
      break;
    case "volunteer-general":
      headline = committeeLabel
        ? `:wave: *General volunteer interest* (no specific role) for the ${committeeLabel} committee`
        : `:wave: *General volunteer interest* (no specific role or committee)`;
      details.push(`*Committee:* ${committeeValue}`);
      break;
    case "meeting-rsvp":
      headline = committeeLabel
        ? `:calendar: *Meeting RSVP* for the ${committeeLabel} committee`
        : `:calendar: *Meeting RSVP*`;
      details.push(`*Committee:* ${committeeValue}`);
      break;
    case "zoning-workshop":
      headline = `:calendar: *Would like to attend a zoning workshop*`;
      if (committeeLabel) details.push(`*Committee:* ${committeeLabel}`);
      break;
  }

  details.push(`*Name:* ${escapeSlack(input.name)}`);
  details.push(`*Contact:* ${escapeSlack(input.contact)}`);

  return [headline, ...details].join("\n");
}
