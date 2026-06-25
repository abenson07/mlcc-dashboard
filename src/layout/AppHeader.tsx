"use client";
import UserDropdown from "@/components/header/UserDropdown";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";

const AppHeader: React.FC = () => {
  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);

  const toggleApplicationMenu = () => {
    setApplicationMenuOpen(!isApplicationMenuOpen);
  };

  return (
    <header className="sticky top-0 z-99999 flex w-full bg-mercury-bg dark:bg-mercury-surface-inverse">
      <div className="flex grow flex-col items-center justify-between lg:flex-row lg:px-6">
        <div className="flex w-full items-center justify-between gap-2 border-b border-mercury-line px-3 py-3 sm:gap-4 lg:justify-normal lg:border-b-0 lg:px-0 lg:py-4 dark:border-white/10">
          <Link href="/" className="lg:hidden">
            <Image
              width={154}
              height={32}
              className="dark:hidden"
              src="/admin/images/mlcc-logo.jpg"
              alt="Logo"
            />
            <Image
              width={154}
              height={32}
              className="hidden dark:block"
              src="/admin/images/mlcc-logo.jpg"
              alt="Logo"
            />
          </Link>

          <button
            onClick={toggleApplicationMenu}
            className="z-99999 flex h-10 w-10 items-center justify-center rounded-mercury-button text-mercury-ink hover:bg-gray-50 dark:text-white/80 dark:hover:bg-white/5 lg:hidden"
            type="button"
            aria-label="Open menu"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M5.99902 10.4951C6.82745 10.4951 7.49902 11.1667 7.49902 11.9951V12.0051C7.49902 12.8335 6.82745 13.5051 5.99902 13.5051C5.1706 13.5051 4.49902 12.8335 4.49902 12.0051V11.9951C4.49902 11.1667 5.1706 10.4951 5.99902 10.4951ZM17.999 10.4951C18.8275 10.4951 19.499 11.1667 19.499 11.9951V12.0051C19.499 12.8335 18.8275 13.5051 17.999 13.5051C17.1706 13.5051 16.499 12.8335 16.499 12.0051V11.9951C16.499 11.1667 17.1706 10.4951 17.999 10.4951ZM11.999 10.4951C12.8275 10.4951 13.499 11.1667 13.499 11.9951V12.0051C13.499 12.8335 12.8275 13.5051 11.999 13.5051C11.1706 13.5051 10.499 12.8335 10.499 12.0051V11.9951C10.499 11.1667 11.1706 10.4951 11.999 10.4951Z"
                fill="currentColor"
              />
            </svg>
          </button>

          <div className="hidden lg:block" />
        </div>
        <div
          className={`${
            isApplicationMenuOpen ? "flex" : "hidden"
          } w-full items-center justify-end gap-4 px-5 py-4 shadow-theme-md lg:flex lg:px-0 lg:shadow-none`}
        >
          <UserDropdown />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
