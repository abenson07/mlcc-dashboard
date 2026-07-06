"use client";

import { useState } from "react";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import { Modal } from "@/components/ui/modal";
import { useLeafletContext } from "@/components/leaflet/LeafletContext";
import ShellWidget from "./ShellWidget";

export default function BudgetSponsorshipsWidget() {
  const { budget, readOnly, updateLeaflet, refetchAll } = useLeafletContext();
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [goalInput, setGoalInput] = useState(String(budget.sponsorshipGoal));
  const [goalSaving, setGoalSaving] = useState(false);
  const [goalError, setGoalError] = useState<string | null>(null);

  const handleGoalChange = (raw: string) => {
    const digitsOnly = raw.replace(/\D/g, "");
    if (digitsOnly === "") {
      setGoalInput("");
      return;
    }
    const num = Number(digitsOnly);
    setGoalInput(num.toLocaleString("en-US"));
  };

  const goalNumericValue = (): number => {
    const stripped = goalInput.replace(/,/g, "");
    return stripped ? Number(stripped) : 0;
  };

  const openGoalModal = () => {
    setGoalInput(String(budget.sponsorshipGoal));
    setGoalError(null);
    setGoalModalOpen(true);
  };

  const saveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = goalNumericValue();
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setGoalError("Enter a valid goal amount.");
      return;
    }
    setGoalSaving(true);
    setGoalError(null);
    try {
      await updateLeaflet({ sponsorship_goal_cents: Math.round(parsed * 100) });
      setGoalModalOpen(false);
      await refetchAll();
    } catch (err) {
      setGoalError(err instanceof Error ? err.message : "Failed to save goal.");
    } finally {
      setGoalSaving(false);
    }
  };

  return (
    <>
      <ShellWidget title="Budget & sponsorships" cardId="budget-and-sponsorships">
        <div className="lf-metric-row">
          <span className="lf-metric-label">Sponsorship progress</span>
          <span>{budget.sponsorshipProgressPct}%</span>
        </div>
        <div className="lf-progress-track" style={{ marginBottom: 12 }}>
          <div className="lf-progress-fill" style={{ width: `${budget.sponsorshipProgressPct}%` }} />
        </div>
        <div className="lf-metric-row">
          <span className="lf-metric-label">Goal</span>
          <span>${budget.sponsorshipGoal.toLocaleString()}</span>
        </div>
        <div className="lf-metric-row">
          <span className="lf-metric-label">Raised</span>
          <span>${budget.raised.toLocaleString()}</span>
        </div>
        <div className="lf-metric-row">
          <span className="lf-metric-label">Pledged</span>
          <span>${budget.pledged.toLocaleString()}</span>
        </div>
        {!readOnly && (
          <button type="button" className="lf-link" style={{ marginTop: 8 }} onClick={openGoalModal}>
            Edit goal
          </button>
        )}
      </ShellWidget>

      <Modal isOpen={goalModalOpen} onClose={() => setGoalModalOpen(false)} className="max-w-md p-6">
        <form onSubmit={(e) => void saveGoal(e)}>
          <h2 className="lf-h2" style={{ marginBottom: 16 }}>
            Edit sponsorship goal
          </h2>
          {goalError ? <p className="lf-text-red" style={{ marginBottom: 12 }}>{goalError}</p> : null}
          <div>
            <Label>Goal ($)</Label>
            <input
              type="text"
              inputMode="numeric"
              value={goalInput}
              onChange={(e) => handleGoalChange(e.target.value)}
              placeholder="0"
              className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-blue-400"
            />
          </div>
          <div className="flex items-center justify-end gap-3" style={{ marginTop: 24 }}>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setGoalModalOpen(false)}
              disabled={goalSaving}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={goalSaving}>
              {goalSaving ? "Saving…" : "Save goal"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
