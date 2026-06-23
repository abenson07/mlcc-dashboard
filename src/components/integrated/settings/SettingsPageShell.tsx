"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import IntegratedTopbar from "../IntegratedTopbar";
import SidebarFooterNav from "../SidebarFooterNav";

const SETTINGS_NAV = [
  { label: "Committee settings", href: "/settings/committee" },
] as const;

type SettingsPageShellProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export default function SettingsPageShell({
  title,
  description,
  children,
}: SettingsPageShellProps) {
  const pathname = usePathname();

  return (
    <>
      <IntegratedTopbar />
      <div className="lf-main">
        <div className="lf-sidebar-col">
          <aside className="lf-sidebar">
            <div className="lf-finance-title-block" style={{ padding: "12px 12px 8px" }}>
              <strong>Settings</strong>
            </div>
            <nav className="lf-sidebar-nav" aria-label="Settings sections">
              {SETTINGS_NAV.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className={pathname === href ? "lf-nav-item lf-nav-item--active" : "lf-nav-item"}
                >
                  {label}
                </Link>
              ))}
              <SidebarFooterNav />
            </nav>
          </aside>
        </div>
        <div className="lf-content-col">
          <main className="lf-canvas lf-canvas--white">
            <h1 className="lf-h1">{title}</h1>
            {description ? <p className="lf-page-desc">{description}</p> : null}
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
