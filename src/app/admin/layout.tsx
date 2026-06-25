import AdminLayoutClient from "./AdminLayoutClient";
import AdminProviders from "./AdminProviders";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import "flatpickr/dist/flatpickr.css";
import React from "react";

export const dynamic = "force-dynamic";

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
      <AdminLayoutClient>{children}</AdminLayoutClient>
    </AdminProviders>
  );
}
