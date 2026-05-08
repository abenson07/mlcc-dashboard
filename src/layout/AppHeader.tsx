"use client";
import { GlobalSearchModal } from "@/components/header/GlobalSearchModal";
import UserDropdown from "@/components/header/UserDropdown";
import { useModal } from "@/hooks/useModal";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";

const AppHeader: React.FC = () => {
  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);
  const {
    isOpen: isSearchOpen,
    openModal: openSearch,
    closeModal: closeSearch,
    toggleModal: toggleSearch,
  } = useModal();

  const toggleApplicationMenu = () => {
    setApplicationMenuOpen(!isApplicationMenuOpen);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        toggleSearch();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [toggleSearch]);

  const searchTriggerClass =
    "inline-flex items-center gap-2 rounded-full border-0 bg-transparent px-2 py-2 text-left text-mercury-muted transition hover:text-mercury-ink dark:text-white/55 dark:hover:text-white/90";

  return (
    <header className="sticky top-0 z-99999 flex w-full bg-mercury-bg dark:bg-mercury-surface-inverse">
      <GlobalSearchModal isOpen={isSearchOpen} onClose={closeSearch} />
      <div className="flex grow flex-col items-center justify-between lg:flex-row lg:px-6">
        <div className="flex w-full items-center justify-between gap-2 border-b border-mercury-line px-3 py-3 sm:gap-4 lg:justify-normal lg:border-b-0 lg:px-0 lg:py-4 dark:border-white/10">
          <Link href="/" className="lg:hidden">
            <Image
              width={154}
              height={32}
              className="dark:hidden"
              src="/images/mlcc-logo.jpg"
              alt="Logo"
            />
            <Image
              width={154}
              height={32}
              className="hidden dark:block"
              src="/images/mlcc-logo.jpg"
              alt="Logo"
            />
          </Link>

          <button
            type="button"
            onClick={openSearch}
            className={`${searchTriggerClass} lg:hidden`}
            aria-label="Open search"
            title="Search (⌘K)"
          >
            <svg
              className="shrink-0"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z"
                fill="currentColor"
              />
            </svg>
          </button>

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

          <div className="hidden lg:block">
            <button
              type="button"
              onClick={openSearch}
              className={`${searchTriggerClass} xl:min-w-[280px]`}
              title="Search everywhere (⌘K)"
            >
              <svg
                className="shrink-0"
                width="18"
                height="18"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z"
                  fill="currentColor"
                />
              </svg>
              <span className="text-mercury-caption">Search for anything</span>
              <span className="ml-auto hidden items-center gap-0.5 text-theme-xs tracking-wide text-mercury-muted sm:inline dark:text-white/40">
                <span>⌘</span>
                <span>K</span>
              </span>
            </button>
          </div>
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
