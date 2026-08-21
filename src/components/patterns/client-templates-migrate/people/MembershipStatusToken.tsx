"use client";

import { deriveMembershipStatus } from "@/lib/memberships/status";
import type { Memberships } from "@/types/database";

export type MembershipStatusTokenProps = {
  membership: Pick<Memberships, "status" | "cancel_at_period_end" | "current_period_end"> | null;
};

/**
 * Colored status pill for a membership. The label is always derived from the
 * record — there is no way to set it by hand, which is the point.
 */
export function MembershipStatusToken({ membership }: MembershipStatusTokenProps) {
  const { label, color } = deriveMembershipStatus(membership);

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 22,
        paddingInline: 8,
        borderRadius: 999,
        background: `${color}1A`,
        color,
        fontSize: 12,
        fontWeight: 500,
        lineHeight: "16px",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}
