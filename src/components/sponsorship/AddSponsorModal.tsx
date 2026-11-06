"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import { useBusinesses } from "hooks";
import type { SponsorshipTierSeed } from "@/lib/sponsorship/tierPlaceholders";
import { defaultSponsorshipTierSeeds } from "@/lib/sponsorship/tierPlaceholders";
import type { SponsorshipsInsert } from "@/types/database";
import { canCreateBusinessFromSearch, parseDollarAmount } from "@/lib/sponsorship/addSponsor";
import { saveErrorMessage } from "@/lib/saveErrorMessage";
import { validateEmail } from "@/lib/validation";
import { localIsoDate } from "@/components/patterns/client-templates-migrate/businesses/adapters";
import { useCreateSponsorBusiness } from "./useCreateSponsorBusiness";

type AddSponsorModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: Omit<SponsorshipsInsert, "event_id" | "leaflet_id">) => Promise<void>;
  tierOptions?: SponsorshipTierSeed[];
};

const MIN_SEARCH_LEN = 1;

export default function AddSponsorModal({
  isOpen,
  onClose,
  onSubmit,
  tierOptions,
}: AddSponsorModalProps) {
  // Memoized: a new array each render re-ran the reset below and wiped the chosen level and amount.
  const tiers = useMemo(
    () => (tierOptions?.length ? tierOptions : defaultSponsorshipTierSeeds()),
    [tierOptions],
  );
  const createSponsorBusiness = useCreateSponsorBusiness();
  const [creatingBusiness, setCreatingBusiness] = useState(false);
  const [newName, setNewName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [businessId, setBusinessId] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [tier, setTier] = useState<string>(tiers[0]?.name ?? "Gold");
  const [amount, setAmount] = useState(String(tiers[0]?.amount ?? 1000));
  const [status, setStatus] = useState<"pledged" | "invoiced" | "paid">("pledged");
  const [memo, setMemo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(search.trim()), 200);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    if (!isOpen) return;
    setTier(tiers[0]?.name ?? "Gold");
    setAmount(String(tiers[0]?.amount ?? 1000));
  }, [isOpen, tiers]);

  const canSearch = debouncedQ.length >= MIN_SEARCH_LEN;
  const { businesses, loading } = useBusinesses({
    autoFetch: isOpen && canSearch,
    filters: canSearch ? { search: debouncedQ } : undefined,
  });

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const selectedBusiness = useMemo(
    () => businesses.find((b) => b.id === businessId),
    [businesses, businessId],
  );

  const tierSelectOptions = useMemo(
    () =>
      tiers.map((t) => ({
        value: t.name,
        label: `${t.name} ($${t.amount.toLocaleString()})`,
      })),
    [tiers],
  );

  const reset = () => {
    setSearch("");
    setBusinessId("");
    setCreatingBusiness(false);
    setNewName("");
    setContactName("");
    setContactEmail("");
    setTier(tiers[0]?.name ?? "Gold");
    setAmount(String(tiers[0]?.amount ?? 1000));
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
    const def = tiers.find((t) => t.name === name);
    if (def) setAmount(String(def.amount));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId && !(creatingBusiness && newName.trim())) {
      setError(creatingBusiness ? "Enter a business name." : "Select a business.");
      return;
    }
    const parsedAmount = parseDollarAmount(amount);
    if (parsedAmount === null) {
      setError("Enter a valid amount.");
      return;
    }
    const emailError = creatingBusiness ? validateEmail(contactEmail) : null;
    if (emailError) {
      setError(emailError);
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      let id = businessId;
      if (!id) {
        // The id stays in state so retrying the sponsorship can't duplicate the business.
        id = await createSponsorBusiness(newName.trim(), { contactName, email: contactEmail });
        setBusinessId(id);
        setSearch(newName.trim());
        setCreatingBusiness(false);
      }
      await onSubmit({
        business_id: id,
        description: tier,
        amount: parsedAmount,
        status,
        paid_date: status === "paid" ? localIsoDate() : null,
        memo: memo.trim() || null,
        quantity: 1,
      });
      reset();
      onClose();
    } catch (err) {
      setError(saveErrorMessage(err, { fallback: "Failed to add sponsor." }));
    } finally {
      setSubmitting(false);
    }
  };

  const inputRing =
    "h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-blue-400";

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-md p-6">
      <form onSubmit={(e) => void handleSubmit(e)}>
        <h2 className="lf-h2" style={{ marginBottom: 16 }}>
          Add sponsor
        </h2>

        {error ? <p className="lf-text-red" style={{ marginBottom: 12 }}>{error}</p> : null}

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div ref={wrapRef} className="relative">
            <Label>Business</Label>
            <input
              type="text"
              autoComplete="off"
              value={
                creatingBusiness
                  ? newName
                  : businessId
                    ? (selectedBusiness?.business_name ?? search)
                    : search
              }
              onChange={(e) => {
                if (creatingBusiness) {
                  setNewName(e.target.value);
                  return;
                }
                setSearch(e.target.value);
                setBusinessId("");
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              placeholder="Search businesses…"
              className={`mt-2 ${inputRing}`}
            />
            {showDropdown && canSearch && !creatingBusiness && (
              <ul className="absolute top-full z-50 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-600 dark:bg-gray-900">
                {loading ? (
                  <li className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                    Searching…
                  </li>
                ) : (
                  businesses.map((b) => (
                    <li key={b.id} role="presentation">
                      <button
                        type="button"
                        className="flex w-full flex-col gap-0.5 px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setBusinessId(b.id);
                          setSearch(b.business_name ?? "");
                          setShowDropdown(false);
                        }}
                      >
                        <span className="truncate font-medium text-gray-900 dark:text-white">
                          {b.business_name ?? "Business"}
                        </span>
                        {b.email ? (
                          <span className="truncate text-xs text-gray-500 dark:text-gray-400">
                            {b.email}
                          </span>
                        ) : null}
                      </button>
                    </li>
                  ))
                )}
                {!loading &&
                canCreateBusinessFromSearch(
                  search,
                  businesses.map((b) => b.business_name),
                ) ? (
                  <li role="presentation">
                    <button
                      type="button"
                      className="w-full px-3 py-2 text-left text-sm font-medium text-blue-600 hover:bg-gray-50 dark:text-blue-400 dark:hover:bg-gray-800"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setCreatingBusiness(true);
                        setNewName(search.trim());
                        setShowDropdown(false);
                      }}
                    >
                      Create &ldquo;{search.trim()}&rdquo; as a new business
                    </button>
                  </li>
                ) : null}
              </ul>
            )}
          </div>

          {creatingBusiness ? (
            <>
              <div>
                <Label>Contact name (optional)</Label>
                <Input type="text" value={contactName} onChange={(e) => setContactName(e.target.value)} />
              </div>
              <div>
                <Label>Contact email (optional)</Label>
                <Input type="text" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
              </div>
              <button
                type="button"
                className="self-start text-sm text-blue-600 dark:text-blue-400"
                onClick={() => {
                  setCreatingBusiness(false);
                  setNewName("");
                  setContactName("");
                  setContactEmail("");
                }}
              >
                Choose an existing business instead
              </button>
            </>
          ) : null}

          <div>
            <Label>Sponsorship level</Label>
            <Select options={tierSelectOptions} defaultValue={tier} onChange={handleTierChange} />
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

        <div className="flex items-center justify-end gap-3" style={{ marginTop: 24 }}>
          <Button type="button" size="sm" variant="ghost" onClick={handleClose} disabled={submitting}>
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