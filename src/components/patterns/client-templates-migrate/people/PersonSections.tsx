"use client";

import { DetailField, DetailRow, DetailSection, DetailSelectField } from "@/components/patterns/foundation/detail";
import { MembershipStatusToken } from "./MembershipStatusToken";
import {
  MEMBERSHIP_TIER_OPTIONS,
  formatMembershipDate,
  toMembershipTier,
} from "@/lib/memberships/status";
import type { PersonWithMembership } from "hooks";
import type { PeopleUpdate, MembershipsUpdate } from "@/types/database";
import { VOLUNTEERED_BEFORE_TAG } from "./adapters";


function formatDisplayDate(value: string | null | undefined): string {
  return formatMembershipDate(value) ?? "—";
}

/** Email, phone, address — editable inline, each field committing on blur. */
export function ContactSection({
  person,
  onCommit,
}: {
  person: PersonWithMembership;
  onCommit: (data: PeopleUpdate) => void | Promise<void>;
}) {
  return (
    <DetailSection title="Contact" isFirst>
      <DetailField
        label="Email"
        value={person.email ?? ""}
        onCommit={(next) => onCommit({ email: next.trim() || null })}
      />
      <DetailField
        label="Phone"
        value={person.phone ?? ""}
        onCommit={(next) => onCommit({ phone: next.trim() || null })}
      />
      <DetailField
        label="Address"
        value={person.address ?? ""}
        onCommit={(next) => onCommit({ address: next.trim() || null })}
      />
      {person.is_executive_board ? <DetailRow label="Executive board" value="Yes" /> : null}
    </DetailSection>
  );
}

/** Only renders when the person has a linked membership record. */
export function MembershipSection({
  person,
  onCommit,
}: {
  person: PersonWithMembership;
  onCommit: (data: MembershipsUpdate) => void | Promise<void>;
}) {
  const membership = person.membership;
  if (!membership) return null;

  const renewsOn = formatMembershipDate(membership.current_period_end);
  const autoRenewLabel = !membership.is_subscription
    ? "Off — one-time membership"
    : membership.cancel_at_period_end
      ? renewsOn
        ? `Off — ends ${renewsOn}`
        : "Off — cancelled"
      : renewsOn
        ? `On — renews ${renewsOn}`
        : "On";

  return (
    <DetailSection title="Membership">
      <DetailSelectField
        label="Tier"
        value={membership.tier}
        options={MEMBERSHIP_TIER_OPTIONS}
        onCommit={(next) => {
          const tier = toMembershipTier(next);
          if (tier) onCommit({ tier });
        }}
      />
      {/*
        Status is derived, not typed in. It used to be a free-text dropdown whose
        options didn't exist in the database, so every edit failed silently — and
        even a successful edit only relabelled the row without touching Stripe.
        It now changes through real actions: cancelling, or a Stripe webhook.
      */}
      <DetailRow label="Status" valueContent={<MembershipStatusToken membership={membership} />} />
      <DetailRow
        label="Member since"
        value={formatDisplayDate(membership.start_date ?? membership.last_renewal)}
      />
      <DetailRow label="Auto-renew" value={autoRenewLabel} />
      {membership.last_renewal ? (
        <DetailRow label="Last renewed" value={formatDisplayDate(membership.last_renewal)} />
      ) : null}
    </DetailSection>
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
    <DetailSection title="Volunteering">
      <DetailRow
        label="Experience"
        value={hasVolunteeredBefore ? "Has volunteered before" : "Interested, not yet volunteered"}
      />
      {interestArea ? <DetailRow label="Interest area" value={interestArea} /> : null}
    </DetailSection>
  );
}
