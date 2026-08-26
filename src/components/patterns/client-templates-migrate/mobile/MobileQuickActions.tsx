"use client";

import { useState } from "react";
import type { PersonWithMembership, BusinessWithDetails } from "hooks";
import { useBusinesses, useBusinessMemberships, useMemberships, usePeople } from "hooks";
import { TextInput } from "@/components/patterns/primitives/TextInput";
import { toMembershipTier } from "@/lib/memberships/status";
import {
  BUSINESS_MEMBERSHIP_ANNUAL_DUES,
  BUSINESS_MEMBERSHIP_TIER,
} from "@/components/patterns/client-templates-migrate/businesses/adapters";
import { MobileBottomSheet } from "./MobileBottomSheet";
import {
  mobileFieldLabelStyle,
  mobileInputStyle,
  mobilePrimaryBtnStyle,
  mobileSecondaryBtnStyle,
} from "./mobileStyles";

export type MobileQuickAddPersonProps = {
  open: boolean;
  onClose: () => void;
  onCreated?: (personId: string) => void;
};

export function MobileQuickAddPerson({ open, onClose, onCreated }: MobileQuickAddPersonProps) {
  const { create } = usePeople({ autoFetch: false });
  const { create: createMembership } = useMemberships();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [makeMember, setMakeMember] = useState(false);
  const [tier, setTier] = useState("individual");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setName("");
    setEmail("");
    setPhone("");
    setMakeMember(false);
    setTier("individual");
    setError(null);
  }

  async function submit() {
    const fullName = name.trim();
    if (!fullName) {
      setError("Name is required.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      let membershipId: string | null = null;
      if (makeMember) {
        const membership = await createMembership({
          tier: toMembershipTier(tier),
          status: "Active",
          start_date: new Date().toISOString().slice(0, 10),
          payment_method: "cash",
          customer_email: email.trim() || null,
        });
        membershipId = membership.id;
      }
      const person = await create({
        full_name: fullName,
        email: email.trim() || null,
        phone: phone.trim() || null,
        membership_id: membershipId,
      });
      if (!person) throw new Error("Could not create person.");
      reset();
      onClose();
      onCreated?.(person.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not add person.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <MobileBottomSheet
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title="Add person"
      size="tall"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <TextInput label="Full name" value={name} onChange={setName} />
        <TextInput label="Email" value={email} onChange={setEmail} />
        <TextInput label="Phone" value={phone} onChange={setPhone} />

        <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14 }}>
          <input
            type="checkbox"
            checked={makeMember}
            onChange={(e) => setMakeMember(e.target.checked)}
          />
          Make member (cash payment)
        </label>

        {makeMember ? (
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={mobileFieldLabelStyle}>Membership tier</span>
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value)}
              style={mobileInputStyle}
            >
              <option value="household">Household</option>
              <option value="individual">Individual</option>
              <option value="senior">Senior</option>
              <option value="student">Student</option>
            </select>
          </label>
        ) : null}

        {error ? (
          <div style={{ fontSize: 13, color: "#eb5757" }}>{error}</div>
        ) : null}

        <button type="button" style={mobilePrimaryBtnStyle} disabled={busy} onClick={submit}>
          {busy ? "Saving…" : "Add to database"}
        </button>
        <button
          type="button"
          style={mobileSecondaryBtnStyle}
          onClick={() => {
            reset();
            onClose();
          }}
        >
          Cancel
        </button>
      </div>
    </MobileBottomSheet>
  );
}

export type MobileLogCashMembershipProps = {
  open: boolean;
  person: PersonWithMembership | null;
  onClose: () => void;
  onDone?: () => void;
};

