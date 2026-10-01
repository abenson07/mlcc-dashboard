"use client";

import { useRef, useState } from "react";
import {
  formatUsd,
  parseDollarsToCents,
  PERSON_TIER_KEYS,
  tierCents,
  type CheckTierKey,
} from "@/lib/memberships/tierPricing";
import type { MembershipEntry, Payer } from "./checkEntryTypes";
import { MoneyInput } from "./MoneyInput";
import { PayerSearchSelect } from "./PayerSearchSelect";
import { DateDigitsInput, digitsToIso, isoToDigits, todayDigits } from "./DateDigitsInput";
import { cardStyle, fieldLabelStyle, linkButtonStyle } from "./checkEntryStyles";

type Props = {
  initial?: MembershipEntry;
  onConfirm: (entry: Omit<MembershipEntry, "key">) => void;
};

function centsToField(cents: number): string {
  return (cents / 100).toFixed(2);
}

function defaultTier(payer: Payer): CheckTierKey {
  return payer.kind === "business" ? "Business" : (payer.activeMembership?.tier ?? "Individual");
}

export function MembershipCheckCard({ initial, onConfirm }: Props) {
  const dateRef = useRef<HTMLInputElement>(null);
  const donationRef = useRef<HTMLInputElement>(null);
  const [payer, setPayer] = useState<Payer | null>(initial?.payer ?? null);
  const [digits, setDigits] = useState(initial ? isoToDigits(initial.date) : todayDigits());
  const [tier, setTier] = useState<CheckTierKey>(initial?.tier ?? "Individual");
  const [amount, setAmount] = useState(initial ? centsToField(initial.membershipCents) : "");
  const [showTiers, setShowTiers] = useState(false);
  const [showDonation, setShowDonation] = useState((initial?.donationCents ?? 0) > 0);
  const [donation, setDonation] = useState(initial?.donationCents ? centsToField(initial.donationCents) : "");
  const [attempted, setAttempted] = useState(false);

  const isoDate = digitsToIso(digits);
  const membershipCents = parseDollarsToCents(amount);
  const donationCents = donation.trim() ? parseDollarsToCents(donation) : 0;
  const donationInvalid = donation.trim() !== "" && donationCents == null;
  const valid = payer != null && isoDate != null && membershipCents != null && !donationInvalid;
  const isActive = payer?.activeMembership != null;

  function pickPayer(p: Payer) {
    const t = defaultTier(p);
    setPayer(p);
    setTier(t);
    setAmount(centsToField(tierCents(t)));
    setShowTiers(false);
    setTimeout(() => dateRef.current?.focus(), 0);
  }

  function changeTier(t: CheckTierKey) {
    setTier(t);
    setAmount(centsToField(tierCents(t)));
  }

  function submit() {
    setAttempted(true);
    if (!valid || !payer || !isoDate || membershipCents == null) return;
    onConfirm({
      kind: "membership",
      payer,
      date: isoDate,
      tier,
      membershipCents,
      donationCents: donationCents ?? 0,
    });
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: 20 }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 8, order: 0 }}>
        <span style={fieldLabelStyle}>Name</span>
        <PayerSearchSelect value={payer} onSelect={pickPayer} onClear={() => setPayer(null)} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, order: 0 }}>
        <span style={fieldLabelStyle}>Check date</span>
        <DateDigitsInput
          ref={dateRef}
          digits={digits}
          onChange={setDigits}
          invalid={attempted && isoDate == null}
        />
      </div>

      {payer ? (
        <div style={{ display: "contents" }}>
          <div
            style={{
              order: 1,
              borderRadius: 12,
              border: "var(--linear-border-width) solid var(--linear-color-hairline-strong)",
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>
                  {tier === "Business" ? "Business" : tier} membership
                </div>
                <div style={{ fontSize: 12, color: "var(--linear-color-ink-subtle)" }}>
                  {isActive
                    ? `Active${payer.activeMembership?.periodEnd ? ` through ${payer.activeMembership.periodEnd}` : ""} · renews for 1 year`
                    : "No active membership · starts for 1 year"}
                </div>
              </div>
              <div style={{ fontSize: 14, color: "var(--linear-color-ink-muted)" }}>
                {formatUsd(tierCents(tier))}
              </div>
            </div>

            {payer.kind === "person" && (showTiers || !isActive) ? (
              <div role="radiogroup" aria-label="Membership category" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {PERSON_TIER_KEYS.map((t) => (
                  <label
                    key={t}
                    style={{
                      cursor: "pointer",
                      fontSize: 13,
                      padding: "6px 12px",
                      borderRadius: 8,
                      border: "var(--linear-border-width) solid var(--linear-color-hairline-strong)",
                      background: tier === t ? "var(--linear-color-sidebar-item-selected)" : "transparent",
                      outline: "none",
                    }}
                  >
                    <input
                      type="radio"
                      name="check-tier"
                      checked={tier === t}
                      onChange={() => changeTier(t)}
                      style={{ position: "absolute", opacity: 0, width: 1, height: 1 }}
                    />
                    {t} · {formatUsd(tierCents(t))}
                  </label>
                ))}
              </div>
            ) : null}

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span style={fieldLabelStyle}>Amount on check for membership</span>
              <MoneyInput
                aria-label="Membership amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                onFocus={(e) => e.currentTarget.select()}
                placeholder="0.00"
                aria-invalid={attempted && membershipCents == null ? true : undefined}
              />
            </div>

          </div>

          {showDonation ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, order: 3 }}>
              <span style={fieldLabelStyle}>Additional donation</span>
              <MoneyInput
                ref={donationRef}
                autoFocus={!initial}
                aria-label="Additional donation"
                value={donation}
                onChange={(e) => setDonation(e.target.value)}
                placeholder="0.00"
                aria-invalid={donationInvalid || undefined}
              />
            </div>
          ) : null}

          <div style={{ display: "flex", justifyContent: "flex-end", order: 4 }}>
            <ConfirmSubmit dimmed={attempted && !valid} />
          </div>

          {!showDonation ? (
            <button
              type="button"
              style={{ ...linkButtonStyle, alignSelf: "flex-start", order: 3 }}
              onClick={() => setShowDonation(true)}
            >
              + Add additional donation
            </button>
          ) : null}

          {payer.kind === "person" && isActive && !showTiers ? (
            <button
              type="button"
              style={{ ...linkButtonStyle, alignSelf: "flex-start", order: 2 }}
              onClick={() => setShowTiers(true)}
            >
              Change membership
            </button>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}

/** Native submit button so Enter anywhere in the form confirms. */
export function ConfirmSubmit({ dimmed }: { dimmed?: boolean }) {
  return (
    <button
      type="submit"
      aria-disabled={dimmed || undefined}
      style={{
        all: "unset",
        boxSizing: "border-box",
        cursor: "pointer",
        opacity: dimmed ? 0.5 : 1,
        height: 40,
        paddingInline: 20,
        borderRadius: 20,
        background: "var(--linear-color-accent)",
        color: "#fff",
        fontSize: 14,
        fontWeight: 500,
      }}
    >
      Confirm
    </button>
  );
}

