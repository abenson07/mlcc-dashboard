"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/patterns/shared/Modal";
import { Button } from "@/components/patterns/primitives/Button";
import { TextInput } from "@/components/patterns/primitives/TextInput";
import { Text } from "@/components/patterns/primitives/Text";
import { Checkbox } from "@/components/patterns/primitives/Checkbox";
import { parseDollarAmount } from "@/lib/sponsorship/addSponsor";
import { saveErrorMessage } from "@/lib/saveErrorMessage";
import { validateEmail } from "@/lib/validation";
import type { BusinessMemberRow, BusinessRow, SponsorRow, SponsorshipLevel } from "./types";
import { localIsoDate, BUSINESS_MEMBERSHIP_ANNUAL_DUES, BUSINESS_MEMBERSHIP_TIER } from "./adapters";

export type BusinessesView = "members" | "sponsors" | "all";

export type NewSponsorInput = Omit<SponsorRow, "id"> & {
  contactName: string;
  email: string;
  alreadyPaid: boolean;
};

export type AddBusinessModalProps = {
  isOpen: boolean;
  view: BusinessesView;
  onClose: () => void;
  onAddMember: (row: Omit<BusinessMemberRow, "id">) => void | Promise<void>;
  onAddSponsor: (row: NewSponsorInput) => void | Promise<void>;
  onAddBusiness: (row: Omit<BusinessRow, "id">) => void | Promise<void>;
};

const LEVELS: SponsorshipLevel[] = ["platinum", "gold", "silver", "bronze"];
const LEVEL_LABEL: Record<SponsorshipLevel, string> = {
  platinum: "Platinum",
  gold: "Gold",
  silver: "Silver",
  bronze: "Bronze",
};

const TITLE: Record<BusinessesView, string> = {
  members: "Add business member",
  sponsors: "Add sponsor",
  all: "Add business",
};

const CURRENT_YEAR = new Date().getFullYear();

const fieldLabelStyle = { fontSize: 12, color: "var(--linear-color-ink-subtle)" } as const;
const selectStyle = {
  boxSizing: "border-box" as const,
  width: "100%",
  height: 32,
  paddingInline: 8,
  borderRadius: 6,
  border: "var(--linear-border-width) solid var(--linear-color-hairline)",
  background: "var(--linear-color-canvas)",
  color: "var(--linear-color-ink)",
  fontSize: 13,
  fontFamily: "inherit",
};

