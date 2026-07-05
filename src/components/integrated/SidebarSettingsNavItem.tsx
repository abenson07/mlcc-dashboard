"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function IconSettings() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M8 10a2 2 0 100-4 2 2 0 000 4z"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <path
        d="M12.5 8.9a1.25 1.25 0 00.25-1.36l-.7-1.21a1.25 1.25 0 00-1.15-.6h-.9a4.5 4.5 0 00-.35-.85l.5-1.35a1.25 1.25 0 00-.75-1.58L8.9 1.75a1.25 1.25 0 00-1.58.75l-.5 1.35a4.5 4.5 0 00-.85.35H5.05a1.25 1.25 0 00-1.15.6l-.7 1.21a1.25 1.25 0 00.25 1.36l1.1 1.1a4.5 4.5 0 000 1.2l-1.1 1.1a1.25 1.25 0 00-.25 1.36l.7 1.21c.26.45.75.73 1.28.73h.9c.12.3.22.58.35.85l-.5 1.35a1.25 1.25 0 00.75 1.58l1.35.5a1.25 1.25 0 001.58-.75l.5-1.35c.3-.12.58-.22.85-.35h.9c.53 0 1.02-.28 1.28-.73l.7-1.21z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function SidebarSettingsNavItem() {
  const pathname = usePathname();
  const active = pathname?.startsWith("/old-admin/settings");

  return (
    <Link
      href="/old-admin/settings/committee"
      className={active ? "lf-nav-item lf-nav-item--active" : "lf-nav-item lf-nav-item--muted"}
    >
      <IconSettings />
      Settings
    </Link>
  );
}
