"use client";

import { ThemeProvider } from "@/context/ThemeContext";

export default function AuthProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
