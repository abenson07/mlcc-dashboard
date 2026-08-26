"use client";

import { deriveMembershipStatus } from "@/lib/memberships/status";
import type { BusinessMembershipStatus } from "./types";

export type BusinessMembershipStatusTokenProps = {
  status: BusinessMembershipStatus;
};

/** Colored status pill for a business membership row — same vocabulary as person memberships. */
export function BusinessMembershipStatusToken({ status }: BusinessMembershipStatusTokenProps) {
  const { label, color } =
    status === "none"
      ? { label: "No membership", color: "#8a8f98" }
      : deriveMembershipStatus({
          status,
          cancel_at_period_end: false,
          current_period_end: null,
        });

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
