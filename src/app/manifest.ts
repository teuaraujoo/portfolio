import type { MetadataRoute } from "next";
import { homeData } from "@/data/home";
import { SITE_DESCRIPTION } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  const fullName = `${homeData.hero.firstName} ${homeData.hero.lastName}`;

  return {
    name: `${fullName} — ${homeData.hero.role}`,
    short_name: fullName,
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#0D0D0D",
    theme_color: "#0D0D0D",
    lang: homeData.locale,
    icons: [
      {
        src: "/icon.png",
        sizes: "any",
        type: "image/png",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
