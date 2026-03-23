import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/login",
          "/register",
          "/forgot-password",
          "/reset-password",
          "/verify-email",
          "/cart",
          "/checkout",
          "/profile",
          "/orders",
          "/track-order",
        ],
      },
    ],
    sitemap: "https://decume.in/sitemap.xml",
  };
}
