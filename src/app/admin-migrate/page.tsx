"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useIsMobileAdmin } from "@/components/patterns/client-templates-migrate/mobile";
import { useWipFeaturesOptional } from "@/components/patterns/foundation/WipFeaturesContext";

export default function AdminMigrateIndexPage() {
  const router = useRouter();
  const isMobile = useIsMobileAdmin();
  const { enabled: wipFeaturesEnabled } = useWipFeaturesOptional();

  const pages = [
    { href: "/admin-migrate/database", label: "Database (mobile)" },
    { href: "/admin-migrate/events", label: "Events" },
    { href: "/admin-migrate/invoices", label: "Invoices" },
    { href: "/admin-migrate/promotions", label: "Promotions (mobile)" },
    { href: "/admin-migrate/people", label: "People" },
    ...(wipFeaturesEnabled
      ? [{ href: "/admin-migrate/committees", label: "Committees" }]
      : []),
  ];

  useEffect(() => {
    if (isMobile) router.replace("/admin-migrate/database");
  }, [isMobile, router]);

  if (isMobile) return null;

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        background: "#09090b",
        color: "#f7f8f8",
        fontFamily: "inherit",
      }}
    >
      <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>Linear Kit preview</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {pages.map((page) => (
          <Link
            key={page.href}
            href={page.href}
            style={{
              color: "#828fff",
              fontSize: 14,
              textDecoration: "none",
            }}
          >
            {page.label} →
          </Link>
        ))}
      </div>
    </div>
  );
}
