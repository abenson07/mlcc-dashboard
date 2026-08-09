import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ThemeProvider } from "@/components/patterns/foundation/ThemeContext";
import { DemoModeProvider } from "@/components/patterns/foundation/DemoModeContext";
import { QueryProvider } from "@/providers/QueryProvider";
import "./isolation.css";

export const dynamic = "force-dynamic";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export default async function AdminMigrateLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div
      className={`admin-migrate-root ${inter.variable}`}
      style={{
        height: "100vh",
        fontFamily: "var(--font-inter), system-ui, sans-serif",
      }}
    >
      <QueryProvider>
        <ThemeProvider>
          <DemoModeProvider>{children}</DemoModeProvider>
        </ThemeProvider>
      </QueryProvider>
    </div>
  );
}
