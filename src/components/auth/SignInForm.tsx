"use client";

import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { ChevronLeftIcon } from "@/icons";
import Link from "next/link";
import React, { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  sendLoginCode,
  verifyLoginCode,
  type SendLoginCodeState,
  type VerifyLoginCodeState,
} from "@/app/(full-width-pages)/(auth)/login/actions";

function SendCodeButton() {
  const { pending } = useFormStatus();
  return (
    <Button className="w-full" size="sm" type="submit" disabled={pending}>
      {pending ? "Sending code..." : "Send code"}
    </Button>
  );
}

function VerifyButton() {
  const { pending } = useFormStatus();
  return (
    <Button className="w-full" size="sm" type="submit" disabled={pending}>
      {pending ? "Signing in..." : "Sign in"}
    </Button>
  );
}

function ResendButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="text-sm text-brand-500 hover:text-brand-600 disabled:opacity-50 dark:text-brand-400"
    >
      {pending ? "Sending..." : "Resend code"}
    </button>
  );
}

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [useDifferentEmail, setUseDifferentEmail] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);

  const [sendState, sendAction] = useActionState<SendLoginCodeState, FormData>(
    sendLoginCode,
    null
  );
  const [verifyState, verifyAction] = useActionState<
    VerifyLoginCodeState,
    FormData
  >(verifyLoginCode, null);

  const showCodeStep = Boolean(sendState?.ok && email && !useDifferentEmail);

  function handleEmailSubmit(e: React.FormEvent<HTMLFormElement>) {
    const fd = new FormData(e.currentTarget);
    const raw = fd.get("email");
    if (typeof raw === "string") {
      setEmail(raw.trim().toLowerCase());
    }
    setUseDifferentEmail(false);
  }

  function handleResendSubmit() {
    setResendDisabled(true);
    window.setTimeout(() => setResendDisabled(false), 30_000);
  }

  function handleDifferentEmail() {
    setUseDifferentEmail(true);
    setEmail("");
  }

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Back to dashboard
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {!showCodeStep
                ? "Enter your email to receive a sign-in code."
                : "Enter the 8-digit code we sent to your email."}
            </p>
          </div>
          <div>
            {!showCodeStep ? (
              <form action={sendAction} onSubmit={handleEmailSubmit}>
                <div className="space-y-6">
                  {sendState?.error && (
                    <p className="text-sm text-error-500">{sendState.error}</p>
                  )}
                  <div>
                    <Label>
                      Email <span className="text-error-500">*</span>
                    </Label>
                    <Input
                      name="email"
                      placeholder="you@example.com"
                      type="email"
                      required
                      defaultValue={email}
                    />
                  </div>
                  <div>
                    <SendCodeButton />
                  </div>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                {!verifyState?.error && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    If this email is registered, we sent a code to{" "}
                    <span className="font-medium text-gray-800 dark:text-white/90">
                      {email}
                    </span>
                    .
                  </p>
                )}
                {verifyState?.error && (
                  <p className="text-sm text-error-500">{verifyState.error}</p>
                )}
                {sendState?.error && (
                  <p className="text-sm text-error-500">{sendState.error}</p>
                )}
                <form action={verifyAction}>
                  <input type="hidden" name="email" value={email} />
                  <div className="space-y-6">
                    <div>
                      <Label>
                        Code <span className="text-error-500">*</span>
                      </Label>
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
                    <div>
                      <VerifyButton />
                    </div>
                  </div>
                </form>
                <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
                  <button
                    type="button"
                    onClick={handleDifferentEmail}
                    className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    Use a different email
                  </button>
                  <form action={sendAction} onSubmit={handleResendSubmit}>
                    <input type="hidden" name="email" value={email} />
                    <ResendButton disabled={resendDisabled} />
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}