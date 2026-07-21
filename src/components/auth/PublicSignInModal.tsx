"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import PostVerifyChooser from "@/components/auth/PostVerifyChooser";
import {
  checkSignInEmail,
  sendLoginCode,
  startMemberSignIn,
  verifyLoginCode,
} from "@/app/(full-width-pages)/(auth)/login/actions";

type Step = "email" | "admin-code" | "check-email" | "chooser";

interface PublicSignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/** Generic public sign-in: admins get a code, known members get a magic link. */
export default function PublicSignInModal({
  isOpen,
  onClose,
}: PublicSignInModalProps) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function handleClose() {
    setStep("email");
    setEmail("");
    setError(null);
    onClose();
  }

  async function handleEmailSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const raw = new FormData(e.currentTarget).get("email");
    const normalized = typeof raw === "string" ? raw.trim() : "";
    setEmail(normalized);
    setError(null);
    setPending(true);

    const result = await checkSignInEmail(normalized);
    if ("error" in result) {
      setError(result.error);
      setPending(false);
      return;
    }

    if (result.isAdmin) {
      const fd = new FormData();
      fd.set("email", normalized);
      const sendResult = await sendLoginCode(null, fd);
      if (sendResult?.error) {
        setError(sendResult.error);
        setPending(false);
        return;
      }
      setStep("admin-code");
    } else {
      await startMemberSignIn(normalized);
      setStep("check-email");
    }
    setPending(false);
  }

  async function handleCodeSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(null);
    setPending(true);
    const result = await verifyLoginCode(null, fd);
    if (result?.error) {
      setError(result.error);
      setPending(false);
      return;
    }
    setStep("chooser");
    setPending(false);
  }

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto p-4">
      <div
        className="fixed inset-0 h-full w-full bg-gray-400/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M6.04289 16.5413C5.65237 16.9318 5.65237 17.565 6.04289 17.9555C6.43342 18.346 7.06658 18.346 7.45711 17.9555L11.9987 13.4139L16.5408 17.956C16.9313 18.3466 17.5645 18.3466 17.955 17.956C18.3455 17.5655 18.3455 16.9323 17.955 16.5418L13.4129 11.9997L17.955 7.4576C18.3455 7.06707 18.3455 6.43391 17.955 6.04338C17.5645 5.65286 16.9313 5.65286 16.5408 6.04338L11.9987 10.5855L7.45711 6.0439C7.06658 5.65338 6.43342 5.65338 6.04289 6.0439C5.65237 6.43442 5.65237 7.06759 6.04289 7.45811L10.5845 11.9997L6.04289 16.5413Z"
              fill="currentColor"
            />
          </svg>
        </button>

        {step === "chooser" ? (
          <div className="pt-2">
            <PostVerifyChooser />
          </div>
        ) : step === "check-email" ? (
          <div className="space-y-3 pt-2">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Check your email
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              We&apos;ve sent a sign-in link to{" "}
              <span className="font-medium text-gray-800 dark:text-white/90">
                {email}
              </span>
              . Click the link to sign in.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Didn&apos;t get it? Double-check that you used the email address
              associated with your account.
            </p>
          </div>
        ) : step === "admin-code" ? (
          <form onSubmit={handleCodeSubmit} className="space-y-4 pt-2">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Enter your code
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Enter the 8-digit code we sent to{" "}
              <span className="font-medium text-gray-800 dark:text-white/90">
                {email}
              </span>
              .
            </p>
            {error && <p className="text-sm text-error-500">{error}</p>}
            <input type="hidden" name="email" value={email} />
            <div>
              <Label>Code</Label>
              <Input
                name="token"
                placeholder="00000000"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={8}
                pattern="[0-9]{8}"
                required
                className="text-center tracking-[0.35em] font-mono"
              />
            </div>
            <Button className="w-full" size="sm" type="submit" disabled={pending}>
              {pending ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleEmailSubmit} className="space-y-4 pt-2">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Sign in
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Enter your email to sign in to your account.
            </p>
            {error && <p className="text-sm text-error-500">{error}</p>}
            <div>
              <Label>Email</Label>
              <Input
                name="email"
                placeholder="you@example.com"
                type="email"
                required
              />
            </div>
            <Button className="w-full" size="sm" type="submit" disabled={pending}>
              {pending ? "Checking..." : "Continue"}
            </Button>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}
