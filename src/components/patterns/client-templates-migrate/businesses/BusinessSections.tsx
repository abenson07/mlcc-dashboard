"use client";

import { DetailField, DetailRow, DetailSection, DetailSelectField } from "@/components/patterns/foundation/detail";
import type { BusinessWithDetails } from "hooks";
import type { BusinessesUpdate, BusinessMembershipsUpdate } from "@/types/database";
import { BUSINESS_MEMBERSHIP_TIER, parseAnnualDues } from "./adapters";
import { MEMBERSHIP_STATUSES, formatMembershipDate, toMembershipStatus } from "@/lib/memberships/status";

const MEMBERSHIP_STATUS_OPTIONS = MEMBERSHIP_STATUSES.map((status) => ({
  value: status,
  label: status,
}));

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

/** Contact info — editable inline, each field committing on blur. */
export function DetailsSection({
  business,
  onCommit,
}: {
  business: BusinessWithDetails;
  onCommit: (data: BusinessesUpdate) => void | Promise<void>;
}) {
  return (
    <DetailSection title="Details" isFirst>
      <DetailField
        label="Contact name"
        value={business.contact_name ?? ""}
        onCommit={(next) => onCommit({ contact_name: next.trim() || null })}
      />
      <DetailField
        label="Phone"
        value={business.phone ?? ""}
        onCommit={(next) => onCommit({ phone: next.trim() || null })}
      />
      <DetailField
        label="Email"
        value={business.email ?? ""}
        onCommit={(next) => onCommit({ email: next.trim() || null })}
      />
      <DetailField
        label="Address"
        value={business.address ?? ""}
        onCommit={(next) => onCommit({ address: next.trim() || null })}
      />
      <DetailField
        label="Website"
        value={business.website ?? ""}
        onCommit={(next) => onCommit({ website: next.trim() || null })}
      />
    </DetailSection>
  );
}

/** Only renders when the business has a linked business_memberships record. */
export function MembershipSection({
  business,
  onCommit,
}: {
  business: BusinessWithDetails;
  onCommit: (data: BusinessMembershipsUpdate) => void | Promise<void>;
}) {
  const membership = business.membership;
  if (!membership) return null;

  return (
    <DetailSection title="Membership">
      <DetailRow label="Type" value={BUSINESS_MEMBERSHIP_TIER} />
      <DetailSelectField
        label="Status"
        value={membership.status}
        options={MEMBERSHIP_STATUS_OPTIONS}
        onCommit={(next) => {
          const status = toMembershipStatus(next);
          if (status) void onCommit({ status });
        }}
      />
      <DetailField
        label="Annual dues"
        type="number"
        value={membership.annual_dues != null ? String(membership.annual_dues) : ""}
        placeholder="200"
        onCommit={(next) => onCommit({ annual_dues: parseAnnualDues(next) })}
      />
      <DetailField
        label="Last renewal"
        type="date"
        value={membership.last_renewal ?? ""}
        onCommit={(next) => {
          if (next) void onCommit({ last_renewal: next });
        }}
      />
    </DetailSection>
  );
}

/** Only renders when the business has sponsorship records. */
export function SponsorshipHistorySection({ business }: { business: BusinessWithDetails }) {
  const sponsorships = business.sponsorships ?? [];
  if (sponsorships.length === 0) return null;

  return (
    <DetailSection title="Sponsorship history">
      {sponsorships.map((sponsorship) => (
        <DetailRow
          key={sponsorship.id}
          label={sponsorship.status ? sponsorship.status : "Sponsorship"}
          valueContent={
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
              <span style={{ fontSize: 13, fontWeight: 510, color: "var(--linear-color-ink)" }}>
                {currencyFormatter.format(sponsorship.amount ?? 0)}
              </span>
              {sponsorship.paid_date ? (
                <span style={{ fontSize: 12, color: "var(--linear-color-ink-subtle)" }}>
                  {formatMembershipDate(sponsorship.paid_date) ?? "—"}
                </span>
              ) : null}
            </div>
          }
        />
      ))}
    </DetailSection>
  );
}
