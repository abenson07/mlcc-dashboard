"use client";

import { Calendar, Mail, MapPin, Phone, Shield, Sparkles, Tag } from "lucide-react";
import { SideContentSection, SideContentField } from "@/components/patterns/foundation/side-content";
import type { PersonWithMembership } from "hooks";
import { VOLUNTEERED_BEFORE_TAG } from "./adapters";

function formatDisplayDate(value: string | null | undefined): string {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return "—";
  }
}

/** Email, phone, address — always shown since a person always has at least an email. */
export function ContactSection({ person }: { person: PersonWithMembership }) {
  return (
    <SideContentSection title="Contact">
      <SideContentField icon={<Mail size={16} strokeWidth={1.75} />} label={person.email ?? "—"} />
      {person.phone ? <SideContentField icon={<Phone size={16} strokeWidth={1.75} />} label={person.phone} /> : null}
      {person.address ? <SideContentField icon={<MapPin size={16} strokeWidth={1.75} />} label={person.address} /> : null}
      {person.is_executive_board ? (
        <SideContentField icon={<Shield size={16} strokeWidth={1.75} />} label="Executive board" />
      ) : null}
    </SideContentSection>
  );
}

/** Only renders when the person has a linked membership record. */
export function MembershipSection({ person }: { person: PersonWithMembership }) {
  const membership = person.membership;
  if (!membership) return null;

  return (
    <SideContentSection title="Membership">
      {membership.tier ? <SideContentField icon={<Tag size={16} strokeWidth={1.75} />} label={membership.tier} /> : null}
      {membership.status ? <SideContentField icon={<Sparkles size={16} strokeWidth={1.75} />} label={membership.status} /> : null}
      <SideContentField
        icon={<Calendar size={16} strokeWidth={1.75} />}
        label={`Member since ${formatDisplayDate(membership.start_date ?? membership.last_renewal)}`}
      />
    </SideContentSection>
  );
}

/** Only renders when the person is tagged/rostered as a volunteer. */
export function VolunteerSection({ person }: { person: PersonWithMembership }) {
  const roles = person.roles ?? [];
  const tags = person.tags ?? [];
  const isVolunteer = roles.some((role) => role.toLowerCase() === "volunteer");
  if (!isVolunteer) return null;

  const hasVolunteeredBefore = tags.includes(VOLUNTEERED_BEFORE_TAG);
  const interestArea = tags.find((tag) => tag !== VOLUNTEERED_BEFORE_TAG);

  return (
    <SideContentSection title="Volunteering">
      <SideContentField
        icon={<Sparkles size={16} strokeWidth={1.75} />}
        label={hasVolunteeredBefore ? "Has volunteered before" : "Interested, not yet volunteered"}
      />
      {interestArea ? <SideContentField icon={<Tag size={16} strokeWidth={1.75} />} label={interestArea} /> : null}
    </SideContentSection>
  );
}
