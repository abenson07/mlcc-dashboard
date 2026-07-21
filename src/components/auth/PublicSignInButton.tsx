"use client";

import { useState } from "react";
import PublicSignInModal from "@/components/auth/PublicSignInModal";

/** Person-icon sign-in trigger for the public nav, next to Volunteer/Support. */
export default function PublicSignInButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Sign in"
        className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-sparkles-navy text-sparkles-navy transition-all duration-300 hover:bg-sparkles-warm"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 12c2.485 0 4.5-2.015 4.5-4.5S14.485 3 12 3 7.5 5.015 7.5 7.5 9.515 12 12 12Zm0 2.25c-3.004 0-9 1.508-9 4.5V21h18v-2.25c0-2.992-5.996-4.5-9-4.5Z"
            fill="currentColor"
          />
        </svg>
      </button>
      <PublicSignInModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
