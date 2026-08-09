"use client";

import { Calendar, CircleDot, DollarSign, Globe, Mail, MapPin, Phone, UserRound } from "lucide-react";
import { SideContentSection, SideContentField } from "@/components/patterns/foundation/side-content";
import type { BusinessWithDetails } from "hooks";
import { BusinessMembershipStatusToken } from "./BusinessMembershipStatusToken";
import { normalizeMembershipStatus } from "./adapters";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function formatDisplayDate(value: string | null | undefined): string {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return "—";
  }
}

/** Contact info — always shown, each field only if set. */
export function DetailsSection({ business }: { business: BusinessWithDetails }) {
  return (
    <SideContentSection title="Details">
      {business.contact_name ? (
        <SideContentField icon={<UserRound size={16} strokeWidth={1.75} />} label={business.contact_name} />
      ) : null}
      {business.phone ? <SideContentField icon={<Phone size={16} strokeWidth={1.75} />} label={business.phone} /> : null}
      {business.email ? <SideContentField icon={<Mail size={16} strokeWidth={1.75} />} label={business.email} /> : null}
      {business.address ? <SideContentField icon={<MapPin size={16} strokeWidth={1.75} />} label={business.address} /> : null}
      {business.website ? <SideContentField icon={<Globe size={16} strokeWidth={1.75} />} label={business.website} /> : null}
    </SideContentSection>
  );
}

/** Only renders when the business has a linked business_memberships record. */
export function MembershipSection({ business }: { business: BusinessWithDetails }) {
  const membership = business.membership;
  if (!membership) return null;

  return (
    <SideContentSection title="Membership">
      <SideContentField
        icon={<CircleDot size={16} strokeWidth={1.75} />}
        endContent={<BusinessMembershipStatusToken status={normalizeMembershipStatus(membership.status)} />}
        label="Status"
      />
      <SideContentField icon={<Calendar size={16} strokeWidth={1.75} />} label={`Renews ${formatDisplayDate(membership.last_renewal)}`} />
    </SideContentSection>
  );
}

/** Only renders when the business has sponsorship records. */
export function SponsorshipHistorySection({ business }: { business: BusinessWithDetails }) {
  const sponsorships = business.sponsorships ?? [];
  if (sponsorships.length === 0) return null;

  return (
    <SideContentSection title="Sponsorship history">
      {sponsorships.map((sponsorship) => (
        <SideContentField
          key={sponsorship.id}
          icon={<DollarSign size={16} strokeWidth={1.75} />}
          label={`${currencyFormatter.format(sponsorship.amount ?? 0)}${sponsorship.status ? ` · ${sponsorship.status}` : ""}`}
          endContent={
            sponsorship.paid_date ? (
              <span style={{ fontSize: 12, color: "var(--linear-color-ink-subtle)" }}>
                {formatDisplayDate(sponsorship.paid_date)}
              </span>
            ) : undefined
          }
        />
      ))}
    </SideContentSection>
  );
}
