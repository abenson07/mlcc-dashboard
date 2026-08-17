import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/admin-preview",
        "/admin-retire",
        "/old-admin",
        "/login",
        "/signup",
        "/api/",
      ],
    },
  };
}
