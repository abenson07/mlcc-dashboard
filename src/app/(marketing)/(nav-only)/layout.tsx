import { ViewTransition } from "react";
import { NavigationBarSection } from "@marketing/components/byq/NavigationBarSection";
import { getBannerItemsFromEvents } from "@marketing/data/banner";
import { getMergedUpcomingEvents } from "@marketing/data/events";

export default async function NavOnlyLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const bannerItems = getBannerItemsFromEvents(await getMergedUpcomingEvents());

  return (
    <>
      <NavigationBarSection bannerItems={bannerItems} />
      <div className="flex-1 bg-sparkles-cream pt-[6.75rem] max-[991px]:pt-[6.25rem]">
        <ViewTransition>{children}</ViewTransition>
      </div>
    </>
  );
}
