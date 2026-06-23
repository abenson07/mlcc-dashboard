import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sparkles — Cleaning for Busy People",
  description: "Professional cleaning services for busy people in Manhattan and beyond.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-sparkles-cream text-sparkles-navy font-body">
        {children}
      </body>
    </html>
  );
}
