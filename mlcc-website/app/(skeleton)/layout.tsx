import { ViewTransition } from "react";
import { FooterSection } from "@marketing/components/byq/FooterSection";
import { NavigationBarSection } from "@marketing/components/byq/NavigationBarSection";

export default function SkeletonLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <NavigationBarSection />
      <div className="flex-1 bg-sparkles-cream pt-[6.75rem] max-[991px]:pt-[6.25rem]">
        <ViewTransition>{children}</ViewTransition>
      </div>
      <FooterSection />
    </>
  );
}
