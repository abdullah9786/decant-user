import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Decume — Premium Perfume Decants India",
    short_name: "Decume",
    description:
      "Authentic perfume decants from designer and niche houses. Trial sizes, fair pricing, pan-India delivery.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#064e3b",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
