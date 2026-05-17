"use client";

import React, { useMemo, useState } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Select from "@/components/form/Select";
import { useWebflowEvents } from "hooks";
import type { VolunteerCommitmentType, VolunteerCommitmentUnit } from "@/types/database";
import { getApiBase } from "@/lib/apiBase";
import { buildWebflowEventSelectOptions } from "@/lib/volunteers/webflowEventOptions";
import { toast } from "sonner";

type FormState = {
  title: string;
  description: string;
  commitment_type: VolunteerCommitmentType;
  commitment_unit: VolunteerCommitmentUnit;
  commitment_quantity: string;
  quantity: string;
  webflow_event_id: string;
};

const initialForm: FormState = {
  title: "",
  description: "",
  commitment_type: "one_off",
  commitment_unit: "hours",
  commitment_quantity: "1",
  quantity: "1",
  webflow_event_id: "",
};

interface AddVolunteerAskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export default function AddVolunteerAskModal({
  isOpen,
  onClose,
  onCreated,
}: AddVolunteerAskModalProps) {
  const {
    data: webflowEvents,
    isLoading: eventsLoading,
    isError: eventsError,
    error: eventsErrorDetail,
  } = useWebflowEvents({ enabled: isOpen });

  const [form, setForm] = useState<FormState>(initialForm);
  const [formKey, setFormKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const eventOptions = useMemo(
    () => buildWebflowEventSelectOptions(webflowEvents),
    [webflowEvents]
  );

  const update = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const reset = () => {
    setForm(initialForm);
    setError(null);
    setFieldErrors({});
    setFormKey((k) => k + 1);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = form.title.trim();
    const errors: Partial<Record<keyof FormState, string>> = {};
    if (!title) errors.title = "Title is required.";

    const commitmentQty = Number(form.commitment_quantity);
    if (!Number.isFinite(commitmentQty) || commitmentQty <= 0) {
      errors.commitment_quantity = "Enter a positive number.";
    }

    const slots = Number.parseInt(form.quantity, 10);
    if (!Number.isFinite(slots) || slots < 1) {
      errors.quantity = "Enter at least 1 volunteer needed.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${getApiBase()}/api/volunteers/asks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: form.description.trim() || null,
          commitment_type: form.commitment_type,
          commitment_unit: form.commitment_unit,
          commitment_quantity: commitmentQty,
          quantity: slots,
          webflowEventItemId: form.webflow_event_id.trim() || null,
        }),
      });

      const json = (await res.json()) as {
        error?: string;
        missing?: string[];
        webflowError?: string | null;
        webflow?: unknown;
      };

      if (!res.ok) {
        const missing =
          json.missing?.length ? ` Missing: ${json.missing.join(", ")}.` : "";
        throw new Error((json.error ?? "Failed to create volunteer ask.") + missing);
      }

      if (json.webflow) {
        toast.success("Volunteer ask saved and published to Webflow.");
      } else if (json.webflowError) {
        toast.success("Volunteer ask saved.");
        toast.error(json.webflowError);
      } else {
        toast.success("Volunteer ask saved.");
      }

      reset();
      onClose();
      onCreated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create volunteer ask.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-[640px] p-5 lg:p-10">
      <form key={formKey} onSubmit={handleSubmit}>
        <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">
          Add volunteer ask
        </h4>

        {error ? (
          <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : null}

        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
          <div className="col-span-1 sm:col-span-2">
            <Label>Title</Label>
            <Input
              type="text"
              placeholder="e.g. Setup crew"
              defaultValue={form.title}
              onChange={(e) => update("title", e.target.value)}
              error={Boolean(fieldErrors.title)}
              hint={fieldErrors.title}
            />
          </div>

          <div className="col-span-1 sm:col-span-2">
            <Label>Description</Label>
            <TextArea
              rows={4}
              placeholder="What will volunteers do?"
              value={form.description}
              onChange={(v) => update("description", v)}
            />
          </div>

          <div>
            <Label>Volunteers needed</Label>
            <Input
              type="number"
              min="1"
              step={1}
              placeholder="2"
              defaultValue={form.quantity}
              onChange={(e) => update("quantity", e.target.value)}
              error={Boolean(fieldErrors.quantity)}
              hint={fieldErrors.quantity}
            />
          </div>

          <div>
            <Label>Time unit</Label>
            <Select
              key={`unit-${formKey}`}
              defaultValue={form.commitment_unit}
              options={[
                { value: "hours", label: "Hours" },
                { value: "minutes", label: "Minutes" },
              ]}
              onChange={(v) => update("commitment_unit", v as VolunteerCommitmentUnit)}
            />
          </div>

          <div>
            <Label>Commitment type</Label>
            <Select
              key={`type-${formKey}`}
              defaultValue={form.commitment_type}
              options={[
                { value: "one_off", label: "One-off" },
                { value: "ongoing", label: "Ongoing (per month)" },
              ]}
              onChange={(v) => update("commitment_type", v as VolunteerCommitmentType)}
            />
          </div>

          <div>
            <Label>Time per volunteer</Label>
            <Input
              type="number"
              min="0"
              step={0.25}
              placeholder="3"
              defaultValue={form.commitment_quantity}
              onChange={(e) => update("commitment_quantity", e.target.value)}
              error={Boolean(fieldErrors.commitment_quantity)}
              hint={fieldErrors.commitment_quantity}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {form.commitment_type === "ongoing"
                ? "Ongoing asks use this amount per month."
                : "Total time for this one-off role."}
            </p>
          </div>

          <div className="col-span-1 sm:col-span-2">
            <Label>Event (optional)</Label>
            {eventsLoading ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">Loading events…</p>
            ) : eventsError ? (
              <p className="text-sm text-red-600 dark:text-red-400">
                {eventsErrorDetail instanceof Error
                  ? eventsErrorDetail.message
                  : "Could not load events from Webflow."}
              </p>
            ) : (
              <Select
                key={`event-${formKey}`}
                defaultValue={form.webflow_event_id}
                placeholder="No linked event"
                options={eventOptions}
                onChange={(v) => update("webflow_event_id", v)}
              />
            )}
          </div>
        </div>

        <div className="mt-8 flex items-center justify-end gap-3">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={submitting}>
            {submitting ? "Saving…" : "Save volunteer ask"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
