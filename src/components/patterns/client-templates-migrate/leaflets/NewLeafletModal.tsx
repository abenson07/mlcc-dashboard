"use client";

import { useEffect, useRef, useState } from "react";
import { Modal } from "@/components/patterns/shared/Modal";
import { Button } from "@/components/patterns/primitives/Button";
import { Text } from "@/components/patterns/primitives/Text";
import { TextInput } from "@/components/patterns/primitives/TextInput";
import { LinearDatePicker } from "@/components/patterns/primitives/LinearDatePicker";
import { useDemoModeOptional } from "@/components/patterns/foundation/DemoModeContext";
import { useDemoGuard } from "hooks";
import { getApiBase } from "@/lib/apiBase";
import { sampleLeaflets, type LeafletSummary } from "@/data/mocks/leaflets";
import { defaultSponsorshipTierSeeds, type SponsorshipTierSeed } from "@/lib/sponsorship/tierPlaceholders";
import { isDuplicateLeafletTitle } from "@/lib/leaflets/leafletTitle";
import {
  addDaysToIsoDate,
  defaultDeliveryDate,
  defaultSponsorshipDueDate,
  formatDistributionDates,
  sponsorshipGoalDollarsFromTiers,
  suggestedLeafletTitle,
} from "@/components/leaflet/leafletData";

export type NewLeafletDraft = {
  title: string;
  distribution_date: string;
  distribution_date_2?: string | null;
  sponsorship_due_date: string;
  delivery_date: string;
  sponsorship_goal_cents: number | null;
  tierOverrides: SponsorshipTierSeed[];
};

export type NewLeafletModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate?: (leaflet: NewLeafletDraft) => void | Promise<void>;
};

type Step = 1 | 2 | 3;

// Confirm review is skipped for now — create from the name step. Flip this
// to true to restore dates → name → confirm.
const INCLUDE_CONFIRM_STEP = false;

type TierDraft = SponsorshipTierSeed & { key: string };

function newTierKey() {
  return `tier-${Math.random().toString(36).slice(2, 10)}`;
}

function toTierDrafts(seeds: SponsorshipTierSeed[]): TierDraft[] {
  return seeds.map((tier) => ({ ...tier, key: newTierKey() }));
}

