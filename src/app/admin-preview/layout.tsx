import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/patterns/foundation/ThemeContext";
import "./isolation.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export default function AdminPreviewLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`admin-preview-root ${inter.variable}`}
      style={{
        height: "100vh",
        fontFamily: "var(--font-inter), system-ui, sans-serif",
      }}
    >
      <ThemeProvider>{children}</ThemeProvider>
    </div>
  );
}
