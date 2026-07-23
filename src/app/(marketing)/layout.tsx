import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "../marketing.css";

export const metadata: Metadata = {
  title: "Maple Leaf Community Council",
  description:
    "A volunteer-run community council connecting neighbors in Maple Leaf, Seattle, through events, advocacy, The Leaflet newsletter, and more.",
  openGraph: {
    siteName: "Maple Leaf Community Council",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="marketing-root min-h-full flex flex-col bg-sparkles-cream text-sparkles-navy font-body antialiased">
      {children}
      <Analytics />
    </div>
  );
}
