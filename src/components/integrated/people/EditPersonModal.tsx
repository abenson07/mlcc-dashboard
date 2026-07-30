"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { usePeople, useMemberships, type PersonWithMembership } from "hooks";

const MEMBERSHIP_TIERS = ["Household", "Individual", "Senior", "Student"] as const;
const MEMBERSHIP_STATUSES = ["Active", "Expired", "Donation", "Cancelled"] as const;

type EditPersonModalProps = {
  isOpen: boolean;
  onClose: () => void;
  person: PersonWithMembership;
  onUpdated?: () => void;
};

function toDateInputValue(value: string | null | undefined): string {
  if (!value) return "";
  return value.slice(0, 10);
}

export default function EditPersonModal({ isOpen, onClose, person, onUpdated }: EditPersonModalProps) {
  const { update: updatePerson } = usePeople({ autoFetch: false });
  const { create: createMembership, update: updateMembership } = useMemberships();

  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [membershipStatus, setMembershipStatus] = useState("");
  const [membershipTier, setMembershipTier] = useState("");
  const [lastRenewal, setLastRenewal] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setFullName(person.full_name ?? "");
    setAddress(person.address ?? "");
    setEmail(person.email ?? "");
    setPhone(person.phone ?? "");
    setMembershipStatus(person.membership?.status ?? "");
    setMembershipTier(person.membership?.tier ?? "");
    setLastRenewal(toDateInputValue(person.membership?.last_renewal));
    setError(null);
  }, [isOpen, person]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const updatedPerson = await updatePerson(person.id, {
        full_name: fullName.trim(),
        address: address.trim() || null,
        email: email.trim() || null,
        phone: phone.trim() || null,
      });
      if (!updatedPerson) throw new Error("Failed to save contact information");

      const membershipPatch = {
        status: membershipStatus || null,
        tier: membershipTier || null,
        last_renewal: lastRenewal || null,
      };
      const hasMembershipInput = membershipStatus || membershipTier || lastRenewal;

      if (person.membership_id) {
        const updatedMembership = await updateMembership(person.membership_id, membershipPatch);
        if (!updatedMembership) throw new Error("Failed to save membership info");
      } else if (hasMembershipInput) {
        const newMembership = await createMembership(membershipPatch);
        if (!newMembership) throw new Error("Failed to create membership info");
        const linked = await updatePerson(person.id, { membership_id: newMembership.id });
        if (!linked) throw new Error("Failed to link membership info");
      }

      onUpdated?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save neighbor");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-6">
      <h2 className="lf-h2" style={{ fontSize: 18 }}>
        Edit neighbor
      </h2>
      <form onSubmit={handleSubmit} style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <Label htmlFor="person-name">Name</Label>
          <Input id="person-name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="person-address">Address</Label>
          <Input id="person-address" value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="person-email">Email</Label>
          <Input id="person-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="person-phone">Phone</Label>
          <Input id="person-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="person-membership-status">Membership status</Label>
          <select
            id="person-membership-status"
            className="lf-select"
            value={membershipStatus}
            onChange={(e) => setMembershipStatus(e.target.value)}
            style={{ width: "100%" }}
          >
            <option value="">Non-member</option>
            {MEMBERSHIP_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="person-membership-tier">Membership type</Label>
          <select
            id="person-membership-tier"
            className="lf-select"
            value={membershipTier}
            onChange={(e) => setMembershipTier(e.target.value)}
            style={{ width: "100%" }}
          >
            <option value="">—</option>
            {MEMBERSHIP_TIERS.map((tier) => (
              <option key={tier} value={tier}>
                {tier}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="person-renewed">Renewed</Label>
          <Input
            id="person-renewed"
            type="date"
            value={lastRenewal}
            onChange={(e) => setLastRenewal(e.target.value)}
          />
        </div>
        {error && (
          <p className="lf-text-red" style={{ fontSize: 13 }}>
            {error}
          </p>
        )}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving || !fullName.trim()}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
