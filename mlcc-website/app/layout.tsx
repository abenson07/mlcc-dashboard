import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Maple Leaf Community Council",
  description:
    "Connecting neighbors to the people and things that matter most. A volunteer-run community council keeping Maple Leaf, Seattle informed, connected, and involved.",
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
