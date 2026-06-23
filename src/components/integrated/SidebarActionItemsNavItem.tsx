"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconCheckSquare } from "@/components/leaflet/icons";

export default function SidebarActionItemsNavItem() {
  const pathname = usePathname();
  const active = pathname?.startsWith("/action-items");

  return (
    <Link
      href="/action-items"
      className={active ? "lf-nav-item lf-nav-item--active" : "lf-nav-item lf-nav-item--muted"}
    >
      <IconCheckSquare />
      Action items
    </Link>
  );
}
