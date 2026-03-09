"use client";

import React, { useState, useEffect } from "react";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { usePeople } from "hooks";
import type { PersonWithMembership } from "hooks";
import type { PeopleUpdate } from "@/types/database";
import { validateEmail, validatePhone } from "@/lib/validation";

interface NeighborDetailSidebarProps {
  person: PersonWithMembership;
  onSaved?: () => void;
  onClose?: () => void;
}

export default function NeighborDetailSidebar({
  person,
  onSaved,
  onClose,
}: NeighborDetailSidebarProps) {
  const { update } = usePeople({ autoFetch: false });
  const [full_name, setFullName] = useState(person.full_name ?? "");
  const [email, setEmail] = useState(person.email ?? "");
  const [phone, setPhone] = useState(person.phone ?? "");
  const [address, setAddress] = useState(person.address ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    full_name?: string;
    email?: string;
    phone?: string;
  }>({});

  useEffect(() => {
    setFullName(person.full_name ?? "");
    setEmail(person.email ?? "");
    setPhone(person.phone ?? "");
    setAddress(person.address ?? "");
    setError(null);
    setFieldErrors({});
  }, [person.id, person.full_name, person.email, person.phone, person.address]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullNameTrimmed = full_name.trim();
    if (!fullNameTrimmed) {
      setFieldErrors((prev) => ({ ...prev, full_name: "Name is required." }));
      return;
    }
    const emailError = validateEmail(email || null);
    const phoneError = validatePhone(phone || null);
    if (emailError || phoneError) {
      setFieldErrors({
        ...(emailError && { email: emailError }),
        ...(phoneError && { phone: phoneError }),
      });
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    setError(null);
    try {
      const payload: PeopleUpdate = {
        full_name: fullNameTrimmed,
        email: email.trim() || null,
        phone: phone.trim() || null,
        address: address.trim() || null,
      };
      const updated = await update(person.id, payload);
      if (updated) {
        onSaved?.();
      } else {
        setError("Failed to update. Please try again.");
      }
    } catch {
      setError("Failed to update. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      <div>
        <Label>Full Name</Label>
        <Input
          type="text"
          placeholder="Full name"
          defaultValue={full_name}
          onChange={(e) => {
            setFullName(e.target.value);
            setFieldErrors((prev) => ({ ...prev, full_name: undefined }));
          }}
          error={!!fieldErrors.full_name}
          hint={fieldErrors.full_name}
        />
      </div>
      <div>
        <Label>Email</Label>
        <Input
          type="email"
          placeholder="email@example.com"
          defaultValue={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setFieldErrors((prev) => ({ ...prev, email: undefined }));
          }}
          error={!!fieldErrors.email}
          hint={fieldErrors.email}
        />
      </div>
      <div>
        <Label>Phone</Label>
        <Input
          type="text"
          placeholder="Phone number"
          defaultValue={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            setFieldErrors((prev) => ({ ...prev, phone: undefined }));
          }}
          error={!!fieldErrors.phone}
          hint={fieldErrors.phone}
        />
      </div>
      <div>
        <Label>Address</Label>
        <Input
          type="text"
          placeholder="Address"
          defaultValue={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-2 pt-2">
        <Button size="sm" type="submit" disabled={submitting}>
          {submitting ? "Saving…" : "Save"}
        </Button>
        {onClose && (
          <Button size="sm" type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
        )}
      </div>
    </form>
  );
}
