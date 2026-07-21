// Curated mapping from Webflow CDN URL -> local file destination(s).
// One entry per unique URL found by 01-enumerate.ts (see raw-urls.json).
export interface ManifestEntry {
  url: string;
  feature: string;
  filename: string;
  apps: ("root" | "website")[];
  /** Path (relative to repo root) to reuse bytes from instead of fetching. */
  reuseFrom?: string;
}

export const manifest: ManifestEntry[] = [
  {
    url: "https://cdn.prod.website-files.com/67f474b29211e3047d6a314e/67f474b29211e3047d6a31c3_chevron-down-white.svg",
    feature: "footer",
    filename: "chevron-down-white.svg",
    apps: ["root"],
  },
  {
    url: "https://cdn.prod.website-files.com/67f474b29211e3047d6a314e/67f474b29211e3047d6a31c4_chevron-down.svg",
    feature: "footer",
    filename: "chevron-down.svg",
    apps: ["root"],
  },
  {
    url: "https://cdn.prod.website-files.com/67f474b29211e3047d6a314e/67f474d94f5d5f791e219a67_Logo-wide.svg",
    feature: "nav",
    filename: "logo-wide.svg",
    apps: ["root"],
  },
  {
    url: "https://cdn.prod.website-files.com/67f474b29211e3047d6a314e/67f48b519939effcfdec35a2_image1.jpeg",
    feature: "committees",
    filename: "committee-photo.jpeg",
    apps: ["root"],
  },
  {
    url: "https://cdn.prod.website-files.com/67f474b29211e3047d6a314e/67f48b51ec064ef3e630383e_community-meeting.jpeg",
    feature: "committees",
    filename: "community-meeting-devlink.jpeg",
    apps: ["root"],
  },
  {
    url: "https://cdn.prod.website-files.com/67f474b29211e3047d6a314e/688b7265bdc1dbb6fc1ce130_moviesbythetower.jpg",
    feature: "zoning",
    filename: "movies-by-the-tower.jpg",
    apps: ["root"],
    reuseFrom: "mlcc-images-old-site/688b7265bdc1dbb6fc1ce130_moviesbythetower.jpg",
  },
  {
    url: "https://cdn.prod.website-files.com/67f474b29211e3047d6a314e/68ffc5e088b7cb6d778300b1_IMG_9176.jpg",
    feature: "one-seattle-plan",
    filename: "img-9176.jpg",
    apps: ["root"],
    reuseFrom: "mlcc-images-old-site/68ffc5e088b7cb6d778300b1_IMG_9176.jpg",
  },
  {
    url: "https://cdn.prod.website-files.com/67f474b29211e3047d6a314e/68ffc6e13cb50c59ba03fd72_IMG_1651(2).JPEG",
    feature: "one-seattle-plan",
    filename: "img-1651.jpeg",
    apps: ["root"],
  },
  {
    url: "https://cdn.prod.website-files.com/67f474b29211e3047d6a314e/68ffd7e99f59393d947343f5_Maple%20Leaf%20Neighborhood%20Center%20tall.png",
    feature: "one-seattle-plan",
    filename: "maple-leaf-neighborhood-center-tall.png",
    apps: ["root"],
  },
  {
    url: "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/6877bff9b59839fa1fd6792c_Photo-Jun-11-2025.jpg",
    feature: "community-photos",
    filename: "photo-jun-11-2025.jpg",
    apps: ["website"],
  },
  {
    url: "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/68c82d9a55f62655acb2e46c_IMG_9152.jpg",
    feature: "community-photos",
    filename: "img-9152.jpg",
    apps: ["website"],
  },
  {
    url: "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/6913dbb252ed363168221ae6_Maple_Leaf.jpg",
    feature: "community-photos",
    filename: "maple-leaf.jpg",
    apps: ["website"],
  },
  {
    url: "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/69530e8b1aadf47968a6eb09_summer_social_2024-62%20(1).webp",
    feature: "community-photos",
    filename: "summer-social-2024-62.webp",
    apps: ["website"],
  },
  {
    url: "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/69530eb0b170ed50a2893314_summer_social_2024-53.webp",
    feature: "community-photos",
    filename: "summer-social-2024-53.webp",
    apps: ["website"],
  },
  {
    url: "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/69530f1e1da163ec47328051_summer_social_2024-39.webp",
    feature: "community-photos",
    filename: "summer-social-2024-39.webp",
    apps: ["website"],
  },
  {
    url: "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/69530f3b720cb8642ef69f08_summer_social_2024-63.webp",
    feature: "community-photos",
    filename: "summer-social-2024-63.webp",
    apps: ["website"],
  },
  {
    url: "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/695312357b037d99bca1b7e9_leaflet.webp",
    feature: "leaflet",
    filename: "leaflet.webp",
    apps: ["root", "website"],
  },
  {
    url: "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/695313c6b976b35d22bb2d6d_community-meeting.webp",
    feature: "community-photos",
    filename: "community-meeting-a.webp",
    apps: ["website"],
  },
  // This "hash" (695313c6b976b35d6d, 18 hex chars) is a corrupted/truncated copy of the asset above
  // (695313c6b976b35d22bb2d6d, 24 hex chars) -- 6 middle chars ("22bb2d") are missing. Always returned
  // AccessDenied (invalid Webflow asset id, not a live-then-removed asset). Treated as the same photo
  // and pointed at community-meeting-a.webp; not downloaded separately.
  {
    url: "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/69531414b76d18b41340f623_community-meeting2.webp",
    feature: "community-photos",
    filename: "community-meeting-c.webp",
    apps: ["website"],
  },
  {
    url: "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/69531455684e18c663a2a6b7_community-meeting3.webp",
    feature: "community-photos",
    filename: "community-meeting-d.webp",
    apps: ["website"],
  },
  {
    url: "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/69540779dacfe8969b3b1a95_summer_social_2024-1%201.webp",
    feature: "community-photos",
    filename: "summer-social-2024-1.webp",
    apps: ["website"],
  },
  {
    url: "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/695b2928eb2f48f58fa2aef8_movies-tower.webp",
    feature: "community-photos",
    filename: "movies-tower.webp",
    apps: ["website"],
  },
  {
    url: "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/695b2c3441277b54461fac94_IMG_6554.jpg",
    feature: "community-photos",
    filename: "img-6554.jpg",
    apps: ["website"],
  },
  {
    url: "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/695b2ef4da00327d5e0c5403_love-your-neighbor.webp",
    feature: "community-photos",
    filename: "love-your-neighbor.webp",
    apps: ["website"],
  },
  {
    url: "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/695b30685a1f306acdc73283_IMG_6862.jpg",
    feature: "community-photos",
    filename: "img-6862.jpg",
    apps: ["website"],
  },
  {
    url: "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/697eb3592b1c8f4dd7e6a98f_cohousing-infographic.png",
    feature: "leaflet-stories",
    filename: "cohousing-infographic.png",
    apps: ["website"],
  },
  {
    url: "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/699b422af10d9dff50983357_Survey_Email_Header-2-narrow.png",
    feature: "leaflet-stories",
    filename: "survey-email-header-2-narrow.png",
    apps: ["website"],
  },
  {
    url: "https://cdn.prod.website-files.com/68a8bac34ba5bc8cee4c21c1/68a8bac34ba5bc8cee4c21ca_Social%20Icon-1.svg",
    feature: "social-icons",
    filename: "social-icon-1.svg",
    apps: ["website"],
  },
  {
    url: "https://cdn.prod.website-files.com/68a8bac34ba5bc8cee4c21c1/68a8bac34ba5bc8cee4c21ce_Social%20Icon-3.svg",
    feature: "social-icons",
    filename: "social-icon-3.svg",
    apps: ["website"],
  },
  {
    url: "https://cdn.prod.website-files.com/68a8bac34ba5bc8cee4c21c1/68a8bac34ba5bc8cee4c224a_Social%20Icon.svg",
    feature: "social-icons",
    filename: "social-icon.svg",
    apps: ["website"],
  },
  {
    url: "https://cdn.prod.website-files.com/68a8bac34ba5bc8cee4c21c1/68a8bac34ba5bc8cee4c2262_Social%20Icon-2.svg",
    feature: "social-icons",
    filename: "social-icon-2.svg",
    apps: ["website"],
  },
  {
    url: "https://cdn.prod.website-files.com/692f17afc3743c9cd4b7cac6%2F693817393d800624450974eb_hero%20%281%29_poster.0000000.jpg",
    feature: "hero",
    filename: "hero-poster.jpg",
    apps: ["website"],
  },
  {
    url: "https://cdn.prod.website-files.com/6931c0eea92dec5b7ca905e9/6931c0eea92dec5b7ca907c4_pattern-vertical-new.svg",
    feature: "patterns",
    filename: "pattern-vertical.svg",
    apps: ["website"],
  },
  {
    url: "https://cdn.prod.website-files.com/6a2fa8175a11738252f297aa/images/image-account_1image-account.avif",
    feature: "account",
    filename: "account-background.avif",
    apps: ["root"],
  },
  {
    url: "https://d3e54v103j8qbb.cloudfront.net/img/background-image.svg",
    feature: "one-seattle-plan",
    filename: "background-image-placeholder.svg",
    apps: ["root"],
  },
];
