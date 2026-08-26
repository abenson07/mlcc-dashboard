"use client";

import { Avatar } from "@/components/patterns/primitives/Avatar";
import { Button } from "@/components/patterns/primitives/Button";
import { DetailActionBar } from "@/components/patterns/foundation/detail";
import { VStack } from "@/components/patterns/primitives/Stack";
import { Text } from "@/components/patterns/primitives/Text";
import type { BusinessWithDetails } from "hooks";
import type { BusinessesUpdate, BusinessMembershipsUpdate } from "@/types/database";
import type { BusinessMemberRow } from "./types";
import { BUSINESS_MEMBERSHIP_TIER } from "./adapters";
import { DetailsSection, MembershipSection, SponsorshipHistorySection } from "./BusinessSections";

export type BusinessMemberDetailPanelProps = {
  businessMember: BusinessMemberRow;
  business: BusinessWithDetails;
  onUpdateBusiness: (data: BusinessesUpdate) => void | Promise<void>;
  onUpdateMembership: (data: BusinessMembershipsUpdate) => void | Promise<void>;
  onStartMembership: () => void | Promise<void>;
};

/** Business member detail — shown in the outlined side panel when a row is selected. */
export function BusinessMemberDetailPanel({
  businessMember,
  business,
  onUpdateBusiness,
  onUpdateMembership,
  onStartMembership,
}: BusinessMemberDetailPanelProps) {
  const hasMembership = Boolean(business.membership);

  return (
    <VStack gap={5}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Avatar name={businessMember.businessName} size="md" />
        <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
          <Text weight="medium">{businessMember.businessName}</Text>
          <Text size="sm" color="secondary">
            {hasMembership ? BUSINESS_MEMBERSHIP_TIER : "Flagged as member — no membership record"}
          </Text>
        </div>
      </div>

      {hasMembership ? null : (
        <DetailActionBar>
          <Button label="Start membership" variant="primary" onClick={() => void onStartMembership()} />
        </DetailActionBar>
      )}

      <DetailsSection business={business} onCommit={onUpdateBusiness} />
      <MembershipSection business={business} onCommit={onUpdateMembership} />
      <SponsorshipHistorySection business={business} />
    </VStack>
  );
}
