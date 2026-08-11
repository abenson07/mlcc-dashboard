import "@/components/shell/shell.css";
import "@/components/leaflet/leaflet.css";
import "@/components/integrated/integrated.css";
import "flatpickr/dist/flatpickr.css";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminProviders from "./AdminProviders";
import ShellPreviewContent from "./ShellPreviewContent";

export const dynamic = "force-dynamic";

function ShellPreviewFallback() {
  return <div className="shell-preview-root shell-app" />;
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <AdminProviders>
      <Suspense fallback={<ShellPreviewFallback />}>
        <ShellPreviewContent>{children}</ShellPreviewContent>
      </Suspense>
    </AdminProviders>
  );
}
