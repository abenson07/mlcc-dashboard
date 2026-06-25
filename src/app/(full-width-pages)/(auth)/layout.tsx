import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";
import AuthProviders from "./AuthProviders";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProviders>
      {children}
      <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
        <ThemeTogglerTwo />
      </div>
    </AuthProviders>
  );
}
