"use client";

import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { ArrowRightIcon } from "@/icons";
import {
  sendLoginCode,
  verifyLoginCode,
  type SendLoginCodeState,
  type VerifyLoginCodeState,
} from "@/app/(full-width-pages)/(auth)/login/actions";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

const ACCOUNT_PANEL_IMAGE =
  "https://cdn.prod.website-files.com/6a2fa8175a11738252f297aa/images/image-account_1image-account.avif";

function SendCodeButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      className="w-full"
      size="md"
      type="submit"
      disabled={pending}
      endIcon={<ArrowRightIcon className="h-4 w-4" />}
    >
      {pending ? "Sending code..." : "Send code"}
    </Button>
  );
}

function VerifyButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      className="w-full"
      size="md"
      type="submit"
      disabled={pending}
      endIcon={<ArrowRightIcon className="h-4 w-4" />}
    >
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
      className="text-sm text-brand-600 hover:text-brand-700 disabled:opacity-50 dark:text-brand-400 dark:hover:text-brand-300"
    >
      {pending ? "Sending..." : "Resend code"}
    </button>
  );
}

export function AccountSection() {
  const leftRef = React.useRef<HTMLDivElement>(null);
  const rightRef = React.useRef<HTMLDivElement>(null);
  const [leftVisible, setLeftVisible] = React.useState(false);
  const [rightVisible, setRightVisible] = React.useState(false);

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

  React.useEffect(() => {
    const leftEl = leftRef.current;
    const rightEl = rightRef.current;
    if (!leftEl || !rightEl) return;

    const leftObs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setLeftVisible(true);
          leftObs.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    const rightObs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setRightVisible(true);
          rightObs.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    leftObs.observe(leftEl);
    rightObs.observe(rightEl);

    return () => {
      leftObs.disconnect();
      rightObs.disconnect();
    };
  }, []);

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
    <section className="bg-gray-100 dark:bg-gray-950">
      <div className="px-8 max-md:px-4">
        <div className="mx-auto w-full">
          <div className="grid min-h-dvh gap-4 py-8 max-md:grid-cols-1 max-md:py-6 max-[991px]:grid-cols-2 min-[992px]:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
            <div
              ref={leftRef}
              className={`flex w-full flex-col items-stretch justify-between rounded-mercury-button-lg bg-white p-12 transition-all duration-700 ease-out max-md:rounded-mercury-card max-md:px-6 max-md:py-8 dark:bg-gray-900 ${
                leftVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-[50px] opacity-0"
              }`}
            >
              <div className="flex flex-col gap-20 max-md:gap-14">
                <Link href="/" className="block max-w-[6rem]">
                  <Image
                    src="/admin/images/mlcc-logo.jpg"
                    alt="Maple Leaf Community Council"
                    width={96}
                    height={96}
                    className="h-auto w-full rounded-mercury-subtle"
                    priority
                  />
                </Link>

                <div>
                  {!showCodeStep ? (
                    <form
                      action={sendAction}
                      onSubmit={handleEmailSubmit}
                      className="flex flex-col gap-12 max-md:gap-8"
                    >
                      <div className="flex flex-col gap-3">
                        <h1 className="m-0 font-semibold text-mercury-ink text-title-sm dark:text-white/90 max-md:text-mercury-h1">
                          Sign in to your account
                        </h1>
                        <p className="m-0 text-mercury-small text-mercury-muted dark:text-gray-400">
                          Enter your email to receive a sign-in code.
                        </p>
                      </div>

                      <div className="flex flex-col gap-8 max-md:gap-6">
                        <div className="flex flex-col gap-6 max-md:gap-5">
                          {sendState?.error && (
                            <p className="text-sm text-error-500">
                              {sendState.error}
                            </p>
                          )}
                          <div>
                            <Label>
                              Email <span className="text-error-500">*</span>
                            </Label>
                            <Input
                              name="email"
                              placeholder="Email address"
                              type="email"
                              required
                              defaultValue={email}
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-4">
                          <SendCodeButton />
                          <Link
                            href="/"
                            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-mercury-button-lg bg-white px-4 py-2.5 text-mercury-small font-[360] text-mercury-ink ring-1 ring-inset ring-mercury-line transition hover:bg-gray-50 dark:bg-white/[0.04] dark:text-white/85 dark:ring-white/10 dark:hover:bg-white/[0.08]"
                          >
                            Back to home
                          </Link>
                        </div>
                      </div>
                    </form>
                  ) : (
                    <div className="flex flex-col gap-12 max-md:gap-8">
                      <div className="flex flex-col gap-3">
                        <h1 className="m-0 font-semibold text-mercury-ink text-title-sm dark:text-white/90 max-md:text-mercury-h1">
                          Enter your code
                        </h1>
                        {!verifyState?.error && (
                          <p className="m-0 text-mercury-small text-mercury-muted dark:text-gray-400">
                            If this email is registered, we sent a code to{" "}
                            <span className="font-medium text-mercury-ink dark:text-white/90">
                              {email}
                            </span>
                            .
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col gap-8 max-md:gap-6">
                        <form action={verifyAction}>
                          <input type="hidden" name="email" value={email} />
                          <div className="flex flex-col gap-6 max-md:gap-5">
                            {verifyState?.error && (
                              <p className="text-sm text-error-500">
                                {verifyState.error}
                              </p>
                            )}
                            {sendState?.error && (
                              <p className="text-sm text-error-500">
                                {sendState.error}
                              </p>
                            )}
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
                                className="text-center font-mono tracking-[0.35em]"
                              />
                            </div>
                            <VerifyButton />
                          </div>
                        </form>

                        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <button
                            type="button"
                            onClick={handleDifferentEmail}
                            className="text-sm text-mercury-muted transition-colors hover:text-mercury-ink dark:text-gray-400 dark:hover:text-gray-200"
                          >
                            Use a different email
                          </button>
                          <form action={sendAction} onSubmit={handleResendSubmit}>
                            <input type="hidden" name="email" value={email} />
                            <ResendButton disabled={resendDisabled} />
                          </form>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div
              ref={rightRef}
              className={`flex h-full w-full items-end justify-end overflow-hidden rounded-mercury-button-lg bg-cover bg-center p-4 max-md:hidden ${
                rightVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-[50px] opacity-0"
              }`}
              style={{
                backgroundImage: `url('${ACCOUNT_PANEL_IMAGE}')`,
                transitionDelay: "100ms",
              }}
            >
              <div className="flex max-w-[20rem] flex-col gap-6 rounded-mercury-button-lg bg-mercury-ink p-8 text-white dark:bg-gray-950">
                <div className="flex flex-col gap-8">
                  <div className="max-w-[8.25rem]">
                    <Image
                      src="/admin/images/mlcc-logo.jpg"
                      alt=""
                      width={132}
                      height={32}
                      className="h-auto w-full rounded-mercury-subtle brightness-0 invert"
                    />
                  </div>
                  <p className="m-0 text-mercury-small leading-6 text-white/65">
                    &ldquo;The Leaflet keeps our neighborhood connected, from
                    block parties to the issues that matter on every street.&rdquo;
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="text-mercury-small font-medium text-white">
                    Maple Leaf Community
                  </div>
                  <div className="m-0 text-mercury-small text-white/65">
                    Serving North Seattle since 1989
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AccountSection;
