import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Maple Leaf Community Council",
    short_name: "MLCC",
    start_url: "/",
    display: "standalone",
    background_color: "#fdf8f1",
    theme_color: "#0d1526",
    icons: [
      {
        src: "/images/favicon/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/images/favicon/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