function money(amount: number): string {
  return amount.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

const cellInputStyle = {
  boxSizing: "border-box" as const,
  width: "100%",
  height: 28,
  paddingInline: 6,
  borderRadius: 6,
  border: "var(--linear-border-width) solid var(--linear-color-hairline)",
  background: "var(--linear-color-canvas)",
  color: "var(--linear-color-ink)",
  fontSize: 13,
  fontFamily: "inherit",
};

function TiersTable({
  tiers,
  editable = false,
  onChange,
}: {
  tiers: TierDraft[];
  editable?: boolean;
  onChange?: (key: string, patch: Partial<SponsorshipTierSeed>) => void;
}) {
  return (
    <div
      style={{
        border: "var(--linear-border-width) solid var(--linear-color-hairline)",
        borderRadius: 6,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 72px 96px",
          gap: 8,
          padding: "8px 10px",
          background: "var(--linear-color-panel)",
          fontSize: 11,
          fontWeight: 600,
          color: "var(--linear-color-ink-subtle)",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        <span>Tier</span>
        <span style={{ textAlign: "right" }}>Qty</span>
        <span style={{ textAlign: "right" }}>Amount</span>
      </div>
      {tiers.map((tier) => (
        <div
          key={tier.key}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 72px 96px",
            gap: 8,
            padding: "8px 10px",
            borderTop: "var(--linear-border-width) solid var(--linear-color-hairline)",
            fontSize: 13,
            color: "var(--linear-color-ink)",
            alignItems: "center",
          }}
        >
          {editable ? (
            <>
              <input
                aria-label={`${tier.name || "Tier"} name`}
                value={tier.name}
                onChange={(event) => onChange?.(tier.key, { name: event.target.value })}
                style={cellInputStyle}
              />
              <input
                aria-label={`${tier.name || "Tier"} quantity`}
                inputMode="numeric"
                value={tier.quantity === 0 ? "" : String(tier.quantity)}
                onChange={(event) => {
                  const digits = event.target.value.replace(/[^\d]/g, "");
                  onChange?.(tier.key, { quantity: digits ? Number(digits) : 0 });
                }}
                style={{ ...cellInputStyle, textAlign: "right" }}
              />
              <input
                aria-label={`${tier.name || "Tier"} amount`}
                inputMode="decimal"
                value={tier.amount === 0 ? "" : String(tier.amount)}
                onChange={(event) => {
                  const raw = event.target.value.replace(/[^\d.]/g, "");
                  const firstDot = raw.indexOf(".");
                  const cleaned =
                    firstDot === -1
                      ? raw
                      : `${raw.slice(0, firstDot + 1)}${raw.slice(firstDot + 1).replace(/\./g, "")}`;
                  onChange?.(tier.key, { amount: cleaned ? Number(cleaned) : 0 });
                }}
                style={{ ...cellInputStyle, textAlign: "right" }}
              />
            </>
          ) : (
            <>
              <span>{tier.name}</span>
              <span style={{ textAlign: "right" }}>{tier.quantity}</span>
              <span style={{ textAlign: "right" }}>{money(tier.amount)}</span>
            </>
          )}
        </div>
      ))}
      {tiers.length === 0 ? (
        <div style={{ padding: "10px", fontSize: 13, color: "var(--linear-color-ink-subtle)" }}>
          No sponsorship tiers to carry over.
        </div>
      ) : null}
    </div>
  );
}

/**
 * Leaflet create flow: dates → name (sponsorships optional, behind a link).
 * Confirm is skipped unless INCLUDE_CONFIRM_STEP is true.
 */
export function NewLeafletModal({ isOpen, onClose, onCreate }: NewLeafletModalProps) {
  const { enabled: demo } = useDemoModeOptional();
  const { store } = useDemoGuard();
  const [step, setStep] = useState<Step>(1);
  const [distributionDate, setDistributionDate] = useState("");
  const [showSecondDate, setShowSecondDate] = useState(false);
  const [distributionDate2, setDistributionDate2] = useState("");
  const [secondDateTouched, setSecondDateTouched] = useState(false);
  const [title, setTitle] = useState("");
  const [titleTouched, setTitleTouched] = useState(false);
  const [budgetDollars, setBudgetDollars] = useState("");
  const [budgetTouched, setBudgetTouched] = useState(false);
  const budgetTouchedRef = useRef(false);
  const [tiers, setTiers] = useState<TierDraft[]>(() => toTierDrafts(defaultSponsorshipTierSeeds()));
  const [showSponsorships, setShowSponsorships] = useState(false);
  const [existingTitles, setExistingTitles] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setStep(1);
    setDistributionDate("");
    setShowSecondDate(false);
    setDistributionDate2("");
    setSecondDateTouched(false);
    setTitle("");
    setTitleTouched(false);
    const seedTiers = toTierDrafts(defaultSponsorshipTierSeeds());
    setTiers(seedTiers);
    setBudgetDollars(String(sponsorshipGoalDollarsFromTiers(seedTiers)));
    budgetTouchedRef.current = false;
    setBudgetTouched(false);
    setShowSponsorships(false);
    setExistingTitles(sampleLeaflets.map((row) => row.title));
    setSaving(false);
    setError(null);

    if (demo) {
      const merged = store.merge<LeafletSummary>("leaflets", sampleLeaflets);
      setExistingTitles(merged.map((row) => row.title));
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(`${getApiBase()}/api/leaflets/create-preview`);
        const data = (await res.json()) as {
          error?: string;
          titles?: string[];
          tiers?: SponsorshipTierSeed[];
        };
        if (cancelled || !res.ok) return;
        if (data.titles?.length) setExistingTitles(data.titles);
        if (data.tiers?.length) {
          const next = toTierDrafts(data.tiers);
          setTiers(next);
          setBudgetDollars((current) =>
            budgetTouchedRef.current ? current : String(sponsorshipGoalDollarsFromTiers(next)),
          );
        }
      } catch {
        // Keep sample titles / default tiers when unauthenticated (preview) or offline.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isOpen, demo]);

  useEffect(() => {
    if (!distributionDate || titleTouched) return;
    setTitle(suggestedLeafletTitle(distributionDate));
  }, [distributionDate, titleTouched]);

  useEffect(() => {
    if (!distributionDate || !showSecondDate || secondDateTouched) return;
    setDistributionDate2(addDaysToIsoDate(distributionDate, 5));
  }, [distributionDate, showSecondDate, secondDateTouched]);

  const suggestedBudget = sponsorshipGoalDollarsFromTiers(tiers);
  useEffect(() => {
    if (budgetTouched) return;
    setBudgetDollars(suggestedBudget > 0 ? String(suggestedBudget) : "");
  }, [suggestedBudget, budgetTouched]);

  const date2 = showSecondDate && distributionDate2 ? distributionDate2 : null;
  const datesLabel = formatDistributionDates(distributionDate, date2);
  const duplicate = isDuplicateLeafletTitle(title, existingTitles);
  const budgetCents = budgetDollars.trim()
    ? Math.round(Number(budgetDollars.replace(/,/g, "")) * 100)
    : null;

  function buildDraft(): NewLeafletDraft {
    return {
      title: title.trim(),
      distribution_date: distributionDate,
      distribution_date_2: date2,
      sponsorship_due_date: defaultSponsorshipDueDate(distributionDate),
      delivery_date: defaultDeliveryDate(distributionDate),
      sponsorship_goal_cents: Number.isFinite(budgetCents) ? budgetCents : null,
      tierOverrides: tiers
        .filter((tier) => tier.name.trim() && tier.amount > 0)
        .map(({ name, amount, quantity }) => ({
          name: name.trim(),
          amount,
          quantity: quantity > 0 ? quantity : 1,
        })),
    };
  }

  async function handleCreate() {
    if (!title.trim() || !distributionDate || duplicate || saving) return;
    setSaving(true);
    setError(null);
    try {
      await onCreate?.(buildDraft());
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create leaflet");
    } finally {
      setSaving(false);
    }
  }

  const modalTitle =
    step === 1 ? "When is this leaflet being delivered?" : step === 2 ? "Name this leaflet" : "Confirm leaflet";

  const createDisabled = saving || duplicate || !title.trim() || !distributionDate;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      width={step === 1 ? 440 : 520}
      footer={
        <>
          {step === 1 ? (
            <Button label="Cancel" variant="secondary" onClick={onClose} />
          ) : (
            <Button
              label="Back"
              variant="secondary"
              onClick={() => {
                setError(null);
                setStep((s) => (s === 3 ? 2 : 1));
              }}
            />
          )}
          {step === 1 ? (
            <Button
              label="Continue"
              variant="primary"
              disabled={!distributionDate}
              onClick={() => {
                setError(null);
                setStep(2);
              }}
            />
          ) : step === 2 && INCLUDE_CONFIRM_STEP ? (
            <Button
              label="Continue"
              variant="primary"
              disabled={!title.trim() || duplicate}
              onClick={() => {
                setError(null);
                setStep(3);
              }}
            />
          ) : (
            <Button
              label={saving ? "Creating…" : "Create leaflet"}
              variant="primary"
              disabled={createDisabled}
              onClick={() => void handleCreate()}
            />
          )}
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {step === 1 ? (
          <>
            <Text size="sm" color="secondary">
              These are the days leaflets hit doorsteps or are available for pickup — not when
              emails go out.
            </Text>
            <LinearDatePicker
              label="First distribution date"
              value={distributionDate}
              onChange={setDistributionDate}
            />
            {showSecondDate ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <LinearDatePicker
                  label="Second distribution date"
                  value={distributionDate2}
                  onChange={(next) => {
                    setSecondDateTouched(true);
                    setDistributionDate2(next);
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowSecondDate(false);
                    setDistributionDate2("");
                    setSecondDateTouched(false);
                  }}
                  style={linkButtonStyle}
                >
                  Remove second date
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setShowSecondDate(true);
                  if (distributionDate) {
                    setDistributionDate2(addDaysToIsoDate(distributionDate, 5));
                  }
                }}
                style={linkButtonStyle}
              >
                Add a second distribution date
              </button>
            )}
          </>
        ) : null}

        {step === 2 ? (
          <>
            <div>
              <TextInput
                label="Leaflet name"
                value={title}
                onChange={(next) => {
                  setTitleTouched(true);
                  setTitle(next);
                }}
              />
              {duplicate ? (
                <Text size="sm" display="block" style={{ ...errorTextStyle, marginTop: 6 }}>
                  A leaflet with this name already exists. Choose a different name to continue.
                </Text>
              ) : null}
              {datesLabel ? (
                <Text size="sm" color="secondary" display="block" style={{ marginTop: 6 }}>
                  {datesLabel}
                </Text>
              ) : null}
              {!showSponsorships ? (
                <button
                  type="button"
                  onClick={() => setShowSponsorships(true)}
                  style={{ ...linkButtonStyle, marginTop: 8 }}
                >
                  Define sponsorships
                </button>
              ) : null}
            </div>
            {showSponsorships ? (
              <>
                <TextInput
                  label="Budget"
                  value={budgetDollars}
                  onChange={(next) => {
                    setBudgetTouched(true);
                    budgetTouchedRef.current = true;
                    setBudgetDollars(next.replace(/[^\d.,]/g, ""));
                  }}
                />
                <div>
                  <Text size="sm" color="secondary" style={{ marginBottom: 8 }}>
                    Sponsorship tiers carried from the previous run
                  </Text>
                  <TiersTable
                    tiers={tiers}
                    editable
                    onChange={(key, patch) => {
                      setTiers((prev) => prev.map((tier) => (tier.key === key ? { ...tier, ...patch } : tier)));
                    }}
                  />
                </div>
              </>
            ) : null}
          </>
        ) : null}

        {step === 3 ? (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <Text weight="medium">{title.trim()}</Text>
              <Text size="sm" color="secondary">
                {datesLabel}
              </Text>
              <Text size="sm" color="secondary">
                Budget{" "}
                {budgetCents != null && Number.isFinite(budgetCents)
                  ? money(budgetCents / 100)
                  : "—"}
              </Text>
            </div>
            <TiersTable tiers={tiers} />
          </>
        ) : null}

        {error ? (
          <Text size="sm" display="block" style={errorTextStyle}>
            {error}
          </Text>
        ) : null}
      </div>
    </Modal>
  );
}

const errorTextStyle = {
  color: "#eb5757",
} as const;

const linkButtonStyle = {
  alignSelf: "flex-start",
  padding: 0,
  border: "none",
  background: "transparent",
  color: "var(--linear-color-ink)",
  fontSize: 13,
  fontFamily: "inherit",
  textDecoration: "underline",
  cursor: "pointer",
} as const;