export function MobileLogCashMembership({
  open,
  person,
  onClose,
  onDone,
}: MobileLogCashMembershipProps) {
  const { update } = usePeople({ autoFetch: false });
  const { create: createMembership } = useMemberships();
  const [tier, setTier] = useState("individual");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!person) return;
    setBusy(true);
    setError(null);
    try {
      const membership = await createMembership({
        tier: toMembershipTier(tier),
        status: "Active",
        start_date: new Date().toISOString().slice(0, 10),
        payment_method: "cash",
        customer_email: person.email,
      });
      await update(person.id, { membership_id: membership.id });
      onClose();
      onDone?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not log membership.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <MobileBottomSheet open={open} onClose={onClose} title="Make member (cash)">
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <p style={{ margin: 0, fontSize: 14, color: "var(--linear-color-ink-subtle)" }}>
          Logs an active membership for {person?.full_name ?? "this person"} paid in cash.
        </p>
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={mobileFieldLabelStyle}>Tier</span>
          <select value={tier} onChange={(e) => setTier(e.target.value)} style={mobileInputStyle}>
            <option value="household">Household</option>
            <option value="individual">Individual</option>
            <option value="senior">Senior</option>
            <option value="student">Student</option>
          </select>
        </label>
        {error ? <div style={{ fontSize: 13, color: "#eb5757" }}>{error}</div> : null}
        <button type="button" style={mobilePrimaryBtnStyle} disabled={busy || !person} onClick={submit}>
          {busy ? "Saving…" : "Confirm cash membership"}
        </button>
      </div>
    </MobileBottomSheet>
  );
}

export type MobileLogDonationProps = {
  open: boolean;
  personName?: string;
  onClose: () => void;
};

export function MobileLogDonation({ open, personName, onClose }: MobileLogDonationProps) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  function submit() {
    const cents = Math.round(parseFloat(amount) * 100);
    if (!Number.isFinite(cents) || cents <= 0) {
      setMessage("Enter a valid amount.");
      return;
    }
    setMessage(
      `Logged $${(cents / 100).toFixed(2)} cash donation${personName ? ` for ${personName}` : ""}${note.trim() ? ` — ${note.trim()}` : ""}. Cash donation API not connected yet.`,
    );
  }

  return (
    <MobileBottomSheet
      open={open}
      onClose={() => {
        setAmount("");
        setNote("");
        setMessage(null);
        onClose();
      }}
      title="Log cash donation"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <TextInput label="Amount (USD)" value={amount} onChange={setAmount} />
        <TextInput label="Note" value={note} onChange={setNote} multiline rows={3} />
        {message ? (
          <div style={{ fontSize: 13, color: "var(--linear-color-ink-subtle)" }}>{message}</div>
        ) : null}
        <button type="button" style={mobilePrimaryBtnStyle} onClick={submit}>
          Log donation
        </button>
      </div>
    </MobileBottomSheet>
  );
}

export type MobileStartBusinessMembershipProps = {
  open: boolean;
  business: BusinessWithDetails | null;
  onClose: () => void;
  onDone?: () => void;
};

export function MobileStartBusinessMembership({
  open,
  business,
  onClose,
  onDone,
}: MobileStartBusinessMembershipProps) {
  const { update } = useBusinesses({ autoFetch: false });
  const { create: createMembership } = useBusinessMemberships();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!business) return;
    setBusy(true);
    setError(null);
    try {
      const today = new Date();
      const lastRenewal = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      const membership = await createMembership({
        status: "Active",
        last_renewal: lastRenewal,
        tier: BUSINESS_MEMBERSHIP_TIER,
        annual_dues: BUSINESS_MEMBERSHIP_ANNUAL_DUES,
      });
      const linked = await update(business.id, { membership_id: membership.id, is_member: true });
      if (!linked) throw new Error("Membership was created but could not be linked to the business.");
      onClose();
      onDone?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start membership.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <MobileBottomSheet open={open} onClose={onClose} title="Start membership">
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <p style={{ margin: 0, fontSize: 14, color: "var(--linear-color-ink-subtle)" }}>
          Logs a ${BUSINESS_MEMBERSHIP_ANNUAL_DUES}/year {BUSINESS_MEMBERSHIP_TIER} for{" "}
          {business?.business_name ?? "this business"}.
        </p>
        {error ? <div style={{ fontSize: 13, color: "#eb5757" }}>{error}</div> : null}
        <button type="button" style={mobilePrimaryBtnStyle} disabled={busy || !business} onClick={submit}>
          {busy ? "Saving…" : "Start membership"}
        </button>
        <button type="button" style={mobileSecondaryBtnStyle} onClick={onClose}>
          Cancel
        </button>
      </div>
    </MobileBottomSheet>
  );
}
