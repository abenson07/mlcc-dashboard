import AdminLayoutClient from "./AdminLayoutClient";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import React from "react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }
    return <AdminLayoutClient>{children}</AdminLayoutClient>;
  } catch (e) {
    throw e;
  }
}
