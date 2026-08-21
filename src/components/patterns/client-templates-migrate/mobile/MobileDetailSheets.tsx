"use client";

import { useState } from "react";
import type { PersonWithMembership, BusinessWithDetails } from "hooks";
import { MobileBottomSheet } from "./MobileBottomSheet";
import {
  MobileLogCashMembership,
  MobileLogDonation,
} from "./MobileQuickActions";
import { mobilePrimaryBtnStyle, mobileSecondaryBtnStyle } from "./mobileStyles";
import { CancelMembershipModal } from "../people/CancelMembershipModal";
import { toast } from "sonner";
import { getApiBase } from "@/lib/apiBase";
import { supabaseClient } from "@/lib/supabaseClient";
import { formatMembershipDate } from "@/lib/memberships/status";
import type { CancelMode } from "@/lib/memberships/cancelMembership";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span style={{ fontSize: 12, color: "var(--linear-color-ink-subtle)" }}>{label}</span>
      <span style={{ fontSize: 15, fontWeight: 500 }}>{value || "—"}</span>
    </div>
  );
}

export type MobilePersonSheetProps = {
  person: PersonWithMembership | null;
  onClose: () => void;
  onRefetch?: () => void;
};

export function MobilePersonSheet({ person, onClose, onRefetch }: MobilePersonSheetProps) {
  const [cashOpen, setCashOpen] = useState(false);
  const [donationOpen, setDonationOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [lastPaymentAmount, setLastPaymentAmount] = useState<number | null>(null);
  const isMember = Boolean(person?.membership_id);

  async function openCancel() {
    const membershipId = person?.membership?.id;
    setLastPaymentAmount(null);
    if (membershipId && supabaseClient) {
      const { data } = await supabaseClient
        .from("payments")
        .select("amount")
        .eq("membership_id", membershipId)
        .order("date", { ascending: false })
        .limit(1)
        .maybeSingle();
      setLastPaymentAmount((data?.amount as number | undefined) ?? null);
    }
    setCancelOpen(true);
  }

  async function handleCancel(mode: CancelMode) {
    const membership = person?.membership;
    if (!person || !membership) return;
    const name = person.full_name ?? "This member";

    setCancelling(true);
    try {
      const response = await fetch(
        `${getApiBase()}/api/admin/memberships/${encodeURIComponent(membership.id)}/cancel`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode }),
        }
      );
      const data = (await response.json()) as {
        error?: string;
        endsOn?: string | null;
        refundAmount?: number | null;
        warning?: string | null;
      };
      if (!response.ok) throw new Error(data.error ?? "Failed to cancel membership");

      if (data.warning) {
        toast.warning(data.warning);
      } else if (mode === "at_period_end") {
        const endsOn = formatMembershipDate(data.endsOn ?? null);
        toast.success(
          endsOn ? `${name}'s membership won't renew — it ends ${endsOn}` : `${name}'s membership won't renew`
        );
      } else {
        toast.success(
          data.refundAmount != null
            ? `${name}'s membership cancelled and $${data.refundAmount.toFixed(2)} refunded`
            : `${name}'s membership cancelled`
        );
      }
      setCancelOpen(false);
      await onRefetch?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to cancel membership");
    } finally {
      setCancelling(false);
    }
  }

  return (
    <>
      <MobileBottomSheet
        open={person != null}
        onClose={onClose}
        title={person?.full_name ?? "Person"}
      >
        {person ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Field label="Email" value={person.email ?? "—"} />
            <Field label="Phone" value={person.phone ?? "—"} />
            <Field label="Address" value={person.address ?? "—"} />
            <Field
              label="Membership"
              value={
                isMember
                  ? `${person.membership?.tier ?? "Member"} · ${person.membership?.status ?? "active"}`
                  : "Not a member"
              }
            />
            {person.roles?.length ? (
              <Field label="Roles" value={person.roles.join(", ")} />
            ) : null}

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
              {!isMember ? (
                <button type="button" style={mobilePrimaryBtnStyle} onClick={() => setCashOpen(true)}>
                  Make member (cash)
                </button>
              ) : null}
              <button
                type="button"
                style={isMember ? mobilePrimaryBtnStyle : mobileSecondaryBtnStyle}
                onClick={() => setDonationOpen(true)}
              >
                Log donation
              </button>
              {isMember && person.membership?.status !== "Cancelled" ? (
                <button type="button" style={mobileSecondaryBtnStyle} onClick={() => void openCancel()}>
                  Cancel membership
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </MobileBottomSheet>

      <MobileLogCashMembership
        open={cashOpen}
        person={person}
        onClose={() => setCashOpen(false)}
        onDone={() => {
          setCashOpen(false);
          onRefetch?.();
        }}
      />
      <MobileLogDonation
        open={donationOpen}
        personName={person?.full_name}
        onClose={() => setDonationOpen(false)}
      />
      {person?.membership ? (
        <CancelMembershipModal
          isOpen={cancelOpen}
          memberName={person.full_name ?? "This member"}
          endsOn={person.membership.current_period_end ?? null}
          lastPaymentAmount={lastPaymentAmount}
          isSubscription={Boolean(person.membership.is_subscription)}
          submitting={cancelling}
          onCancel={() => setCancelOpen(false)}
          onConfirm={(mode) => void handleCancel(mode)}
        />
      ) : null}
    </>
  );
}

export type MobileBusinessSheetProps = {
  business: BusinessWithDetails | null;
  onClose: () => void;
};

export function MobileBusinessSheet({ business, onClose }: MobileBusinessSheetProps) {
  return (
    <MobileBottomSheet
      open={business != null}
      onClose={onClose}
      title={business?.business_name ?? "Business"}
    >
      {business ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Field label="Contact" value={business.contact_name ?? "—"} />
          <Field label="Email" value={business.email ?? "—"} />
          <Field label="Phone" value={business.phone ?? "—"} />
          <Field label="Website" value={business.website ?? "—"} />
          <Field label="Member" value={business.is_member ? "Yes" : "No"} />
          <Field label="Past sponsor" value={business.is_past_sponsor ? "Yes" : "No"} />
        </div>
      ) : null}
    </MobileBottomSheet>
  );
}