/** Add-business form, split by the active Businesses view since each roster tracks different fields. */
export function AddBusinessModal({
  isOpen,
  view,
  onClose,
  onAddMember,
  onAddSponsor,
  onAddBusiness,
}: AddBusinessModalProps) {
  const [businessName, setBusinessName] = useState("");
  const [renewalDate, setRenewalDate] = useState("");
  const [annualDues, setAnnualDues] = useState(String(BUSINESS_MEMBERSHIP_ANNUAL_DUES));
  const [sponsorshipLevel, setSponsorshipLevel] = useState<SponsorshipLevel>(LEVELS[0]);
  const [amount, setAmount] = useState("");
  const [lastSponsoredYear, setLastSponsoredYear] = useState(String(CURRENT_YEAR));
  const [sponsorSince, setSponsorSince] = useState("");
  const [category, setCategory] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [alreadyPaid, setAlreadyPaid] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setBusinessName("");
    setRenewalDate("");
    setAnnualDues(String(BUSINESS_MEMBERSHIP_ANNUAL_DUES));
    setSponsorshipLevel(LEVELS[0]);
    setAmount("");
    setLastSponsoredYear(String(CURRENT_YEAR));
    setSponsorSince("");
    setCategory("");
    setContactName("");
    setPhone("");
    setEmail("");
    setAlreadyPaid(false);
    setError(null);
  }, [isOpen, view]);

  async function handleSubmit() {
    if (!businessName.trim()) {
      setError("Enter a business name.");
      return;
    }
    const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

    setBusy(true);
    setError(null);
    try {
      if (view === "members") {
        const renewal = renewalDate || localIsoDate();
        await onAddMember({
          businessName: businessName.trim(),
          tier: BUSINESS_MEMBERSHIP_TIER,
          renewalDate: renewal,
          status: "Active",
          memberSince: renewal,
          annualDues: Number(annualDues) || BUSINESS_MEMBERSHIP_ANNUAL_DUES,
        });
      } else if (view === "sponsors") {
        const parsedAmount = parseDollarAmount(amount);
        if (parsedAmount === null) throw new Error("Enter an amount greater than $0.");
        const emailError = validateEmail(email);
        if (emailError) throw new Error(emailError);
        await onAddSponsor({
          businessName: businessName.trim(),
          sponsorshipLevel,
          amount: parsedAmount,
          lastSponsoredYear: Number(lastSponsoredYear) || CURRENT_YEAR,
          sponsorSince: sponsorSince ? formatDate(sponsorSince) : today,
          contactName: contactName.trim(),
          email: email.trim(),
          alreadyPaid,
        });
      } else {
        await onAddBusiness({
          businessName: businessName.trim(),
          category: category.trim(),
          contactName: contactName.trim(),
          phone: phone.trim(),
        });
      }
      onClose();
    } catch (e) {
      setError(saveErrorMessage(e, { fallback: "Something went wrong. Please try again." }));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={TITLE[view]}
      footer={
        <>
          <Button label="Cancel" variant="secondary" onClick={onClose} />
          <Button
            label={busy ? "Saving…" : TITLE[view]}
            variant="primary"
            disabled={busy}
            onClick={() => void handleSubmit()}
          />
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <TextInput label="Business name" value={businessName} onChange={setBusinessName} />

        {view === "members" ? (
          <>
            <div>
              <span style={fieldLabelStyle}>Type</span>
              <div style={{ marginTop: 6, fontSize: 13, color: "var(--linear-color-ink)" }}>
                {BUSINESS_MEMBERSHIP_TIER}
              </div>
            </div>
            <TextInput label="Annual dues" value={annualDues} onChange={setAnnualDues} />
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={fieldLabelStyle}>Last renewal</span>
              <input
                type="date"
                value={renewalDate}
                onChange={(event) => setRenewalDate(event.target.value)}
                style={selectStyle}
              />
            </label>
          </>
        ) : null}

        {view === "sponsors" ? (
          <>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={fieldLabelStyle}>Sponsorship level</span>
              <select
                value={sponsorshipLevel}
                onChange={(event) => setSponsorshipLevel(event.target.value as SponsorshipLevel)}
                style={selectStyle}
              >
                {LEVELS.map((option) => (
                  <option key={option} value={option}>
                    {LEVEL_LABEL[option]}
                  </option>
                ))}
              </select>
            </label>
            <TextInput label="Amount" value={amount} onChange={setAmount} />
            <TextInput label="Last sponsored year" value={lastSponsoredYear} onChange={setLastSponsoredYear} />
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={fieldLabelStyle}>Sponsor since</span>
              <input
                type="date"
                value={sponsorSince}
                onChange={(event) => setSponsorSince(event.target.value)}
                style={selectStyle}
              />
            </label>
            <TextInput label="Contact name" value={contactName} onChange={setContactName} />
            <TextInput label="Contact email" value={email} onChange={setEmail} />
            <Checkbox label="Already paid" value={alreadyPaid} onChange={setAlreadyPaid} />
          </>
        ) : null}

        {view === "all" ? (
          <>
            <TextInput label="Category" value={category} onChange={setCategory} />
            <TextInput label="Contact name" value={contactName} onChange={setContactName} />
            <TextInput label="Phone" value={phone} onChange={setPhone} />
          </>
        ) : null}

        {error ? <Text size="sm" color="accent">{error}</Text> : null}
      </div>
    </Modal>
  );
}

function formatDate(value: string): string {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
