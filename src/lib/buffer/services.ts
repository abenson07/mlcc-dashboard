import type { SupportedSocialService } from "@/lib/buffer/types";

const SUPPORTED = new Set<string>(["instagram", "facebook"]);

export function isSupportedSocialService(
  service: string,
): service is SupportedSocialService {
  return SUPPORTED.has(service.toLowerCase());
}

export function serviceLabel(service: SupportedSocialService): string {
  return service === "instagram" ? "Instagram" : "Facebook";
}
