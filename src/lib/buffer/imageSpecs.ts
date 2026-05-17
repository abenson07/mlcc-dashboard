import type { SupportedSocialService } from "@/lib/buffer/types";

export type ImagePreset = {
  id: string;
  label: string;
  width: number;
  height: number;
};

export type ImageValidationResult = {
  ok: boolean;
  preset: ImagePreset | null;
  message: string;
};

const ASPECT_TOLERANCE = 0.1;

export const CAPTION_LIMITS: Record<SupportedSocialService, number> = {
  instagram: 2200,
  facebook: 63206,
};

/** Binding limit when one caption is shared across Instagram and Facebook. */
export const SHARED_CAPTION_LIMIT = CAPTION_LIMITS.instagram;

export const IMAGE_PRESETS: Record<SupportedSocialService, ImagePreset[]> = {
  instagram: [
    { id: "ig-square", label: "Feed (1:1)", width: 1080, height: 1080 },
    { id: "ig-portrait", label: "Portrait (4:5)", width: 1080, height: 1350 },
  ],
  facebook: [
    { id: "fb-square", label: "Square", width: 1080, height: 1080 },
    { id: "fb-landscape", label: "Landscape", width: 1200, height: 630 },
  ],
};

function aspectRatio(width: number, height: number): number {
  return width / height;
}

function aspectMatches(
  actualW: number,
  actualH: number,
  preset: ImagePreset,
): boolean {
  const target = aspectRatio(preset.width, preset.height);
  const actual = aspectRatio(actualW, actualH);
  const delta = Math.abs(target - actual) / target;
  return delta <= ASPECT_TOLERANCE;
}

export function findClosestPreset(
  service: SupportedSocialService,
  width: number,
  height: number,
): ImagePreset | null {
  const presets = IMAGE_PRESETS[service];
  for (const preset of presets) {
    if (aspectMatches(width, height, preset)) return preset;
  }
  return null;
}

export function validateImageDimensions(
  service: SupportedSocialService,
  width: number,
  height: number,
): ImageValidationResult {
  const preset = findClosestPreset(service, width, height);
  if (preset) {
    return {
      ok: true,
      preset,
      message: `Matches ${preset.label} (${preset.width}×${preset.height}).`,
    };
  }
  const options = IMAGE_PRESETS[service]
    .map((p) => `${p.label} (${p.width}×${p.height})`)
    .join(" or ");
  return {
    ok: false,
    preset: null,
    message: `Image aspect ratio doesn't match ${options}.`,
  };
}

export function imageRequiredForService(service: SupportedSocialService): boolean {
  return service === "instagram";
}

export function formatPresetHints(service: SupportedSocialService): string {
  return IMAGE_PRESETS[service]
    .map((p) => `${p.label}: ${p.width}×${p.height}`)
    .join(" · ");
}
