"use client";

import * as React from "react";
import Link from "next/link";
import bannerData from "@marketing/data/banner.json";

export type BannerItem = {
  headline: string;
  linkText: string;
  linkPath: string;
};

const FADE_MS = 1000;
const CYCLE_MS = 30000;

const banners = bannerData.banners as BannerItem[];

export function RotatingBanner() {
  const [index, setIndex] = React.useState(0);
  const [visible, setVisible] = React.useState(true);

  React.useEffect(() => {
    if (banners.length <= 1) return;

    const intervalId = window.setInterval(() => {
      setVisible(false);

      window.setTimeout(() => {
        setIndex((current) => (current + 1) % banners.length);
        setVisible(true);
      }, FADE_MS);
    }, CYCLE_MS);

    return () => window.clearInterval(intervalId);
  }, []);

  const banner = banners[index] ?? banners[0];
  if (!banner) return null;

  return (
    <div className="w-full relative p-1">
      <div className="flex items-center justify-center gap-2 px-2 py-2 rounded-2xl bg-sparkles-navy text-sparkles-cream text-center backdrop-blur-xl">
        <div
          className="flex items-center justify-center gap-2 transition-opacity duration-1000 ease-in-out"
          style={{ opacity: visible ? 1 : 0 }}
        >
          <div className="font-body text-[0.625rem] leading-3 font-bold uppercase tracking-[0.0625rem]">
            {banner.headline}
          </div>
          <Link
            href={banner.linkPath}
            className="font-body text-[0.625rem] leading-3 font-bold uppercase tracking-[0.0625rem] no-underline text-sparkles-cream/90 hover:text-sparkles-cream transition-colors duration-200"
          >
            {banner.linkText}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default RotatingBanner;
