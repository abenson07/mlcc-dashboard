"use client";

import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import { usePathname } from "next/navigation";
import React from "react";

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isIntegratedShell =
    pathname?.startsWith("/admin/leaflet") ||
    pathname?.startsWith("/admin/site") ||
    pathname?.startsWith("/admin/people") ||
    pathname?.startsWith("/admin/biz") ||
    pathname === "/admin/events" ||
    pathname?.startsWith("/admin/events?") ||
    pathname?.startsWith("/admin/events-hub") ||
    pathname?.startsWith("/admin/stories") ||
    pathname?.startsWith("/admin/finance") ||
    pathname?.startsWith("/admin/settings") ||
    pathname?.startsWith("/admin/action-items") ||
    pathname?.startsWith("/admin/shell-preview");
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  if (isIntegratedShell) {
    return <div className="h-screen overflow-hidden">{children}</div>;
  }

  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[199px]"
    : "lg:ml-[90px]";

  return (
    <div className="min-h-screen xl:flex">
      <AppSidebar />
      <Backdrop />
      <div
        className={`flex-1 transition-all  duration-300 ease-in-out ${mainContentMargin}`}
      >
        <AppHeader />
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">{children}</div>
      </div>
    </div>
  );
}
