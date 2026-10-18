import Link from "next/link";
import { NextStudio } from "next-sanity/studio";
import config from "@/lib/sanity/studio.config";

export const dynamic = "force-dynamic";

export { metadata, viewport } from "next-sanity/studio";

// Admin auth is enforced by src/app/admin/layout.tsx (redirects to /login without a Supabase user).
export default function WebsiteStudioPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          height: 36,
          padding: "0 12px",
          fontSize: 13,
          borderBottom: "1px solid rgba(128,128,128,0.3)",
        }}
      >
        <Link href="/admin/website" style={{ textDecoration: "none", color: "inherit" }}>
          ← Back to Edit website
        </Link>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <NextStudio config={config} unstable_noAuthBoundary={false} />
      </div>
    </div>
  );
}
