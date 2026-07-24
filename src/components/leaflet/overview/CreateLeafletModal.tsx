"use client";

import { useMemo, useState } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import DatePickerField from "@/components/form/DatePicker";
import { defaultSponsorshipDueDate, defaultDeliveryDate } from "../leafletData";
import { defaultSponsorshipTierSeeds, type SponsorshipTierSeed } from "@/lib/sponsorship/tierPlaceholders";

const LEAFLET_HERO_IMAGE =
  "/images/leaflet/leaflet.webp";

const inputRing =
  "h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 dark:border-gray-600 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-blue-400 dark:focus:ring-blue-400/20";

export type CreateLeafletInput = {
  title: string;
  distribution_date: string;
  sponsorship_due_date: string;
  delivery_date: string;
  sponsorship_goal_cents: number | null;
  tierOverrides: SponsorshipTierSeed[];
};

type CreateLeafletModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (input: CreateLeafletInput) => Promise<void>;
};

type TierDraft = {
  key: string;
  name: string;
  amount: string;
  quantity: string;
};

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function newTierKey() {
  return `tier-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function seedsToDrafts(seeds: SponsorshipTierSeed[]): TierDraft[] {
  return seeds.map((t) => ({
    key: newTierKey(),
    name: t.name,
    amount: String(t.amount),
    quantity: String(t.quantity),
  }));
}

function PastDateWarning({ value }: { value: string }) {
  if (!value || value >= todayStr()) return null;
  return (
    <p className="text-xs text-amber-600 mt-1" style={{ marginTop: 4 }}>
      This date is in the past.
    </p>
  );
}

function sanitizeCurrencyDigits(raw: string): string {
  let cleaned = raw.replace(/[^\d.]/g, "");
  const firstDot = cleaned.indexOf(".");
  if (firstDot !== -1) {
    cleaned = cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, "");
  }
  const [intPart, decPart] = cleaned.split(".");
  return decPart !== undefined ? `${intPart}.${decPart.slice(0, 2)}` : cleaned;
}

function formatCurrencyDisplay(raw: string): string {
  if (!raw) return "";
  const [intPart, decPart] = raw.split(".");
  const withCommas = (intPart || "0").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decPart !== undefined ? `$${withCommas}.${decPart}` : `$${withCommas}`;
}

type WizardStep = 1 | 2;

export default function CreateLeafletModal({
  isOpen,
  onClose,
  onCreate,
}: CreateLeafletModalProps) {
  const [step, setStep] = useState<WizardStep>(1);
  const [title, setTitle] = useState("");
  const [distributionDate, setDistributionDate] = useState("");
  const [sponsorshipDueDate, setSponsorshipDueDate] = useState("");
  const [sponsorshipDueDateTouched, setSponsorshipDueDateTouched] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryDateTouched, setDeliveryDateTouched] = useState(false);
  const [budgetGoal, setBudgetGoal] = useState("");
  const [tiers, setTiers] = useState<TierDraft[]>(() => seedsToDrafts(defaultSponsorshipTierSeeds()));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmitStep1 = useMemo(
    () => Boolean(title.trim() && distributionDate && deliveryDate),
    [title, distributionDate, deliveryDate],
  );

  const canSubmitStep2 = useMemo(() => Boolean(sponsorshipDueDate), [sponsorshipDueDate]);

  const canSubmit = canSubmitStep1 && canSubmitStep2;

  function handleDistributionDateChange(value: string) {
    setDistributionDate(value);
    if (!sponsorshipDueDateTouched) setSponsorshipDueDate(value ? defaultSponsorshipDueDate(value) : "");
    if (!deliveryDateTouched) setDeliveryDate(value ? defaultDeliveryDate(value) : "");
  }

  function updateTier(key: string, patch: Partial<Omit<TierDraft, "key">>) {
    setTiers((prev) => prev.map((t) => (t.key === key ? { ...t, ...patch } : t)));
  }

  function addTier() {
    setTiers((prev) => [
      ...prev,
      { key: newTierKey(), name: "", amount: "", quantity: "1" },
    ]);
  }

  function removeTier(key: string) {
    setTiers((prev) => (prev.length <= 1 ? prev : prev.filter((t) => t.key !== key)));
  }

  function reset() {
    setStep(1);
    setTitle("");
    setDistributionDate("");
    setSponsorshipDueDate("");
    setSponsorshipDueDateTouched(false);
    setDeliveryDate("");
    setDeliveryDateTouched(false);
    setBudgetGoal("");
    setTiers(seedsToDrafts(defaultSponsorshipTierSeeds()));
    setError(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleNext() {
    if (!canSubmitStep1) return;
    setError(null);
    setStep(2);
  }

  function handleBack() {
    setError(null);
    setStep(1);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (step !== 2) {
      handleNext();
      return;
    }
    if (!canSubmit) return;
    setSaving(true);
    setError(null);
    try {
      const tierOverrides: SponsorshipTierSeed[] = tiers
        .map((t) => ({
          name: t.name.trim(),
          amount: Number(t.amount),
          quantity: Number(t.quantity) || 1,
        }))
        .filter((t) => t.name.length > 0 && Number.isFinite(t.amount) && t.amount > 0);

      await onCreate({
        title: title.trim(),
        distribution_date: distributionDate,
        sponsorship_due_date: sponsorshipDueDate,
        delivery_date: deliveryDate,
        sponsorship_goal_cents: budgetGoal.trim() ? Math.round(Number(budgetGoal) * 100) : null,
        tierOverrides: tierOverrides.length > 0 ? tierOverrides : defaultSponsorshipTierSeeds(),
      });
      reset();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create leaflet");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isFullscreen className="overflow-hidden p-0">
      <div className="grid h-full min-h-screen gap-4 bg-gray-100 p-4 dark:bg-gray-950 max-md:grid-cols-1 min-[992px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="flex w-full flex-col overflow-y-auto rounded-mercury-button-lg bg-white p-12 max-md:rounded-mercury-card max-md:px-6 max-md:py-8 dark:bg-gray-900">
          <p className="m-0 text-mercury-small font-medium text-mercury-muted dark:text-gray-400">
            Step {step} of 2
          </p>
          <h1 className="m-0 mt-1 font-semibold text-mercury-ink text-title-sm dark:text-white/90 max-md:text-mercury-h1">
            {step === 1 ? "Schedule new leaflet" : "Sponsorships"}
          </h1>
          <p className="m-0 mt-2 text-mercury-small text-mercury-muted dark:text-gray-400">
            {step === 1
              ? "Creates a planned edition and copies routes into deliveries."
              : "Set a sponsorship deadline, budget goal, and tiers for this edition."}
          </p>

          <form onSubmit={handleSubmit} style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 20 }}>
            {step === 1 && (
              <>
                <div>
                  <Label htmlFor="leaflet-title">Leaflet name</Label>
                  <Input
                    id="leaflet-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="December 2026 Leaflet"
                  />
                </div>
                <div>
                  <DatePickerField
                    id="leaflet-distribution-date"
                    label="Distribution date"
                    value={distributionDate}
                    onChange={handleDistributionDateChange}
                  />
                  <PastDateWarning value={distributionDate} />
                </div>
                <div>
                  <DatePickerField
                    id="leaflet-delivery-date"
                    label="Content due date"
                    value={deliveryDate}
                    onChange={(next) => {
                      setDeliveryDateTouched(true);
                      setDeliveryDate(next);
                    }}
                  />
                  <PastDateWarning value={deliveryDate} />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <DatePickerField
                    id="leaflet-sponsorship-due-date"
                    label="Sponsorship due date"
                    value={sponsorshipDueDate}
                    onChange={(next) => {
                      setSponsorshipDueDateTouched(true);
                      setSponsorshipDueDate(next);
                    }}
                  />
                  <PastDateWarning value={sponsorshipDueDate} />
                </div>
                <div>
                  <Label htmlFor="leaflet-budget-goal">Budget goal</Label>
                  <Input
                    id="leaflet-budget-goal"
                    type="text"
                    inputMode="decimal"
                    value={formatCurrencyDisplay(budgetGoal)}
                    onChange={(e) => setBudgetGoal(sanitizeCurrencyDigits(e.target.value))}
                    placeholder="$15,000"
                  />
                </div>

                <div>
                  <Label>Sponsorship tiers</Label>
                  <div className="mt-2 space-y-3">
                    <div className="grid grid-cols-[minmax(0,1fr)_3.5rem_7.5rem_2.25rem] items-end gap-2">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Name</span>
                      <span className="text-center text-xs font-medium text-gray-600 dark:text-gray-400">Qty</span>
                      <span className="text-right text-xs font-medium text-gray-600 dark:text-gray-400">Price</span>
                      <span aria-hidden />
                    </div>
                    <ul className="space-y-2">
                      {tiers.map((tier) => (
                        <li key={tier.key} className="grid grid-cols-[minmax(0,1fr)_3.5rem_7.5rem_2.25rem] items-center gap-2">
                          <input
                            value={tier.name}
                            onChange={(e) => updateTier(tier.key, { name: e.target.value })}
                            placeholder="Tier name"
                            className={inputRing}
                          />
                          <input
                            type="text"
                            inputMode="decimal"
                            value={tier.quantity}
                            onChange={(e) => updateTier(tier.key, { quantity: e.target.value })}
                            placeholder="1"
                            className={`${inputRing} px-2 text-center tabular-nums`}
                          />
                          <div className="relative">
                            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400">
                              $
                            </span>
                            <input
                              type="text"
                              inputMode="decimal"
                              value={tier.amount}
                              onChange={(e) => updateTier(tier.key, { amount: e.target.value })}
                              placeholder="0"
                              className={`${inputRing} pl-7 text-right tabular-nums`}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeTier(tier.key)}
                            className="mb-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg text-xl leading-none text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                            aria-label="Remove sponsorship tier"
                            disabled={tiers.length <= 1}
                          >
                            ×
                          </button>
                        </li>
                      ))}
                    </ul>
                    <Button type="button" variant="outline" size="sm" onClick={addTier}>
                      + Add sponsorship
                    </Button>
                  </div>
                </div>
              </>
            )}

            {error && <p className="lf-text-red" style={{ fontSize: 13 }}>{error}</p>}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              {step === 2 && (
                <Button type="button" variant="outline" onClick={handleBack} disabled={saving}>
                  Back
                </Button>
              )}
              <Button type="button" variant="outline" onClick={handleClose} disabled={saving}>
                Cancel
              </Button>
              {step === 1 ? (
                <Button type="submit" disabled={!canSubmitStep1}>
                  Next
                </Button>
              ) : (
                <Button type="submit" disabled={saving || !canSubmit}>
                  {saving ? "Creating…" : "Create leaflet"}
                </Button>
              )}
            </div>
          </form>
        </div>

        <div
          className="flex h-full w-full items-end justify-end overflow-hidden rounded-mercury-button-lg bg-cover bg-center p-4 max-md:hidden"
          style={{ backgroundImage: `url('${LEAFLET_HERO_IMAGE}')`, backgroundColor: "#18181b" }}
        >
          <div className="flex max-w-[20rem] flex-col gap-6 rounded-mercury-button-lg bg-mercury-ink p-8 text-white dark:bg-gray-950">
            <p className="m-0 text-mercury-small leading-6 text-white/65">
              &ldquo;The Leaflet keeps our neighborhood connected — from block parties to the issues
              that matter on every street.&rdquo;
            </p>
            <div className="flex flex-col gap-1">
              <div className="text-mercury-small font-medium text-white">Maple Leaf Community</div>
              <div className="m-0 text-mercury-small text-white/65">Serving North Seattle since 1989</div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
