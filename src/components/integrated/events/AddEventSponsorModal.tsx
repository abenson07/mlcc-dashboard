"use client";

import { useMemo, useState } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import { useBusinesses } from "hooks";
import { SPONSORSHIP_TIER_DEFS } from "@/components/leaflet/leafletData";
import type { SponsorshipsInsert } from "@/types/database";

type AddEventSponsorModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: Omit<SponsorshipsInsert, "event_id" | "leaflet_id">) => Promise<void>;
};

export default function AddEventSponsorModal({
  isOpen,
  onClose,
  onSubmit,
}: AddEventSponsorModalProps) {
  const { businesses, loading } = useBusinesses({ autoFetch: isOpen });
  const [businessId, setBusinessId] = useState("");
  const [tier, setTier] = useState<string>(SPONSORSHIP_TIER_DEFS[0]?.name ?? "Gold");
  const [amount, setAmount] = useState(String(SPONSORSHIP_TIER_DEFS[0]?.amount ?? 1000));
  const [status, setStatus] = useState<"pledged" | "invoiced" | "paid">("pledged");
  const [memo, setMemo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const businessOptions = useMemo(
    () =>
      businesses.map((b) => ({
        value: b.id,
        label: b.business_name ?? b.id,
      })),
    [businesses],
  );

  const tierOptions = useMemo(
    () =>
      SPONSORSHIP_TIER_DEFS.map((t) => ({
        value: t.name,
        label: `${t.name} ($${t.amount.toLocaleString()})`,
      })),
    [],
  );

  const reset = () => {
    setBusinessId("");
    setTier(SPONSORSHIP_TIER_DEFS[0]?.name ?? "Gold");
    setAmount(String(SPONSORSHIP_TIER_DEFS[0]?.amount ?? 1000));
    setStatus("pledged");
    setMemo("");
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleTierChange = (name: string) => {
    setTier(name);
    const def = SPONSORSHIP_TIER_DEFS.find((t) => t.name === name);
    if (def) setAmount(String(def.amount));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) {
      setError("Select a business.");
      return;
    }
    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError("Enter a valid amount.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        business_id: businessId,
        description: tier,
        amount: parsedAmount,
        status,
        memo: memo.trim() || null,
        quantity: 1,
      });
      reset();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add sponsor.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-md p-6">
      <form onSubmit={(e) => void handleSubmit(e)}>
        <h2 className="lf-h2" style={{ marginBottom: 16 }}>
          Add sponsor
        </h2>

        {error ? <p className="lf-text-red" style={{ marginBottom: 12 }}>{error}</p> : null}

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <Label>Business</Label>
            {loading ? (
              <p className="lf-meta">Loading businesses…</p>
            ) : (
              <Select
                placeholder="Select business"
                options={businessOptions}
                onChange={setBusinessId}
              />
            )}
          </div>

          <div>
            <Label>Sponsorship level</Label>
            <Select options={tierOptions} defaultValue={tier} onChange={handleTierChange} />
          </div>

          <div>
            <Label>Amount ($)</Label>
            <Input type="number" min="1" step={1} value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>

          <div>
            <Label>Status</Label>
            <Select
              defaultValue={status}
              options={[
                { value: "pledged", label: "Pledged" },
                { value: "invoiced", label: "Invoiced" },
                { value: "paid", label: "Paid" },
              ]}
              onChange={(v) => setStatus(v as "pledged" | "invoiced" | "paid")}
            />
          </div>

          <div>
            <Label>Memo (optional)</Label>
            <Input type="text" value={memo} onChange={(e) => setMemo(e.target.value)} />
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 24 }}>
          <Button type="button" size="sm" variant="outline" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={submitting}>
            {submitting ? "Saving…" : "Add sponsor"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
