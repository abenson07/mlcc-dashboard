"use client";

import * as React from "react";
import Link from "next/link";
import { getBannerItems } from "@marketing/data/banner";

const FADE_MS = 1000;
const CYCLE_MS = 30000;

const banners = getBannerItems();

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

  const bannerContent = (
    <>
      <div className="font-body text-[0.625rem] leading-3 font-bold uppercase tracking-[0.0625rem] whitespace-nowrap">
        {banner.headline}
      </div>
      <Link
        href={banner.linkPath}
        className="font-body text-[0.625rem] leading-3 font-bold uppercase tracking-[0.0625rem] no-underline whitespace-nowrap text-sparkles-cream/90 hover:text-sparkles-cream transition-colors duration-200"
      >
        {banner.linkText}
      </Link>
    </>
  );

  return (
    <div className="w-full relative p-1">
      <style>{`
        @keyframes marquee-banner {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-marquee-banner {
          animation: marquee-banner 12s linear infinite;
        }
      `}</style>

      <div className="rounded-2xl bg-sparkles-navy text-sparkles-cream text-center backdrop-blur-xl min-[768px]:flex min-[768px]:items-center min-[768px]:justify-center min-[768px]:gap-2 min-[768px]:px-2 min-[768px]:py-2 max-[767px]:overflow-hidden max-[767px]:py-2">
        <div
          className="min-[768px]:flex min-[768px]:items-center min-[768px]:justify-center min-[768px]:gap-2 transition-opacity duration-1000 ease-in-out max-[767px]:hidden"
          style={{ opacity: visible ? 1 : 0 }}
        >
          {bannerContent}
        </div>

        <div className="hidden max-[767px]:flex max-[767px]:w-max max-[767px]:items-center max-[767px]:gap-2 animate-marquee-banner">
          <div className="flex shrink-0 items-center gap-2 pl-2">{bannerContent}</div>
          <div className="flex shrink-0 items-center gap-2 pl-2">{bannerContent}</div>
        </div>
      </div>
    </div>
  );
}

export default RotatingBanner;
