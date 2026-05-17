"use client";

import Label from "@/components/form/Label";
import {
  formatPresetHints,
  imageRequiredForService,
  validateImageDimensions,
} from "@/lib/buffer/imageSpecs";
import { serviceLabel } from "@/lib/buffer/services";
import type { BufferChannelRow, SupportedSocialService } from "@/lib/buffer/types";
import { useCallback, useEffect, useId, useState } from "react";

export type PlatformImageSlotValue = {
  file: File | null;
  preview: string | null;
  url: string | null;
  dims: { width: number; height: number } | null;
  validation: string | null;
  ok: boolean;
};

const EMPTY_SLOT: PlatformImageSlotValue = {
  file: null,
  preview: null,
  url: null,
  dims: null,
  validation: null,
  ok: false,
};

function readImageDimensions(
  file: File,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image dimensions."));
    };
    img.src = url;
  });
}

type PlatformImageSlotProps = {
  service: SupportedSocialService;
  channel: BufferChannelRow | null;
  value: PlatformImageSlotValue;
  onChange: (value: PlatformImageSlotValue) => void;
  disabled?: boolean;
};

export function emptyPlatformImageSlot(): PlatformImageSlotValue {
  return { ...EMPTY_SLOT };
}

export default function PlatformImageSlot({
  service,
  channel,
  value,
  onChange,
  disabled,
}: PlatformImageSlotProps) {
  const inputId = useId();
  const [validating, setValidating] = useState(false);

  const applyFile = useCallback(
    async (file: File | null) => {
      if (value.preview) URL.revokeObjectURL(value.preview);

      if (!file) {
        onChange(emptyPlatformImageSlot());
        return;
      }

      const preview = URL.createObjectURL(file);
      onChange({
        ...emptyPlatformImageSlot(),
        file,
        preview,
      });

      setValidating(true);
      try {
        const dims = await readImageDimensions(file);
        const result = validateImageDimensions(service, dims.width, dims.height);
        onChange({
          file,
          preview,
          url: null,
          dims,
          validation: result.message,
          ok: result.ok,
        });
      } catch (e) {
        onChange({
          file,
          preview,
          url: null,
          dims: null,
          validation:
            e instanceof Error ? e.message : "Could not validate image.",
          ok: false,
        });
      } finally {
        setValidating(false);
      }
    },
    [onChange, service, value.preview],
  );

  useEffect(() => {
    if (value.file && channel) {
      void applyFile(value.file);
    }
  }, [channel?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const required = imageRequiredForService(service);

  return (
    <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white/90">
          {serviceLabel(service)}
        </h3>
        {channel ? (
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            {channel.name} · {channel.descriptor}
            {channel.isDisconnected ? (
              <span className="text-amber-800 dark:text-amber-300">
                {" "}
                · Reconnect in Buffer
              </span>
            ) : null}
          </p>
        ) : (
          <p className="mt-0.5 text-xs text-amber-800 dark:text-amber-300">
            No {serviceLabel(service)} channel connected in Buffer.
          </p>
        )}
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {formatPresetHints(service)}
          {required ? " · Image required" : " · Image optional"}
        </p>
      </div>

      <Label htmlFor={inputId}>
        Image{required ? " (required)" : ""}
      </Label>
      <input
        id={inputId}
        type="file"
        accept="image/*"
        disabled={disabled || !channel || channel.isDisconnected}
        onChange={(e) => void applyFile(e.target.files?.[0] ?? null)}
        className="mt-2 block w-full text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand-700 disabled:opacity-50 dark:text-gray-400 dark:file:bg-brand-500/15 dark:file:text-brand-300"
      />

      {value.preview && (
        <div className="mt-3 flex items-start gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value.preview}
            alt={`${serviceLabel(service)} preview`}
            className="h-28 w-28 rounded-lg border border-gray-200 object-cover dark:border-gray-700"
          />
          <div className="text-sm">
            {validating ? (
              <p className="text-gray-500 dark:text-gray-400">Checking size…</p>
            ) : (
              <>
                {value.dims && (
                  <p className="text-gray-700 dark:text-gray-300">
                    Actual: {value.dims.width}×{value.dims.height}
                  </p>
                )}
                {value.validation && (
                  <p
                    className={
                      value.ok
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-amber-800 dark:text-amber-300"
                    }
                  >
                    {value.validation}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
