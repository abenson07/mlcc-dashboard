import { FooterSection } from "@marketing/components/sections/FooterSection";
import { NavigationBarSection } from "@marketing/components/sections/NavigationBarSection";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <NavigationBarSection />
      <div className="flex-1">{children}</div>
      <FooterSection />
    </>
  );
}
