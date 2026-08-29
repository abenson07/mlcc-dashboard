"use client";

import * as React from "react";
import { getApiBase } from "@/lib/apiBase";
import type { OpenRoute } from "@marketing/data/open-routes";

const inputClassName =
  "mb-3 min-h-12 w-full rounded-lg border border-sparkles-cream bg-white px-4 py-2 font-body text-base leading-6 text-sparkles-navy/90 placeholder:text-sparkles-muted focus:border-sparkles-navy focus:text-sparkles-navy focus:outline-none";

const labelClassName =
  "mb-2 font-body text-xs leading-4 font-bold uppercase tracking-[0.0625rem] text-sparkles-navy";

export function OpenRouteSignupModal({
  route,
  onClose,
  onSignedUp,
}: {
  route: OpenRoute;
  onClose: () => void;
  onSignedUp: (deliveryId: string) => void;
}) {
  const panelRef = React.useRef<HTMLDivElement>(null);
  const [status, setStatus] = React.useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    panelRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!route.deliveryId) {
      setStatus("error");
      setErrorMessage("This route isn't available to claim yet.");
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const address = String(formData.get("address") ?? "").trim();
    const website = String(formData.get("website") ?? "").trim();

    setStatus("submitting");
    setErrorMessage(null);
    try {
      const response = await fetch(`${getApiBase()}/api/public/open-routes/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliveryId: route.deliveryId,
          name,
          email,
          address,
          website,
        }),
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        throw new Error(payload?.error || "Request failed");
      }
      setStatus("success");
      onSignedUp(route.deliveryId);
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <div className="fixed inset-0 z-[1000]">
      <button
        type="button"
        aria-label="Close sign up"
        onClick={onClose}
        className="absolute inset-0 bg-puget-night/40"
      />
      <div className="absolute inset-0 flex items-start justify-center overflow-y-auto px-4 py-16 max-[767px]:py-8">
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="open-route-signup-title"
          tabIndex={-1}
          className="relative w-full max-w-[28rem] rounded-2xl bg-sparkles-warm p-8 outline-none"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-5 top-5 font-display text-sm font-bold text-sparkles-navy uppercase"
          >
            Close
          </button>

          {status === "success" ? (
            <div className="flex flex-col gap-4 pr-10">
              <h2
                id="open-route-signup-title"
                className="m-0 font-display text-[1.75rem] leading-8 font-bold tracking-[-0.0625rem] text-puget-night"
              >
                You&apos;re signed up
              </h2>
              <p className="m-0 font-body text-base leading-6 text-sparkles-navy">
                Thanks for taking {route.routeName}. Check your email for a confirmation, and we&apos;ll
                follow up with delivery details.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-2 inline-flex items-center justify-center rounded-[2rem] border border-sparkles-navy bg-sparkles-navy px-4 py-3 font-display text-sm leading-5 font-bold text-sparkles-cream"
              >
                Done
              </button>
            </div>
          ) : (
            <form className="flex flex-col" aria-label={`Sign up for ${route.routeName}`} onSubmit={handleSubmit}>
              <div className="mb-6 pr-10">
                <h2
                  id="open-route-signup-title"
                  className="m-0 font-display text-[1.75rem] leading-8 font-bold tracking-[-0.0625rem] text-puget-night"
                >
                  Sign up to deliver
                </h2>
                <p className="mt-2 mb-0 font-body text-base leading-6 text-sparkles-navy">{route.routeName}</p>
              </div>

              <label htmlFor="open-route-name" className={labelClassName}>
                Name
              </label>
              <input
                className={inputClassName}
                maxLength={256}
                name="name"
                placeholder="Full name"
                type="text"
                id="open-route-name"
                autoComplete="name"
                required
              />

              <label htmlFor="open-route-email" className={labelClassName}>
                Email
              </label>
              <input
                className={inputClassName}
                maxLength={256}
                name="email"
                placeholder="Email"
                type="email"
                id="open-route-email"
                autoComplete="email"
                required
              />

              <label htmlFor="open-route-address" className={labelClassName}>
                Address
              </label>
              <textarea
                className={`${inputClassName} min-h-24 resize-y`}
                maxLength={500}
                name="address"
                placeholder="Street address for Leaflet pickup and delivery"
                id="open-route-address"
                autoComplete="street-address"
                required
              />

              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: "-9999px",
                  width: "1px",
                  height: "1px",
                  overflow: "hidden",
                }}
              />

              <button
                type="submit"
                disabled={status === "submitting"}
                className="mt-1 w-full cursor-pointer rounded-[2rem] border border-sparkles-navy bg-sparkles-navy px-4 py-3 font-display text-sm leading-5 font-bold text-sparkles-cream transition-all duration-300 hover:border-sparkles-navy/90 hover:bg-sparkles-navy/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "submitting" ? "Signing up…" : "Sign up"}
              </button>
              {errorMessage ? (
                <p className="mt-3 mb-0 font-body text-sm text-red-700">{errorMessage}</p>
              ) : null}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
