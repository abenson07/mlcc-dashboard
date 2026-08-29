"use client";

/**
 * Admin app lives at `/admin`. Shared client-template components that
 * prefix navigation use this so they do not hardcode a stale preview path.
 */
export function useAdminBasePath(): "/admin" {
  return "/admin";
}
